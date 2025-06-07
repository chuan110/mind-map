import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Edit',
    component: () => import(`./pages/Edit/Index.vue`)
  },
  {
    path: '/index',
    redirect: '/'
  },
  {
    path: '/doc/zh',
    component: () => import(`./pages/Doc.vue`)
  },
  {
    path: '/md/:filePath',
    name: 'md-edit',
    component: () => {
      console.log('Router matched /md/:filePath');
      return import(`./pages/Edit/Index.vue`);
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
