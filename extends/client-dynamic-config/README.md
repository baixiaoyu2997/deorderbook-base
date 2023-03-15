## 介绍

允许项目 SSG 之后动态修改配置文件

## 要求

1. 项目`public`必须有`config.json`文件
1. 运行`generate`时需要有`MODE`环境变量,对应`config.json`中的配置

```json
// config.json文件的格式应该如下所示，第一层为环境，也就是对应MODE变量，第二层为业务需要的配置
{
  "locale": {
    "a": 1,
    "b": 2
  },
  "test": {
    "a": 3,
    "b": 4
  },
  "prod": {
    "a": 5,
    "b": 6
  }
}
```

1. 需要`store`
1. 需要`utils`
