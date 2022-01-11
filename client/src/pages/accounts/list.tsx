import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import {AccountItem} from '../../types/accounts'
import { AtButton, AtList, AtListItem } from 'taro-ui'

import "taro-ui/dist/style/components/flex.scss"
import "taro-ui/dist/style/components/button.scss" // 按需引入
import 'taro-ui/dist/style/components/list.scss' // 按需引入
import 'taro-ui/dist/style/components/icon.scss' // 按需引入
import './account.scss'

interface AccountsListState {
  lists: AccountItem[]
}

function ListItem (props: AccountItem) {
  function handleClick (index: number) {
    Taro.navigateTo({
      url: `/pages/accounts/edit?index=${index}`
    })
  }

  return (
    <AtListItem title={props.name} note={props.account} extraText={props.endLine} arrow="right" onClick={() => {handleClick(props.index)}} />
  )
}

export default class AccountList extends Component<{}, AccountsListState> {
  constructor (prop: {}) {
    super(prop)

    this.state = {
      lists: []
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    const {keys} = Taro.getStorageInfoSync()
    let accounts: string = ''
    if (keys.length > 0) {
      accounts = Taro.getStorageSync('accounts')
    }

    this.setState({
      lists: accounts ? JSON.parse(accounts) : []
    })
  }

  componentDidHide () { }

  handleAddClick () {
    Taro.navigateTo({
      url: '/pages/accounts/add'
    })
  }

  handlePageJump (url: string) {
    Taro.navigateTo({
      url: url
    })
  }

  render () {
    return (
      <View className='account-list'>
        <View style="margin: 10px;">
        {
          this.state.lists.length ? (
            <AtList>
              {
                this.state.lists.map((item: AccountItem) => {
                  return (<ListItem {...item} key={item.index} />)
                })
              }
            </AtList>
          ) : <View></View>
        }
        </View>
        <View className="at-row at-row__justify--around" style="margin-bottom: 10px;">
          <View className="at-col at-col-11">
            <AtButton type="primary" size="small" circle={true} onClick={this.handleAddClick}>添加</AtButton>
          </View>
        </View>
        <View className="at-row at-row__justify--around">
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/accounts/import') }}>导入</AtButton>
          </View>
          <View className="at-col at-col-5">
            <AtButton type="primary" size="small" circle={true} onClick={() => { this.handlePageJump('/pages/accounts/export') }}>导出</AtButton>
          </View>
        </View>
      </View>
    )
  }
}
