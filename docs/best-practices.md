# 最佳实践

前端最佳实践

## 数据

1. 永远不要在 `<script setup>` 或 `setup()` 函数之外定义 `const state = ref()`。 这种状态将在所有访问您网站的用户之间共享，并可能导致内存泄漏！使用 nuxt3 提供的`useState`解决，例：`const useX = () => useState('x')`
1. 使用`useFetch, useLazyFetch, useAsyncData and useLazyAsyncData`这类可组合式函数，支持缓存接口，优先使用`Lazy`，这样不会阻塞页面。当修改数据时，应该手动刷新接口

### format

1. 尽量不要对获取的数据直接做格式化操作，应保留原始数据，并单独添加一个`computed`或者方法来做格式化。这样方便以后的扩展和对原始数据的引用

### 数字

1. 处理数字时尽量使用`Big.js`，除非不会出错的简单数据，否则都应该使用`Big(xx).toFixed()`返回字符串
1. 尽量不要对数字的结果直接添加单位，比如：`Big(xx).toFixed() + '%'`, 这样的数据不利于复用

### store

1. store 中的获取数据方法应该为`get` + 数据字段名,例如：

```js
{
  return {
    dobPoolData,
    getDOBPoolData,
  }
}
```

## Composables

1. 应尽量保证可组合式函数的输入和输出都是动态的，比如传入的值为`Ref`类型，输出的变量为`ComputedRef`，这样数据就不需要手动触发刷新了,如果导出为函数那么应该以`computed`开头命名

## Components

1. 对于第三方组件的样式修改，不要使用全局 css 变量和直接对全局样式覆盖。应该单独做一个组件，或者添加一个全局别名 class, 对其封装样式，这样不会导致修改全局变量后影响其他组件。

## Style

1. 尽量不要使用`!important`,而应该是增加选择器的权重，防止覆盖其他样式，以及方便其他组件覆盖当前样式

## JS

1. 尽量不要使用`export default`,这样做会有一些问题，比如`tree-shaking`或者以后添加额外的导出，这经常发生于为`ts`添加导出类型
2. 引入`Big.js`应使用部分导出`import {Big} from 'big.js'`

## Git

1. 提交代码之前 review 一遍改动
1. 根据情况使用`rebase`替代`merge`，减少多出来的`merge message`，并且查询改动历史更方便
1. 提交代码前`git pull --autostash --rebase`,减少冲突并使代码成为最新 commit

### PR

1. 提交 PR 之前，使用`git rebase develop`（前提是 develop 为最新代码)
2. PR 已经在`github`上时，本地的 PR branch 如果有更新，则不应该再使用`rebase`,而应该是用`merge`来更新其他分支的代码,这样对`review`人员更友好

## Images

1. gif 图片应裁剪到真实使用大小，再转换成 webp,顺序不要颠倒，最后的大小不一样，目前的解决方案[https://ezgif.com/resize](https://ezgif.com/resize)

## TODO

- [ ] global store
  - [ ] 对于必须获取最新数据的情况，但是有可能分别在兄弟组件中同时触发的优化方案
  - [ ] 修改全局数据后，隐藏的数据依赖去除缓存的解决方案，比如`option enter`，会产生新的 bullet,这时需要在响应的 action 中加入其他全局数据的刷新操作，但是对于不理解业务的开发人员不够友好
