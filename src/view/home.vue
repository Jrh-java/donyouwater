<template>
    <div class="app-layout">
        

        <div class="earth">
            <earth />
        </div>
    </div>
</template>

<script setup>
import { ref,watch } from 'vue'
import earth from '../components/viewer.vue'


import { useStore } from '@/store/pinia';
const store = useStore();
console.log(store)

</script>

<style lang="scss" scoped>

.app-layout {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.earth {
    width: 100%;
    height: 100%;
}

</style>