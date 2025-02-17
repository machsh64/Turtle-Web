<template>
  <div class="space">
    <HeaderBar :isFixHeaderBar="true"></HeaderBar>
    <div class="space-container">
      <div class="history-wrapper">
        <!-- 左侧观看记录列表 -->
        <div class="history-content">
          <h1 class="history-title">观看记录</h1>
          <div class="history-list">
            <div v-for="(item, index) in historyList" :key="index" class="history-item">
              <div class="thumbnail" @click="openNewPage('/video/' + item.video.vid)">
                <img :src="item.video.coverUrl" :alt="item.video.title">
                <span class="duration">{{ handleDuration(item.video.duration) }}</span>
              </div>
              <div class="video-info">
                <h3 class="video-title" @click="openNewPage('/video/' + item.video.vid)">
                  {{ item.video.title }}
                </h3>
                <div class="channel-name" @click="openNewPage('/space/' + item.user.uid)">
                  {{ item.user.nickname }}
                </div>
                <div class="video-stats">
                  <span>{{ handleNum(item.stats.play) }}次观看</span>
                  <span class="dot">•</span>
                  <span>{{ item.playTime }}</span>
                </div>
              </div>
              <div class="delete-btn" @click.stop="deletePlayHistory(item.video.vid)">
                <el-icon>
                  <Close />
                </el-icon>
              </div>
            </div>
            <div v-if="loading" class="loading-text">加载中...</div>
            <div v-if="!hasMore && historyList.length > 0" class="no-more-text">没有更多数据了</div>
          </div>
        </div>

        <!-- 右侧功能区 -->
        <div class="history-sidebar">
          <!-- 搜索框 -->
          <div class="search-box" ref="searchBox">
            <el-input
              v-model="searchQuery"
              placeholder="搜索观看记录"
              :prefix-icon="Search"
              clearable
              @focus="handleFocus"
              @blur="handleBlur"
              @keyup.enter="handleSearch"
              @clear="handleClear"
            >
              <template #prefix>
                <el-icon class="search-icon" @click="handleSearch"><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <!-- 清除按钮 -->
          <div class="clear-history">
            <el-button type="danger" @click="deleteAllHistory">
              <el-icon><Delete /></el-icon>
              &nbsp;清除所有观看记录
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderBar from '@/components/headerBar/HeaderBar.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { handleTime, handleNum, handleDate } from '@/utils/utils.js';
import { Close, Search, Delete } from '@element-plus/icons-vue';


export default {
  name: "playHistory",
  components: {
    HeaderBar,
    Close,
    Search,
    Delete
  },
  data() {
    return {
      timer: null,
      mounted: false,
      offset: 0,  // 已获取的数量,默认从0开始
      quantity: 10,   // 每次获取的数量
      historyList: [],
      loading: false, // 是否正在加载
      hasMore: true, // 是否还有更多数据
      searchQuery: '',
      searchTimeout: null, // 用于防抖
    }
  },
  computed: {
  },
  methods: {
    // 获取用户历史播放记录
    async getPlayHistory() {
      if (this.loading || !this.hasMore) return;

      if (this.$store.state.isLogin) {
        this.loading = true;
        const params = {
          offset: this.offset,
          quantity: this.quantity,
          keyword: this.searchQuery || undefined // 只在有搜索词时才添加参数
        };
        
        try {
          const res = await this.$get("/video/user-play", {
            params,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            },
          });
          
          if (res.data.code === 200) {
            this.historyList = [...this.historyList, ...res.data.data];
            this.offset += res.data.data.length;
            this.hasMore = res.data.data.length === this.quantity;
          }
        } catch (error) {
          console.error('获取播放历史失败:', error);
          ElMessage.error('搜索失败，请稍后重试');
        } finally {
          this.loading = false;
        }
      }
    },

    // 删除播放历史记录,依据vid
    async deletePlayHistory(vid) {
      const res = await this.$post(`/video/user-play/delete/${vid}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      if (res.data.code === 200) {
        ElMessage.success("删除成功");
        this.historyList = this.historyList.filter(item => item.video.vid !== vid);
      } else {
        ElMessage.error("删除失败");
      }
    },
    // 删除所有播放历史记录
    async deleteAllHistory() {
      try {
        await ElMessageBox.confirm('确定要清除所有观看记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await this.$post('/video/user-play/delete', {}, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        
        if (res.data.code === 200) {
          ElMessage.success("清除成功");
          this.historyList = [];
          this.offset = 0;
        } else {
          ElMessage.error("清除失败");
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error("操作失败");
        }
      }
    },
    // 打开新标签页
    openNewPage(route) {
      window.open(this.$router.resolve(route).href, '_blank');
    },
    // 处理播放时长
    handleDuration(time) {
      return handleTime(time);
    },
    // 处理大于一万的数字
    handleNum(number) {
      return handleNum(number);
    },

    noPage() {
      ElMessage.warning("该功能暂未开放");
    },

    // 监听滚动事件
    handleScroll() {
      // 防抖处理
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        // 当距离底部小于100px时加载更多
        if (scrollHeight - scrollTop - clientHeight < 100) {
          this.getPlayHistory();
        }
      }, 100);
    },

    // 处理搜索
    handleSearch() {
      this.resetAndSearch();
    },

    // 处理清除搜索
    handleClear() {
      this.searchQuery = '';
      this.resetAndSearch();
    },

    // 重置状态并搜索
    resetAndSearch() {
      this.offset = 0;
      this.historyList = [];
      this.hasMore = true;
      this.getPlayHistory();
    },

    handleFocus() {
      this.$refs.searchBox?.classList.add('focused');
    },
    handleBlur() {
      this.$refs.searchBox?.classList.remove('focused');
    }
  },
  created() {
  },
  mounted() {
    this.mounted = true;
    // 添加滚动监听
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    // 移除滚动监听
    window.removeEventListener('scroll', this.handleScroll);
    // 清除定时器
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },
  watch: {
    // 添加对登录状态的监听
    '$store.state.isLogin': {
      immediate: true, // 确保组件创建时立即执行一次
      handler(newVal) {
        if (newVal) {
          this.getPlayHistory();
        }
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    // 设置全局背景
    let apps = document.querySelectorAll('#app');
    apps.forEach(element => {
      element.style.cssText = 'background-color: #fafafa;';
    });
    next();
  },
}
</script>

<style scoped>
.space-container {
  width: auto;
  padding: 54px 0px 0px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  box-sizing: content-box;
  position: relative;
  background-color: #ffffff;
}

.history-wrapper {
  display: flex;
  position: relative;  /* 修改为相对定位 */
  max-width: 1600px;
  margin-left: 15%;
  margin-right: 35%;
  padding: 0 24px;
}

.history-content {
  flex: 1;
  max-width: 1000px;  /* 减小主内容区域宽度 */
}

.history-sidebar {
  position: fixed;  /* 改为固定定位 */
  right: 10%;      /* 距离右边 10% */
  top: 16%;      /* 调整顶部距离，考虑到顶部导航栏的高度 */
  width: 280px;    /* 稍微减小宽度 */
  height: fit-content;
  z-index: 10;
}

.history-title {
  font-size: 30px;
  font-weight: 500;
  margin: 24px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  position: relative;
  display: flex;
  gap: 16px;
  cursor: pointer;
  padding-right: 40px;
}

.thumbnail {
  position: relative;
  width: 275px;
  height: 166px;
  background-color: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 3px 4px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.channel-name {
  color: #606060;
  font-size: 14px;
}

.video-stats {
  color: #606060;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  font-size: 14px;
}

.video-title:hover,
.channel-name:hover {
  color: #1890ff;
}

.loading-text,
.no-more-text {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.delete-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.delete-btn .el-icon {
  color: rgb(0, 0, 0);
  font-size: 22px;
}

.delete-btn:hover {
  background-color: rgba(0, 0, 0, 0.146);
}

.search-box {
  margin-bottom: 16px;
  position: relative;
  padding: 4px 0;
  padding-left: 7px;
  background: none;
  box-shadow: none;
}

/* 移除 el-input 默认样式 */
.search-box .el-input :deep(.el-input__wrapper) {
  background: none;
  box-shadow: none !important;
  border: none;
  padding: 0 0 2px 0;
}

/* 输入框文字样式 */
.search-box .el-input :deep(.el-input__inner) {
  background: transparent;
  font-family: "Roboto", "Arial", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #0f0f0f;
  padding-left: 28px;
  height: 32px;
  line-height: 32px;
}

/* 搜索图标样式 */
.search-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #606060;
  cursor: pointer;
  transition: color 0.2s ease;
}

.search-icon:hover {
  color: #0f0f0f;  /* 鼠标悬停时变深 */
}

/* 底部线条 - 默认状态 */
.search-box::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 7px;
  width: 100%;
  height: 1px;
  background-color: #e0e0e0;
}

/* 底部线条 - 聚焦动画 */
.search-box::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 52.5%;
  width: 0;
  height: 2px;
  background-color: #0f0f0f;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

/* 聚焦状态 */
.search-box.focused::before {
  width: 100%;
}

/* 清除按钮样式 */
.search-box .el-input :deep(.el-input__suffix) {
  right: 0;
}

.search-box .el-input :deep(.el-input__suffix-inner) {
  color: #606060;
}

/* 输入框占位符样式 */
.search-box .el-input :deep(.el-input__inner::placeholder) {
  color: #606060;
  font-weight: 400;
}

/* 确保输入时文字可见 */
.search-box .el-input :deep(.el-input__inner:focus) {
  color: #0f0f0f;
}

/* 清除按钮悬停效果 */
.search-box .el-input :deep(.el-input__clear:hover) {
  color: #0f0f0f;
}

@media (prefers-color-scheme: dark) {
  .search-box .el-input :deep(.el-input__inner) {
    color: #fff;
  }
  
  .search-box .el-input :deep(.el-input__inner::placeholder) {
    color: #aaa;
  }
  
  .search-box::after {
    background-color: #333;
  }
  
  .search-box::before {
    background-color: #fff;
  }
  
  .search-icon {
    color: #aaa;
  }
}

.clear-history {
  border-radius: 12px;
  padding: 0px;
  transition: all 0.3s ease;
}

.clear-history .el-button {
  width: 55%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  gap: 8px;
  height: 30px;
  border: none;
  background-color: #f5f5f500;
  color: #0f0f0f;  /* 更深的黑色 */
  font-size: 14px;
  font-weight: 550;  /* 适中的字重 */
  letter-spacing: 0.2px;  /* 轻微增加字间距 */
  font-family: "Roboto", "Arial", sans-serif;  /* YouTube 使用的字体 */
  -webkit-font-smoothing: antialiased;  /* 字体平滑渲染 */
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;  /* 优化字体渲染 */
}

.clear-history .el-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #0f0f0f;
}

.clear-history .el-button:active {
  background-color: rgba(0, 0, 0, 0.08);
  transform: scale(0.98);  /* 点击时的微小缩放效果 */
}

/* 图标样式优化 */
.clear-history .el-button .el-icon {
  font-size: 16px;
  margin-right: 4px;
  color: #0f0f0f;
}

/* 响应式布局优化 */
@media screen and (max-width: 1400px) {
  .history-sidebar {
    right: 5%;  /* 在较小屏幕上减少右边距 */
  }
}

@media screen and (max-width: 1200px) {
  .history-wrapper {
    flex-direction: column;
  }
  
  .history-sidebar {
    position: static;  /* 在小屏幕上恢复正常文档流 */
    width: 100%;
    margin-bottom: 20px;
  }
  
  .history-content {
    max-width: 100%;
  }
}

/* 添加平滑滚动 */
html {
  scroll-behavior: smooth;
}
</style>