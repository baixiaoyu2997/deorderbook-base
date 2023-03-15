# Create Option

## 介绍

创建 option 流程,正常的 dapp 使用，需要 18 个 option,buy and sell 各 9 个，遵循每个日期对应三个价格的方式去创建

创建参数为：

1. 行权价格,一般都是以万为单位，例如：`15000、20000`
1. 行权时间（UTC 时间）
1. 开始时间（UTC 时间），表示该 option 在`deorderbook`中的可用时间

## workflow

> 每个创建的 option 都必须做以下操作才可以保证 dapp 正常执行。

1. open `deorderbook-pro` site: `http://35.82.30.121:9001/`
1. use owner account (only owner user or whitelist user can create option, you can find more account info at bottom)
1. 使用`OTC Owner`（now,same with owner） 开启创建 option 的 bullet 的交易权限（do `Enable`）
1. use `Collector` account to approve dob pool spend bullet（do `Approve`）

## 注意

1. 创建 option 之后，你可以使用`Owner`账户对其禁用，但是只能是在`开始时间`之前
1. 不要修改行权时间的`Hour`，应该为 utc 时间`08:00`
1. 为了方便测试，开始时间应该尽量选择你的当前时间，比如 UTC 时间为`2022-11-08 11:00:00`,而你的时区为`+8`,那么则应修改为`2022-11-08 3:00:02`,添加几分钟为了防止创建时间小于当前时间，会导致创建失败。
1. 当前`pro`项目有 bug,如果数据没有及时更新，请刷新页面
