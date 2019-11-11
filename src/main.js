import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入 element 组件库样式
import 'element-ui/lib/theme-chalk/index.css'
// 导入 Vue 组件库
import ElementUI from 'element-ui'

Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
