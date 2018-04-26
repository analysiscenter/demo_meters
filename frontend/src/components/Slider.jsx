import React from 'react'
import { inject, observer } from 'mobx-react'
import { Icon } from 'react-fa'
import { Grid, Row, Col, Image } from 'react-bootstrap'

@inject("mtStore")
@observer
export class MetersSlider extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      slidesToShow: 3,
      slidesToScroll: 3,
      currentSlide: 0
    }
  }

  handleImageClick (id) {
    this.props.handleSetId(id)
    this.props.mtStore.getInference(id)
  }

  thumbnail (id, index) {
    if (index < this.state.currentSlide |
        index >= this.state.currentSlide + this.state.slidesToShow) {
      return null
    }
    let item = this.props.mtStore.get(id)
    if (item.thumbnail !== null) {
      return (
        <div className='thumbnail-viewer' key={id} >
          <Image src={item.thumbnail.src} onClick={() => { this.handleImageClick(id) }} />
        </div>
      )
    } else {
      return (
        <div className='thumbnail-viewer' key={id} >
          <Icon name='spinner' spin className='loading' />
        </div>
      )
    }
  }

  handleLeft () {
    this.setState({currentSlide: Math.max(this.state.currentSlide - this.state.slidesToScroll, 0)})
  }

  handleRight () {
    this.setState({currentSlide: Math.min(this.state.currentSlide + this.state.slidesToScroll,
      this.props.mtStore.items.keys().length - this.state.slidesToShow)})
  }

  render () {
    if (this.props.mtStore.items.keys().length > 0) {
      return (
        <div className='thumbnails-container'>
          <Grid fluid>
            <Row>
              <Col className='thumbnail-viewer'>
                <Icon name='arrow-circle-left'
                  className={(this.state.currentSlide === 0) ? 'arrow-left disabled' : 'arrow-left'}
                  onClick={this.handleLeft.bind(this)} />
              </Col>
              { this.props.mtStore.items.keys().map((id, index) => this.thumbnail(id, index)) }
              <Col className='thumbnail-viewer' >
                <Icon name='arrow-circle-right'
                  className={(this.state.currentSlide === this.props.mtStore.items.keys().length - this.state.slidesToShow) ? 'arrow-right disabled' : 'arrow-right'}
                  onClick={this.handleRight.bind(this)} />
              </Col>
            </Row>
          </Grid>
        </div>
      )
    } else {
      return null
    }
  }
}
