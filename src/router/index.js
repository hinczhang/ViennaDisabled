import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/views/MainPage'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Vienna Disabled Travelling',
      component: MainPage
    }
  ]
})
