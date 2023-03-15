<template>
  <div class="no-data">
    <img src="~/assets/img/no_data@2x.png" alt="" />
    <p>No Data</p>
  </div>
</template>

<style lang="postcss" scoped>
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 300px;

  & img {
    width: 86px;
    margin-bottom: 16px;
  }

  & p {
    font-size: 14px;
    line-height: 26px;
  }
}
</style>
