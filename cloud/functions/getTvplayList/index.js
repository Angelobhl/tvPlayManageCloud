// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()

  let openID = event.openID

  if (!openID) {
    const wxContext = cloud.getWXContext()
    openID = wxContext.OPENID
  }

  const dataSet = db.collection('typlayLists')

  return dataSet.where({
    _id: openID
  }).get().then(res => {
    console.log(res)

    if (res.data.length) {
      return {
        openID: openID,
        list: res.data[0].list
      }
    } else {
      return dataSet.add({
        data: {
          _id: openID,
          list: []
        }
      }).then(res => {
        return {
          openID: openID,
          list: []
        }
      })
    }
  })
}