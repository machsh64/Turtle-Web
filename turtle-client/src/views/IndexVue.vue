<template>
    <div class="index">
        <!-- 顶部横栏 -->
        <div class="large-header">
            <!-- 信息搜索栏 -->
            <HeaderBar></HeaderBar>
            <!-- 固钉频道栏 -->
            <HeaderChannel :currentMcId="mcId" @category-change="handleCategoryChange"></HeaderChannel>
        </div>

        <div class="layout-contaioner">
            <!-- 侧边栏（可折叠） 主体作功能集中，暂时取消侧边栏
            <SiderLayout :isCollapsed="isCollapsed" @toggle="toggleSidebar"></SiderLayout> -->

            <!-- 主体布局 -->
            <div class="main__layout">
                <div class="recommended-container">
                    <div class="container">
                        <!-- 轮播图 -->
                        <div class="recommended-swipe" :style="mcId ? 'display:none' : ''">
                            <div class="recommended-swipe-core">
                                <!-- 骨架屏 -->
                                <div class="recommended-swipe-shim">
                                    <div class="video-card" v-for="index in 2" :key="index">
                                        <div class="video-card__skeleton">
                                            <div class="video-card__skeleton--cover"></div>
                                            <div class="video-card__skeleton--info">
                                                <div class="video-card__skeleton--right">
                                                    <p class="video-card__skeleton--text"></p>
                                                    <p class="video-card__skeleton--text short"></p>
                                                    <p class="video-card__skeleton--light"></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="shim-card"></div>
                                    <div class="shim-card"></div>
                                </div>
                                <!-- 轮播图主体 -->
                                <div class="recommended-swipe-body">
                                    <div class="carousel-area">
                                        <CarouselIndex></CarouselIndex>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 随机推荐 -->
                        <div class="feed-card" v-for="index in loadingRandom ? 11 : randomVideos.length" :style="mcId ? 'display:none' : ''" :key="index">
                            <div class="video-card">
                                <!-- 骨架屏 -->
                                <div class="video-card__skeleton" :class="loadingRandom ? 'loading_animation' : 'hide'">
                                    <div class="video-card__skeleton--cover"></div>
                                    <div class="video-card__skeleton--info">
                                        <div class="video-card__skeleton--right">
                                            <p class="video-card__skeleton--text"></p>
                                            <p class="video-card__skeleton--text short"></p>
                                            <p class="video-card__skeleton--light"></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 实体内容 -->
                                <div class="video-card__wrap" v-if="!loadingRandom">
                                    <a :href="`/video/${randomVideos[index - 1].video.vid}`" target="_self">
                                        <div class="video-card__image">
                                            <div class="video-card__image--wrap">
                                                <picture class="video-card__cover">
                                                    <img :src="randomVideos[index - 1].video.coverUrl"
                                                        :alt="randomVideos[index - 1].video.title">
                                                </picture>
                                            </div>
                                            <div class="video-card__mask">
                                                <div class="video-card__stats">
                                                    <div class="video-card__stats--left">
                                                        <span class="video-card__stats--item">
                                                            <i class="iconfont icon-bofangshu"></i>
                                                            <span class="video-card__stats--text">
                                                                {{ handleNum(randomVideos[index - 1].stats.play) }}
                                                            </span>
                                                        </span>
                                                        <span class="video-card__stats--item">
                                                            <i class="iconfont icon-danmushu"></i>
                                                            <span class="video-card__stats--text">
                                                                {{ handleNum(randomVideos[index - 1].stats.danmu) }}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="video-card__stats__duration">
                                                        {{ handleDuration(randomVideos[index - 1].video.duration) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                    <div class="video-card__info">
                                        <div class="video-card__info--right">
                                            <h3 class="video-card__info--tit">
                                                <a :href="`/video/${randomVideos[index - 1].video.vid}`"
                                                    target="_self">
                                                    {{ randomVideos[index - 1].video.title }}
                                                </a>
                                            </h3>
                                            <div class="video-card__info--bottom">
                                                <div class="video-card__info--icon-text" :style="'display: none;'">已关注
                                                </div>
                                                <a class="video-card__info--owner"
                                                    :href="`/space/${randomVideos[index - 1].user.uid}`"
                                                    target="_self">
                                                    <i class="iconfont icon-uper" :style="''"></i>
                                                    <span class="video-card__info--author">{{ randomVideos[index -
                                                        1].user.nickname }}</span>
                                                    <span class="video-card__info--date">
                                                        · {{ handleDate(randomVideos[index - 1].video.uploadDate) }}
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 累加推荐 -->
                        <div class="video-card" v-for="(item, index) in cumulativeVideos" :key="index">
                            <!-- 骨架屏 -->
                            <div class="video-card__skeleton hide">
                                <div class="video-card__skeleton--cover"></div>
                                <div class="video-card__skeleton--info">
                                    <div class="video-card__skeleton--right">
                                        <p class="video-card__skeleton--text"></p>
                                        <p class="video-card__skeleton--text short"></p>
                                        <p class="video-card__skeleton--light"></p>
                                    </div>
                                </div>
                            </div>
                            <!-- 实体内容 -->
                            <div class="video-card__wrap">
                                <a :href="`/video/${item.video.vid}`" target="_self">
                                    <div class="video-card__image">
                                        <div class="video-card__image--wrap">
                                            <picture class="video-card__cover">
                                                <img :src="item.video.coverUrl" :alt="item.video.title">
                                            </picture>
                                        </div>
                                        <div class="video-card__mask">
                                            <div class="video-card__stats">
                                                <div class="video-card__stats--left">
                                                    <span class="video-card__stats--item">
                                                        <i class="iconfont icon-bofangshu"></i>
                                                        <span class="video-card__stats--text">
                                                            {{ handleNum(item.stats.play) }}
                                                        </span>
                                                    </span>
                                                    <span class="video-card__stats--item">
                                                        <i class="iconfont icon-danmushu"></i>
                                                        <span class="video-card__stats--text">
                                                            {{ handleNum(item.stats.danmu) }}
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="video-card__stats__duration">
                                                    {{ handleDuration(item.video.duration) }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                                <div class="video-card__info">
                                    <div class="video-card__info--right">
                                        <h3 class="video-card__info--tit">
                                            <a :href="`/video/${item.video.vid}`" target="_self"
                                                :title="item.video.title">
                                                {{ item.video.title }}
                                            </a>
                                        </h3>
                                        <div class="video-card__info--bottom">
                                            <div class="video-card__info--icon-text" :style="'display: none;'">已关注</div>
                                            <a class="video-card__info--owner" :href="`/space/${item.user.uid}`"
                                                target="_self">
                                                <i class="iconfont icon-uper" :style="''"></i>
                                                <span class="video-card__info--author">{{ item.user.nickname }}</span>
                                                <span class="video-card__info--date">
                                                    · {{ handleDate(item.video.uploadDate) }}
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 骨架屏 -->
                        <div class="video-card" v-for="index in 10" :key="index"
                            :style="hasMore ? '' : 'display: none;'">
                            <div class="video-card__skeleton loading_animation">
                                <div class="video-card__skeleton--cover"></div>
                                <div class="video-card__skeleton--info">
                                    <div class="video-card__skeleton--right">
                                        <p class="video-card__skeleton--text"></p>
                                        <p class="video-card__skeleton--text short"></p>
                                        <p class="video-card__skeleton--light"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="feed-roll-btn" :style="mcId ? 'display:none' : ''">
                        <div class="roll-btn" @click="getRandomVideos(); refreshTime++;">
                            <i class="iconfont icon-shuaxin" :style="`transform: rotate(${refreshTime * 360}deg);`"></i>
                            <span>换一换</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import HeaderBar from '@/components/headerBar/HeaderBar.vue';
import HeaderChannel from '@/components/headerChannel/HeaderChannel.vue';
// import SiderLayout from '@/components/siderLayout/SiderLayout.vue';
import CarouselIndex from '@/components/carousel/CarouselIndex.vue';
import { handleTime, handleNum, handleDate } from '@/utils/utils.js';

let headerHight, bottomDistance;

export default {
    name: "IndexVue",
    components: {
        HeaderBar,
        HeaderChannel,
        // SiderLayout,
        CarouselIndex,
    },
    data() {
        return {
            // 是否是固钉导航栏
            isFixHeaderBar: false,
            // 是否是固钉频道栏
            isFixChannel: false,
            // 随机推荐视频列表
            randomVideos: [],
            // 累加视频列表
            cumulativeVideos: [],
            // 累加视频id列表
            vids: [],
            // 是否正在加载随机推荐
            loadingRandom: true,
            // 是否还有更多累加视频
            hasMore: true,
            // 是否正在加载更多视频中
            loadingMore: false,
            // 刷新次数
            refreshTime: 0,
            isCollapsed: true, // 侧边栏默认收起
            mcId: '', // 视频种类，如果为空，则默认为全部，如果不为空，则根据mcId获取视频，并隐藏banner及随机推荐栏目
        }
    },
    computed: {
        // 频道列表
        channels() {
            return this.$store.state.channels;
        }
    },
    methods: {
        // 请求
        // 获取游客随机推荐
        async getRandomVideos() {
            this.loadingRandom = true;
            const res = await this.$get("/video/random/visitor");
            if (res.data.data) {
                this.randomVideos = res.data.data;
                this.loadingRandom = false;
            }
            // console.log(this.randomVideos);
        },

        // 获取游客累加推荐
        async getCumulativeVideos() {
            this.loadingMore = true;
            const params = {
                    // 已推荐过的视频列表，传过去不再推荐
                    vids: this.vids.join(","),
                    // 视频category
                    mcId: this.mcId || undefined,
                };
            const res = await this.$get("/video/cumulative/visitor", {params});
            if (res.data.data) {
                this.cumulativeVideos.push(...res.data.data.videos);
                this.vids.push(...res.data.data.vids);
                this.hasMore = res.data.data.more;
            }
            // console.log(this.cumulativeVideos);
            this.loadingMore = false;
        },
        // 监听handerChannel里的mcId，控制数据
        handleCategoryChange(mcId) {
            this.mcId = mcId;
            this.resetCumulativeData();
            this.getCumulativeVideos();
        },
        resetCumulativeData() {
            this.cumulativeVideos = [];
            this.vids = [];
            this.hasMore = true;
        },

        async handleScroll() {
            // 计算页面底部距离
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            bottomDistance = documentHeight - (window.scrollY + windowHeight);

            // 导航栏
            if (this.el.scrollTop >= 64 && !this.isFixHeaderBar) {
                this.isFixHeaderBar = true;
            } else if (this.el.scrollTop < 64 && this.isFixHeaderBar) {
                this.isFixHeaderBar = false;
            }

            // 频道栏
            if (this.el.scrollTop >= headerHight && !this.isFixChannel) {
                this.isFixChannel = true;
            } else if (this.el.scrollTop < headerHight && this.isFixChannel) {
                this.isFixChannel = false;
            }

            // 当距离底部小于800且有更多数据时触发加载数据的函数
            if (bottomDistance < 800 && this.hasMore && !this.loadingMore) {
                await this.getCumulativeVideos();
            }
        },

        // 处理播放时长
        handleDuration(time) {
            return handleTime(time);
        },

        // 处理大于一万的数字
        handleNum(number) {
            return handleNum(number);
        },

        // 处理投稿时间
        handleDate(date) {
            return handleDate(date);
        },
        // 侧边栏操作
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed;
        },
    },
    created() {
        this.getRandomVideos();
    },
    async mounted() {
        // 窗口滚动时根据高度判断是否显示固钉导航栏和固钉频道栏
        this.el = document.documentElement;
        // 根据主体顶部的偏移量计算 header 的高度
        headerHight = document.querySelector(".main__layout").offsetTop;
        window.addEventListener('scroll', this.handleScroll);
        // 初次挂载时执行一次，防止大屏情况下，视频数量不足以撑出滚动条
        await this.handleScroll();
        while (bottomDistance < 800 && this.hasMore) {
            await this.handleScroll();
        }
    },
    beforeUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseout', this.handleMouseOut);
        window.removeEventListener('scroll', this.handleScroll);
    }
}
</script>

<style scoped>
@media (min-width: 1367px) and (max-width: 1700.9px) {
    .header-banner__inner {
        padding: 0 64px;
    }
}

.index {
    position: relative;
    margin: 0 auto;
    max-width: 2560px;
    background-color: var(--bg1);
}

.large-header {
    background-color: #fff;
    min-height: 96px;
    position: relative;
    margin: 0 auto;
    max-width: 2560px;
    width: 100%;
    color: #000;
}

.header__banner {
    position: relative;
    z-index: 0;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
    margin: 0 auto;
    min-width: 1000px;
    min-height: 155px;
    height: 9.375vw;
    max-height: 240px;
    background-color: #e3e5e7;
    background-position: center 0;
    background-size: cover;
    background-repeat: no-repeat;
}

.v-img {
    display: inline-block;
    line-height: 1;
    width: 100%;
    height: 100%;
    vertical-align: middle;
    background-color: var(--graph_bg_regular);
}

.v-img img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: inherit;
}

.banner-img {
    position: absolute;
    object-fit: cover;
}

.banner-img img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: inherit;
}

.header-banner__inner {
    position: relative;
    width: 100%;
    max-width: 2078px;
    margin: 0 auto;
    display: flex;
    align-items: flex-end;
}

@media (max-width: 1366.9px) {
    .header-banner__inner {
        padding: 0 56px;
    }
}

@media (min-width: 1367px) and (max-width: 1700.9px) {
    .header-banner__inner {
        padding: 0 64px;
    }
}

@media (min-width: 1701px) and (max-width: 2199.9px) {
    .header-banner__inner {
        padding: 0 96px;
        max-width: 2270px;
    }
}

@media (min-width: 2200px) {
    .header-banner__inner {
        max-width: 2078px;
    }
}

.logo-box {
    z-index: 1;
    display: inline-block;
    width: 150px;
    height: 50%;
}

.header-banner__inner img {
    cursor: pointer;
    position: relative;
    top: 5;
    right: 0;
    margin-bottom: 20px;
    margin-left: 15px;
    width: 150px;
    height: 50px;
    filter: drop-shadow(3px 5px 3px rgba(0, 0, 0, 0.5));
}

header {
    position: relative;
    z-index: 0;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
    margin: 0 auto;
    min-width: 1000px;
    min-height: 155px;
    height: 9.375vw;
    max-height: 240px;
    background-color: #e3e5e7;
    background-position: center 0;
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;
    --percentage: 0.5;
}

header .view,
header .tree {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

header .view img,
header .view video,
header .tree img {
    position: absolute;
    display: block;
    width: 120%;
    height: 100%;
    object-fit: cover;
}

header .morning {
    z-index: 20;
    opacity: calc(1 - (var(--percentage) - 0.25) / 0.25);
}

header .afternoon {
    z-index: 10;
    opacity: calc(1 - (var(--percentage) - 0.5) / 0.5);
}

header .view {
    transform: translatex(calc(var(--percentage) * 100px));
}

header .tree {
    transform: translatex(calc(var(--percentage) * 50px));
    filter: blur(3px);
}

header .view,
header .tree,
header .morning,
header .afternoon {
    transition: .2s all ease-in;
}

header.moving .view,
header.moving .tree,
header.moving .morning,
header.moving .afternoon {
    transition: none;
}

header .window-cover {
    opacity: calc((var(--percentage) - 0.9) / 0.1);
}

.taper-line {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(rgba(0, 0, 0, .4), transparent);
    pointer-events: none;
}

/* 主体布局：包含侧边栏和内容区 */
.layout-container {
    display: flex;
    margin-top: 60px;
    /* 避免被顶部栏遮挡 */
    height: calc(100vh - 60px);
}

.main__layout {
    background-color: #fff;
    margin: 0 auto;
    padding: 0 var(--layout-padding);
    max-width: calc(1980px + 2 * var(--layout-padding));
    width: 100%;
    flex: 1;
    /* padding: 16px; */
    transition: margin-left 0.3s ease-in-out;
}

/* 当侧边栏收起时，内容区域自动填充 */
.main__layout.collapsed {
    margin-left: 60px;
}

@media (max-width: 1139.9px) {
    .main__layout {
        width: 1020px;
    }

    .feed-roll-btn {
        left: initial !important;
        right: 10px;
        top: 255px !important;
        transform: initial !important;
    }
}

@media (min-width: 1140px) {
    .main__layout {
        position: relative;
    }

    .recommended-container {
        position: relative;
    }
}

.recommended-container {
    padding-bottom: 60px;
}

.container {
    grid-gap: 20px;
    display: grid;
    position: relative;
    width: 100%;
}

@media (max-width: 1399.9px) {
    .container {
        grid-column: span 4;
        grid-template-columns: repeat(4, 1fr);
    }

    .container>*:nth-of-type(n + 6) {
        margin-bottom: 15px;
    }

    .container .feed-card:nth-of-type(n + 10) {
        display: none;
    }
}

@media (min-width: 1400px) {
    .container {
        grid-column: span 5;
        grid-template-columns: repeat(5, 1fr);
    }

    .container>*:nth-of-type(n + 8) {
        margin-bottom: 25px;
    }
}

.recommended-swipe {
    position: relative;
    grid-column: 1/3;
    /* 跨越从第1列到第3列，占据两个网格列的宽度，等价于 grid-column: span 2; */
    grid-row: 1/3;
    /* 跨越从第1行到第3行，占据两个网格行的高度 */
}

.recommended-swipe-core {
    position: relative;
    width: 100%;
}

.recommended-swipe-shim {
    opacity: 0;
    visibility: hidden;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    pointer-events: none;
    grid-column: span 2;
    grid-row: span 2;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;
    width: 100%;
    display: grid;
}

.shim-card {
    width: 100%;
    height: 0;
    padding-top: 56.25%;
}

.recommended-swipe-body {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    transform: translateZ(0);
    /* 没有视觉效果的平移，它可以触发 GPU 加速，以提高性能和动画平滑度 */
    border-radius: 6px;
    overflow: hidden;
    background-color: var(--graph_bg_regular);
}

.carousel-area {
    position: relative;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    z-index: 0;
}

.feed-roll-btn {
    position: absolute;
    left: 100%;
    top: 0;
    z-index: 2;
    transform: translate(10px);
}

.feed-roll-btn .roll-btn {
    flex-direction: column;
    margin-left: 0;
    height: auto;
    width: 40px;
    padding: 9px;
    background-color: #fff;
    color: var(--text1);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 8px;
    font-size: 12px;
    border: 1px solid var(--line_regular);
    transform-origin: center;
    transition: .2s;
    cursor: pointer;
    line-height: 1.15;
}

.feed-roll-btn .roll-btn:hover {
    background-color: var(--graph_bg_thick);
}

.feed-roll-btn .roll-btn .iconfont {
    line-height: 16px;
    margin-bottom: 6px;
    transition: transform .5s ease;
}

@media (max-width: 1120px) {
    .feed-roll-btn {
        opacity: 0.8;
    }
}

.sider-layout {
    width: 220px;
    transition: width 0.3s ease-in-out;
    background: #f8f9fa;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

/* 侧边栏收起时 */
.sider-layout.collapsed {
    width: 60px;
}
</style>