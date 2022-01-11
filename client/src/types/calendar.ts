export interface CalendarDay {
  index: string,
  day: number | '',
  selected: boolean,
  picked: boolean,
  beToday: boolean,
  curMonth: boolean,
  lastMonth?: boolean,
  pickNum?: number,
  beOverdue?: boolean
}

export interface CalendarProps {
  source: string,
  afterRender?: (source: string, start?: string, end?: string, selectDay?: CalendarDay) => void,
  handleDayClick?: (day?: CalendarDay) => void
}

export interface CalendarWeek {
  week: string
}

export interface CalendarState {
  weeks: CalendarWeek[],
  aDays: CalendarDay[],
  title: string,
  year: number,
  month: number
}

export interface DayItemProps {
  day: CalendarDay,
  handleClick?: (index: string) => void
}
