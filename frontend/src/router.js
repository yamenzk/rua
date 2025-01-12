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
    path: '/project/:id',
    component: () => import('@/layouts/ProjectLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'overview',
        name: 'ProjectOverview',
        component: () => import('@/pages/ProjectOverview.vue'),
      },
      {
        path: 'tasks',
        name: 'ProjectTasks',
        component: () => import('@/pages/ProjectTasks.vue'),
      },
      {
        path: 'items',
        name: 'ProjectItems',
        component: () => import('@/pages/ProjectItems.vue'),
      },
      {
        path: 'documents',
        name: 'ProjectDocuments',
        component: () => import('@/pages/ProjectDocuments.vue'),
      },
      {
        path: 'documents/quotation/:quotationId',
        name: 'QuotationDetails',
        component: () => import('@/pages/QuotationDetails.vue'),
      },
    ],
  },
  {
    path: '/employee/:id',
    component: () => import('@/layouts/EmployeeLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'overview',
        name: 'EmployeeOverview',
        component: () => import('@/pages/EmployeeOverview.vue'),
      },
      {
        path: 'attendance',
        name: 'EmployeeAttendance',
        component: () => import('@/pages/EmployeeAttendance.vue'),
      },
      {
        path: 'files',
        name: 'EmployeeFiles',
        component: () => import('@/pages/EmployeeFiles.vue'),
      }
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