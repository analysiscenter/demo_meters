import React from 'react'

export class UrlUpload extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      query: null
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    let that = this
    if (this.state.query === null) {
      return
    }
    var img = new Image()
    img.src = this.state.query
    img.crossOrigin = 'Anonymous'
    img.onload = function () {
      if (img.src.startsWith('data:image')) {
        that.props.handleNewImage(img)
      } else {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        var url = canvas.toDataURL('image/jpeg', 1.0)
        var img64 = new Image()
        img64.src = url
        img64.onload = function () {
          that.props.handleNewImage(img64)
        }
      }
    }
    img.onerror = function () {
      that.props.handleNewImage(null)
    }
  }

  render () {
    return (
      <div className='input-url'>
        <form>
          <input
            placeholder='Скопируйте ссылку сюда'
            onChange={event => { this.setState({query: event.target.value}) }}
            onKeyPress={event => {
              if (event.key === 'Enter') { this.handleClick() }
            }}
          />
          <button onClick={this.handleClick}>Загрузить</button>
        </form>
      </div>
    )
  }
}
