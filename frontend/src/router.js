import { createRouter, createWebHistory } from 'vue-router'
import { session } from './data/session'
import { userResource } from '@/data/user'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/Home.vue'),
      },
      {
        name: 'Projects',
        path: 'projects',
        component: () => import('@/pages/Projects.vue'),
      },
      {
        name: 'Inventory',
        path: 'inventory',
        component: () => import('@/pages/Inventory.vue'),
      },
      {
        name: 'Employees',
        path: 'employees',
        component: () => import('@/pages/Employees.vue'),
      },
      {
        name: 'Settings',
        path: 'settings',
        component: () => import('@/pages/Settings.vue'),
      },
    ],
  },
  {
    name: 'Login',
    path: '/account/login',
    component: () => import('@/pages/Login.vue'),
  },
]

let router = createRouter({
  history: createWebHistory('/frontend'),
  routes,
})

router.beforeEach(async (to, from, next) => {
  let isLoggedIn = session.isLoggedIn
  try {
    await userResource.promise
  } catch (error) {
    isLoggedIn = false
  }

  if (to.name === 'Login' && isLoggedIn) {
    next({ name: 'Home' })
  } else if (to.name !== 'Login' && !isLoggedIn) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
