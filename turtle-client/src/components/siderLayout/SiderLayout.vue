<template>
    <div class="sider-layout" :class="{ 'collapsed': isCollapsed }">
        <button @click="$emit('toggle')">☰</button>
        <nav v-if="!isCollapsed">
            <!-- 侧边栏菜单项 -->
            <ul>
                <li>首页</li>
                <li>分类</li>
                <li>收藏</li>
            </ul>
        </nav>
    </div>
</template>

<script>
export default {
    props: {
        isCollapsed: Boolean,
    },
};
</script>

<style scoped>
.sider-layout {
    width: 220px;
    height: 100%;
    background: #f8f9fa;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
    transition: width 0.3s ease-in-out;
}

.sider-layout.collapsed {
    width: 60px;
}

button {
    width: 100%;
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
}
</style>
