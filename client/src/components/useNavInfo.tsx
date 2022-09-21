import Taro from '@tarojs/taro'
import {INavInfo} from '../types/common'

function useNavInfo(): INavInfo {
  const { statusBarHeight, screenWidth, screenHeight, windowHeight, safeArea } = Taro.getSystemInfoSync()
  // 获取胶囊信息
  const { width, height, left, top, right } = Taro.getMenuButtonBoundingClientRect()
  // 计算标题栏高度
  const titleBarHeight = height + (top - (statusBarHeight || 0)) * 2
  // 计算导航栏高度
  const appHeaderHeight = (statusBarHeight || 0) + titleBarHeight
  // 边距，两边的
  const marginSides = screenWidth - right
  // 标题宽度
  const titelBarWidth = screenWidth - width - marginSides * 3
  // 去掉导航栏，屏幕剩余的高度
  const contentHeight = screenHeight - appHeaderHeight
  // 全面屏，底部安全高度
  let bottomSafeHeight = 0
  if (safeArea) {
    bottomSafeHeight = screenHeight - safeArea.bottom
  }

  const navInfo: INavInfo = {
    statusBarHeight: statusBarHeight || 0,  //状态栏高度
    titleBarHeight: titleBarHeight,  //标题栏高度
    titelBarWidth: titelBarWidth,  //标题栏宽度
    appHeaderHeight: appHeaderHeight, //整个导航栏高度
    marginSides: marginSides, //侧边距
    capsuleWidth: width,  //胶囊宽度
    capsuleHeight: height,  //胶囊高度
    capsuleLeft: left,
    contentHeight: contentHeight,
    screenHeight: screenHeight,
    windowHeight: windowHeight,
    bottomSafeHeight: bottomSafeHeight
  }
  
  return navInfo
}

export default useNavInfo
