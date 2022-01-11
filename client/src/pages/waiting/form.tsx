import React from "react"
import { View } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { Picker } from '@tarojs/components'
import { AtForm, AtInput, AtButton, AtRadio, AtList, AtListItem } from 'taro-ui'
import {WaitingItem} from '../../types/common'
import {aPlatform, aType} from '../../util/const'
import { getStorage, setStorage } from '../../util/common'

import "taro-ui/dist/style/components/flex.scss"
import 'taro-ui/dist/style/components/form.scss' // 按需引入
import 'taro-ui/dist/style/components/input.scss' // 按需引入
import 'taro-ui/dist/style/components/button.scss' // 按需引入
import 'taro-ui/dist/style/components/radio.scss' // 按需引入
import 'taro-ui/dist/style/components/list.scss' // 按需引入
import 'taro-ui/dist/style/components/icon.scss' // 按需引入
import './form.scss'

function FormField (props: {label: string, children: React.ReactNode}) {
  return (
    <View className="form-field-item">
      <View className="form-field-item-label">{props.label}</View>
      <View className="form-field-item-content">{props.children}</View>
    </View>
  )
}

export default class WaitingForm extends React.Component<{}, WaitingItem> {
  $instance: Taro.Current = getCurrentInstance()
  aList: WaitingItem[]

  constructor (prop: {}) {
    super(prop)

    this.state = {
      index: 0,
      title: '',
      date: '',
      type: '',
      platform: ''
    }
  }

  componentDidShow () {
    this.aList = getStorage<WaitingItem>('waiting')

    let item: WaitingItem = {
      index: +this.$instance.router.params.index || 0,
      title: '',
      date: '',
      type: '',
      platform: ''
    }
    let len: number = this.aList.length
    for (let i = 0; i < len; i++) {
      if (this.aList[i].index === item.index) {
        item.title = this.aList[i].title
        item.date = this.aList[i].date
        item.type = this.aList[i].type
        item.platform = this.aList[i].platform
      }
    }

    this.setState(item)
  }

  handleTitleInput (title: string) {
    this.setState({
      title
    })
  }

  handlePlatformChange (platform: string) {
    this.setState({
      platform
    })
  }

  handleTypeChange (type: string) {
    this.setState({
      type
    })
  }

  handleDateChange (date: string) {
    this.setState({
      date
    })
  }

  handleSave () {
    if (this.state.index > 0) {
      let len: number = this.aList.length
      for (let i: number = 0; i < len; i++) {
        if (this.aList[i].index === this.state.index) {
          this.aList[i].title = this.state.title
          this.aList[i].date = this.state.date
          this.aList[i].platform = this.state.platform
          this.aList[i].type = this.state.type
          break
        }
      }
    } else {
      let item: WaitingItem = {
        index: this.aList.length ? this.aList[this.aList.length - 1].index + 1 : 1,
        title: this.state.title,
        date: this.state.date,
        platform: this.state.platform,
        type: this.state.type
      }
      this.aList.push(item)
    }

    setStorage<WaitingItem>('waiting', this.aList)
    Taro.switchTab({
      url: '/pages/waiting/list'
    })
  }

  handleBeWatching () {
    Taro.redirectTo({
      url: `/pages/add/add?waiting=${this.state.index}`
    })
  }

  handleDel () {
    if (this.state.index > 0) {
      let index: number = -1
      let len: number = this.aList.length
      for (let i = 0; i < len; i++) {
        if (this.aList[i].index === this.state.index) {
          index = i
        }
      }

      if (index > -1) {
        Taro.showModal({
          title: '提示',
          content: '确认删除？'
        }).then(res => {
          if (res.confirm) {
            this.aList.splice(index, 1)
            setStorage<WaitingItem>('waiting', this.aList)
            Taro.switchTab({
              url: '/pages/waiting/list'
            })
          }
        })
      }
    }
  }

  render () {
    return (
      <View className="waiting-form-page">
        <AtForm>
          <FormField label="剧名">
            <AtInput
              name='value'
              type='text'
              placeholder='请输入剧名'
              value={this.state.title}
              onChange={this.handleTitleInput.bind(this)}
            />
          </FormField>
          <FormField label="类型">
            <AtRadio
              options={aType}
              value={this.state.type}
              onClick={this.handleTypeChange.bind(this)}
            />
          </FormField>
          <FormField label="平台">
            <AtRadio
              options={aPlatform}
              value={this.state.platform}
              onClick={this.handlePlatformChange.bind(this)}
            />
          </FormField>
          <FormField label="上线时间">
            <Picker mode="date" onChange={(e) => this.handleDateChange(e.detail.value)} value={this.state.date}>
              <AtList>
                <AtListItem title='请选择时间' extraText={this.state.date} />
              </AtList>
            </Picker>
          </FormField>
          <AtButton type="primary" size="small" circle={true} onClick={this.handleSave.bind(this)}>保存</AtButton>
          {
            this.state.index > 0 ? (
          <View className="at-row at-row__justify--around" style="margin-top: 10px;">
            <View className="at-col at-col-5">
              <AtButton type="primary" size="small" circle={true} onClick={this.handleBeWatching.bind(this)}>开始追</AtButton>
            </View>
            <View className="at-col at-col-5">
              <AtButton type="primary" size="small" circle={true} onClick={this.handleDel.bind(this)}>删除</AtButton>
            </View>
          </View>
            ) : <View></View>
          }
        </AtForm>
      </View>
    )
  }
}
