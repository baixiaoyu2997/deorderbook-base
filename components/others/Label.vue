<template>
  <div class="y-label">
    <span class="y-label__title">
      {{ title }}
    </span>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  inline: {
    default: false,
    type: Boolean,
  },
  title: {
    default: '',
    type: String,
  },
  left: {
    default: '12px',
    type: String,
  },
  backgroundColor: {
    default: '#222',
    type: String,
  },
})
const styles = {
  display: props.inline ? 'inline-block' : 'block',
  transform: `translate(${props.left},-50%)`,
  backgroundcolor: props.backgroundColor,
}
</script>

<style lang="postcss" scoped>
.y-label {
  position: relative;
  display: v-bind('styles.display');

  & .y-label__title {
    position: absolute;
    top: 0;
    z-index: 1;
    display: block;
    padding: 0 5px;
    font-size: 12px;
    color: #fff9;
    background-color: v-bind('styles.backgroundcolor');
    border-radius: 4px;
    transform: v-bind('styles.transform');
  }
}
</style>
