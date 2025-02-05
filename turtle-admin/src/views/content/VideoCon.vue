<template>
    <div class="flex-fill">
        <div class="v-container">

            <!-- 搜索条件和总数 -->
            <div class="search-bar">
                <div class="search-left">
                    <!-- 前3个固定显示的搜索条件 -->
                    <div class="visible-conditions">
                        <span><i class="el-icon-search"></i>标题: </span>
                        <el-input v-model="videoReqDate.title" placeholder=" 请输入标题" style="width: 180px;"></el-input>


                        <span><i class="el-icon-menu"></i>状态: </span>
                        <el-select v-model="videoReqDate.status" placeholder=" 选择状态" style="width: 120px;">
                            <el-option label="全部" value=""></el-option>
                            <el-option label="已通过" value="1"></el-option>
                            <el-option label="未过审" value="2"></el-option>
                        </el-select>

                        <span><i class="el-icon-search"></i>分类: </span>
                        <el-select v-model="videoReqDate.mcId" placeholder=" 请选择分类" style="width: 120px;">
                            <el-option label=" 全部" value=""></el-option>
                            <el-option v-for="(item, index) in channels" :key="index" :label="item.mcName"
                                :value="item.mcId"></el-option>
                        </el-select>

                        <span><i class="el-icon-search"></i>投稿类型: </span>
                        <el-select v-model="videoReqDate.type" placeholder=" 请选择类型" style="width: 120px;">
                            <el-option label="全部" value=""></el-option>
                            <el-option label="自制" value="1"></el-option>
                            <el-option label="转载" value="2"></el-option>
                        </el-select>

                    </div>

                    <!-- 折叠的搜索条件 -->
                    <div class="collapsed-conditions" v-show="isExpanded">

                        <span><i class="el-icon-search"></i>用户名称: </span>
                        <el-input v-model="videoReqDate.nickName" placeholder=" 请输入名称" style="width: 180px;"></el-input>

                        <span><i class="el-icon-search"></i>用户id: </span>
                        <el-input v-model="videoReqDate.uid" placeholder=" 请输入ID" style="width: 180px;"></el-input>

                        <span><i class="el-icon-search"></i>视频id: </span>
                        <el-input v-model="videoReqDate.vid" placeholder=" 请输入ID" style="width: 180px;"></el-input>

                    </div>
                </div>

                <div class="search-right">
                    <el-button @click="toggleExpand" class="toggle-btn">
                        {{ isExpanded ? '收起' : '更多查询' }}
                    </el-button>
                    <el-button type="primary" @click="getVideoList">查询</el-button>
                    <el-button @click="resetFilters">重置</el-button>
                </div>
            </div>

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
                                        <th style="min-width: 80px;">简介</th>
                                        <th style="min-width: 60px;">分类</th>
                                        <th style="min-width: 60px;">状态</th>
                                        <th style="min-width: 120px;">创建时间</th>
                                        <th style="min-width: 150px;">操作</th> <!-- 增加操作列 -->
                                    </tr>
                                </thead>
                                <tbody v-if="videoList.length !== 0">
                                    <tr v-for="(item, index) in videoList" :key="index">
                                        <td style="min-width: 30px"></td>
                                        <td style="width: 176px;">
                                            <img :src="item.coverUrl" class="cover" alt="">
                                        </td>
                                        <td style="min-width: 80px;">
                                            <span class="title" @click="toggleTitle(index)">
                                                {{ item.title.length > 6 ? (isTitleExpanded(index) ? item.title :
                                                    item.title.slice(0, 6) + '...') : item.title }}
                                            </span>
                                        </td>
                                        <td style="min-width: 80px;">
                                            <span class="descr" @click="toggleDescr(index)">
                                                {{ item.descr.length > 12 ? (isDescrExpanded(index) ? item.descr :
                                                    item.descr.slice(0, 12) + '...') : item.descr }}
                                            </span>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="type">
                                                <span>{{ getMcNameById(item.mcId) }}</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="status" v-if="item.status === 1">
                                                <i class="iconfont icon-wancheng"></i>
                                                <span>已通过</span>
                                            </div>
                                            <div class="status" v-if="item.status === 2">
                                                <i class="iconfont icon-shibai"></i>
                                                <span>未过审</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 150px;">{{ item.uploadDate }}</td>
                                        <td style="min-width: 150px;">
                                            <el-button size="small" @click="showDetail(item)">详情</el-button>
                                            <el-button size="small" :type="item.status === 2 ? 'danger' : 'success'"
                                                @click="toggleStatus(item)">
                                                {{ item.status === 1 ? '下架' : '上架' }}
                                            </el-button>
                                            <el-button size="small" type="danger"
                                                @click="deleteVideo(item)">删除</el-button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="no-more" v-if="!loading && videoList.length == 0">
                                <img src="~assets/img/silly.png" alt="">
                                <span>没有找到任何数据</span>
                            </div>
                        </div>
                        <div class="v-table-page">
                            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
                                :pager-count="pagerCount" :current-page="page"
                                @current-change="pageChange"></el-pagination>
                            <span class="total-count">总数: {{ total }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 详情弹窗 -->
            <el-dialog style="width: 47%;" v-model="detailDialogVisible" title="视频详情数据" append-to-body>
                <el-form :model="detailVideo" label-width="100px">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="视频id: ">
                                <span>{{ detailVideo.vid }}</span>
                            </el-form-item>
                            <el-form-item label="标题：">
                                <span>{{ detailVideo.title }}</span>
                            </el-form-item>
                            <el-form-item label="视频类型：">
                                <span>{{ getMcNameById(detailVideo.mcId) }}</span>
                            </el-form-item>
                            <el-form-item label="视频封面：">
                                <img :src="detailVideo.coverUrl" class="cover" alt="">
                            </el-form-item>
                        </el-col>

                        <el-col :span="12">
                            <el-form-item label="投稿用户id: ">
                                <span>{{ detailVideo.uid }}</span>
                            </el-form-item>

                            <el-form-item label="类型：">
                                <div v-if="detailVideo.type === 1">
                                    <span>自制</span>
                                </div>
                                <div v-if="detailVideo.type === 2">
                                    <i class="iconfont icon-shibai"></i>
                                    <span>转载</span>
                                </div>
                            </el-form-item>
                            <el-form-item label="状态：">
                                <div class="status" v-if="detailVideo.status === 1">
                                    <i class="iconfont icon-wancheng"></i>
                                    <span>已通过</span>
                                </div>
                                <div class="status" v-if="detailVideo.status === 2">
                                    <i class="iconfont icon-shibai"></i>
                                    <span>未过审</span>
                                </div>
                            </el-form-item>
                            <el-form-item label="视频时长：">
                                <span>{{ formattedDuration }}</span>
                            </el-form-item>
                            <el-form-item label="视频预览：">
                                <span class="detail-btn" 
                                @click="openNewPage({
                                    name: 'videoConDetail',
                                    params: { vid: detailVideo.vid }
                                })">
                                    视频预览
                                </span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="detailDialogVisible = false">关闭</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script>
export default {
    name: "VideoCon",
    data() {
        return {
            videoStatus: "",   // 要查询的轮播图状态，1 启用中，2 下架 默认不传则全查
            videoTitle: '',    // 轮播图标题，供查询
            nickName: '',  // 用户昵称，供查询
            uid: '',    //  用户id，供查询
            vid: '',
            videoType: null,
            videoMcId: '',
            videoReqDate: {
                status: '',
                title: '',
                nickName: '',
                type: '',
                mcId: '',
                uid: '',
                vid: '',
                page: 1,
                pageSize: 5,
            },
            videoList: [],
            page: 1,
            pageSize: 5,
            total: 100,
            pagerCount: 7,
            loading: true,
            expandedTitles: [],  // 存储哪个标题被展开
            expandedDescr: [],  // 存储哪个简介被展开
            detailDialogVisible: false,  // 控制编辑弹出框的显示
            detailVideo: {},  // 存储当前选中的视频数据
            isExpanded: false, // 更多搜索条件的展开和折叠
        }
    },
    computed: {
        formattedDuration() {
            const minutes = Math.floor(this.detailVideo.duration / 60);
            const seconds = (this.detailVideo.duration % 60).toFixed(0);
            return `${minutes} 分 ${seconds} 秒`;
        },
        // 频道列表
        channels() {
            return this.$store.state.channels;
        },
        getMcNameById() {
            return (mcId) => {
                const channel = this.channels.find(channel => channel.mcId === mcId);
                return channel ? channel.mcName : '未知';
            };
        },
    },
    methods: {
        // 请求
        // 查询所有视频
        async getVideoList() {
            this.videoReqDate.page = this.page;
            this.videoReqDate.pageSize = this.pageSize;
            const res = await this.$post("/admin/video-con/getPage", this.videoReqDate, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                }
            });
            if (res.data.code === 200) {
                this.total = res.data.data.total
                this.videoList = res.data.data.list;
            } else {
                this.total = 0;
                this.videoList = [];
            }
            console.log('video列表: ', this.videoList);
        },
        async toggleStatus(item) {
            console.log('Toggle status for carousel:', item);
            // 启用/禁用逻辑
            this.$confirm('是否修改该视频状态?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const newStatus = item.status === 1 ? 2 : 1;
                const formData = new FormData();
                formData.append('vid', item.vid);
                formData.append('status', newStatus);
                this.$post("/admin/video-con/updateStatus", formData, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    }
                }).then(res => {
                    if (res.data.code === 200) {
                        item.status = newStatus;
                        console.log('Status updated successfully');
                    } else {
                        console.error('Failed to update status');
                    }
                }).catch(err => {
                    console.error('Error updating status:', err);
                });
            }).catch(() => {
                console.log('取消更新');
            });
        },
        async deleteVideo(item) {
            console.log('Delete video:', item);
            // 删除逻辑
            this.$confirm('该操作会删除视频源文件，无法复原，确定删除吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$get(`/admin/video-con/delete/${item.vid}`, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    }
                }).then(res => {
                    if (res.data.code === 200) {
                        this.videoList = this.videoList.filter(video => video.vid !== item.vid);
                        this.total -= 1;
                        console.log('video deleted successfully');
                    } else {
                        console.error('Failed to delete video');
                    }
                }).catch(err => {
                    console.error('Error deleting video:', err);
                });
            }).catch(() => {
                console.log('取消删除');
            });
        },
        // 事件
        // 跳向视频预览页面
        // 打开新标签页
        openNewPage(route) {
            console.log(route);
            window.open(this.$router.resolve(route).href, '_blank');
        },
        // 搜索条件切换
        toggleExpand() {
            this.isExpanded = !this.isExpanded
        },
        // 切换类型
        changeStatus(vstatus) {
            this.videoStatus = vstatus;
            if (this.page !== 1) {
                this.page = 1;  // 这里页码改变会触发重加载
            } else {
                this.reloadVideoList();
            }
        },
        // 重置查询条件
        resetFilters() {
            this.videoReqDate = {
                status: '',
                title: '',
                nickName: '',
                type: '',
                mcId: '',
                uid: '',
                vid: '',
                page: 1,
                pageSize: 5,
            }
            this.getVideoList();  // 重新查询所有数据
        },
        // 改变页码时的回调
        async pageChange(page) {
            this.page = page;
            await this.reloadVideoList();
        },
        // 重新加载banner列表
        async reloadVideoList() {
            this.loading = true;
            await this.getVideoList();
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
        closeAllTitles() {
            // 关闭所有展开的标题
            this.expandedTitles = [];
        },
        handleClickOutside(event) {
            // 检查点击是否在标题之外
            const titleElements = document.querySelectorAll('.title');
            let isClickInside = false;
            titleElements.forEach(element => {
                if (element.contains(event.target)) {
                    isClickInside = true;
                }
            });
            if (!isClickInside) {
                this.closeAllTitles();
            }
        },
        toggleDescr(index) {
            // 切换标题展开/收起状态
            if (this.expandedDescr.includes(index)) {
                this.expandedDescr = this.expandedDescr.filter(item => item !== index);
            } else {
                this.expandedDescr.push(index);
            }
        },
        isDescrExpanded(index) {
            // 判断标题是否展开
            return this.expandedDescr.includes(index);
        },
        closeAllDescrs() {
            // 关闭所有展开的标题
            this.expandedDescr = [];
        },
        handleClickOutside(event) {
            // 检查点击是否在标题之外
            const descrElements = document.querySelectorAll('.descr');
            let isClickInside = false;
            descrElements.forEach(element => {
                if (element.contains(event.target)) {
                    isClickInside = true;
                }
            });
            if (!isClickInside) {
                this.closeAllDescrs();
            }
        },

        showDetail(item) {
            // 详情页面点开
            console.log('Detial video:', item);
            this.detailVideo = { ...item };  // 复制当前行的数据到 detailVideo
            this.detailDialogVisible = true;  // 显示编辑弹窗
        },

    },
    async created() {
        this.changeWidth();
        await this.getVideoList();
        this.loading = false;
    },
    mounted() {
        // 监听窗口大小变化，判断是否小窗
        window.addEventListener('resize', this.changeWidth);
        // 添加点击事件监听器
        document.addEventListener('click', this.handleClickOutside);
    },
    unmounted() {
        window.removeEventListener('resize', this.changeWidth);
        // 移除点击事件监听器
        document.removeEventListener('click', this.handleClickOutside);
    },
}
</script>

<style scoped>
.search-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 16px;
    /* 添加一些内边距 */
    background-color: #f5f7fa;
    /* 统一背景颜色 */
    border-bottom: 1px solid #e7e7e7;
    /* 去除底部边距 */
    flex-wrap: wrap;
    /* 允许换行 */
}

.search-left {
    display: flex;
    flex-direction: column;
    /* 改为纵向排列 */
    flex-grow: 1;
    gap: 10px;
    /* 行间距 */
}

/* 调整元素间距 */
.search-left span {
    white-space: nowrap;
}

.search-left .el-input,
.search-left .el-select {
    margin-right: 10px;
}

.search-left .el-input input,
.search-left .el-select .el-input__inner {
    padding: 10px;
    /* 增加内边距 */
}

.visible-conditions,
.collapsed-conditions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    /* 允许条件换行 */
    gap: 10px;
}

.search-right {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    /* 保持右侧对齐 */
}

.search-right .el-button {
    margin-right: 10px;
    min-width: 80px;
    /* 增加按钮宽度 */
}

/* 按钮样式调整 */
.toggle-btn {
    margin-left: 10px;
    color: #409EFF;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
}

/* 调整所有输入框的内边距 */
.search-left :deep(.el-input__inner) {
    padding: 8px 12px !important;
    /* 增加左右内边距 */
}

/* 调整选择框的内边距 */
.search-left :deep(.el-select .el-input__inner) {
    padding: 8px 30px 8px 12px !important;
    /* 右侧留出下拉箭头空间 */
}

/* 调整选择框下拉菜单的选项间距 */
.search-left :deep(.el-select-dropdown__item) {
    padding: 8px 12px !important;
}

/* 调整输入框聚焦状态样式 */
.search-left :deep(.el-input__inner:focus) {
    border-color: #409EFF;
    box-shadow: 0 0 4px rgba(64, 158, 255, 0.3);
}

/* 响应式调整：小屏幕时缩小间距 */
@media (max-width: 1600px) {
    .search-left :deep(.el-input__inner) {
        padding: 6px 10px !important;
    }

    .search-left :deep(.el-select .el-input__inner) {
        padding: 6px 28px 6px 10px !important;
    }
}

.banner-table-card {
    background-color: #f5f7fa;
    /* 统一背景颜色 */
    border-top: none;
    /* 去除顶部边框 */
}

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
    align-items: center;
    margin-top: 16px;
    /* 添加一些顶部间距 */
}

.v-table-page .el-pagination {
    margin-right: 16px;
    /* 确保分页控件和总数之间有一定的间距 */
}

.v-table-page .total-count {
    font-size: 14px;
    color: #333;
}
</style>