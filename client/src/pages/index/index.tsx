import { Component, createRef } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtButton } from 'taro-ui'
import Calendar from '../../components/calendar'
import ChapterList from './chapterList'
import {CalendarDay} from '../../types/calendar'
import {chapterData, chapterCalendarItemData, chapterCalendarData, ChapterListItemProp} from '../../types/common'
import {aPlatform} from '../../util/const'
import { getStorage, dayArrJoin } from '../../util/common'

let oPlatform = {}
aPlatform.forEach(item => {
  oPlatform[item.value] = item.label
})

import "taro-ui/dist/style/components/flex.scss"
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/list.scss' // 按需引入
import 'taro-ui/dist/style/components/icon.scss' // 按需引入
import './index.scss'

// 数据改成state
// 导入的数据格式检测

export default class Index extends Component<{}> {
  // 当前日历开始日期
  calendarDayStart: number
  // 当前日历结束日期
  calendarDayEnd: number
  // 日历上选择的日期
  selectDay: CalendarDay

  // 所有需要在日历上显示的剧集数据
  aChapterData: chapterData[]
  // 所有剧集的hash对象
  oChapterData: {
    [propName: string]: chapterData
  } = {}
  // 当前日历上要展示的剧集数据
  calendarData: chapterCalendarData

  // 日历的ref对象
  calendarRef: React.RefObject<Calendar>
  // 列表的ref对象
  chapterListRef: React.RefObject<ChapterList>

  constructor (props: {}) {
    super(props)

    this.calendarRef = createRef()
    this.chapterListRef = createRef()
  }

  componentWillMount () { }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () {
    const aChapterData: chapterData[] = getStorage<chapterData>('chapter')
    if (aChapterData.length) {
      this.aChapterData = aChapterData
      let item: chapterData
      for (item of this.aChapterData) {
        this.oChapterData['index_' + item.index] = item
      }
      this.fInitChapterData()
    }
  }

  componentDidHide () { }

  theDayDate (time: number) {
    const flag: number = 1612108800000
    return time - (time - flag) % 86400000
  }

  fInitChapterData () {
    // 遍历数组，算出每一部电视剧，剩余集数对应的具体年月日，包括今天
    // step1: 循环数组，把添加时间、结束时间，在start、end范围里的剧集，放在一个数组里，然后按添加时间排序
    // 排除已经完结的剧集
    let curCalendarData: chapterData[] = []
    let item: chapterData
    for (item of this.aChapterData) {
      const createdDate: number = this.theDayDate(item.createdDate)
      const endDate: number = item.endDate || this.calendarDayEnd

      if (!item.isEnd && createdDate <= this.calendarDayEnd && (createdDate >= this.calendarDayStart || endDate >= this.calendarDayStart)) {
        curCalendarData.push(item)
      }
    }
    curCalendarData.sort((a: chapterData, b: chapterData) => { return a.createdDate - b.createdDate })

    // step2：循环上一步生成的数组，计算出每一部剧在当前日历范围里具体的更新日期
    this.calendarData = {}
    const startDay: number = new Date(this.calendarDayStart).getDay()
    const rangeDays: number = (this.calendarDayEnd - this.calendarDayStart) / 86400000 + 1
    for (item of curCalendarData) {
      // 1、从开始时间计算，当前剧，已更新多少集
      let curChapterNum: number = item.curChapterNum
      // 不是当前范围里添加的，需要额外添加已经过去的时间里更新的剧集
      const createdDate: number = this.theDayDate(item.createdDate)
      if (createdDate < this.calendarDayStart) {
        const dayPast: number = Math.ceil((this.calendarDayStart - createdDate) / 86400000)

        // 已经过去的天数，换算出一个完整的周的数量
        // 加上这几个周里更新的集数
        curChapterNum += Math.floor(dayPast / 7) * item.weekDays.length * item.updateNum

        // 已经过去的天数，除去完整的周，还剩的天数
        // 加上这几天里，符合更新天的集数
        const dayPastLeft: number = dayPast % 7
        let day = new Date(createdDate).getDay() || 7
        let i: number = 0
        for (; i < dayPastLeft; i++){
          if (item.weekDays.includes(day)) {
            curChapterNum += item.updateNum
          }
          day++
          if (day > 7) {
            day = 1
          }
        }
      }

      // 2、当前范围内，需要更新多少集，已经更新的日期
      let forIndex: number = 0
      let day = startDay || 7
      for (; forIndex < rangeDays; forIndex++) {
        if (item.weekDays.includes(day)) {
          const theDate: Date = new Date(this.calendarDayStart + forIndex * 86400000)
          const createdDate: number = this.theDayDate(item.createdDate)
          if (theDate.getTime() >= createdDate && (!item.totalChapterNum || item.totalChapterNum > curChapterNum)) {
            const theDay: string = dayArrJoin([theDate.getFullYear(), theDate.getMonth() + 1, theDate.getDate()])
            if (!this.calendarData[theDay]) {
              this.calendarData[theDay] = []
            }
            let chapter: number[] = []
            let i: number = 0
            for (; i < item.updateNum; i++) {
              if (!item.totalChapterNum || curChapterNum < item.totalChapterNum) {
                chapter.push(++curChapterNum)
              }
            }
            this.calendarData[theDay].push({
              index: item.index,
              chapter: chapter
            })
          }
        }
        day++
        if (day > 7) {
          day = 1
        }
      }
    }

    // step3：在日历上标记有剧集更新的日期
    this.calendarRef.current && this.calendarRef.current.pickDay(this.calendarData)

    // step4：在日历下方，生成选中日期所对应的剧集列表，以时间轴方式展示
    this.fRenderChapterList()
  }

  fRenderChapterList () {
    if (this.selectDay) {
      let aList: ChapterListItemProp[] = []
      const chapterList: chapterCalendarItemData[] = this.calendarData[this.selectDay.index] || []
      let item: chapterCalendarItemData
      let chapter: chapterData
      for (item of chapterList) {
        chapter = this.oChapterData['index_' + item.index]
        // 拼组列表展示的数据
        aList.push({
          index: item.index,
          title: chapter.title,
          chapterNum: item.chapter.join('，'),
          platform: oPlatform[chapter.platform]
        })
      }

      this.chapterListRef.current && this.chapterListRef.current.fSetList(aList)
    }
  }

  handleAddClick () {
    Taro.navigateTo({
      url: '/pages/add/add'
    })
  }

  handleCalendarRender (source: string, start?: string, end?: string, selectDay?: CalendarDay) {
    const aStart: string[] = start.split('-')
    const aEnd: string[] = end.split('-')
    this.calendarDayStart = new Date(+aStart[0], +aStart[1] - 1, +aStart[2]).getTime()
    this.calendarDayEnd = new Date(+aEnd[0], +aEnd[1] - 1, +aEnd[2]).getTime()
    this.selectDay = selectDay
    if (this.aChapterData) {
      this.fInitChapterData()
    }
  }

  handleCalendarDayClick (day: CalendarDay) {
    this.selectDay = day

    // step4：在日历下方，生成选中日期所对应的剧集列表，以时间轴方式展示
    this.fRenderChapterList()
  }

  handlePageJump (url: string) {
    Taro.navigateTo({
      url: url
    })
  }

  render () {
    return (
      <View className='index'>
        <Calendar source="index" afterRender={this.handleCalendarRender.bind(this)} handleDayClick={this.handleCalendarDayClick.bind(this)} ref={this.calendarRef} />
        <ChapterList ref={this.chapterListRef} />
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={this.handleAddClick}>添加</AtButton>
          </View>
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/chapters/chapters') }}>全部剧集</AtButton>
          </View>
        </View>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/import/import') }}>导入</AtButton>
          </View>
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/export/export') }}>导出</AtButton>
          </View>
        </View>
        <View className="at-row at-row__justify--around">
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/platform/list') }}>剧集平台</AtButton>
          </View>
          <View className="at-col at-col-5">
          </View>
        </View>
      </View>
    )
  }
}
