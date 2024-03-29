import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import {chapterData} from '../../types/common'
import {getStorage} from '../../util/common'
import useNavInfo from '../../components/useNavInfo'

import "taro-ui/dist/style/components/flex.scss"
import "taro-ui/dist/style/components/button.scss" // 按需引入
import './export.scss'

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
    const aChapterData: chapterData[] = getStorage<chapterData>('chapter')
    if (aChapterData.length) {
      this.setState({
        chapterJSON: JSON.stringify(aChapterData)
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
    const useNav = useNavInfo()
    const bottomStyle = {
      paddingBottom: useNav.bottomSafeHeight + 'px'
    }
    return (
      <View className='export' style={bottomStyle}>
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
