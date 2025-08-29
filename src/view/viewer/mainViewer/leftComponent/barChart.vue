<template>
    <div ref="chartDom" style="width: 95%;height: 240px;">
  
    </div>
  </template>
  
  <script setup lang="ts">
  import * as echarts from 'echarts';
  import { onMounted, ref } from 'vue';
  
  var chartDom = ref(null);
  var myChart;
  var option: any;
  // Data from the image
  const damAgeData = {
    categories: ['<10年', '10-20年', '20-30', '30-50', '>50年'],
    counts: [5, 0, 0, 0, 0],
    percentages: ['', '', '', '', '']
  };
var maxValue = 30;
// 创建外壳数据
var shellData = damAgeData.counts.map((value) => maxValue);
  // Maximum Y-axis value based on image (approx 30, let's set to 30 or slightly more)
  var maxYValue = 30;
  option = {
    backgroundColor: 'transparent', // 更改图表背景颜色
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow' // 'shadow' is often better for bar charts
      },
      formatter: function (params: any) {
        const barParam = params.find((p: any) => p.seriesType === 'bar');
        if (barParam) {
          const dataIndex = barParam.dataIndex;
          return `${damAgeData.categories[dataIndex]}<br/>数量: ${barParam.value} 座<br/>占比: ${damAgeData.percentages[dataIndex]}`;
        }
        return '';
      }
    },
    grid: {
      top: '20%', // Adjust top spacing if needed
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
  
      }
    },
    legend: {
      show: false // Hide legend as per the image (no legend shown for this specific chart)
    },
    xAxis: [
      {
        type: 'category',
        data: damAgeData.categories,
        axisPointer: {
          type: 'shadow'
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.6)', // Match image style (light color for axis line)
            width: 1
          }
        },
        axisTick: {
          show: false // No ticks in the image
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.8)' // Light color for labels
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '单位:座',
        nameTextStyle: {
          color: 'rgba(255, 255, 255, 0.8)',
          align: 'left',
          padding: [0, 0, 0, -30] // Adjust padding to position name correctly
        },
        min: 0,
        max: maxYValue,
        interval: 10, // Based on image y-axis ticks (0, 10, 20, 30)
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)', // Light dashed lines for grid
            type: 'dashed'
          }
        },
        axisLabel: {
          formatter: '{value}',
          // color: 'rgba(255, 255, 255, 0.8)' // Light color for labels
        },
        axisLine: {
        lineStyle: {
          color: ' rgba(155, 226, 255, 0.6)'
        }
      },
      }
    ],
    series: [
      {
        name: '坝龄分布',
        type: 'bar',
        barWidth: '40%', // Adjust bar width as needed
        data: damAgeData.counts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(
            0, 0, 0, 1,
            [
              { offset: 0, color: 'rgba(20,197,255,1)' }, // Solid blue, adjust as per image
              { offset: 1, color: 'rgba(20,197,255,0.7)' } // Lighter blue at the bottom
            ]
          ),
          borderRadius: [3, 3, 0, 0] // Optional: rounded corners at the top
        },
        
        label: {
          show: true,
          position: 'top',
          formatter: function(params: any) {
            // Display count on top of the bar
            // And percentage inside or above, let's try above count
            const dataIndex = params.dataIndex;
            // return `${params.value}\n${damAgeData.percentages[dataIndex]}`;
            return `${params.value}` // Just count for now, percentage is in tooltip
          },
          color: '#FFF',
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      {
      data: shellData,
      type: 'bar',
      barGap: '-120%', // 确保外壳和原柱体重叠
      barWidth: '60%', // 使外壳宽度比原柱体大一点
      itemStyle: {  
        color: 'rgba(0, 150, 213,0.15)', // 设置透明的外壳颜色

      },
      z: -1 // 确保外壳在柱体后面
    },
      // Add percentage labels as a separate series if needed, or rely on tooltip
      // For simplicity, keeping percentages in tooltip and count on top of bar.
      // The image shows percentages inside the bar, let's try that with another label series or rich text.
      {
        name: '坝龄分布百分比',
        type: 'pictorialBar',
        symbol: 'rect',
        itemStyle: {
            color: 'transparent' // Make this series invisible, only for labels
        },
        label: {
            show: true,
            position: 'insideBottom', // Position percentage inside the bar, towards the bottom
            formatter: function(params: any) {
                return damAgeData.percentages[params.dataIndex];
            },
            color: '#FFF',
            fontSize: 12,
            fontWeight: 'bold',
            offset: [0, 5] // Adjust offset to position correctly within the bar
        },
        data: damAgeData.counts, // Use same data to align labels
        z: 10 // Ensure labels are on top
      }
    ],
  
  };
  onMounted(() => {
    myChart = echarts.init(chartDom.value);
    option && myChart.setOption(option);
  })
  </script>
  
  <style scoped></style>