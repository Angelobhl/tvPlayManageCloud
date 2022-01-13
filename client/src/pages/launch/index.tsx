import { Component } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {PlatformItem, TypeItem} from '../../types/common'
import { setStorage } from '../../util/common'

export default class Index extends Component<{}> {

  constructor (props: {}) {
    super(props)
  }

  componentWillMount () {}

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () {
    Taro.cloud.callFunction({
      name: 'platformLists',
      data: {}
    }).then(res => {
      const { aPlatform, aType } = res.result as {aPlatform: [], aType: []}

      setStorage<PlatformItem>('platform', aPlatform)
      setStorage<TypeItem>('types', aType)

      Taro.switchTab({
        url: '/pages/index/index'
      })
    })
  }

  componentDidHide () { }

  render () {
    return (
      <View></View>
    )
  }
}
