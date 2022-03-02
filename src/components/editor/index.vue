<template>
  <div id="editor">
    <div id="editor-toolbar">
      <emoji-tool @select="onSelectEmoji" />
      <link-card-tool />
    </div>
    <div id="editor-container" spellcheck="false"></div>

    <button @click="onSubmit">Submit</button>
  </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import EmojiBlot from './formats/emoji'
import LinkCardBlot from './formats/link-card'
import EmojiTool from './tools/emoji'
import LinkCardTool from './tools/link-card.vue'

Quill.register({
  'formats/emoji': EmojiBlot
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
          toolbar: '#editor-toolbar',
        }
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

    onSubmit () {
      console.log(this.quill.getContents());
    }
  }
}
</script>

<style>
#editor-container .ql-editor {
  min-height: 400px;
}
</style>