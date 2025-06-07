<template>
  <div
    class="container"
    :class="{ isDark: isDark, activeSidebar: activeSidebar }"
  >
    <template v-if="show">
      <Toolbar v-if="!isZenMode"></Toolbar>
      <Edit></Edit>
    </template>
  </div>
</template>

<script>
import Toolbar from './components/Toolbar.vue'
import Edit from './components/Edit.vue'
import { mapState, mapMutations } from 'vuex'
import { getLocalConfig } from '@/api'

export default {
  components: {
    Toolbar,
    Edit
  },
  data() {
    return {
      show: false,
      pendingMarkdownContent: null
    }
  },
  computed: {
    ...mapState({
      isZenMode: state => state.localConfig.isZenMode,
      isDark: state => state.localConfig.isDark,
      activeSidebar: state => state.activeSidebar
    })
  },
  watch: {
    isDark() {
      this.setBodyDark()
    }
  },
  beforeCreate() {
    console.log('Index.vue beforeCreate');
  },
  async created() {
    console.log('Index.vue created');
    this.initLocalConfig()
    const loading = this.$loading({
      lock: true,
      text: this.$t('other.loading')
    })

    console.log('Markdown00000')
    const filePath = this.$route.params.filePath
    if (filePath) {
      try {
        const response = await this.$axios.get(`http://127.0.0.1:5010/read-file?path=${encodeURIComponent(filePath)}`)
        const markdownContent = response.data.content // 从响应中获取content字段
        
        // 存储markdown内容，等待Edit组件准备好后再加载
        this.pendingMarkdownContent = markdownContent
        this.show = true
        console.log('Index.vue created - Markdown content loaded:', markdownContent); // 添加日志
      } catch (error) {
        console.error('Index.vue created - Error reading markdown file:', error); // 添加日志
        this.$message.error('Failed to load markdown file.')
        // 如果加载失败，仍然显示页面，但内容为空或默认
        this.show = true
      }
    }
    // 如果没有filePath，正常加载数据
    if (!filePath) {
      this.show = true
    }
    loading.close()
    this.setBodyDark()
},
  mounted() {
    console.log('Index.vue mounted');
    console.log('Index.vue mounted - Listening for mindMapReady event'); // 添加日志
    // 监听mindMapReady事件
    this.$bus.$on('mindMapReady', this.handleMindMapReady);
  },
  methods: {
    ...mapMutations(['setLocalConfig']),

    // 处理mindMapReady事件
    handleMindMapReady() {
      console.log('Index.vue handleMindMapReady called');
      // 如果有待加载的markdown内容，确保Edit组件完全准备好
      if (this.pendingMarkdownContent) {
        const trySend = (attempt = 0) => {
          if (attempt >= 5) {
            console.error('Failed to send markdown after 5 attempts');
            return;
          }
          
          console.log(`Attempt ${attempt + 1} to send markdown content`);
          this.$nextTick(() => {
            setTimeout(() => {
              // 检查mindMap是否已初始化完成
              if (this.$bus._events['mindMapReady'] && 
                  this.$bus._events['loadMarkdown']) {
                console.log('Index.vue - MindMap and handlers ready, emitting loadMarkdown');
                this.$bus.$emit('loadMarkdown', this.pendingMarkdownContent);
                this.pendingMarkdownContent = null;
              } else {
                console.log('Index.vue - MindMap not ready yet, retrying...');
                trySend(attempt + 1);
              }
            }, 200); // 增加延迟时间
          });
        };
        trySend();
      }
    },

    // 初始化本地配置
    initLocalConfig() {
      let config = getLocalConfig()
      if (config) {
        this.setLocalConfig({
          ...this.$store.state.localConfig,
          ...config
        })
      }
    },

    setBodyDark() {
      this.isDark
        ? document.body.classList.add('isDark')
        : document.body.classList.remove('isDark')
    }
  }
}
</script>

<style lang="less">
.container {
}

body {
  &.isDark {
    /* el-button */
    .el-button {
      background-color: #363b3f;
      color: hsla(0, 0%, 100%, 0.9);
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    /* el-input */
    .el-input__inner {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
      color: hsla(0, 0%, 100%, 0.9);
    }

    .el-input.is-disabled .el-input__inner {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
      color: hsla(0, 0%, 100%, 0.3);
    }

    .el-input-group__append,
    .el-input-group__prepend {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    .el-input-group__append button.el-button {
      color: hsla(0, 0%, 100%, 0.9);
    }

    /* el-select */
    .el-select-dropdown {
      background-color: #36393d;
      border-color: hsla(0, 0%, 100%, 0.1);

      .el-select-dropdown__item {
        color: hsla(0, 0%, 100%, 0.6);
      }

      .el-select-dropdown__item.selected {
        color: #409eff;
      }

      .el-select-dropdown__item.hover,
      .el-select-dropdown__item:hover {
        background-color: hsla(0, 0%, 100%, 0.05);
      }
    }

    .el-select .el-input.is-disabled .el-input__inner:hover {
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    /* el-popper*/
    .el-popper {
      background-color: #36393d;
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    .el-popper[x-placement^='bottom'] .popper__arrow {
      background-color: #36393d;
    }

    .el-popper[x-placement^='bottom'] .popper__arrow::after {
      border-bottom-color: #36393d;
    }

    .el-popper[x-placement^='top'] .popper__arrow {
      background-color: #36393d;
    }

    .el-popper[x-placement^='top'] .popper__arrow::after {
      border-top-color: #36393d;
    }

    /* el-tabs */
    .el-tabs__item {
      color: hsla(0, 0%, 100%, 0.6);

      &:hover,
      &.is-active {
        color: #409eff;
      }
    }

    .el-tabs__nav-wrap::after {
      background-color: hsla(0, 0%, 100%, 0.6);
    }

    /* el-slider */
    .el-slider__runway {
      background-color: hsla(0, 0%, 100%, 0.6);
    }

    /* el-radio-group */
    .el-radio-group {
      .el-radio-button__inner {
        background-color: #36393d;
        color: hsla(0, 0%, 100%, 0.6);
      }

      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        color: #fff;
        background-color: #409eff;
      }
    }

    /* el-dialog */
    .el-dialog {
      background-color: #262a2e;

      .el-dialog__header {
        border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
      }

      .el-dialog__title {
        color: hsla(0, 0%, 100%, 0.9);
      }

      .el-dialog__body {
        background-color: #262a2e;
      }

      .el-dialog__footer {
        border-top: 1px solid hsla(0, 0%, 100%, 0.1);
      }
    }

    /* el-upload */
    .el-upload__tip {
      color: #999;
    }

    /* 富文本编辑器 */
    .toastui-editor-main-container {
      background-color: #fff;
    }
  }
}
</style>
