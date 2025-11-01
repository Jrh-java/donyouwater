<template>
    <div class="calendar">
        <div class="calendar-time">{{ formattedTime }}</div>
        <div class="calendar-content">
            <div>{{ formattedWeek }}</div>
            <div>{{ formattedDate }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const date = ref<number>(new Date().getTime())
const formattedTime = ref<string>('')
const formattedWeek = ref<string>('')
const formattedDate = ref<string>('')
let timer: string | number | NodeJS.Timer | undefined
onUnmounted(() => {
    clearInterval(timer)
})

const format = ref({
    time: 'HH:mm:ss',
    week: 'w',
    date: 'YYYY.MM.DD'
})

function formatDate(date: number, formatString: string): string {
    const d = new Date(date)
    const map: { [key: string]: string } = {
        'YYYY': `${d.getFullYear()}`,
        'MM': `${d.getMonth() + 1}`.padStart(2, '0'),
        'DD': `${d.getDate()}`.padStart(2, '0'),
        'HH': `${d.getHours()}`.padStart(2, '0'),
        'mm': `${d.getMinutes()}`.padStart(2, '0'),
        'ss': `${d.getSeconds()}`.padStart(2, '0'),
        'w': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
    }

    return formatString.replace(/YYYY|MM|DD|HH|mm|ss|w/g, match => map[match])
}

timer = setInterval(() => {
    date.value = new Date().getTime()
    formattedTime.value = formatDate(date.value, format.value.time)
    formattedWeek.value = formatDate(date.value, format.value.week)
    formattedDate.value = formatDate(date.value, format.value.date)
}, 1000)

// 初始化日期格式
formattedTime.value = formatDate(date.value, format.value.time)
formattedWeek.value = formatDate(date.value, format.value.week)
formattedDate.value = formatDate(date.value, format.value.date)

</script>



<style lang="scss" scoped>
.calendar {
    
    display: flex;
    align-items: center;
    // position: absolute;
    // right: 242px;
    .calendar-time {
        font-family: Segoe UI;
        font-weight: 300;
        font-size: 30px;
        color: #FFFFFF;

    }

    .calendar-content {
        color: #fff;
        font-size: 14px;
        width: 56px;
        margin-left: 25px;
    }
}
</style>