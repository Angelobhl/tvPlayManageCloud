// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()

  return db.collection('platforms').doc('54ad1eea61dd43e105800303362e1273').get().then(res => {
    console.log(res)

    return res
  })
}