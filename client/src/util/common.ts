import Taro from '@tarojs/taro'

export const getStorage = function<T>(key: string): T[] {
  let result: T[] = []

  const {keys} = Taro.getStorageInfoSync()
  if (keys.length > 0) {
    const data = Taro.getStorageSync(key)
    if (data) {
      result = JSON.parse(data)
    }
  }

  return result
}

export const setStorage = function<T>(key: string, data: T[] | string): void {
  try {
    Taro.setStorageSync(key, typeof data === 'string' ? data : JSON.stringify(data))
  } catch (e) {}
}

export const dayArrJoin = function (dayArr: number[] | string[], joinStr: string = '-'): string {
  if (+dayArr[1] < 10) {
    dayArr[1] = '0' + dayArr[1]
  }
  if (+dayArr[2] < 10) {
    dayArr[2] = '0' + dayArr[2]
  }
  return dayArr.join(joinStr)
}
