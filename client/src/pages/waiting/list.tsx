import React from "react"
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtList, AtListItem, AtButton } from "taro-ui"
import {WaitingItem} from '../../types/common'
import {aPlatform} from '../../util/const'
import { getStorage } from '../../util/common'

let oPlatform = {}
aPlatform.forEach(item => {
  oPlatform[item.value] = item.label
})

import "taro-ui/dist/style/components/flex.scss"
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/list.scss' // 按需引入
import 'taro-ui/dist/style/components/icon.scss' // 按需引入
import './list.scss'

interface WaitingListState {
  aList: WaitingItem[]
}

function WaitingListItem (props: WaitingItem) {
  function handleClick (index: number) {
    Taro.navigateTo({
      url: `/pages/waiting/form?index=${index}`
    })
  }

  return (
    <AtListItem title={props.title} note={oPlatform[props.platform]} arrow="right" onClick={() => {handleClick(props.index)}} />
  )
}

export default class WaitingList extends React.Component<{}, WaitingListState> {
  constructor (prop: {}){
    super(prop)

    this.state = {
      aList: []
    }
  }

  componentDidShow () {
    const aList: WaitingItem[] = getStorage<WaitingItem>('waiting')

    this.setState({
      aList
    })
  }

  handleAddClick () {
    Taro.navigateTo({
      url: '/pages/waiting/form'
    })
  }

  render () {
    return (
      <View className="waiting-list-page">
        {
        this.state.aList.length ? (
          <AtList>
            {
              this.state.aList.map(item => {
                return (<WaitingListItem {...item} key={item.index} />)
              })
            }
          </AtList>
        ) : <View></View>
        }
        <View className="at-row at-row__justify--around" style="margin-top: 10px;">
          <View className="at-col at-col-11">
            <AtButton type="primary" size="small" onClick={this.handleAddClick.bind(this)}>添加</AtButton>
          </View>
        </View>
      </View>
    )
  }
}
