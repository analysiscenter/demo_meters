import React from 'react'
import { Grid, Row } from 'react-bootstrap'
import { inject, observer } from 'mobx-react'
import { DropZone } from './DropZone.jsx'
import { MtItem } from './MeterViewer.jsx'
import { UrlUpload } from './UrlUpload.jsx'
import { MetersSlider } from './Slider.jsx'

@inject("mtStore")
@observer
export default class MainPage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      inputSource: 'gallery',
      showId: null,
      uploadedTotal: 0,
      uploadFailed: false
    }

    this.handleNewImage = this.handleNewImage.bind(this)
    this.handleSetId = this.handleSetId.bind(this)
  }

  handleNewImage (image) {
    if (image === null) {
      this.setState({uploadFailed: true})
      return
    } else {
      if (this.state.uploadFailed) {
        this.setState({uploadFailed: false})
      }
    }
    let id = `uploaded/image_${this.state.uploadedTotal.toString()}.png`
    this.handleSetId(id)
    this.setState({uploadedTotal: this.state.uploadedTotal + 1})
    console.log('NEW ITEM', id)
    let item = {
      id: id,
      image: image,
      inference: null,
      waitingData: false,
      waitingInference: false
    }
    this.props.mtStore.setImage(item)
    this.props.mtStore.uploadImage(image.src, item.id)
  }

  handleSetId (id) {
    if (this.state.uploadFailed) {
      this.setState({uploadFailed: false})
    }
    this.setState({showId: id})
  }

  inputZone () {
    switch (this.state.inputSource) {
      case 'gallery':
        return <MetersSlider handleSetId={this.handleSetId} />
      case 'file':
        return <DropZone handleNewImage={this.handleNewImage} />
      case 'url':
        return <UrlUpload handleNewImage={this.handleNewImage} />
      default:
        return null
    }
  }

  inferenceSpinner () {
    return (
      <div className='load-spinner'>
        <div className='outer-circle' />
      </div>
    )
  }

  showResult () {
    if (this.state.showId === null) {
      return null
    }
    const item = this.props.mtStore.items.get(this.state.showId)
    if (item === undefined) {
      return null
    }
    if (item.waitingData) {
      return null
    }
    if (item.inference === null) {
      return this.inferenceSpinner()
    }
    return <MtItem item={item}
      key={this.state.showId}
      width={600}
      height={300} />
  }

  setInputSource (src) {
    if (src !== this.state.inputSource) {
      this.setState({inputSource: src, showId: null})
      if (this.state.uploadFailed) {
        this.setState({uploadFailed: false})
      }
    }
  }

  checkActiveSource (src) {
    if (src === 'gallery') {
      if (this.state.inputSource === 'gallery' | this.state.inputSource === null) {
        return 'one-active'
      }
      else
      {
        return 'one'
      }
    }
    if (src === 'file') {
      if (this.state.inputSource === 'file') {
        return 'two-active'
      }
      else
      {
        return 'two'
      }
    }
    if (src === 'url') {
      if (this.state.inputSource === 'url') {
        return 'three-active'
      }
      else
      {
        return 'three'
      }
    }
  }

  render () {
    return (
      <div className='page'>
        <Grid fluid>
          <Row>
            <span className='headline centered-text'> Распознавание показаний счетчиков </span>
          </Row>
          <Row>
            <div className='container centered-text'>
              <ul>
                <li className={this.checkActiveSource('gallery')}><a href='#' onClick={() => { this.setInputSource('gallery') }}>Галерея счетчиков</a></li>
                <li className={this.checkActiveSource('file')}><a href='#' onClick={() => { this.setInputSource('file') }}>Выбрать из файла</a></li>
                <li className={this.checkActiveSource('url')}><a href='#' onClick={() => { this.setInputSource('url') }}>Загрузить по ссылке</a></li>
                <hr />
              </ul>
            </div>
          </Row>
          <Row className='input-zone'>
            {(this.state.inputSource !== null)
              ? this.inputZone()
              : null
            }
          </Row>
          <div className='grow-div' />
          <Row className='center-view'>
            {(!this.state.uploadFailed)
              ? this.showResult()
              : <span className='load-error'>
                Не удалось загрузить изображение :(
              </span>
            }
          </Row>
        </Grid>
      </div>
    )
  }
}
