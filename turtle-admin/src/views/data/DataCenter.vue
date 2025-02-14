<template>
    <div class="data-center">
        <div class="toolbar">
            <button @click="togglePeriod('七日')" :class="{ active: period === '七日' }">七日</button>
            <button @click="togglePeriod('今天')" :class="{ active: period === '今天' }">今天</button>
        </div>
        <v-chart class="chart full-width" :option="videoHotRank" />
        <div class="chart-container">
            <v-chart class="chart half-width" :option="mcActive" />
            <v-chart class="chart half-width" :option="videoPlayRank" />
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts'; // 引入 echarts

export default {
    name: "DataCenter",
    data() {
        return {
            period: '七日',
            dataSets: {
                '七日': {
                    Top10WeightVd: [],
                    weightTimeLine: [],
                    mcActive: [],
                    mcName: [],
                    videoPlayRank: [],
                    videoPlayTitle: [],
                },
                '今天': {
                    Top10WeightVd: [],
                    weightTimeLine: [],
                    mcActive: [],
                    mcName: [],
                    videoPlayRank: [],
                    videoPlayTitle: [],
                }
            },
            videoHotRank: {},
            userActive: {},
            videoPlayRank: {},
            // 接口数据
            dataTab: [],
        };
    },
    computed: {
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
        // 获取数据
        async getDataTab() {
            this.$get(`/admin/videoStats`, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                }
            }).then(res => {
                if (res.data.code === 200) {
                    // 7日数据
                    this.dataTab = res.data.data;

                    // 处理映射数据
                    // 7日
                    //  权度热度值
                    this.dataSets['七日'].Top10WeightVd = this.dataTab.sevenDayTop10WeightVd.map(item => item.vdWeight);
                    this.dataSets['七日'].weightTimeLine = this.dataTab.sevenDayTop10WeightVd.map(item => item.stat_data + "(vid:" + item.vid + ")");
                    // 视频播放量
                    this.dataSets['七日'].videoPlayRank = this.dataTab.sevenDayTop10VdPlayCount.map(item => item.totalPlay).reverse();
                    this.dataSets['七日'].videoPlayTitle = this.dataTab.sevenDayTop10VdPlayCount.map(item => "(vid:" + item.vid + ")").reverse();
                    // 板块点击量  
                    this.dataSets['七日'].mcActive = this.dataTab.sevenDayMcVdPlayCount.map(item => item.totalPlay);
                    this.dataSets['七日'].mcName = this.dataTab.sevenDayMcVdPlayCount.map(item => this.getMcNameById(item.mcId));

                    // 今日
                    //  权度热度值
                    this.dataSets['今天'].Top10WeightVd = this.dataTab.todayTop10WeightVd.map(item => item.vdWeight);
                    this.dataSets['今天'].weightTimeLine = this.dataTab.todayTop10WeightVd.map(item => item.title + "(vid:" + item.vid + ")");
                    // 视频播放量
                    this.dataSets['今天'].videoPlayRank = this.dataTab.todayTop10VdPlayCount.map(item => item.totalPlay).reverse();
                    this.dataSets['今天'].videoPlayTitle = this.dataTab.todayTop10VdPlayCount.map(item => "(vid:" + item.vid + ")").reverse();
                    // 板块点击量
                    this.dataSets['今天'].mcActive = this.dataTab.todayMcVdPlayCount.map(item => item.totalPlay);
                    this.dataSets['今天'].mcName = this.dataTab.todayMcVdPlayCount.map(item => this.getMcNameById(item.mcId));

                    // **确保数据赋值完成后再更新图表**
                    this.updateCharts();
                } else {
                    console.error('Failed to get DataTab');
                }
            }).catch(err => {
                console.error('Error get DataTab:', err);
            });
        },
        // 视图设置        
        updateCharts() {
            this.videoHotRank = this.createLineChartOption('视频最高热度值', this.dataSets[this.period].Top10WeightVd);
            this.mcActive = this.createPieMcChartOption('板块点击率', this.dataSets[this.period].mcActive);
            this.videoPlayRank = this.createBarChartOption('视频播放量(TOP8)', this.dataSets[this.period].videoPlayRank);
        },
        createLineChartOption(title, data) {
            return {
                title: { text: title, left: 'center', textStyle: { color: '#333', fontSize: 18 } },
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(0, 0, 0, 0.7)', textStyle: { color: '#fff' } },
                xAxis: {
                    type: 'category',
                    data: this.dataSets[this.period].weightTimeLine,
                    axisLine: { lineStyle: { color: '#999' } },
                    axisLabel: { color: '#666' }
                },
                yAxis: {
                    type: 'value',
                    axisLine: { lineStyle: { color: '#999' } },
                    axisLabel: { color: '#666' },
                    splitLine: { lineStyle: { color: ['#e5e5e5'], type: 'dashed' } }
                },
                series: [{
                    name: title,
                    type: 'line',
                    data,
                    smooth: true,
                    itemStyle: { color: '#007bff' },
                    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0, 123, 255, 0.3)' }, { offset: 1, color: 'rgba(0, 123, 255, 0)' }] } },
                    lineStyle: { width: 2, shadowColor: 'rgba(0, 0, 0, 0.3)', shadowBlur: 10 }
                }],
                grid: { left: '5%', right: '5%', bottom: '10%', containLabel: true },
                backgroundColor: '#f9f9f9'
            };
        },
        createPieMcChartOption(title, data) {
            return {
                title: { text: title, left: 'center', textStyle: { color: '#333', fontSize: 18 } },
                tooltip: { trigger: 'item', backgroundColor: 'rgba(0, 0, 0, 0.7)', textStyle: { color: '#fff' } },
                series: [{
                    name: title,
                    type: 'pie',
                    radius: '50%',
                    data: this.dataSets[this.period].mcName.map((mcName, index) => ({
                        name: mcName,
                        value: data[index]
                    })),
                    itemStyle: {
                        color: (params) => {
                            const colorList = ['#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8'];
                            return colorList[params.dataIndex % colorList.length];
                        }
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {c} ({d}%)'
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }],
                grid: { left: '5%', right: '5%', bottom: '10%', containLabel: true },
                backgroundColor: '#f9f9f9'
            };
        },
        createBarChartOption(title, data) {
            return {
                title: { text: title, left: 'center', textStyle: { color: '#333', fontSize: 18 } },
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(0, 0, 0, 0.7)', textStyle: { color: '#fff' } },
                xAxis: {
                    type: 'value',
                    axisLine: { lineStyle: { color: '#999' } },
                    axisLabel: { color: '#666' },
                    splitLine: { lineStyle: { color: ['#e5e5e5'], type: 'dashed' } }
                },
                yAxis: {
                    type: 'category',
                    data: this.dataSets[this.period].videoPlayTitle,
                    axisLine: { lineStyle: { color: '#999' } },
                    axisLabel: { color: '#666' }
                },
                series: [{
                    name: title,
                    type: 'bar',
                    data,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#007bff' },
                            { offset: 1, color: '#0056b3' }
                        ])
                    },
                    barWidth: '60%',
                    label: { show: true, position: 'right', color: '#333' }
                }],
                grid: { left: '10%', right: '10%', bottom: '10%', containLabel: true },
                backgroundColor: '#f9f9f9'
            };
        },
        togglePeriod(period) {
            this.period = period;
            this.updateCharts();
        }
    },
    mounted() {
    },
    async created() {
        this.getDataTab();
    }
};
</script>

<style scoped>
.data-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f9f9f9;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.toolbar {
    margin-bottom: 20px;
}

button {
    padding: 10px 20px;
    margin: 0 10px;
    border: none;
    cursor: pointer;
    background-color: #ddd;
    border-radius: 4px;
    transition: background-color 0.3s;
}

button.active {
    background-color: #007bff;
    color: white;
}

.chart-container {
    display: flex;
    width: 80%;
    justify-content: space-between;
}

.chart {
    height: 330px;
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.full-width {
    width: 80%;
}

.half-width {
    width: 48%;
}
</style>