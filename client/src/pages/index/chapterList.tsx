import { View } from "@tarojs/components"
import React from "react"
import Taro from '@tarojs/taro'
import { AtList, AtListItem } from 'taro-ui'
import {ChapterListItemProp, ChapterListState} from '../../types/common'

function ChapterListItem (props: ChapterListItemProp) {
  function handleClick (index: number) {
    Taro.navigateTo({
      url: `/pages/detail/detail?index=${index}`
    })
  }

  return (
    <AtListItem title={props.title} note={props.platform} extraText={props.chapterNum} arrow="right" onClick={() => {handleClick(props.index)}} />
  )
}

class ChapterList extends React.Component<{}, ChapterListState> {
  constructor (prop: {}) {
    super(prop)

    this.state = {
      list: []
    }
  }

  fSetList (list: ChapterListItemProp[]) {
    this.setState({
      list
    })
  }

  render () {
    return (
      <View style="margin: 10px;">
      {
        this.state.list.length ? (
          <AtList>
            {
              this.state.list.map(item => {
                return (<ChapterListItem {...item} key={item.index} />)
              })
            }
          </AtList>
        ) : <View></View>
      }
      </View>
    )
  }
}

export default ChapterList
