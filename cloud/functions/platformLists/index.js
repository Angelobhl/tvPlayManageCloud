// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const aType = [
    { label: '电视剧', value: 'tvplay' },
    { label: '综艺', value: 'varietyshow' },
    { label: '动漫', value: 'cartoon' },
    { label: '电影', value: 'film' }
  ]

  const aPlatform = [
    { label: '爱奇艺', value: 'iqiyi' },
    { label: '腾讯', value: 'tt' },
    { label: '芒果TV', value: 'mgtv' },
    { label: '优酷', value: 'youku' },
    { label: '哔哩哔哩', value: 'bilibili' }
  ]

  return {
    aPlatform,
    aType
  }
}