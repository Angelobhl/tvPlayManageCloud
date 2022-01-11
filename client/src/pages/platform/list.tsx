import React from "react"
import { View, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtList, AtListItem, AtButton, AtInput, AtModal, AtModalHeader, AtModalContent, AtModalAction } from "taro-ui"
import {PlatformItem} from '../../types/common'
import {aPlatform} from '../../util/const'
import { setStorage } from '../../util/common'

import "taro-ui/dist/style/components/flex.scss"
import 'taro-ui/dist/style/components/input.scss' // 按需引入
import "taro-ui/dist/style/components/modal.scss"
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/list.scss' // 按需引入
import 'taro-ui/dist/style/components/icon.scss' // 按需引入
import './list.scss'

interface PlatformListStatus {
  aList: PlatformItem[],
  modelData: PlatformItem,
  addModalShow: boolean,
  modalType: string
}

interface PlatformListItemProp extends PlatformItem {
  handleClick: (item: PlatformItem) => void
}

function PlatformListItem (props: PlatformListItemProp) {
  return (
    <AtListItem title={props.label} arrow="right" onClick={() => {props.handleClick({label: props.label, value: props.value})}} />
  )
}

export default class PlatformList extends React.Component<{}, PlatformListStatus> {
  aPlatform: PlatformItem[] = []

  constructor (prop: {}) {
    super(prop)

    this.state = {
      aList: [],
      modelData: {label: '', value: ''},
      addModalShow: false,
      modalType: ''
    }
  }

  initPlatformData () {
    this.aPlatform = aPlatform
  }

  storePlatformStorage (aPlatform: PlatformItem[]) {
    setStorage<PlatformItem>('platform', aPlatform)
  }

  componentDidShow () {
    this.initPlatformData()

    this.setState({
      aList: this.aPlatform
    })
  }

  handleAddClick () {
    this.handleShowModal({label: '', value: ''})
  }

  handleItemClick (item: PlatformItem) {
    this.handleShowModal(item)
  }

  handleShowModal (item: PlatformItem) {
    this.setState({
      modelData: item,
      addModalShow: true,
      modalType: item.value ? 'edit' : 'add'
    })
  }

  fCancelModal () {
    this.setState({
      addModalShow: false
    })
  }

  fSavePlatform () {
    let item: PlatformItem = {label: '', value: ''}
    item.label = this.state.modelData.label
    item.value = this.state.modelData.value

    if (!item.label || !item.value) {
      Taro.showToast({
        title: '全部必填',
        icon: 'none'
      })
      return false
    }

    if (this.state.modalType === 'add') {
      this.aPlatform.push(item)
    } else {
      for (let i = 0; 0 < this.aPlatform.length; i++) {
        if (this.aPlatform[i].value === item.value) {
          this.aPlatform[i].label = item.label
          break
        }
      }
    }

    this.storePlatformStorage(this.aPlatform)
    this.setState({
      aList: this.aPlatform,
      addModalShow: false
    })
  }

  handleModalPlatformTitle (label: string) {
    this.setState({
      modelData: {label: label, value: this.state.modelData.value}
    })
  }

  handleModalPlatformValue (value: string) {
    if (this.state.modalType === 'add') {
      this.setState({
        modelData: {label: this.state.modelData.label, value: value}
      })
    }
  }

  render () {
    return  (
      <View className="platform-list-page">
        <AtModal isOpened={this.state.addModalShow}>
          <AtModalHeader>{this.state.modalType === 'add' ? '添加平台' : '编辑平台'}</AtModalHeader>
          <AtModalContent>
            <AtInput
              name='label'
              type='text'
              placeholder='请输入名称'
              value={this.state.modelData.label}
              onChange={this.handleModalPlatformTitle.bind(this)}
            />
            <AtInput
              disabled={this.state.modalType !== 'add'}
              name='value'
              type='text'
              placeholder='请输入关键字'
              value={this.state.modelData.value}
              onChange={this.handleModalPlatformValue.bind(this)}
            />
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.fCancelModal.bind(this)}>取消</Button>
            <Button onClick={this.fSavePlatform.bind(this)}>确定</Button>
          </AtModalAction>
        </AtModal>
        {
        this.state.aList.length ? (
          <AtList>
            {
              this.state.aList.map(item => {
                return (<PlatformListItem {...item} key={item.value} handleClick={this.handleItemClick.bind(this)} />)
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
