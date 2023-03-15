# DeOrderbook v2

## DeOrder

1. token0 为 USDC ,token1 为 WBTC switch 时，token0 为 WBTC ，token1 为 USDC
2. 如果用户想用 uHODL 的话，按 USDC dropdown - a）用户钱包里有 uHODL 的话 dropdown 显示 = uHODL，WBTC； b） 用户钱包里有 uHODL 和 bHODL 的话 dropdown 显示 = uHODL，WBTC， bHODL；c）用户钱包里没有 uHODL 或 bHODL dropdown 显示 = WBTC；
3. 用户选择 token0 为 uHODL 时 ,token1 为 WBTC switch 时，token0 为 WBTC ，token1 为 USDC
4. 用户选择 token0 为 WBTC 时 ,token1 为 USDC switch 时，token0 为 USDC ，token1 为 WBTC
5. 用户选择 token0 为 bHODL（只有钱包里有 bHODL 的情况下 dropdown 里显示并可选）时 token1 为 USDC switch 时，token0 为 USDC ，token1 为 WBTC
6. token1 never shows HODL token
7. 如果没有 uHODL 和 bHODL 没有 balance 的话 token0 不显示相关 token

# DeOrderbook v1

## 部署

1. 需要添加`.deploy-env`文件：

```
SSH_HOST=xxx
SSH_PORT=xxx
SSH_USER=xxx
```

1. 测试环境：运行指令`sh deploy.sh test`

### 地址

1. 测试环境和 subgraph 都部署在 35.82.30.121 服务器上
1. sniper pool rewarder:0x6f7F6bc06110460Ee9dA5adbBBa570cF66e61131
1. hodl pool rewarder:0xdE2b5f8526baf6156879c452c4142b85850900db
1. dob rewardDispatcher:0x2B863AF4AF818A7673C0305eF827D6423B080306
1. collector：0x3E5a34F8561e0D23BF50B57d30Bbff9C9FFdA8Ff

### 私钥

1. owner：0x20b873607bffdf634b4c25e9998caa8941e692ef1ca13aaa9872266612646118
1. rewardDispatcher：6d157dda10e55802f18e5ac7659ab9390bc123b82976bca2cc7a916044e2f8dc
1. collector ：2b0533314d20c4f17bcdae102ce8c5c0f5bc29c343d7ad807c16decca69374b4
1. worker：d84459bbec7a8787668eb3d7dbe219916be4301b90feaf12b968c82252d7edb0
1. bscScan 网站 api 私钥：FM7S3N36KS77AMABC44EMFT95VSZVBX492，账号密码：baixiaoyu@yeeyuntech.com,bxy2997@

## 业务

> mint 不需要 approve

### UnLock(UnWind)

1. approve
1. sniper
1. bullet
1. 日期相关：unlock：在 expire 之前，sniper+bullet=>target
1. balance:表示用户钱包中的 sniper（不包含 staked）
1. unlock 不需要红点提醒

### Exercise

> 行权，不需要对应的 sniper,只需要 bullet 和 baseToken

1. approve
1. base token (uHODL 或者 bHODL)
1. bullet
1. 日期相关：exercise：expire 到 expire + 24h，bullet + base => target
1. balance: 取 bullet 钱包中余额（不包含 staked）
1. 有可操作 bullet 时需要红点提醒

### HODL

1. Total Amount 为 Pool 总质押数
2. 列表中 My Wallet 除了`Unlock HODL`都取所有（total + staked），`Unlock HODL`取 sniper 的余额(total)
3. `exercise`、`withdrawTarget`、`redeemToken`操作时，收取的相关 token 费用会从选中的 option 发放给`collector`，option 在 enter 时会被交易等量的 token

#### Collect

1. approve
1. sniper
1. bHODL 和 uHODL
1. 日期相关: collect: expire + 24 之后，sniper => target or base or both to 的数量参考下边计算方法， optionType=0 时 baseToken 是 uHODL，1 时为 bHODL
1. balance:表示用户所有的 sniper; wallet sniper + staked sniper
1. 有可操作 sniper 时需要红点提醒

```
// to的数量参考下边计算方法

// bHODL = 数量 * 当前option的bHODL余额 / sniper的总数 - fee;
// uHODL = 数量 * 当前option的uHODL余额 / sniper的总数 - fee;
// fee=  bHODL或者uHODL * optoinRedeemFeeRatio/10000
```

### deorder

1. buy 的时候传入 total 值
1. sell 的时候传入数量值
1. staking 为质押 sniper，被质押的 sniper 会从 balance 中扣除。所有 sniper = 质押的 sniper + 钱包中的 sniper
1. option 交易产生的 bullet 会分发 20%给 option 的创建者，剩下 80%分发给 bulletCollector（不是当前交易用户）
1. option 交易的 fee，其中 50% 分发给 fee collector，另外 50%分发给 fund(基金会)
1. sell 列表和 buy 列表的行权价格单位都是`uHODL`

### staking

1. 部分数据需要 worker 定时调用`drawReward`，测试环境暂时没有 worker,以下数据可能受到影响：
1. dob 每天质押数
1. hodl rewards pool 奖励总数
1. 奖励金额
1. bullet 奖励
1. bullet:
1. option factory 的 owner 会调用 notifyRemoveBullet，把对应的 bullet 从 list remove 掉，每个月做一次 remove，会把 bullets 这个 list 维护成当前有效的
1. option 的起始时间时当天 0 点
1. HODL Rewards Pool 中 total hodl 的值等于 Collector + rewardDispatcher 的 hodl 之和
1. worker: 定时调用接口发放奖励，每天最多会触发一次，调用之后 dob 当日 staking 数量会被清空，奖励内容为所有 bullet 种类，奖励从 bulletCollector 拿取
1. Bullet Rewards Pool 中 Total Rewards 为当日所有奖励
1. pool 每天奖励产出 1w dob
1. stakingPoolRewarder 中的 rewardDispatcher 和 dobStakingPool rewardDispatcher 是一个地址
1. 过期的 sniper 不可以再 stake

### Lock Page

1. claim all rewards 需要有 hodl 进行赎回或者 exit，才会有 hodl 分发给 feeCollector。

### bullet market

> 文档：<https://shimo.im/docs/N2A1Mbdmg7sbVvAD/read>  
> UI: <https://www.figma.com/file/36vsTf6W1Twr0wVCA6JdDr/DeOrderbook?node-id=15518%3A2079>

1. v2, 只有 golden 用户才可以访问 bullet market
1. v1.1 支持买卖 bullet，卖的时候全部卖掉，不支持只卖掉部分。可以取消卖，可以加一个期限 过期就取消掉。bullet 支持批量交易
1. otc price 最多 4 位小数
1. my bullet: bBullet amount 限制最多 4 位小数，uBullet amount 限制为整数，弹窗也一样
1. 最大可交易时长应为 72 小时

### bullet rewarders

1. unstake 会扣除用户当天总 lock 数量

#### 卖家

1. 可以卖 bullet
1. 到期的 bullet 订单重新上架？是的话添加到列表中，不是的话可以 claim 自己的 bullet
1. 卖掉的 bullet，变成 uHODL，然后领取
1. 取消交易，领取 bullet
1. 只有过期和 in sale 的 bullet 可以 update
1. 只有 not in sale 的 bullet 才可以 sell

#### 买家

1. 可以买部分或者全部的 bullet
1. 目前只能通过 uHODL 购买 bullet

#### 平台功能

1. 展示 bullet，bBullet amount 展示最多 4 位，uBullet amount 展示限制没有小数。编辑时不做限制（dob workshop 7.15 11:11）
1. bullet 如果到期，状态为 pending,没到期之前都可以进行买的操作
1. 卖出的 bullet 会自动 claim 奖励
1. 卖出的 bullet 会被平台抽取一部分收益（HODL），比例是动态的,通过 handlingFeeRatio 获取，只有在成交时才会扣除，扣除的是卖家的收益
1. 取消交易
1. 卖家能看到自己的 bullet 吗？

### 共通

1. 点击 max 时，显示的值应为实际数值，不是展示数值。
1. exerciseTimestamp 应该为某一天的 0 点
1. apy 计算方式：（1+ (我的总奖励价值/平台总质押价值)）\*\* 一年出块数量 -1
1. 倒计时显示逻辑，大于 0 小于 24，按照 1day 显示
1. withdraw 同样需要授权
1. dobStakingPool 的 feeCollector 和 bulletCollector 相同，都是 collector 的地址
1. sniper 价格计算方法：

```
it does because SNIPER is a representation of one or two things
we know the claim the user has on the HODL tokens underlying on the SNIPER
so we can calculate price
for example I have 1% of SNIPER tokens 20,000 strike, expiry on tomorrow, there's 100 bHODL and 100,000 uHODL held in that SNIPER contract from partial exercise
means I have a claim to 1 bHODL and 1,000 uHODL at the moment, if BTC price is $21,000 and USDC price is $1, my SNIPER tokens are worth $22,000 right now

```

1. bullet 的价格，应该从 bullet market 获取，now if the Bullet Marketplace only lists ask prices then you have to provide a weighted price for the BULLETs

```js
// rewardPerBlock: 一个块发放的dob数量，精度应除以18

// sniper apy计算方式
// const dailyApy = 24*60*20* res.rewardPerBlock * dob price / 平台 totalSniper * sniper price
// const apy = (1 + dailyApy)^365 - 1

// dob apy计算方式
//  ((currentUHODLAccuReward- 7dayAgoUHODLAccuReward) * uhodlPrice +(currentBHODLAccuReward- 7dayAgoBHODLAccuReward) * bhodlPrice))  +  ((collector uhodl * uHODLPrice + collector bhodl * bHODLPrice) /total stake dob price)
```

1. 图标：hodl、sniper、bullet 都使用组合图标

## 特性

1. 自动引入，包括`composables`中的 hook,还有 vueuse 及 vue api 和 nuxt api

## 注意

1. 新增的 hook 需要在 eslint 中添加`globals`变量
1. 在 element-ui 更换回`dart-sass`之前固定在`2.15.7`版本，<https://github.com/ElemeFE/element/blob/dev/CHANGELOG.zh-CN.md#%E5%85%B6%E4%BB%96>
