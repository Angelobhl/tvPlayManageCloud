import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { AtList, AtListItem, AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtInputNumber } from "taro-ui"
import {aType, aPlatform} from '../../util/const'
import {chapterData, WaitingItem} from '../../types/common'
import {getStorage, setStorage, dayArrJoin} from '../../util/common'

import "taro-ui/dist/style/components/flex.scss"
import "taro-ui/dist/style/components/modal.scss"
import "taro-ui/dist/style/components/button.scss"
import "taro-ui/dist/style/components/list.scss"
import "taro-ui/dist/style/components/input-number.scss"
import "taro-ui/dist/style/components/icon.scss"
import './detail.scss'

function FormField (props: {label: string, children: React.ReactNode}) {
  return (
    <View className="form-field-item">
      <View className="form-field-item-label">{props.label}</View>
      <View className="form-field-item-content">{props.children}</View>
    </View>
  )
}

interface LeftChaper {
  fullDate: string,
  chapter: string,
  date: string
}

interface DetailState {
  chapter: chapterData,
  leftChaper: LeftChaper[],
  curChapterNum: number,
  totalNumModalShow: boolean,
  totalNum: number,
  delModalShow: boolean
}

export default class Detail extends Component<{}, DetailState> {
  $instance: Taro.Current = getCurrentInstance()
  index: number

  constructor (prop: {}) {
    super(prop)

    this.state = {
      chapter: {} as chapterData,
      leftChaper: [],
      curChapterNum: 0,
      totalNumModalShow: false,
      totalNum: 0,
      delModalShow: false
    }
  }

  componentWillMount () {
    const self = this

    this.index = +this.$instance.router.params.index || 0
    let chapter: chapterData
    const aChapterData: chapterData[] = getStorage<chapterData>('chapter')

    let item: chapterData
    for (item of aChapterData) {
      if (item.index === self.index) {
        chapter = item
      }
    }
    if (!chapter) {
      Taro.navigateBack()
    } else {
      const curChapterNum = this.fCurChapterNum(chapter)
      const leftChaper = this.fLeftChapterNum(chapter, curChapterNum)
      this.setState({
        chapter,
        curChapterNum,
        leftChaper
      })
    }
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  showType () {
    let str: string
    let item: {label: string, value: string}

    for (item of aType) {
      if (item.value === this.state.chapter.type) {
        str = item.label
      }
    }

    return str
  }

  showPlatform () {
    let str: string
    let item: {label: string, value: string}

    for (item of aPlatform) {
      if (item.value === this.state.chapter.platform) {
        str = item.label
      }
    }

    return str
  }

  theDayDate (time: number) {
    const flag: number = 1612108800000
    return time - (time - flag) % 86400000
  }

  fCurChapterNum (chapter: chapterData) {
    const now = new Date()
    // 精确到当天0时0分0秒
    const curDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let curChapterNum: number = chapter.curChapterNum || 0

    if (chapter.weekDays && chapter.weekDays.length) {
      const createdDate: number = this.theDayDate(chapter.createdDate)
      const dayPast: number = Math.ceil((curDate.getTime() - createdDate) / 86400000)

      curChapterNum += Math.floor(dayPast / 7) * chapter.weekDays.length * chapter.updateNum

      const dayPastLeft: number = dayPast % 7
      let day = new Date(createdDate).getDay() || 7
      let i: number = 0
      for (; i < dayPastLeft; i++){
        if (chapter.weekDays.includes(day)) {
          curChapterNum += chapter.updateNum
        }
        day++
        if (day > 7) {
          day = 1
        }
      }
    }

    return chapter.totalChapterNum ? Math.min(chapter.totalChapterNum, curChapterNum) : curChapterNum
  }

  showUpdateRule () {
    let str: string = ''

    if (this.state.chapter.weekDays && this.state.chapter.weekDays.length) {
      str = `每周${this.state.chapter.weekDays.join('，')}的${this.state.chapter.updateTime}更新${this.state.chapter.updateNum}集`
    }

    return str
  }

  fLeftChapterNum (chapter: chapterData, curChapterNum: number) {
    // 剩余的集数
    let leftChaper: LeftChaper[] = []
    const now = new Date()
    // 精确到当天0时0分0秒
    let loopDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let leftChaperNum = chapter.totalChapterNum ? chapter.totalChapterNum - curChapterNum : chapter.updateNum
    let loopDateTime = loopDate.getTime()
    let loopDay = loopDate.getDay() || 7

    while(leftChaperNum > 0) {
      if (chapter.weekDays.includes(loopDay)) {
        let i: number = 0
        for (; i < chapter.updateNum; i++) {
          if (leftChaperNum > 0) {
            curChapterNum++
            leftChaper.push({
              fullDate: dayArrJoin([loopDate.getFullYear(), loopDate.getMonth() + 1, loopDate.getDate()]),
              chapter: curChapterNum + '集',
              date: dayArrJoin([loopDate.getMonth() + 1, loopDate.getDate()])
            })
            leftChaperNum--
          }
        }
      }

      loopDateTime += 86400000
      loopDate = new Date(loopDateTime)
      loopDay = loopDate.getDay() || 7
    }

    return leftChaper
  }

  handleTotalNumChange (value: number) {
    this.setState({
      totalNum: value
    })
  }

  handleSetTotalNum () {
    this.setState({
      totalNumModalShow: true
    })
  }

  fCancelSetTotalNum () {
    this.setState({
      totalNumModalShow: false
    })
  }

  fConfirmSetTotalNum () {
    const total = this.state.totalNum
    this.fSaveChaperInfo<chapterData['totalChapterNum']>('totalChapterNum', total)
    this.setState({
      totalNumModalShow: false
    })
  }

  handleSetEnd () {
    this.fSaveChaperInfo<chapterData['isEnd']>('isEnd', true)
    this.setState({
      totalNumModalShow: false
    })
  }

  fSaveChaperInfo <T>(key: string, value: T) {
    let chapter = this.state.chapter
    chapter[key] = value

    this.setState({
      chapter
    })

    const aChapterData: chapterData[] = getStorage<chapterData>('chapter')
    let includeIndex: number = -1
    aChapterData.forEach((item: chapterData, index: number) => {
      if (item.index === chapter.index) {
        includeIndex = index
      }
    })
    if (includeIndex > -1) {
      aChapterData[includeIndex] = chapter
      setStorage<chapterData>('chapter', aChapterData)
      Taro.showToast({
        title: '保存成功',
        icon: 'none'
      })
    }
  }

  handleDelClick () {
    this.setState({
      delModalShow: true
    })
  }

  fCancelDelClick () {
    this.setState({
      delModalShow: false
    })
  }

  handleComfrimDel () {
    const aChapterData: chapterData[] = getStorage<chapterData>('chapter')
    let includeIndex: number = -1
    aChapterData.forEach((item: chapterData, index: number) => {
      if (item.index === this.index) {
        includeIndex = index
      }
    })
    if (includeIndex > -1) {
      aChapterData.splice(includeIndex, 1)
      setStorage<chapterData>('chapter', JSON.stringify(aChapterData))
      Taro.switchTab({
        url: '/pages/index/index'
      })
    }
  }

  handleLeftChapterClick (leftChaper: LeftChaper) {
    Taro.showModal({
      title: '想看',
      content: '添加到想到？'
    }).then(res => {
      console.log(res)
      if (res.confirm) {
        let waitingList: WaitingItem[] = getStorage<WaitingItem>('waiting')
        let item: WaitingItem = {
          index: waitingList.length ? waitingList[waitingList.length - 1].index + 1 : 1,
          title: `${this.state.chapter.title}[${leftChaper.chapter}]`,
          type: this.state.chapter.type,
          platform: this.state.chapter.platform,
          date: leftChaper.fullDate
        }
        waitingList.push(item)
        setStorage<WaitingItem>('waiting', waitingList)
      }
    })
  }

  render () {
    return (
      <View className="detail-page">
        <AtModal isOpened={this.state.totalNumModalShow}>
          <AtModalHeader>设置总集数</AtModalHeader>
          <AtModalContent>
            {
              this.state.totalNumModalShow && (
                <AtInputNumber
                  type="digit"
                  min={0}
                  max={999}
                  step={1}
                  value={this.state.totalNum}
                  onChange={this.handleTotalNumChange.bind(this)}
                />
              )
            }
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.fCancelSetTotalNum.bind(this)}>取消</Button>
            <Button onClick={this.fConfirmSetTotalNum.bind(this)}>确定</Button>
          </AtModalAction>
        </AtModal>
        <AtModal isOpened={this.state.delModalShow}>
          <AtModalHeader>删除剧集</AtModalHeader>
          <AtModalContent>
            <View>确认删除会员【{this.state.chapter.title}】吗？</View>
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.fCancelDelClick.bind(this)}>取消</Button>
            <Button onClick={this.handleComfrimDel.bind(this)}>确定</Button>
          </AtModalAction>
        </AtModal>
        <AtList>
          <AtListItem title="标题" extraText={this.state.chapter.title} />
          <AtListItem title="类型" extraText={this.showType()} />
          <AtListItem title="平台" extraText={this.showPlatform()} />
          {
            this.state.chapter.totalChapterNum ? (<AtListItem title="总共" extraText={this.state.chapter.totalChapterNum + '集'} />) : (<View></View>)
          }
          <AtListItem title="已更新" extraText={this.state.curChapterNum + '集'} />
          <FormField label="周更">
            <View>{this.showUpdateRule()}</View>
          </FormField>
          <FormField label="待更新">
            <View className="left-chapter-grid">
              {
                this.state.leftChaper.map((item: LeftChaper) => {
                  return (
                    <View className="left-chapter-grid-item" onClick={() => { this.handleLeftChapterClick(item) }}>
                      <View>{item.chapter}</View>
                      <View>{item.date}</View>
                    </View>
                  )
                })
              }
            </View>
          </FormField>
        </AtList>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-11">
            <AtButton type="primary" size="small" onClick={this.handleDelClick.bind(this)}>删除</AtButton>
          </View>
        </View>
        <View className="at-row at-row__justify--around">
          {
            !this.state.chapter.totalChapterNum && (
              <View className="at-col at-col-5">
                <AtButton type="primary" onClick={this.handleSetTotalNum.bind(this)}>设置总集数</AtButton>
              </View>
            )
          }
          <View className="at-col at-col-5">
            <AtButton type="primary" disabled={this.state.chapter.isEnd} onClick={this.handleSetEnd.bind(this)}>已看完</AtButton>
          </View>
        </View>
      </View>
    )
  }
}
