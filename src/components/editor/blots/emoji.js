import Quill from 'quill'

const ImageBlot = Quill.import('formats/image')

export default class EmojiBlot extends ImageBlot {
  static tagName = 'img'
  static blotName = 'emoji'
  static className = 'emoji'

  static create(value) {
    const node = super.create(value)
    node.setAttribute('src', value.src)
    node.setAttribute('alt', value.alt)
    node.setAttribute('style', 'vertical-align: bottom;pointer-events: none;')
    if (value.width !== undefined) {
      node.setAttribute('width', value.width)
    }
    if (value.height !== undefined) {
      node.setAttribute('height', value.height)
    }
    return node
  }

  static value(node) {
    return {
      src: node.getAttribute('src'),
      alt: node.getAttribute('alt'),
      width: node.getAttribute('width'),
      height: node.getAttribute('height'),
    }
  }
}
