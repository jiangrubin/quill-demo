import Quill from 'quill'

const BlockEmbed = Quill.import('blots/block/embed')

export default class LinkCardBlot extends BlockEmbed {
  static tagName = 'figure'
  static blotName = 'link-card'
  
  static create(value) {
    const node = super.create(value)
    const { url, image, title } = value
    node.setAttribute('contenteditable', false)

    const linkCard = document.createElement('div')
    linkCard.classList.add('link-card')
    linkCard.setAttribute('target', '_blank')
    linkCard.setAttribute('href', url)
    linkCard.setAttribute('data-image', image)
    linkCard.setAttribute('data-title', title)

    const linkCardBackdrop = document.createElement('span')
    linkCardBackdrop.classList.add('link-card-backdrop')
    linkCardBackdrop.setAttribute('style', `background-image: url('${image}')`)

    const linkCardContent = document.createElement('span')
    linkCardContent.classList.add('link-card-content')

    const linkCardText = document.createElement('span')
    linkCardText.classList.add('link-card-text')

    const linkCardTitle = document.createElement('span')
    linkCardTitle.classList.add('link-card-title')
    linkCardTitle.textContent = title

    const linkCardMeta = document.createElement('span')
    linkCardMeta.classList.add('link-card-meta')
    linkCardMeta.textContent = url

    const linkCardImageCell = document.createElement('span')
    linkCardImageCell.classList.add('link-card-image-cell')

    const linkCardImage = document.createElement('img')
    linkCardImage.classList.add('link-card-image')
    linkCardImage.setAttribute('src', image)

    linkCardText.appendChild(linkCardTitle)
    linkCardText.appendChild(linkCardMeta)
    linkCardImageCell.appendChild(linkCardImage)
    linkCardContent.appendChild(linkCardText)
    linkCardContent.appendChild(linkCardImageCell)
    linkCard.appendChild(linkCardBackdrop)
    linkCard.appendChild(linkCardContent)
    node.appendChild(linkCard)

    linkCard.addEventListener('click', () => {
      linkCard.classList.toggle('focused')
    })
    return node
  }

  static value(node) {
    const linkCard = node.querySelector('.link-card')
    return {
      url: linkCard.getAttribute('href'),
      title: linkCard.getAttribute('data-title'),
      image: linkCard.getAttribute('data-image')
    }
  }
}