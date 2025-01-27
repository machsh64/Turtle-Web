<template>
    <div class="flex-fill">
        <div class="v-container">
            <div class="v-card">
                <div class="banner-table-card">
                    <div class="v-table" v-loading="loading">
                        <div class="v-table__wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="min-width: 30px;"></th>
                                        <th style="min-width: 120px;">封面</th>
                                        <th style="min-width: 80px;">标题</th>
                                        <th style="min-width: 60px;">标题颜色</th>
                                        <th style="min-width: 80px;">视频预览</th>
                                        <th style="min-width: 60px;">状态</th>
                                        <th style="min-width: 160px;">创建时间</th>
                                        <th style="min-width: 80px;"></th>
                                    </tr>
                                </thead>
                                <tbody v-if="carousels.length !== 0">
                                    <tr v-for="(item, index) in carousels" :key="index">
                                        <td style="min-width: 30px"></td>
                                        <td style="width: 176px;">
                                            <img :src="item.url" class="cover" alt="">
                                        </td>
                                        <td style="min-width: 80px;">
                                            <span :style="{ color: item.color }" class="title" @click="toggleTitle(index)">
                                                <!-- 判断标题长度，如果超过8个字，折叠显示 -->
                                                {{ isTitleExpanded(index) ? item.title : item.title.slice(0, 8) + '...' }}
                                            </span>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="color-block" :style="{ backgroundColor: item.color }"></div>
                                        </td>
                                        <td style="min-width: 80px;">
                                            <span class="detail-btn" @click="openVideo(item.target)">
                                                视频预览
                                            </span>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="status" v-if="item.status === '0'">
                                                <i class="iconfont icon-wancheng"></i>
                                                <span>启用中</span>
                                            </div>
                                            <div class="status" v-if="item.status === '1'">
                                                <i class="iconfont icon-shibai"></i>
                                                <span>已下架</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 150px;">{{ item.createTimeStr }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="no-more" v-if="!loading && carousels.length == 0">
                                <img src="~assets/img/silly.png" alt="">
                                <span>没有找到任何数据</span>
                            </div>
                        </div>
                        <div class="v-table-page">
                            <el-pagination background layout="prev, pager, next" :total="total" :page-size="10"
                                :pager-count="pagerCount" :current-page="page"
                                @current-change="pageChange"></el-pagination>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "CarouselManage",
    data() {
        return {
            bannerStatus: '',   // 要查询的轮播图状态，0 启用中，1 停用 默认不传则全查
            bannerTitle: '',    // 轮播图标题，供查询
            carousels: [],
            page: 1,
            pageSize: 10,
            total: 100,
            pagerCount: 7,
            loading: true,
            dialogVisible: false,  // 控制视频弹出框的显示
            currentTitle: '',  // 当前选中的标题
            currentVideo: '',  // 当前选中的视频链接
            expandedTitles: []  // 存储哪个标题被展开
        }
    },
    methods: {
        // 请求
        // 查询所有轮播图
        async getCarousels() {
            const requestData = {
                status: this.bannerStatus,
                title: this.bannerTitle,
                page: this.page,
                pageSize: this.pageSize
            };

            const res = await this.$post("/admin/banner/getPage", requestData, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                }
            });
            console.log("TEEEee: ", res.data)
            if (res.data.code === 200) {
                this.total = res.data.data.total
                this.carousels = res.data.data.list;
            } else {
                this.total = 0;
                this.carousels = [];
            }
            console.log('banner列表: ', this.carousels);
        },

        // 事件
        // 切换类型
        changeStatus(vstatus) {
            this.videoStatus = vstatus;
            if (this.page !== 1) {
                this.page = 1;  // 这里页码改变会触发重加载
            } else {
                this.reloadVideos();
            }
        },

        // 改变页码时的回调
        async pageChange(page) {
            this.page = page;
            await this.reloadVideos();
        },

        // 重新加载视频列表
        async reloadVideos() {
            this.loading = true;
            await this.getTotal();
            if (this.total > 0) {
                await this.getVideos();
            }
            this.loading = false;
        },

        // 判断是否小窗
        changeWidth() {
            if (window.innerWidth < 480) {
                this.pagerCount = 3;
            } else {
                this.pagerCount = 7;
            }
        },
        toggleTitle(index) {
            // 切换标题展开/收起状态
            if (this.expandedTitles.includes(index)) {
                this.expandedTitles = this.expandedTitles.filter(item => item !== index);
            } else {
                this.expandedTitles.push(index);
            }
        },
        isTitleExpanded(index) {
            // 判断标题是否展开
            return this.expandedTitles.includes(index);
        },
        openVideo(target) {
            // 打开视频预览弹窗
            this.currentVideo = target;  // 假设 target 是视频链接
            this.dialogVisible = true;
        },
        closeDialog() {
            // 关闭视频预览弹窗
            this.dialogVisible = false;
            this.currentVideo = '';  // 清空视频链接
        }
    },
    async created() {
        this.changeWidth();
        await this.getCarousels();
        this.loading = false;
    },
    mounted() {
        // 监听窗口大小变化，判断是否小窗
        window.addEventListener('resize', this.changeWidth);
    },
    unmounted() {
        window.removeEventListener('resize', this.changeWidth);
    },
}
</script>

<style scoped>
.banner-table-card {
    height: calc(100vh - 96px);
    position: relative;
    overflow: hidden !important;
    overflow-anchor: none;
    -ms-overflow-style: none;
    touch-action: auto;
    -ms-touch-action: auto;
}

.v-table {
    --v-table-row-height: 120px;
}

.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    border-bottom: 1px solid #e7e7e7;
}

.navbar,
.top-right {
    display: flex;
    flex: 0 0 auto;
}

.top-right {
    margin-left: 100px;
}

.bar-item {
    flex: 0 0 auto;
    height: 64px;
    padding-bottom: 18px;
    padding-top: 26px;
    margin-left: 40px;
    font-size: 16px;
    color: #505050;
    cursor: pointer;
}

.active {
    color: var(--brand_pink);
    font-weight: 600;
    border-bottom: 3px solid var(--brand_pink);
}

.top-right>div {
    flex: 0 0 auto;
    line-height: 54px;
    margin-right: 30px;
    padding-top: 10px;
}

.refresh {
    cursor: pointer;
    color: var(--brand_blue);
}

.refresh:hover {
    color: var(--Lb6);
}

.v-table__wrapper {
    height: calc(100% - 150px);
}

.v-table__wrapper table {
    padding: 0 4px 8px;
}

.cover {
    height: 81px;
    width: 144px;
    object-fit: cover;
    box-shadow: 2px 2px 8px #0000001f;
}

.title {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}

.title:hover {
    color: var(--text1);
}

/* 显示标题颜色块 */
.color-block {
    width: 20px;
    height: 20px;
    border-radius: 50%;
}

.detail-btn {
    cursor: pointer;
    color: #409EFF;
}

.category {
    color: #fff;
    line-height: 18px;
    padding: 2px 8px;
    border-radius: 10px;
}

.status {
    display: flex;
    align-items: center;
}

.status .iconfont {
    font-size: 12px;
    margin-right: 5px;
}

.icon-shenhezhong {
    color: var(--pay_yellow);
}

.icon-wancheng {
    color: var(--success_green);
}

.icon-shibai {
    color: var(--stress_red);
}

.detail-btn {
    cursor: pointer;
    color: var(--brand_blue);
}

.detail-btn:hover {
    color: var(--Lb6);
    text-decoration: underline;
}

.no-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 150px;
    width: 100%;
}

.no-more img {
    height: 80px;
}

.no-more span {
    font-size: 20px;
    color: var(--text3);
    line-height: 40px;
}

.v-table-page {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>