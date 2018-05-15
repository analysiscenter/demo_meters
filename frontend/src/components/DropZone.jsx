import React from 'react'
import { inject, observer } from 'mobx-react'
import Dropzone from 'react-dropzone'

@inject("mtStore")
@observer
export class DropZone extends React.Component {
  onDrop (acceptedFiles, rejectedFiles) {
    let that = this
    let reader = new FileReader()
    reader.readAsDataURL(acceptedFiles.pop())
    reader.onload = function (e) {
      var img = new Image()
      img.src = reader.result
      img.onload = function () {
        if (Math.min(img.width, img.height) > 300) {
          const factor = 300 / Math.min(img.width, img.height)
          const width = img.width * factor
          const height = img.height * factor         
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          var url = canvas.toDataURL()
          var imgReduced = new Image()
          imgReduced.src = url
          console.log(width, height)
          imgReduced.onload = function () {
            that.props.mtStore.uploadImage(imgReduced.src)
            that.props.handleNewImage(imgReduced)
          }
        } else {
          that.props.mtStore.uploadImage(reader.result)
          that.props.handleNewImage(img)
        }
      }
    }
  }

  render () {
    return (
      <Dropzone className='dropzone'
        activeClassName='dropzone active'
        rejectClassName='dropzone reject'
        accept='image/jpeg, image/png' onDrop={this.onDrop.bind(this)}>
        <div className='drop-text'>
          <div>
            Для загрузки нажмите или перетащите файл сюда. Допустимый формат jpeg или png.
          </div>
        </div>
      </Dropzone>
    )
  }
}
