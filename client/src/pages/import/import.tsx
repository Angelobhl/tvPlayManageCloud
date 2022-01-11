import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton, AtTextarea } from 'taro-ui'
import {setStorage} from '../../util/common'

import "taro-ui/dist/style/components/flex.scss"
import "taro-ui/dist/style/components/button.scss" // 按需引入
import "taro-ui/dist/style/components/textarea.scss" // 按需引入
import './import.scss'

interface ImportState{
  chapterJSON: string
}

export default class Import extends Component<{}, ImportState> {
  constructor (prop: {}) {
    super(prop)

    this.state = {
      chapterJSON: ''
    }
  }

  componentWillMount () { }

  componentDidMount () {
    const self = this
    Taro.getClipboardData({
      success (res) {
        self.setState({
          chapterJSON: res.data || ''
        })
      }
    })
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleSave () {
    try {
      if (this.state.chapterJSON) {
        setStorage('chapter', this.state.chapterJSON)
        Taro.showToast({
          title: '保存成功'
        })
        Taro.switchTab({
          url: '/pages/index/index'
        })
      }
    } catch (e) {}
  }

  handleChange (value: string) {
    this.setState({
      chapterJSON: value
    })
  }

  render () {
    return (
      <View className='import'>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-11">
            <AtTextarea
              value={this.state.chapterJSON}
              onChange={this.handleChange.bind(this)}
              maxLength={-1}
              count={false}
              height={500}
            />
          </View>
        </View>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-11">
            <AtButton type="primary" size="small" circle={true} onClick={this.handleSave.bind(this)}>保存</AtButton>
          </View>
        </View>
      </View>
    )
  }
}
