<template>
    <div class="header-channel-fixed">
        <div class="header-channel-fixed-container" :class="isChannelDown ? 'header-channel-fixed-down' : ''"
            @mouseenter="isChannelDown = true;" @mouseleave="isChannelDown = false;">
            <div class="header-channel-fixed-left">
                <div class="left-fixed-channel">
                    <i class="iconfont icon-fengche"></i>
                    <span>动态</span>
                </div>
                <div class="left-fixed-channel">
                    <i class="iconfont icon-huo"></i>
                    <span>热门</span>
                </div>
            </div>
            <div class="header-channel-fixed-center"></div>
            <div class="header-channel-fixed-right">
                <div class="header-channel-fixed-right-left">
                    <div class="left-top">
                        <a :href="`/v/anime`" target="_blank" class="header-channel-fixed-right-item">番剧</a>
                        <a :href="`/movie`" target="_blank" class="header-channel-fixed-right-item">电影</a>
                        <a :href="`/v/guochuang`" target="_blank" class="header-channel-fixed-right-item">国创</a>
                        <a :href="`/tv`" target="_blank" class="header-channel-fixed-right-item">电视剧</a>
                        <a :href="`/variety`" target="_blank" class="header-channel-fixed-right-item">综艺</a>
                        <a :href="`/documentary`" target="_blank" class="header-channel-fixed-right-item">纪录片</a>
                        <a :href="`/v/${item.mcId}`" target="_blank" class="header-channel-fixed-right-item"
                            v-for="(item, index) in channels.slice(2)" :key="index">
                            {{ item.mcName }}
                        </a>
                        <a :href="`/v/life/daily`" target="_blank" class="header-channel-fixed-right-item">VLOG</a>
                        <a :href="`/v/life/funny`" target="_blank" class="header-channel-fixed-right-item">搞笑</a>
                        <a :href="`/v/game/stand_alone`" target="_blank"
                            class="header-channel-fixed-right-item">单机游戏</a>
                        <a :href="`/love`" target="_blank" class="header-channel-fixed-right-item">公益</a>
                        <a :href="`/mooc`" target="_blank" class="header-channel-fixed-right-item">公开课</a>
                    </div>
                </div>
                <div class="header-channel-fixed-right-right">
                    <a :href="`/read/home`" target="_blank" class="header-channel-fixed-right-item">专栏</a>
                    <a :href="`/live`" target="_blank" class="header-channel-fixed-right-item">直播</a>
                    <a :href="`/activity`" target="_blank" class="header-channel-fixed-right-item">活动</a>
                    <a :href="`/cheese`" target="_blank" class="header-channel-fixed-right-item">课堂</a>
                    <a :href="`/community`" target="_blank" class="header-channel-fixed-right-item"
                        style="letter-spacing: 0px;">社区中心</a>
                    <a :href="`/song`" target="_blank" class="header-channel-fixed-right-item"
                        style="letter-spacing: 0px;">新歌热榜</a>
                </div>
                <div class="left-bottom">
                    <a :href="`/v/anime`" target="_blank" class="header-channel-fixed-right-item">番剧</a>
                    <a :href="`/movie`" target="_blank" class="header-channel-fixed-right-item">电影</a>
                    <a :href="`/v/guochuang`" target="_blank" class="header-channel-fixed-right-item">国创</a>
                    <a :href="`/tv`" target="_blank" class="header-channel-fixed-right-item">电视剧</a>
                    <a :href="`/variety`" target="_blank" class="header-channel-fixed-right-item">综艺</a>
                    <a :href="`/documentary`" target="_blank" class="header-channel-fixed-right-item">纪录片</a>
                    <a :href="`/v/${item.mcId}`" target="_blank" class="header-channel-fixed-right-item"
                        v-for="(item, index) in channels.slice(2)" :key="index">
                        {{ item.mcName }}
                    </a>
                    <a :href="`/v/life/daily`" target="_blank" class="header-channel-fixed-right-item">VLOG</a>
                    <a :href="`/v/life/funny`" target="_blank" class="header-channel-fixed-right-item">搞笑</a>
                    <a :href="`/v/game/stand_alone`" target="_blank" class="header-channel-fixed-right-item">单机游戏</a>
                    <a :href="`/love`" target="_blank" class="header-channel-fixed-right-item">公益</a>
                    <a :href="`/mooc`" target="_blank" class="header-channel-fixed-right-item">公开课</a>
                </div>
            </div>
            <div class="header-channel-fixed-arrow">
                <div class="iconfont icon-xiajiantou" :style="isChannelDown ? 'transform: rotate(180deg);' : ''"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "HeaderChannel",
    data() {
        return {
            // 是否显示更多频道
            isChannelDown: false,
        }
    },
    computed: {
        // 频道列表
        channels() {
            return this.$store.state.channels;
        }
    },
    methods: {
        // 打开新标签页
        openNewPage(route) {
            window.open(this.$router.resolve(route).href, '_blank');
        }
    }
}
</script>

<style scoped>
.header-channel-fixed {
    width: 100%;
    min-width: 1100px;
    max-width: 2560px;
    display: flex;
    justify-content: center;
    background: var(--bg1_float);
    z-index: 1001;
    position: fixed;
    top: 35px;
    letter-spacing: 2px;
    animation: headerSlideDown .2s linear forwards;
}

@keyframes headerSlideDown {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.header-channel-fixed {
    --left_width: 140px;
    --left_width_item: 70px;
    --item_height: 28px;
}

.header-channel-fixed-container {
    max-height: 56px;
    overflow: hidden;
    transition: max-height .2s;
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    padding: 14px var(--layout-padding, 60px) 14px var(--layout-padding, 30px);
}

.header-channel-fixed-down {
    max-height: 150px;
}

.header-channel-fixed-left {
    display: flex;
    min-width: var(--left_width);
    width: var(--left_width);
    flex-wrap: wrap;
    color: var(--text2);
    font-size: 14px;
    align-self: start;
}

.left-fixed-channel {
    cursor: pointer;
    display: flex;
    width: var(--left_width_item);
    height: 28px;
    margin-bottom: 14px;
    align-items: center;
}

.left-fixed-channel .iconfont {
    color: var(--text1);
    font-size: 21px;
    display: inline-block;
    position: relative;
    margin-right: 5px;
}

.left-fixed-channel:hover,
.left-fixed-channel:hover .iconfont {
    color: var(--brand_pink);
}

.header-channel-fixed-center {
    height: 14px;
    width: 1px;
    margin-right: 10px;
    background: var(--line_regular);
}

.header-channel-fixed-right {
    display: inline-grid;
    flex: 1;
    height: 100%;
    position: relative;
}

.header-channel-fixed-right-item {
    height: var(--item_height);
    line-height: var(--item_height);
    border: 1px solid var(--line_light);
    background: var(--graph_bg_thin);
    border-radius: 6px;
    text-align: center;
    cursor: pointer;
    color: var(--text2);
}

.header-channel-fixed-right-item:hover {
    background: var(--graph_bg_thick);
    transition: background 0.2s;
}

.left-top .header-channel-fixed-right-item:nth-of-type(23),
.left-top .header-channel-fixed-right-item:nth-of-type(24),
.left-top .header-channel-fixed-right-item:nth-of-type(26),
.left-bottom .header-channel-fixed-right-item:nth-of-type(23),
.left-bottom .header-channel-fixed-right-item:nth-of-type(24),
.left-bottom .header-channel-fixed-right-item:nth-of-type(26) {
    letter-spacing: 0px;
}

.header-channel-fixed-right-left {
    display: inline-grid;
    position: relative;
}

.header-channel-fixed-right-left .left-top {
    display: inline-grid;
    grid-template-rows: repeat(2, 1fr);
    position: relative;
    grid-auto-flow: column;
}

.header-channel-fixed-right-right {
    display: inline-grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-flow: column;
    grid-template-rows: var(--item_height) var(--item_height);
    grid-column: span 3;
}

.header-channel-fixed-right .left-bottom {
    display: inline-grid;
    grid-template-rows: repeat(1, 1fr);
    position: relative;
}

.header-channel-fixed-right .left-bottom,
.header-channel-fixed-right-right,
.header-channel-fixed-right-left .left-top,
.header-channel-fixed-right {
    grid-gap: 14px 10px;
}

@media (max-width: 1366.9px) {
    .header-channel-fix {
        --left_width: 128px;
        --left_width_item: 64px;
    }

    .header-channel-fixed-right {
        grid-column: span 12;
        grid-template-columns: repeat(12, 1fr);
    }

    .header-channel-fixed-right-left {
        grid-column: span 9;
        grid-template-columns: repeat(9, 1fr);
    }

    .header-channel-fixed-right .left-bottom {
        grid-column: span 12;
        grid-template-columns: repeat(12, 1fr);
    }

    .header-channel-fixed-right-left .left-top {
        grid-column: span 9;
        grid-template-columns: repeat(9, 1fr);
    }

    .header-channel-fixed-right .left-bottom,
    .header-channel-fixed-right-right,
    .header-channel-fixed-right-left .left-top,
    .header-channel-fixed-right {
        font-size: 13px;
        grid-gap: 14px 8px;
    }

    .left-top .header-channel-fixed-right-item:nth-of-type(1n + 19) {
        display: none !important;
    }

    .left-bottom .header-channel-fixed-right-item:nth-of-type(-1n + 18) {
        display: none !important;
    }
}

@media (min-width: 1367px) and (max-width: 1700.9px) {
    .header-channel-fixed-right {
        grid-column: span 14;
        grid-template-columns: repeat(14, 1fr);
    }

    .header-channel-fixed-right-left {
        grid-column: span 11;
        grid-template-columns: repeat(11, 1fr);
    }

    .header-channel-fixed-right .left-bottom {
        grid-column: span 14;
        grid-template-columns: repeat(14, 1fr);
    }

    .header-channel-fixed-right-left .left-top {
        grid-column: span 11;
        grid-template-columns: repeat(11, 1fr);
    }

    .left-top .header-channel-fixed-right-item:nth-of-type(1n + 23) {
        display: none !important;
    }

    .left-bottom .header-channel-fixed-right-item:nth-of-type(-1n + 22) {
        display: none !important;
    }
}

@media (min-width: 1701px) and (max-width: 2199.9px) {
    .header-channel-fix {
        --left_width: 160px;
        --left_width_item: 80px;
    }

    .header-channel-fixed-right {
        grid-column: span 15;
        grid-template-columns: repeat(15, 1fr);
    }

    .header-channel-fixed-right-left {
        grid-column: span 12;
        grid-template-columns: repeat(12, 1fr);
    }

    .header-channel-fixed-right .left-bottom {
        grid-column: span 15;
        grid-template-columns: repeat(15, 1fr);
    }

    .header-channel-fixed-right-left .left-top {
        grid-column: span 12;
        grid-template-columns: repeat(12, 1fr);
    }

    .left-top .header-channel-fixed-right-item:nth-of-type(1n + 25) {
        display: none !important;
    }

    .left-bottom .header-channel-fixed-right-item:nth-of-type(-1n + 24) {
        display: none !important;
    }
}

@media (min-width: 2200px) {
    .header-channel-fix {
        --left_width: 160px;
        --left_width_item: 80px;
    }

    .header-channel-fixed-right {
        grid-column: span 17;
        grid-template-columns: repeat(17, 1fr);
    }

    .header-channel-fixed-right-left {
        grid-column: span 14;
        grid-template-columns: repeat(14, 1fr);
    }

    .header-channel-fixed-right .left-bottom {
        display: none;
    }

    .header-channel-fixed-right-left .left-top {
        grid-column: span 14;
        grid-template-columns: repeat(14, 1fr);
    }
}

.header-channel-fixed-arrow {
    position: absolute;
    right: calc(var(--layout-padding, 60px) - 40px);
    width: 28px;
    height: 28px;
    padding: 6px;
    margin-left: 10px;
    align-self: start;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: .2s;
}

.header-channel-fixed-arrow:hover {
    background-color: var(--graph_bg_thick);
}

.icon-xiajiantou {
    font-weight: 600;
    width: 100%;
    height: 100%;
    transition: .2s;
}
</style>