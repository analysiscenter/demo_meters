import React from 'react'
import { Image } from 'react-bootstrap'

export class MtItem extends React.Component {
  renderInference (item) {
    const hRatio = this.props.width / item.image.width
    const vRatio = this.props.height / item.image.height
    const ratio = Math.min(hRatio, vRatio)
    const xShift = (this.props.width - item.image.width * ratio) / 2
    const yShift = (this.props.height - item.image.height * ratio) / 2
    let box = item.inference.bbox.map(x => x * ratio)

    const canvas = document.createElement('canvas')
    canvas.width = this.props.width
    canvas.height = this.props.height
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(item.image, xShift, yShift,
      item.image.width * ratio, item.image.height * ratio)
    ctx.beginPath()
    ctx.lineWidth = '7'
    ctx.strokeStyle = 'green'
    ctx.rect(xShift + box[0], yShift + box[1], box[2], box[3])
    ctx.stroke()

    return (
      <div>
        <Image src={canvas.toDataURL()} />
        <br />
        <span className='predict'>На счетчике: {item.inference.value}</span>
      </div>
    )
  }

  render () {
    return (
      <div className='image-viewer'>
        { this.renderInference(this.props.item) }
      </div>
    )
  }
}
