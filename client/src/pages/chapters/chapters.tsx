import { Component, createRef } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtButton } from 'taro-ui'
import ChapterList from '../index/chapterList'
import {chapterData, ChapterListItemProp, platformListsResult} from '../../types/common'
import {aPlatform} from '../../util/const'
import {getStorage, setStorage} from '../../util/common'

import './chapters.scss'

let oPlatform = {}
aPlatform.forEach(item => {
  oPlatform[item.value] = item.label
})

export default class Chapters extends Component {
  chapterListRef: React.RefObject<ChapterList>

  constructor (props: {}) {
    super(props)

    this.chapterListRef = createRef()
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    const aChapterData: chapterData[] = getStorage<chapterData>('chapter')
    this.refleshChapterList(aChapterData)
  }

  componentDidHide () { }

  refleshChapterList (aChapterData: chapterData[]) {
    let aList: ChapterListItemProp[] = []

    if (aChapterData.length) {
      let item: chapterData
      for (item of aChapterData) {
        aList.push({
          index: item.index,
          title: item.title,
          chapterNum: item.isEnd ? '已完结' : '',
          platform: oPlatform[item.platform]
        })
      }
      aList.sort((a: ChapterListItemProp, b: ChapterListItemProp) => {
        return a.chapterNum > b.chapterNum ? 1 : -1
      })
    }

    this.chapterListRef.current && this.chapterListRef.current.fSetList(aList)
  }

  handleLoadFromCloud () {
    Taro.showModal({
      title: '提示',
      content: '确认用云端的剧集列表覆盖本地的剧集列表？'
    }).then(res => {
      if (res.confirm) {
        const openID: string = Taro.getStorageSync('openID')

        Taro.cloud.callFunction({
          name: 'getTvplayList',
          data: {
            openID: openID || ''
          }
        }).then(res => {
          // res.result为resolve返回的值
          // res.result.data为查询的数据，是一个数组；使得用doc().get()，则是一个json
          console.log('pages', res)

          const result: platformListsResult = res.result as platformListsResult
          Taro.setStorageSync('openID', result.openID)

          if (result.list.length) {
            setStorage<chapterData>('chapter', result.list)
            this.refleshChapterList(result.list)
          }
        })
      }
    })
  }

  submitToCloud () {
    Taro.showModal({
      title: '提示',
      content: '确认用本地的剧集列表覆盖云端的剧集列表？'
    }).then(res => {
      if (res.confirm) {
        const openID: string = Taro.getStorageSync('openID')
        const aChapterData: chapterData[] = getStorage<chapterData>('chapter')

        if (openID && aChapterData.length) {
          Taro.cloud.callFunction({
            name: 'updateTvplayList',
            data: {
              openID: openID,
              list: aChapterData
            }
          })
        }
      }
    })
  }

  handlePageJump (url: string) {
    Taro.navigateTo({
      url: url
    })
  }

  render () {
    return (
      <View className='chapterList'>
        <ChapterList ref={this.chapterListRef} />
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handleLoadFromCloud() }}>从云端导入</AtButton>
          </View>
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.submitToCloud() }}>保存到云端</AtButton>
          </View>
        </View>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/import/import') }}>文本导入</AtButton>
          </View>
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/export/export') }}>文本导出</AtButton>
          </View>
        </View>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/add/add') }}>添加</AtButton>
          </View>
        </View>
      </View>
    )
  }
}
