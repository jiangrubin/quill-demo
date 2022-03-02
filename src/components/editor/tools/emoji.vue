<template>
  <span class="editor-tool-emoji">
    <el-popover
      ref="popover"
      width="360"
      trigger="click"
      placement="top"
      popper-class="editor-tool-emoji-popper"
    >
      <template v-for="(item, i) of emojis">
        <span class="editor-tool-emoji-wrap" :key="i" @click="onSelect(item)" v-if="item.src_ios">
          <img :src="item.src_ios" :alt="item.code_cn" class="editor-tool-emoji-dot" />
        </span>
      </template>
    </el-popover>
  
    <img src="../assets/emoji.png" v-popover:popover class="editor-tool-emoji-icon" />
  </span>
</template>

<script>
import emojis from '../assets/wechat-emojis.json'

export default {
  data () {
    return {
      emojis: Object.freeze(emojis)
    }
  },

  methods: {
    onSelect (item) {
      this.$emit('select', item)
      this.$refs.popover.doClose()
    }
  }
}
</script>

<style lang="scss">
.editor-tool-emoji {
  vertical-align: middle;
  display: inline-block;
  margin-right: 12px;
}

.editor-tool-emoji-icon {
  width: 20px;
  height: 20px;
  display: block;
  cursor: pointer;
}

.editor-tool-emoji-popper {
  border: none !important;
  border-radius: 10px !important;
}

.editor-tool-emoji-wrap {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  .editor-tool-emoji-dot {
    width: 24px;
    height: 24px;
  }
}

.editor-tool-emoji-wrap:hover {
  background-color: #f0f0f0;
}

.editor-tool-emoji-wrap:active {
  background-color: #d1d1d1;
}
</style>