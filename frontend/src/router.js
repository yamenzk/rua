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
        path: 'projects',
        name: 'Projects',
        component: () => import('@/pages/Projects.vue'),
      },
      {
        // Redirect /project to /projects
        path: 'project',
        redirect: { name: 'Projects' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/pages/Inventory.vue'),
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/pages/Employees.vue'),
      },
      {
        // Redirect /employee to /employees
        path: 'employee',
        redirect: { name: 'Employees' }
      },
      {
        path: 'parties',
        name: 'Parties',
        component: () => import('@/pages/Parties.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
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
        // Redirect /project/:id to /project/:id/overview
        path: '',
        redirect: to => ({ name: 'ProjectOverview', params: { id: to.params.id }})
      },
      {
        path: 'overview',
        name: 'ProjectOverview',
        component: () => import('@/pages/ProjectOverview.vue'),
      },
      {
        path: 'chat',
        name: 'ProjectChat',
        component: () => import('@/pages/ProjectChat.vue'),
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
        children: [
          {
            path: '',
            name: 'ProjectDocumentsDefault',
            redirect: to => ({ name: 'ProjectDocumentsQuotations', params: { id: to.params.id }})
          },
          {
            path: 'quotations',
            name: 'ProjectDocumentsQuotations',
            component: () => import('@/pages/ProjectDocuments.vue'),
            props: { defaultTab: 'quotations' }
          },
          {
            path: 'proformas',
            name: 'ProjectDocumentsProformas',
            component: () => import('@/pages/ProjectDocuments.vue'),
            props: { defaultTab: 'proformas' }
          },
          {
            path: 'invoices',
            name: 'ProjectDocumentsInvoices',
            component: () => import('@/pages/ProjectDocuments.vue'),
            props: { defaultTab: 'invoices' }
          },
          {
            path: 'rfqs',
            name: 'ProjectDocumentsRFQs',
            component: () => import('@/pages/ProjectDocuments.vue'),
            props: { defaultTab: 'rfqs' }
          },
          {
            path: 'purchase-orders',
            name: 'ProjectDocumentsPurchaseOrders',
            component: () => import('@/pages/ProjectDocuments.vue'),
            props: { defaultTab: 'purchaseOrders' }
          },
          {
            path: 'payments',
            name: 'ProjectDocumentsPayments',
            component: () => import('@/pages/ProjectDocuments.vue'),
            props: { defaultTab: 'payments' }
          }
        ]
      },
      {
        path: 'documents/quotation/:quotationId',
        name: 'QuotationDetails',
        component: () => import('@/pages/QuotationDetails.vue'),
      },
      {
        path: 'documents/lpo/:lpoId',
        name: 'LPODetails',
        component: () => import('@/pages/LPODetails.vue'),
      },
    ],
  },
  {
    path: '/employee/:id',
    component: () => import('@/layouts/EmployeeLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        // Redirect /employee/:id to /employee/:id/overview
        path: '',
        redirect: to => ({ name: 'EmployeeOverview', params: { id: to.params.id }})
      },
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
        path: 'documents',
        name: 'EmployeeDocuments',
        component: () => import('@/pages/EmployeeDocuments.vue'),
      }
    ],
  },
  {
    name: 'Login',
    path: '/account/login',
    component: () => import('@/pages/Login.vue'),
  },
  // 404 route - must be last
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    // No requiresAuth meta to ensure 404 is shown even when not logged in
  }
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

  // Allow NotFound page to be accessed regardless of auth status
  if (to.name === 'NotFound') {
    next()
    return
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