# DeOrderBook FE Guide

前端开发规范

## 命名

### origin

带有`origin`字样的字段表示原始值，一般用于为格式化做基础数据

## 数字

### Length Limit

1. 小数部分第一个不为 0 的值后边，最大长度为 4， eg: `0.08888`
2. 小数部分最长为 8, eg:`0.12345678`
3. 所有数字最长为 12（不包含小数点）eg: `123456789.012`
4. input 的场景应该使用`useNumberLimit`或者`useNumberLimitDebounceFn`
5. apr 是单独的规则，不受该规则影响
6. 显示美元的时候都保留 2 为小数,使用`useUSDFormat`
7. 所有的 token amount，应该使用`useTokenNumberFormat`，并传入 token,sniper 和 bullet 可以只传`SNIPER`或者`BULLET`

## 组件

1. 业务强相关的组件，应该放在`components/business`路径下
1. 全局消息提示使用`useNotify`

## Github

### Pull Request

> 目前除了`Project`中制定的`bug or feat`, 我们可以直接推送到 develop 分支

1. `deorderbook-explorer`issue,分支命名应使用这种格式`[feat or fix]/#[issue number]-[branch description]`，例如：`fix/#8-maohui`
2. `internal`仓库中的 issue 或者特性在`deorderbook-explorer`中修复，分支命名规则`[feat or fix]/internal#[issue number]-[branch description]`,例如：`feat/internal#83-bullet`

## TypesScript

从外部`import`的类型应该使用`type`声明,例如:`import type { Ref } from 'vue'`

## TODO

- [ ] github
  - [ ] 提交信息格式
  - [ ] PR
