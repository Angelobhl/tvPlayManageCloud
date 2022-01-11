import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Picker } from '@tarojs/components'
import { AtForm, AtInput, AtButton, AtRadio, AtCheckbox, AtList, AtListItem, AtInputNumber } from 'taro-ui'
import {aType, aPlatform} from '../../util/const'
import {addState, chapterData, WaitingItem} from '../../types/common'
import {getStorage, setStorage} from '../../util/common'

import 'taro-ui/dist/style/components/form.scss' // 按需引入
import 'taro-ui/dist/style/components/input.scss' // 按需引入
import 'taro-ui/dist/style/components/button.scss' // 按需引入
import 'taro-ui/dist/style/components/radio.scss' // 按需引入
import 'taro-ui/dist/style/components/checkbox.scss' // 按需引入
import 'taro-ui/dist/style/components/list.scss' // 按需引入
import 'taro-ui/dist/style/components/input-number.scss' // 按需引入
import 'taro-ui/dist/style/components/icon.scss' // 按需引入
import './add.scss'

const aWeekDay = [
  {label: '周一', value: 1},
  {label: '周二', value: 2},
  {label: '周三', value: 3},
  {label: '周四', value: 4},
  {label: '周五', value: 5},
  {label: '周六', value: 6},
  {label: '周日', value: 7}
]

function FormField (props: {label: string, children: React.ReactNode}) {
  return (
    <View className="form-field-item">
      <View className="form-field-item-label">{props.label}</View>
      <View className="form-field-item-content">{props.children}</View>
    </View>
  )
}

export default class Add extends Component<{}, addState> {
  $instance: Taro.Current = getCurrentInstance()
  waiting: number = -1
  aWaitingList: WaitingItem[] = []

  constructor (props: {}) {
    super(props)

    this.state = {
      title: '',
      type: '',
      platform: '',
      weekDays: [],
      updateTime: '20:00',
      updateNum: 2,
      curChapterNum: 0,
      totalChapterNum: 0
    }

    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleTypeChange = this.handleTypeChange.bind(this)
    this.handlePlatformChange = this.handlePlatformChange.bind(this)
    this.handleWeekdaysChange = this.handleWeekdaysChange.bind(this)
    this.handleUpdateTimeChange = this.handleUpdateTimeChange.bind(this)
    this.handleCurChapterNumChange = this.handleCurChapterNumChange.bind(this)
    this.handleTotalChapterNumChange = this.handleTotalChapterNumChange.bind(this)
    this.handleUpdateNumChange = this.handleUpdateNumChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    this.waiting = this.$instance.router.params.waiting ? +this.$instance.router.params.waiting : -1
    console.log(this.waiting)

    if (this.waiting > 0) {
      this.aWaitingList = getStorage<WaitingItem>('waiting')
      let item: WaitingItem
      let len: number = this.aWaitingList.length
      for (let i = 0; i < len; i++) {
        if (this.aWaitingList[i].index === this.waiting) {
          item = this.aWaitingList[i]
          break
        }
      }
      if (item) {
        this.setState({
          title: item.title,
          type: item.type,
          platform: item.platform
        })
      }
    }
  }

  componentDidHide () { }

  handleTitleChange (value: string | number) {
    this.setState({
      title: value as string
    })
  }

  handleTypeChange (value: string) {
    this.setState({
      type: value
    })
  }

  handlePlatformChange (value: string) {
    this.setState({
      platform: value
    })
  }

  handleWeekdaysChange (value: number[]) {
    this.setState({
      weekDays: value
    })
  }

  handleUpdateTimeChange (value: string) {
    this.setState({
      updateTime: value
    })
  }

  handleCurChapterNumChange (value: number) {
    this.setState({
      curChapterNum: value
    })
  }

  handleTotalChapterNumChange (value: number) {
    this.setState({
      totalChapterNum: value
    })
  }

  handleUpdateNumChange (value: number) {
    this.setState({
      updateNum: value
    })
  }

  handleSubmit (event) {
    const curDate = new Date()
    // let fSaveData = this.fSaveData
    let oData: chapterData = {
      index: 0,
      title: this.state.title,
      type: this.state.type,
      platform: this.state.platform,
      weekDays: this.state.weekDays.sort(),
      updateTime: this.state.updateTime,
      updateNum: this.state.updateNum,
      curChapterNum: this.state.curChapterNum,
      totalChapterNum: this.state.totalChapterNum,
      createdDate: curDate.getTime(),
      endDate: 0,
      isEnd: false
    }

    if (!oData.title || !oData.type || !oData.platform || !oData.weekDays.length) {
      Taro.showToast({
        title: '全部必填',
        icon: 'none'
      })
      return false
    }
    // 根据总集数，算出完结时间
    if (oData.totalChapterNum) {
      let endDate = 0
      const curDay = curDate.getDay() || 7
      const leftDays = Math.ceil((oData.totalChapterNum - oData.curChapterNum) / oData.updateNum)

      let curWeekLeftDay = 0
      const curDayIndex = oData.weekDays.indexOf(curDay)
      if (curDayIndex > -1) {
        curWeekLeftDay = oData.weekDays.length - curDayIndex
      }
      const leftWeeksWithoutCurWeek = Math.ceil((leftDays - curWeekLeftDay) / oData.weekDays.length)
      const theLastWeekDayIndex = (leftDays - curWeekLeftDay) % oData.weekDays.length || oData.weekDays.length
      const theLastWeekDay = oData.weekDays[theLastWeekDayIndex - 1]
      const totolLeftDays = (7 - curDay) + leftWeeksWithoutCurWeek * 7 - (7 - theLastWeekDay)
      endDate = curDate.getTime() + totolLeftDays * 86400000

      oData.endDate = endDate
    }

    const aData: chapterData[] = getStorage<chapterData>('chapter')
    this.fSaveData(aData, oData)
  }

  fSaveData (aData: chapterData[], oData: chapterData) {
    oData.index = aData.length ? aData[aData.length - 1].index + 1 : 1
    aData.push(oData)

    setStorage<chapterData>('chapter', aData)

    if (this.waiting && this.aWaitingList.length) {
      let index = -1
      let len: number = this.aWaitingList.length
      for (let i = 0; i < len; i++) {
        if (this.aWaitingList[i].index === this.waiting) {
          index = i
          break
        }
      }
      if (index > -1) {
        this.aWaitingList.splice(index, 1)
        setStorage<WaitingItem>('waiting', this.aWaitingList)
      }
    }

    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  render () {
    return (
      <View className="add-page">
        <AtForm>
          <FormField label="剧名">
            <AtInput
              name='value'
              type='text'
              placeholder='请输入剧名'
              value={this.state.title}
              onChange={this.handleTitleChange}
            />
          </FormField>
          <FormField label="类型">
            <AtRadio
              options={aType}
              value={this.state.type}
              onClick={this.handleTypeChange}
            />
          </FormField>
          <FormField label="平台">
            <AtRadio
              options={aPlatform}
              value={this.state.platform}
              onClick={this.handlePlatformChange}
            />
          </FormField>
          <FormField label="周更频率">
            <AtCheckbox
              options={aWeekDay}
              selectedList={this.state.weekDays}
              onChange={this.handleWeekdaysChange}
            />
          </FormField>
          <FormField label="更新时间">
            <Picker mode="time" onChange={(e) => this.handleUpdateTimeChange(e.detail.value)} value={this.state.updateTime}>
              <AtList>
                <AtListItem title='请选择时间' extraText={this.state.updateTime} />
              </AtList>
            </Picker>
          </FormField>
          <FormField label="更新集数">
            <AtInputNumber
              type="digit"
              min={0}
              max={999}
              step={1}
              value={this.state.updateNum}
              onChange={this.handleUpdateNumChange}
            />
          </FormField>
          <FormField label="已更新集数">
            <AtInputNumber
              type="digit"
              min={0}
              max={999}
              step={1}
              value={this.state.curChapterNum}
              onChange={this.handleCurChapterNumChange}
            />
            <View style="font-size: 12px;color: red;">如果创建当日有更新，不算在已更新集数中</View>
          </FormField>
          <FormField label="总集数">
            <AtInputNumber
              type="digit"
              min={0}
              max={999}
              step={1}
              value={this.state.totalChapterNum}
              onChange={this.handleTotalChapterNumChange}
            />
          </FormField>
          <AtButton type="primary" size="small" circle={true} onClick={this.handleSubmit}>保存</AtButton>
        </AtForm>
      </View>
    )
  }
}
