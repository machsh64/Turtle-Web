<template>
    <div class="flex-fill">
        <div class="v-container">

            <!-- 搜索条件和总数 -->
            <div class="search-bar">
                <div class="search-left">
                    <span><i class="el-icon-search"></i> 标题：</span>
                    <el-input v-model="bannerTitle" placeholder=" 请输入标题"
                        style="width: 200px; margin-right: 10px;"></el-input>
                    <span><i class="el-icon-menu"></i> 状态：</span>
                    <el-select v-model="bannerStatus" placeholder=" 选择状态" style="width: 150px; margin-right: 10px;">
                        <el-option label=" 全部" value=""></el-option>
                        <el-option label=" 启用中" value="0"></el-option>
                        <el-option label=" 已下架" value="1"></el-option>
                    </el-select>
                </div>
                <div class="search-right">
                    <el-button type="primary" @click="getCarousels"
                        style="min-width: 80px; margin-right: 10px;">查询</el-button>
                    <el-button @click="resetFilters" style="min-width: 80px; margin-right: 10px;">重置</el-button>
                    <el-button type="success" @click="addCarousel" style="min-width: 80px;">新增</el-button>
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
                                        <th style="min-width: 60px;">标题颜色</th>
                                        <th style="min-width: 60px;">类型</th>
                                        <th style="min-width: 80px;">目标预览</th>
                                        <th style="min-width: 60px;">状态</th>
                                        <th style="min-width: 160px;">创建时间</th>
                                        <th style="min-width: 150px;">操作</th> <!-- 增加操作列 -->
                                    </tr>
                                </thead>
                                <tbody v-if="carousels.length !== 0">
                                    <tr v-for="(item, index) in carousels" :key="index">
                                        <td style="min-width: 30px"></td>
                                        <td style="width: 176px;">
                                            <img :src="item.url" class="cover" alt="">
                                        </td>
                                        <td style="min-width: 80px;">
                                            <span class="title" @click="toggleTitle(index)">
                                                {{ item.title.length > 6 ? (isTitleExpanded(index) ? item.title :
                                                    item.title.slice(0, 6) + '...') : item.title }}
                                            </span>
                                        </td>
                                        <td style="min-width: 60px;">
                                            <div class="color-block" :style="{ backgroundColor: item.color }"></div>
                                        </td>
                                        <td style="min-width: 60px;">
                                            {{ item.type === '0' ? '站内' : '站外' }}
                                        </td>
                                        <td style="min-width: 80px;">
                                            <span class="detail-btn" @click="decideWichToGo(item)">
                                                点击预览
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
                                        <td style="min-width: 150px;">
                                            <el-button size="small" @click="editCarousel(item)">编辑</el-button>
                                            <el-button size="small" :type="item.status === '0' ? 'danger' : 'success'"
                                                @click="toggleStatus(item)">
                                                {{ item.status === '0' ? '禁用' : '启用' }}
                                            </el-button>
                                            <el-button size="small" type="danger"
                                                @click="deleteCarousel(item)">删除</el-button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="no-more" v-if="!loading && carousels.length == 0">
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

            <!-- 新增弹窗 -->
            <el-dialog style="width: 37%;" v-model="addDialogVisible" title="新增轮播图" append-to-body>
                <el-form :model="newCarousel" label-width="100px">
                    <el-form-item label="标题">
                        <el-input v-model="newCarousel.title"></el-input>
                    </el-form-item>
                    <el-form-item label="封面">
                        <el-upload class="upload-demo" :show-file-list="false" :before-upload="beforeUpload">
                            <el-button type="primary">点击上传</el-button>
                            <template #tip>
                                <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 3MB</div>
                            </template>
                        </el-upload>
                        <!-- 进度条 -->
                        <el-progress v-if="uploadProgress > 0 && uploadProgress < 100"
                            :percentage="uploadProgress"></el-progress>
                        <!-- 预览已上传的图片 -->
                        <div v-if="newCarousel.url" style="margin-top: 10px;">
                            <img :src="newCarousel.url" alt="预览图"
                                style="width: 100px; height: 100px; border-radius: 8px;" />
                        </div>
                    </el-form-item>
                    <el-form-item label="标题颜色">
                        <el-color-picker v-model="newCarousel.color" :show-alpha="false" format="hex"></el-color-picker>
                    </el-form-item>
                    <el-form-item label="类型">
                        <el-radio-group v-model="newCarousel.type">
                            <el-radio :label="'0'">站内</el-radio>
                            <el-radio :label="'1'">站外</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="newCarousel.type === '0'" label="视频vid">
                        <el-input v-model="newCarousel.target"></el-input>
                    </el-form-item>
                    <el-form-item v-if="newCarousel.type === '1'" label="跳转URL">
                        <el-input v-model="newCarousel.target"></el-input>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="newCarousel.status" placeholder="选择状态">
                            <el-option label="启用" value="0"></el-option>
                            <el-option label="已下架" value="1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="addDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleCreatreCarousel">确认</el-button>
                    </span>
                </template>
            </el-dialog>

            <!-- 编辑弹窗 -->
            <el-dialog style="width: 37%;" v-model="editDialogVisible" title="编辑轮播图" append-to-body>
                <el-form :model="editingCarousel" label-width="100px">
                    <el-form-item label="标题">
                        <el-input v-model="editingCarousel.title"></el-input>
                    </el-form-item>
                    <el-form-item label="封面">
                        <el-upload class="upload-demo" :show-file-list="false" :before-upload="beforeUpload">
                            <el-button type="primary">点击上传</el-button>
                            <template #tip>
                                <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 3MB</div>
                            </template>
                        </el-upload>
                        <!-- 进度条 -->
                        <el-progress v-if="uploadProgress > 0 && uploadProgress < 100"
                            :percentage="uploadProgress"></el-progress>
                        <!-- 预览已上传的图片 -->
                        <div v-if="editingCarousel.url" style="margin-top: 10px;">
                            <img :src="editingCarousel.url" alt="预览图"
                                style="width: 100px; height: 100px; border-radius: 8px;" />
                        </div>
                    </el-form-item>
                    <el-form-item label="标题颜色">
                        <el-color-picker v-model="editingCarousel.color" :show-alpha="false"
                            format="hex"></el-color-picker>
                    </el-form-item>
                    <el-form-item label="类型">
                        <el-radio-group v-model="editingCarousel.type">
                            <el-radio :label="'0'">站内</el-radio>
                            <el-radio :label="'1'">站外</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="editingCarousel.type === '0'" label="视频vid">
                        <el-input v-model="editingCarousel.target"></el-input>
                    </el-form-item>
                    <el-form-item v-if="editingCarousel.type === '1'" label="跳转URL">
                        <el-input v-model="editingCarousel.target"></el-input>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="editingCarousel.status" placeholder="选择状态">
                            <el-option label="启用" value="0"></el-option>
                            <el-option label="已下架" value="1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="editDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleUpdateCarousel">确认</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import fileUpload from '@/utils/fileUpload';

export default {
    name: "CarouselManage",
    data() {
        return {
            bannerStatus: '',   // 要查询的轮播图状态，0 启用中，1 停用 默认不传则全查
            bannerTitle: '',    // 轮播图标题，供查询
            carousels: [],
            page: 1,
            pageSize: 6,
            total: 100,
            pagerCount: 7,
            loading: true,
            dialogVisible: false,  // 控制视频弹出框的显示
            currentVideo: '',  // 当前选中的视频链接
            expandedTitles: [],  // 存储哪个标题被展开
            editDialogVisible: false,  // 控制编辑弹出框的显示
            editingCarousel: {},  // 存储正在编辑的轮播图数据
            addDialogVisible: false,  // 控制新增弹出框的显示
            newCarousel: {},  // 存储正在新增的轮播图数据
            uploadProgress: 0,  // 上传进度
        }
    },
    computed: {
        uploadHeaders() {
            return {
                Authorization: "Bearer " + localStorage.getItem("token")
            };
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
            if (res.data.code === 200) {
                this.total = res.data.data.total
                this.carousels = res.data.data.list;
            } else {
                this.total = 0;
                this.carousels = [];
            }
            console.log('banner列表: ', this.carousels);
        },
        handleCreatreCarousel() {
            this.checkVideoExist(this.newCarousel.type, this.newCarousel.target).then(isValid => {
                if (isValid) {
                    this.createCarousel();
                }
            })

        },
        createCarousel() {
            // 对target进行处理
            this.newCarousel.target = this.washTarget(this.newCarousel.type, this.newCarousel.target)
            console.log('Create carousel:', this.newCarousel);
            // 发送请求新增轮播图数据
            this.$post("/admin/banner/add", this.newCarousel, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                }
            }).then(res => {
                if (res.data.code === 200) {
                    // 新增成功，刷新列表
                    this.getCarousels();
                    this.addDialogVisible = false;  // 关闭新增弹窗
                    console.log('Carousel created successfully');
                } else {
                    console.error('Failed to create carousel');
                }
            }).catch(err => {
                console.error('Error creating carousel:', err);
            });
        },
        handleUpdateCarousel() {
            this.checkVideoExist(this.editingCarousel.type, this.editingCarousel.target).then(isValid => {
                if (isValid) {
                    this.updateCarousel();
                }
            })

        },
        updateCarousel() {
            // 对target进行处理
            this.editingCarousel.target = this.washTarget(this.editingCarousel.type, this.editingCarousel.target)
            console.log('Update carousel:', this.editingCarousel);
            // 发送请求更新轮播图数据
            this.$post("/admin/banner/update", this.editingCarousel, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                }
            }).then(res => {
                if (res.data.code === 200) {
                    // 更新成功，刷新列表
                    this.getCarousels();
                    this.editDialogVisible = false;  // 关闭编辑弹窗
                    console.log('Carousel updated successfully');
                } else {
                    console.error('Failed to update carousel');
                }
            }).catch(err => {
                console.error('Error updating carousel:', err);
            });
        },
        async toggleStatus(item) {
            console.log('Toggle status for carousel:', item);
            // 修改状态前进行检测
            const enabledCount = this.carousels.filter(carousel => carousel.status === '0').length;
            if (enabledCount <= 3 && item.status === '0') {
                this.$message.warning('轮播图应至少保持三个在启用状态');
                return;
            }
            // 启用/禁用逻辑
            this.$confirm('是否修改该条轮播图状态?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const newStatus = item.status === '0' ? '1' : '0';
                this.$post("/admin/banner/update", {
                    id: item.id,
                    status: newStatus
                }, {
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
        async deleteCarousel(item) {
            console.log('Delete carousel:', item);
            // 删除前进行检测
            const enabledCount = this.carousels.filter(carousel => carousel.status === '0').length;
            if (enabledCount <= 3 && item.status === '0') {
                this.$message.warning('轮播图应至少保持三个在启用状态');
                return;
            }
            // 删除逻辑
            this.$confirm('此操作将永久删除该轮播图, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$get(`/admin/banner/delete/${item.id}`, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    }
                }).then(res => {
                    if (res.data.code === 200) {
                        this.carousels = this.carousels.filter(carousel => carousel.id !== item.id);
                        console.log('Carousel deleted successfully');
                    } else {
                        console.error('Failed to delete carousel');
                    }
                }).catch(err => {
                    console.error('Error deleting carousel:', err);
                });
            }).catch(() => {
                console.log('取消删除');
            });
        },
        async beforeUpload(file) {
            const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt3M = file.size / 1024 / 1024 < 3;

            if (!isJPGorPNG) {
                this.$message.error('只能上传 JPG/PNG 格式的图片！');
                return false;
            }
            if (!isLt3M) {
                this.$message.error('文件大小不能超过 3MB！');
                return false;
            }

            try {
                const croppedFile = await this.cropImage(file, 2560, 1440); // 进行裁剪

                const url = await fileUpload.uploadImgMinio(croppedFile, (progress) => {
                    this.uploadProgress = progress;  // 记录上传进度
                });

                this.newCarousel.url = url;
                this.editingCarousel.url = url;
                this.$message.success('上传成功！');
            } catch (error) {
                console.error('上传失败', error);
                this.$message.error('上传失败');
            }
            return false;  // 阻止 `el-upload` 继续执行默认上传逻辑
        },

        // 使用 Canvas 进行裁剪
        cropImage(file, targetWidth, targetHeight) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        // 创建 Canvas
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // 计算等比例缩放
                        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                        const scaledWidth = img.width * scale;
                        const scaledHeight = img.height * scale;

                        // 居中裁剪
                        const offsetX = (scaledWidth - targetWidth) / 2;
                        const offsetY = (scaledHeight - targetHeight) / 2;

                        canvas.width = targetWidth;
                        canvas.height = targetHeight;

                        ctx.drawImage(img, -offsetX, -offsetY, scaledWidth, scaledHeight);

                        // 导出裁剪后的图片
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name, { type: file.type }));
                            } else {
                                reject(new Error('裁剪失败'));
                            }
                        }, file.type);
                    };
                    img.onerror = () => reject(new Error('图片加载失败'));
                };
                reader.onerror = () => reject(new Error('文件读取失败'));
            });
        },

        // 事件
        // 切换类型
        changeStatus(vstatus) {
            this.videoStatus = vstatus;
            if (this.page !== 1) {
                this.page = 1;  // 这里页码改变会触发重加载
            } else {
                this.reloadCarousels();
            }
        },
        // 重置查询条件
        resetFilters() {
            this.bannerTitle = '';  // 清空标题
            this.bannerStatus = '';  // 重置状态
            this.page = 1;  // 重置分页
            this.getCarousels();  // 重新查询所有数据
        },
        // 改变页码时的回调
        async pageChange(page) {
            this.page = page;
            await this.reloadCarousels();
        },
        // 重新加载banner列表
        async reloadCarousels() {
            this.loading = true;
            await this.getCarousels();
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
        addCarousel() {
            // 新增页面点开
            console.log('Add carousel');
            this.newCarousel = {};  // 清空新增轮播图数据
            this.addDialogVisible = true;  // 显示新增弹窗
        },
        editCarousel(item) {
            // 编辑页面点开
            this.editingCarousel = { ...item };  // 复制当前行的数据到 editingCarousel
            // 如果是站内视频，向用户展示需要清除 /video/ 前缀
            if (item.type === '0') {
                this.editingCarousel.target = item.target.replace('/video/', '');
            }
            this.editDialogVisible = true;  // 显示编辑弹窗
        },
        washTarget(type, target) {
            // 如果是站内，则处理加上 /video/ 前缀，使其可以在用户端跳转
            if (type === '0') {
                return '/video/' + target;
            }
            // 如果是站外，则判断target是否是https或http开头，如果不是，则加上https
            if (type === '1') {
                if (!target.startsWith('https://') && !target.startsWith('http://')) {
                    target = 'https://' + target;
                }
                return target;
            }
        },
        // 检查已过审视频是否存在
        checkVideoExist(type, vid) {
            return new Promise((resolve) => {
                // 如果是站外视频，直接通行
                if (type === '1') {
                    resolve(true)
                }
                if (type === '0') {
                    const formData = new FormData();
                    formData.append('vid', vid);
                    formData.append('status', 1);
                    this.$post("/admin/video-con/check", formData, {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token"),
                        }
                    }).then(res => {
                        if (res.data.code === 200) {
                            resolve(true)
                        } else {
                            this.$message.error('请确认该vid视频是否存在或已过审');
                            resolve(false)
                        }
                    });
                }

            });
        },
        // 判断站内外视频，决定跳转位置
        decideWichToGo(item) {
            // 如果是站内
            if (item.type === '0') {
                // 处理target，去掉 /video/前缀
                item.target = item.target.replace('/video/', '');
                // 打开新页面跳转
                const route = {
                    name: 'videoConDetail',
                    params: {
                        vid: item.target
                    }
                };
                window.open(this.$router.resolve(route).href, '_blank');
            }
            // 如果是站外
            if (item.type === '1') {
                // 判断target是否是https或http开头，如果不是，则加上https
                if (!item.target.startsWith('https://') && !item.target.startsWith('http://')) {
                    item.target = 'https://' + item.target;
                }
                window.open(item.target, '_blank');
            }
        },
    },
    async created() {
        this.changeWidth();
        await this.getCarousels();
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
    align-items: center;
    padding: 10px 16px;
    /* 添加一些内边距 */
    background-color: #f5f7fa;
    /* 统一背景颜色 */
    border-bottom: 1px solid #e7e7e7;
    /* 添加底部边框 */
    margin-bottom: 0;
    /* 去除底部边距 */
}

.search-left {
    display: flex;
    align-items: center;
}

.search-left span {
    margin-right: 5px;
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

.search-right {
    display: flex;
    align-items: center;
}

.search-right .el-button {
    margin-right: 10px;
    min-width: 80px;
    /* 增加按钮宽度 */
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

.video-preview {
    width: 60%;
}
</style>