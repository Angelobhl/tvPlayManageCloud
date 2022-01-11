export interface addState {
  title: string,
  type: string,
  platform: string,
  weekDays: number[],
  updateTime: string,
  updateNum: number,
  curChapterNum: number,
  totalChapterNum: number
}

export interface chapterData extends addState {
  index: number,
  createdDate: number,
  endDate: number,
  isEnd: boolean
}

export interface chapterCalendarItemData {
  index: number,
  chapter: number[]
}

export interface chapterCalendarData {
  [propName: string]: chapterCalendarItemData[]
}

export interface ChapterListItemProp {
  index: number,
  title: string,
  chapterNum: string,
  platform: string
}

export interface ChapterListState {
  list: ChapterListItemProp[]
}

export interface PlatformItem {
  label: string,
  value: string
}

export interface WaitingItemAdd {
  title: string,
  date: string,
  type: string,
  platform: string
}

export interface WaitingItem extends WaitingItemAdd {
  index: number
}
