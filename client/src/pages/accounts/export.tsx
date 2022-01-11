import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'

import "taro-ui/dist/style/components/flex.scss"
import "taro-ui/dist/style/components/button.scss" // 按需引入

interface ExportState {
  chapterJSON: string
}

export default class Export extends Component<{}, ExportState> {
  constructor (prop: {}) {
    super(prop)

    this.state = {
      chapterJSON: ''
    }
  }

  componentWillMount () { }

  componentDidMount () {
    const {keys} = Taro.getStorageInfoSync()
    if (keys.length > 0) {
      const aChapterData = Taro.getStorageSync('accounts')
      this.setState({
        chapterJSON: aChapterData
      })
    }
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleCopy () {
    Taro.setClipboardData({
      data: this.state.chapterJSON
    })
  }

  render () {
    return (
      <View className='export'>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-11">
            <View style="word-break: break-all;white-space: pre-line;">{this.state.chapterJSON}</View>
          </View>
        </View>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-11">
            <AtButton type="primary" size="small" circle={true} onClick={this.handleCopy.bind(this)}>复制</AtButton>
          </View>
        </View>
      </View>
    )
  }
}
