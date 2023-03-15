<template>
  <div class="layout--default page--flex">
    <client-only>
      <y-header></y-header>
      <slot />
      <y-footer></y-footer>
    </client-only>
  </div>
</template>
<script setup lang="ts">
// useLayout()
</script>
<style lang="postcss" scoped>
.layout--default {
  /* min-height: 100vh; */

  /* min-width: 100vw; */

  & :deep(.y-header + div) {
    flex: 1;
  }
}
</style>
