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
      that.props.mtStore.uploadImage(reader.result)
      var img = new Image()
      img.src = reader.result
      img.onload = function () {
        that.props.handleNewImage(img)
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
