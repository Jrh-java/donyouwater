<template>
  <div class="subtitle-frame">
    <div class="header">
      <div class="title-slot">
        <slot name="title"></slot>
      </div>
      <div class="subtitle-slot">
        <slot name="subtitle"></slot>
      </div>
      <div class="options-slot">
        <slot name="options"></slot>
      </div>
    </div>
    <div class="content-slot">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
// No specific script logic needed for this component structure
</script>

<style scoped>
.subtitle-frame {
  width: 100%;
  margin-bottom: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  padding: 0 10px;
  position: relative;
}

.header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: #14c5ff;
}

.title-slot ::v-deep(p),
.title-slot ::v-deep(span) {
  font-size: 14px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 12px;
}

.subtitle-slot ::v-deep(p),
.subtitle-slot ::v-deep(span) {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: auto;
  margin-right: 10px;
}

.options-slot ::v-deep(div) {
  /* Styles for the options slot, if any specific are needed */
  /* For example, if it contains a button like .all-btn */
  background: rgba(20, 197, 255, 0.2);
  color: #14c5ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.content-slot {
  padding: 10px 5px;
  flex-grow: 1;
  overflow-y: auto; /* 如果内容过多，允许滚动 */
}
</style>