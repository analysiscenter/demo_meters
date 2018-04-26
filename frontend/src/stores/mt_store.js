import { observable, autorun, action } from 'mobx'

import { API_Events } from './const'

const itemTemplate = {
  id: null,
  image: null,
  thumbnail: null,
  inference: null,
  waitingData: false,
  waitingInference: false
}

export default class MtStore {
  server = null
  @observable ready = false
  @observable items = new Map()

  constructor (server) {
    this.server = server
    autorun(() => this.onConnect())
    this.server.subscribe(API_Events.MT_GOT_LIST, this.onGotList.bind(this))
    this.server.subscribe(API_Events.MT_GOT_ITEM_DATA, this.onGotItemData.bind(this))
    this.server.subscribe(API_Events.MT_GOT_INFERENCE, this.onGotInference.bind(this))
  }

  onConnect () {
    if ((this.items.size === 0) & this.server.ready) {
      this.server.send(API_Events.MT_GET_LIST)
    }
  }

  @action
  onGotList (data, meta) {
    data.map((item) => this.items.set(item.id, Object.assign({}, itemTemplate, item)))
    this.ready = true
  }

  @action
  onGotItemData (data, meta) {
    const item = this.items.get(data.id)
    let image = new Image()
    let that = this
    const src = new Uint8Array(data.src).reduce((data, byte) => data + String.fromCharCode(byte), '')
    image.src = 'data:image/jpeg;base64,' + src
    image.onload = function () {
      item.image = image
      that.setThumbnail(data.id, image)
      item.waitingData = false
    }
  }

  setThumbnail (id, image) {
    const item = this.items.get(id)
    const canvas = document.createElement('canvas')
    canvas.width = 150
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    const minSize = Math.min(image.width, image.height)
    const xShift = (image.width - minSize) / 2
    const yShift = (image.height - minSize) / 2
    ctx.drawImage(image, xShift, yShift, minSize, minSize,
      0, 0, canvas.width, canvas.height)
    var url = canvas.toDataURL()
    var thumbnail = new Image()
    thumbnail.src = url
    thumbnail.onload = function () {
      item.thumbnail = thumbnail
    }
  }

  @action
  onGotInference (data, meta) {
    const item = this.items.get(data.id)
    item.inference = data.inference
    item.waitingInference = false
  }

  @action
  getItemData (id) {
    const item = this.items.get(id)
    if (item !== undefined) {
      if (!item.waitingData) {
        item.waitingData = true
        this.server.send(API_Events.MT_GET_ITEM_DATA, {id: id})
      }
    }
  }

  getInference (id) {
    if (!this.items.get(id).waitingInference) {
      this.items.get(id).waitingInference = true
      this.server.send(API_Events.MT_GET_INFERENCE, {id: id})
    }
  }

  uploadImage (src, id) {
    this.server.send(API_Events.MT_UPLOAD_IMAGE, {src: src, id: id}, {})
  }

  setImage (item) {
    this.items.set(item.id, Object.assign({}, itemTemplate, item))
    this.setThumbnail(item.id, item.image)
  }

  get (id) {
    const item = this.items.get(id)
    if (item !== undefined) {
      if (item.image === null) { this.getItemData(id) }
    }
    return item
  }
}
