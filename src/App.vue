<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      radio: '1'
    }
  }
}
</script>

<style lang="less" scoped>
#app {
  height: 100%;
}
</style>
