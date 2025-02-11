<template>
    <div class="flex-fill">
        <div class="v-container">

            <!-- 搜索条件和总数 -->
            <div class="search-bar">
                <div class="search-left">
                    <!-- 前3个固定显示的搜索条件 -->
                    <div class="visible-conditions">
         
                        <span><i class="el-icon-search"></i>账号: </span>
                        <el-input v-model="userReqDate.username" placeholder=" 请输入账号" style="width: 180px;"></el-input>

                        <span><i class="el-icon-search"></i>名称: </span>
                        <el-input v-model="userReqDate.nickname" placeholder=" 请输入名称" style="width: 180px;"></el-input>

                        <span><i class="el-icon-menu"></i>状态: </span>
                        <el-select v-model="userReqDate.state" placeholder=" 选择状态" style="width: 120px;">
                            <el-option label="全部" value=""></el-option>
                            <el-option label="正常" value="0"></el-option>
                            <el-option label="封禁" value="1"></el-option>
                        </el-select>

                
                    </div>

                    <!-- 折叠的搜索条件 -->
                    <div class="collapsed-conditions" v-show="isExpanded">
                        <!-- 可以添加更多搜索条件 -->
                        <span><i class="el-icon-search"></i>UID: </span>
                        <el-input v-model="userReqDate.uid" placeholder=" 请输入UID" style="width: 180px;"></el-input>

                        <span><i class="el-icon-search"></i>角色: </span>
                        <el-select v-model="userReqDate.roleId" placeholder=" 请选择角色" style="width: 120px;">
                            <el-option label="全部" value=""></el-option>
                            <el-option v-for="(role, index) in roles" :key="index" :label="role.roleName"
                                :value="role.id"></el-option>
                        </el-select>
                    </div>
                </div>

                <div class="search-right">
                    <el-button @click="toggleExpand" class="toggle-btn">
                        {{ isExpanded ? '收起' : '更多查询' }}
                    </el-button>
                    <el-button type="primary" @click="getUserList">查询</el-button>
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
                                        <th style="min-width: 60px;">uid</th>
                                        <th style="min-width: 60px;">账号</th>
                                        <th style="min-width: 60px;">名称</th>
                                        <th style="min-width: 60px;">角色</th>
                                        <th style="min-width: 60px;">性别</th>
                                        <th style="min-width: 60px;">状态</th>
                                        <th style="min-width: 120px;">创建时间</th>
                                        <th style="min-width: 150px;">操作</th> <!-- 增加操作列 -->
                                    </tr>
                                </thead>
                                <tbody v-if="userList.length !== 0">
                                    <tr v-for="(item, index) in userList" :key="index">
                                        <td style="min-width: 30px"></td>
                                        <td style="min-width: 60px;">
                                            <div class="type">
                                                <span>{{ item.uid }}</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="type">
                                                <span>{{ item.username }}</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="type">
                                                <span>{{ item.nickname }}</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="type">
                                                <span>{{ getRoleNameById(item.roleId) }}</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="type">
                                                <span>{{ item.gender === 0 ? '女' : item.gender === 1 ? '男' : '未知'
                                                    }}</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="status" v-if="item.state === 0">
                                                <i class="iconfont icon-wancheng"></i>
                                                <span>正常</span>
                                            </div>
                                            <div class="status" v-if="item.state === 1">
                                                <i class="iconfont icon-shibai"></i>
                                                <span>封禁</span>
                                            </div>
                                            <div class="status" v-if="item.state === 2">
                                                <i class="iconfont icon-shibai"></i>
                                                <span>注销</span>
                                            </div>
                                        </td>
                                        <td style="min-width: 150px;">{{ item.createDate }}</td>
                                        <td style="min-width: 150px;">
                                            <el-button size="small" @click="showDetail(item)">详情</el-button>
                                            <el-button size="small" :type="item.state === 1 ? 'danger' : 'success'"
                                                @click="toggleStatus(item)">
                                                {{ item.state === 0 ? '封禁' : '解封' }}
                                            </el-button>
                                            <el-button size="small" type="danger"
                                                @click="deleteUser(item)">删除</el-button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="no-more" v-if="!loading && userList.length == 0">
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
            <el-dialog style="width: 47%;" v-model="detailDialogVisible" title="用户详情" append-to-body>
                <el-form :model="detailUser" label-width="100px">
                    <el-row :gutter="20">

                        <el-col :span="12">
                            <el-form-item label="用户ID: ">
                                <span>{{ detailUser.uid }}</span>
                            </el-form-item>
                            <el-form-item label="账号: ">
                                <span>{{ detailUser.username }}</span>
                            </el-form-item>
                            <el-form-item label="名称: ">
                                <span>{{ detailUser.nickname }}</span>
                            </el-form-item>
                            <el-form-item label="角色: ">
                                <span>{{ getRoleNameById(detailUser.roleId) }}</span>
                            </el-form-item>
                        </el-col>

                        <el-col :span="12">
                            <el-form-item label="性别: ">
                                <span>{{ detailUser.gender === 0 ? '女' : detailUser.gender === 1 ? '男' : '未知'
                                    }}</span>
                            </el-form-item>
                            <el-form-item label="状态: ">
                                <div class="status" v-if="detailUser.state === 0">
                                    <i class="iconfont icon-wancheng"></i>
                                    <span>正常</span>
                                </div>
                                <div class="status" v-if="detailUser.state === 1">
                                    <i class="iconfont icon-shibai"></i>
                                    <span>封禁</span>
                                </div>
                                <div class="status" v-if="detailUser.state === 2">
                                    <i class="iconfont icon-shibai"></i>
                                    <span>注销</span>
                                </div>

                            </el-form-item>
                            <el-form-item label="创建时间: ">
                                <span>{{ detailUser.createDate }}</span>
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
    name: "UserManage",

    data() {
        return {
            userReqDate: {
                state: null,
                uid: null,
                username: "",
                nickname: "",
                roleId: "",
                page: 1,
                pageSize: 7,
            },
            userList: [],
            roleList: [],
            page: 1,
            pageSize: 5,
            total: 100,
            pagerCount: 7,
            loading: true,
            detailDialogVisible: false,  // 控制编辑弹出框的显示
            detailUser: {},  // 存储当前选中的数据
            isExpanded: false, // 更多搜索条件的展开和折叠
        }
    },
    computed: {
        // 频道列表
        roles() {
            console.log(this.$store.state)
            return this.$store.state.roleList;
        },
        getRoleNameById() {
            return (roleId) => {
                const role = this.roles.find(role => role.id === roleId);
                return role ? role.roleName : '未知';
            };
        },
    },
    methods: {
        // 请求
        // 查询所有列表
        async getUserList() {
            this.userReqDate.page = this.page;
            this.userReqDate.pageSize = this.pageSize;
            const res = await this.$post("/admin/user/getPage", this.userReqDate, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                }
            });
            if (res.data.code === 200) {
                this.total = res.data.data.total
                this.userList = res.data.data.list;
            } else {
                this.total = 0;
                this.userList = [];
            }
        },
        async toggleStatus(item) {
            // 启用/禁用逻辑
            this.$confirm('是否修改该用户状态?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const newState = item.state === 0 ? 1 : 0;
                const formData = new FormData();
                formData.append('uid', item.uid);
                formData.append('state', newState);
                this.$post("/admin/user/editUserState", formData, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    }
                }).then(res => {
                    if (res.data.code === 200) {
                        item.state = newState;
                        console.log('Status updated successfully');
                    } else {
                        this.$message.warning(res.data.msg);
                        console.error('Failed to update status');
                    }
                }).catch(err => {
                    console.error('Error updating status:', err);
                });
            }).catch(() => {
                console.log('取消更新');
            });
        },
        async deleteUser(item) {
            // 删除逻辑
            this.$confirm('是否删除该用户?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const newStatus = 2;
                const formData = new FormData();
                formData.append('uid', item.uid);
                formData.append('state', newStatus);
                this.$post("/admin/user/editUserState", formData, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    }
                }).then(res => {
                    if (res.data.code === 200) {
                        this.userList = this.userList.filter(user => user.uid !== item.uid);
                        this.total -= 1;
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
        // 重置查询条件
        resetFilters() {
            this.userReqDate = {
                state: null,
                uid: null,
                username: "",
                nickname: "",
                roleId: "",
                page: 1,
                pageSize: 7,
            },
                this.getUserList();  // 重新查询所有数据
        },
        // 改变页码时的回调
        async pageChange(page) {
            this.page = page;
            await this.reloadUserList();
        },
        // 重新加载列表
        async reloadUserList() {
            this.loading = true;
            await this.getUserList();
            this.loading = false;
        },
        showDetail(item) {
            // 详情页面点开
            this.detailUser = { ...item };  // 复制当前行的数据到 detailVideo
            this.detailDialogVisible = true;  // 显示编辑弹窗
        },

    },
    async created() {
        await this.getUserList();
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
    --v-table-row-height: 80px;
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