<template>
  <div class="address-page content--max">
    <y-search-hash v-model="hashValue" class="home__search"></y-search-hash>
    <div class="address__user">
      <div class="user__label">User details:</div>
      <div class="user__copy" @click="() => copy(addressRef)">
        <div class="user__value--format">{{ addressFormat }}</div>
        <div ref="addressRef" class="user__value">{{ params.address }}</div>
        <img src="~/assets/img/icon_copy@mini.svg" alt="" />
      </div>
    </div>
    <div class="address__tabs">
      <y-tabs v-model="activeTab" :class="tabsClass">
        <el-tab-pane label="$DOB" name="$DOB">
          <DOBTable></DOBTable>
        </el-tab-pane>
        <el-tab-pane lazy label="Pools" name="Pools">
          <PoolTable></PoolTable>
        </el-tab-pane>
        <el-tab-pane lazy label="BULLETs" name="BULLETs">
          <BulletTable></BulletTable>
        </el-tab-pane>
      </y-tabs>
    </div>
  </div>
</template>
<script setup lang="ts">
import DOBTable from './items/DOBTable.vue'
import PoolTable from './items/PoolTable.vue'
import BulletTable from './items/BulletTable.vue'

// [ Init ]
const { params, hash } = useRoute()

// [ Search ]
const hashValue = ref('')

// [ User ]
const addressRef = ref(null as unknown as HTMLDivElement)
const { lookupAddress } = useENS()
const addressFormat = computed(() => {
  return lookupAddress(params.address as string).value.state || params.address
})
const { copy } = useCopyText()

// [ Tabs ]
const activeTab = ref(hash ? hash.slice(1, hash.length) : '$DOB')
const tabsClass = computed(() => {
  let className = ''
  if (activeTab.value === '$DOB') {
    className = 'is-first-tab'
  } else if (activeTab.value === 'BULLETs') {
    className = 'is-last-tab'
  }
  return className
})
</script>
<style lang="postcss" scoped>
.address-page {
  padding: 66.43px 0;
  & .home__search {
    margin: 0 auto;
  }
  & .address__user {
    display: flex;
    margin-top: 40px;
    & .user__label {
      font-size: 20px;
      font-weight: 600;
      line-height: 30px;
    }
    & .user__copy {
      display: flex;
      align-items: center;
      margin-left: 4px;
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
      text-decoration: underline;
      cursor: pointer;
      & img {
        width: 16px;
        height: 16px;
        margin-left: 4px;
      }
    }
    & .user__value {
      position: absolute;
      top: 0;
      z-index: -1;
    }
  }
  & .address__tabs {
    margin-top: 40px;
  }
  & .is-first-tab :deep(.y-table__wrap) {
    border-top-left-radius: 0;
  }
  & .is-last-tab :deep(.y-table__wrap) {
    border-top-right-radius: 0;
  }
}
</style>
