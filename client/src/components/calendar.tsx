import React from "react";
import { View, Text } from '@tarojs/components'
import { AtBadge } from 'taro-ui'
import {CalendarDay, CalendarProps, CalendarWeek, CalendarState, DayItemProps} from '../types/calendar'
import '../static/css/calendar.scss'
import {chapterCalendarData} from '../types/common'
import {dayArrJoin} from '../util/common'

import 'taro-ui/dist/style/components/badge.scss'

function DayItem (props: DayItemProps) {
  const day = props.day
  let aClass = ['calendar-day']

  if (day.selected) {
    aClass.push('selected')
  }
  if (day.beToday) {
    aClass.push('beToday')
  }
  if (day.picked) {
    aClass.push('picked')
    if (day.beOverdue) {
      aClass.push('overdued')
    }
  }
  if (!day.curMonth) {
    aClass.push('disabled')
  }

  return (
    <View className={aClass.join(' ')} onClick={() => {props.handleClick && props.handleClick(day.index)}}>
      <View className="calendar-day-txt">
        {
          day.pickNum ? (<AtBadge value={day.pickNum} className="calendar-day-badge"><Text>{day.beToday ? '今' : day.day}</Text></AtBadge>) : (<Text>{day.beToday ? '今' : day.day}</Text>)
        }
      </View>
    </View>
  )
}

class Calendar extends React.Component<CalendarProps, CalendarState> {
  todayYear: number;
  todayMonth: number;
  todayDate: number;
  todayDateStr: string;
  selectDay: CalendarDay;

  constructor (props: CalendarProps) {
    super(props)

    const weeks: CalendarWeek[] = [
      { week: '日' },
      { week: '一' },
      { week: '二' },
      { week: '三' },
      { week: '四' },
      { week: '五' },
      { week: '六' }
    ]
    const today = new Date()
    this.todayYear = today.getFullYear()
    this.todayMonth = today.getMonth() + 1
    this.todayDate = today.getDate()

    this.state = {
      weeks: weeks,
      aDays: [] as CalendarDay[],
      title: '',
      year: this.todayYear,
      month: this.todayMonth
    }

    this.todayDateStr = dayArrJoin([this.todayYear, this.todayMonth, this.todayDate])

    this.handleDayClick = this.handleDayClick.bind(this)
  }

  componentDidMount () {
    this.buildCalendar(this.todayYear, this.todayMonth)
  }

  monthChange (prev: boolean, daySelect?: string) {
    let newMonth: number = this.state.month
    let newYear: number = this.state.year
    if (prev) {
      newMonth -= 1
      if (newMonth < 1) {
        newYear -= 1
        newMonth = 12
      }
    } else {
      newMonth += 1
      if (newMonth > 12) {
        newYear += 1
        newMonth = 1
      }
    }

    this.setState({
      year: newYear,
      month: newMonth
    })
    this.buildCalendar(newYear, newMonth, daySelect || this.selectDay.index)
  }

  buildCalendar (year: number, month: number, daySelect?: string) {
    const theLastDay = (new Date(year, month, 1, 0, 0, -1))
    const theLastDate = theLastDay.getDate()
    const theFirstDay = (new Date(year, month - 1, 1, 0, 0, 0))

    let i = 1
    const aDays: CalendarDay[] = []
    let selectDay: CalendarDay
    for (; i <= theLastDate; i++) {
      const day = dayArrJoin([year, month, i])
      const selected: boolean = daySelect ? daySelect === day : day === this.todayDateStr
      aDays.push({
        index: day,
        day: i,
        selected: selected,
        picked: false,
        beToday: day === this.todayDateStr,
        curMonth: true,
        beOverdue: false
      })

      if (selected) {
        selectDay = aDays[aDays.length - 1]
      }
    }
    // 补充月头前缺失的周的天
    const theMonthFirstDay = theFirstDay.getDay()
    let j = theMonthFirstDay
    let blankDayTime: number = 0
    let blankDate: Date
    for (; j > 0; j--) {
      if (!blankDayTime) {
        blankDayTime = theFirstDay.getTime() - 1000
      } else {
        blankDayTime = blankDayTime - 86400000
      }
      blankDate = new Date(blankDayTime)
      const blankYear = blankDate.getFullYear()
      const blankMonth = blankDate.getMonth() + 1
      const blankDay = blankDate.getDate()

      const day = dayArrJoin([blankYear, blankMonth, blankDay])
      aDays.unshift({
        index: day,
        day: blankDay,
        selected: false,
        picked: false,
        beToday: day === this.todayDateStr,
        curMonth: false,
        lastMonth: true,
        beOverdue: false
      })
    }

    // 补充月尾缺失的周的天
    const theMonthLastDay = theLastDay.getDay()
    j = theMonthLastDay
    blankDayTime = 0
    for (; j < 6; j++) {
      if (!blankDayTime) {
        blankDayTime = theLastDay.getTime() + 86400000
      } else {
        blankDayTime = blankDayTime + 86400000
      }
      blankDate = new Date(blankDayTime)
      const blankYear = blankDate.getFullYear()
      const blankMonth = blankDate.getMonth() + 1
      const blankDay = blankDate.getDate()

      const day = dayArrJoin([blankYear, blankMonth, blankDay])
      aDays.push({
        index: day,
        day: blankDay,
        selected: false,
        picked: false,
        beToday: day === this.todayDateStr,
        curMonth: false,
        lastMonth: false,
        beOverdue: false
      })
    }

    this.setState({
      title: month < 10 ? `${year}.0${month}` : `${year}.${month}`,
      aDays: aDays
    }, () => {
      selectDay && (this.selectDay = selectDay)
      this.props.afterRender && this.props.afterRender(this.props.source, aDays[0].index, aDays[aDays.length - 1].index, selectDay)
    })
  }

  handleDayClick (index: string) {
    let item: CalendarDay
    let curDays = this.state.aDays
    let selectDay: CalendarDay
    let changeMonth: boolean = false
    let monthPrev: boolean = false
    for (item of curDays) {
      if (item.index === index) {
        if (item.curMonth) {
          if (!item.selected) {
            item.selected = true
            selectDay = item
          }
        } else {
          changeMonth = true
          monthPrev = item.lastMonth
          break
        }
      } else {
        if (item.selected) {
          item.selected = false
        }
      }
    }
    if (changeMonth) {
      this.monthChange(monthPrev, index)
    } else if (!!selectDay) {
      this.setState({
        aDays: curDays
      })
      this.selectDay = selectDay
      this.props.handleDayClick && this.props.handleDayClick(selectDay)
    }
  }

  pickDay (calendarData: chapterCalendarData) {
    let item: CalendarDay
    let curDays: CalendarDay[] = this.state.aDays
    for (item of curDays) {
      item.picked = !!calendarData[item.index]
      item.pickNum = item.picked ? calendarData[item.index].length : 0
      item.beOverdue = item.picked ? item.index < this.todayDateStr : false
    }
    this.setState({
      aDays: curDays
    })
  }

  render () {
    return (
      <View className="calendar-layer">
        <View className="calendar-header">
          <View className="icon icon-prev" onClick={() => {this.monthChange(true)}}></View>
          <Text className="title">{this.state.title}</Text>
          <View className="icon icon-next" onClick={() => {this.monthChange(false)}}></View>
        </View>
        <View className="calendar-weeks">
          {
            this.state.weeks.map(item => {
              return (<Text className="calendar-week-item" key={item.week}>{item.week}</Text>)
            })
          }
        </View>
        <View className="calendar-days">
          {
            this.state.aDays.map(item => {
              // return dayItem(item)
              return (<DayItem day={item} key={item.index} handleClick={this.handleDayClick} />)
            })
          }
        </View>
      </View>
    )
  }
}

export default Calendar