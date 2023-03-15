# unplugin-icons

## 介绍

github:<https://github.com/antfu/unplugin-icons>

支持[iconify](`https://icon-sets.iconify.design/`)所有图标

## 安装

`pnpm i @iconify/json unplugin-icons` 为了减少下载时间，我们只应下载使用的图集，而不是下载所有`@iconify/json`,eg:`pnpm i -D @iconify-json/mdi`

## 使用

根据网站找到的 icon 名称,例如`icon-park-outline:loading-one`，名称格式为`[collection]:[icon]`,按照这种格式 import，`~icons/[collection]/[icon]`

```vue
<template>
  <div>
    <SVGLoadingOne style="color: red;font-size: 2em;"></SVGLoadingOne>
  </div>
</template>
<script setup lang="ts">
import SVGLoadingOne from '~icons/icon-park-outline/loading-one'
</script>
```

## 样式修改

支持`style`和`class`属性和其他 svg 属性，eg:`width`和`height`
