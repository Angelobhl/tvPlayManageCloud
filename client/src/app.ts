import { Component } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'

class App extends Component {

  componentDidMount () {
    if (false) {
      if (process.env.TARO_ENV === 'weapp') {
        Taro.cloud.init({
          env: 'cloud1-3gscpohq3da20747'
        })
      }
    }
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
