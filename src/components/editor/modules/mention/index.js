import Quill from 'quill'
import {
  attachDataValues,
  getMentionCharIndex,
  hasValidChars,
  hasValidMentionCharIndex
} from './utils'
import './style.css'

const Module = Quill.import('core/module')

export default class Mention extends Module {
  constructor(quill, options) {
    super(quill, options)

    this.options = {
      source: () => {},
      renderItem(item) {
        return `${item.value}`;
      },
      onSelect(item, insertItem) {
        insertItem(item);
      },
      minChars: 0,
      maxChars: 31,
      mentionDenotationChars: ['@'],
      isolateCharacter: false,
      mentionContainerClass: 'ql-mention-container',
      mentionListClass: 'ql-mention-list',
      mentionListItemClass: 'ql-mention-list-item',
      offsetTop: 2,
      offsetLeft: 0,
      fixMentionsToQuill: false,
      dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target', 'disabled'],
      blotName: 'mention',
      showDenotationChar: true,
      ...options,
    }

    // create mention container
    this.mentionContainer = document.createElement('div')
    this.mentionContainer.className = this.options.mentionContainerClass || ''
    this.mentionContainer.style.cssText = 'display: none position: absolute'

    this.mentionList = document.createElement('ul')
    this.mentionList.className = this.options.mentionListClass || ''
    this.mentionContainer.appendChild(this.mentionList)

    quill.on('text-change', this.onTextChange.bind(this))
  }

  onTextChange(delta, oldDelta, source) {
    if (source === 'user') {
      this.onChange()
    }
  }

  getTextBeforeCursor() {
    const startPos = Math.max(0, this.cursorPos - this.options.maxChars)
    const textBeforeCursorPos = this.quill.getText(startPos, this.cursorPos - startPos)
    return textBeforeCursorPos
  }

  onChange () {
    const range = this.quill.getSelection()
    if (range == null) return

    this.cursorPos = range.index
    const textBeforeCursor = this.getTextBeforeCursor()
    const { mentionChar, mentionCharIndex } = getMentionCharIndex(
      textBeforeCursor,
      this.options.mentionDenotationChars
    )
    if (hasValidMentionCharIndex(
      mentionCharIndex,
      textBeforeCursor,
      this.options.isolateCharacter
    )) {
      this.mentionCharPos = this.cursorPos - (textBeforeCursor.length - mentionCharIndex)
      const textAfter = textBeforeCursor.substring(mentionCharIndex + mentionChar.length)
      if (textAfter.length >= this.options.minChars) {
        this.options.source(
          textAfter,
          (data, searchTerm) => {
            this.renderList(mentionChar, data, searchTerm)
          },
          mentionChar
        )
      }
    }
  }

  renderList(mentionChar, data, searchTerm) {
    if (data && data.length > 0) {
      this.values = data
      this.mentionList.innerHTML = ''

      var initialSelection = -1

      for (let i = 0; i < data.length; i += 1) {
        const li = document.createElement('li')
        li.id = 'quill-mention-item-' + i
        li.className = this.options.mentionListItemClass || ''
        if (data[i].disabled) {
          li.className += ' disabled'
          li.setAttribute('aria-hidden','true')
        } else if (initialSelection === -1) {
          initialSelection = i
        }
        li.dataset.index = i
        li.innerHTML = this.options.renderItem(data[i], searchTerm)
        if (!data[i].disabled) {
          // li.onmouseenter = this.onItemMouseEnter.bind(this)
          li.onmouseup = this.onItemClick.bind(this)
          // li.onmousedown = this.onItemMouseDown.bind(this)
        } else {
          li.onmouseenter = this.onDisabledItemMouseEnter.bind(this)
        }
        li.dataset.denotationChar = mentionChar
        this.mentionList.appendChild(
          attachDataValues(li, data[i], this.options.dataAttributes)
        )
      }
      this.itemIndex = initialSelection
      this.showMentionContainer()
    } else {
      this.hideMentionContainer()
    }
  }

  onItemClick(e) {
    if (e.button !== 0) {
      return
    }
    e.preventDefault()
    e.stopImmediatePropagation()
    this.itemIndex = e.currentTarget.dataset.index
    this.selectItem()
  }

  selectItem() {
    if (this.itemIndex === -1) {
      return
    }
    const data = this.getItemData();
    if (data.disabled) {
      return
    }
    this.options.onSelect(data, (asyncData) => {
      this.insertItem(asyncData)
    })
    this.hideMentionContainer()
  }

  getItemData() {
    const { link } = this.mentionList.childNodes[this.itemIndex].dataset;
    const hasLinkValue = typeof link !== "undefined";
    const itemTarget = this.mentionList.childNodes[this.itemIndex].dataset.target;
    if (hasLinkValue) {
      this.mentionList.childNodes[this.itemIndex].dataset.value = `<a href="${link}" target=${itemTarget ||
        this.options.linkTarget}>${
        this.mentionList.childNodes[this.itemIndex].dataset.value
      }`
    }
    return this.mentionList.childNodes[this.itemIndex].dataset;
  }

  insertItem(data, programmaticInsert) {
    const render = data
    if (render === null) {
      return
    }
    if (!this.options.showDenotationChar) {
      render.denotationChar = ''
    }

    var insertAtPos

    if (!programmaticInsert) {
      insertAtPos = this.mentionCharPos
      this.quill.deleteText(
        this.mentionCharPos,
        this.cursorPos - this.mentionCharPos,
        Quill.sources.USER
      );
    } else {
      insertAtPos = this.cursorPos
    }
    this.quill.insertEmbed(insertAtPos, this.options.blotName, render, Quill.sources.USER)
    if (this.options.spaceAfterInsert) {
      this.quill.insertText(insertAtPos + 1, ' ', Quill.sources.USER)
      // setSelection here sets cursor position
      this.quill.setSelection(insertAtPos + 2, Quill.sources.USER)
    } else {
      this.quill.setSelection(insertAtPos + 1, Quill.sources.USER)
    }
    this.hideMentionContainer();
  }

  showMentionContainer () {
    this.quill.container.appendChild(this.mentionContainer)
    this.mentionContainer.style.visibility = 'hidden'
    this.mentionContainer.style.display = ''
    this.mentionContainer.scrollTop = 0
    this.setMentionContainerPosition()
  }

  setMentionContainerPosition () {
    this.setMentionContainerPositionFixed()
  }

  setMentionContainerPositionFixed () {
    this.mentionContainer.style.position = 'fixed'
    this.mentionContainer.style.height = null

    const containerPos = this.quill.container.getBoundingClientRect()
    const mentionCharPos = this.quill.getBounds(this.mentionCharPos)
    const mentionCharPosAbsolute = {
      left: containerPos.left + mentionCharPos.left,
      top: containerPos.top + mentionCharPos.top,
      width: 0,
      height: mentionCharPos.height,
    }

    // Which rectangle should it be relative to
    const relativeToPos = this.options.fixMentionsToQuill ? containerPos : mentionCharPosAbsolute

    let topPos = this.options.offsetTop
    let leftPos = this.options.offsetLeft

    // handle horizontal positioning
    if (this.options.fixMentionsToQuill) {
      const rightPos = relativeToPos.right
      this.mentionContainer.style.right = `${rightPos}px`
    } else {
      leftPos += relativeToPos.left

      // if its off the righ edge, push it back
      if (leftPos + this.mentionContainer.offsetWidth > document.documentElement.clientWidth) {
        leftPos -= leftPos + this.mentionContainer.offsetWidth - document.documentElement.clientWidth
      }
    }

    const availableSpaceTop = relativeToPos.top
    const availableSpaceBottom = document.documentElement.clientHeight - (relativeToPos.top + relativeToPos.height)

    const fitsBottom = this.mentionContainer.offsetHeight <= availableSpaceBottom
    const fitsTop = this.mentionContainer.offsetHeight <= availableSpaceTop

    var placement

    if (this.options.defaultMenuOrientation === 'top' && fitsTop) {
      placement = 'top'
    } else if (this.options.defaultMenuOrientation === 'bottom' && fitsBottom) {
      placement = 'bottom'
    } else {
      // it doesnt fit either so put it where there's the most space
      placement = availableSpaceBottom > availableSpaceTop ? 'bottom' : 'top'
    }

    if (placement === 'bottom') {
      topPos = relativeToPos.top + relativeToPos.height
      if (!fitsBottom) {
        // shrink it to fit
        // 3 is a bit of a fudge factor so it doesnt touch the edge of the screen
        this.mentionContainer.style.height = availableSpaceBottom - 3 + 'px'
      }

      this.options.mentionContainerClass.split(' ').forEach((className) => {
        this.mentionContainer.classList.add(`${className}-bottom`)
        this.mentionContainer.classList.remove(`${className}-top`)
      })
    } else {
      topPos = relativeToPos.top - this.mentionContainer.offsetHeight
      if (!fitsTop) {
        // shrink it to fit
        // 3 is a bit of a fudge factor so it doesnt touch the edge of the screen
        this.mentionContainer.style.height = availableSpaceTop - 3 + 'px'
        topPos = 3
      }

      this.options.mentionContainerClass.split(' ').forEach((className) => {
        this.mentionContainer.classList.add(`${className}-top`)
        this.mentionContainer.classList.remove(`${className}-bottom`)
      })
    }

    this.mentionContainer.style.top = `${topPos}px`
    this.mentionContainer.style.left = `${leftPos}px`
    this.mentionContainer.style.visibility = 'visible'
  }

  hideMentionContainer () {
    this.mentionContainer.style.display = 'none'
    this.mentionContainer.remove()
    this.quill.root.removeAttribute('aria-activedescendant')
  }
}