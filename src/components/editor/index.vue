<template>
  <div id="editor">
    <div id="editor-toolbar">
      <emoji-tool @select="onSelectEmoji" />
      <link-card-tool @click.native="onClickLinkCard" />
    </div>
    
    <div id="editor-container" spellcheck="false"></div>

    <button @click="onSubmit">Submit</button>
    <button @click="onUpdate">Update</button>
    <button @click="onGetLeaf">Leaf</button>
  </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'
import EmojiBlot from './blots/emoji'
import LinkCardBlot from './blots/link-card'
import MentionBlot from './blots/mention'
import EmojiTool from './tools/emoji'
import LinkCardTool from './tools/link-card'
import MentionModule from './modules/mention'
import './assets/style.scss'

const Tooltip = Quill.import('ui/tooltip')

Quill.register({
  'formats/emoji': EmojiBlot,
  'formats/link-card': LinkCardBlot,
  'formats/mention': MentionBlot,
  'modules/mention': MentionModule,
}, true)

export default {
  props: {},

  components: {
    EmojiTool,
    LinkCardTool
  },

  mounted () {
    this.init()
  },

  beforeDestroy () {
    this.quill = null
  },

  methods: {
    init () {
      this.quill = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '',
        modules: {
          // toolbar: ['bold', { 'color': [] }, 'image'],
          toolbar: {
            container: '#editor-toolbar',
          },
          mention: {
            source (searchTerm, renderList, mentionChar) {
              renderList([
                { id: 1, value: 'Fredrik' },
                { id: 2, value: 'Patrik' }
              ])
            }
          }
        }
      })

      this.quill.on('text-change', function(delta) {
        console.log(delta);
      })
    },

    onSelectEmoji (data) {
      const { index = 0 } = this.quill.getSelection(true) || {}
      this.quill.insertEmbed(index, 'emoji', {
        width: '20px',
        height: '20px',
        src: data.src_ios,
        alt: data.code_cn
      })
      this.quill.setSelection(index + 1)
    },

    onClickLinkCard () {
      const { index = 0 } = this.quill.getSelection(true) || {}
      this.quill.insertEmbed(index, 'link-card', {
        url: 'https://quilljs.com/',
        title: 'Quill - Your powerful rich text editor',
        image: 'https://pic1.zhimg.com/v2-11df01f75e231325abeb7f68b4cd0473.jpg',
      })
      this.quill.setSelection(index + 1)
    },

    onSubmit () {
      console.log(this.quill.getContents());
    },

    onUpdate () {
      this.quill.setContents([
        {
          attributes: { alt: '[撇嘴]', height: '20px', width: '20px' },
          insert: {
            emoji: {
              src: 'https://emojipedia-us.s3.amazonaws.com/content/2021/02/20/grimace_ios_802.png',
              alt: '[撇嘴]',
              width: '20px',
              height: '20px',
            }
          }
        },
        { insert: '\n' }
      ])
    },

    onGetLeaf () {
      console.log(this.quill.getLeaf(0));
    }
  }
}
</script>

<style>
#editor-container .ql-editor {
  min-height: 400px;
}
</style>