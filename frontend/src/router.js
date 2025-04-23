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
				redirect: { name: 'Projects' },
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
				redirect: { name: 'Employees' },
			},
			{
				path: 'parties',
				name: 'Parties',
				component: () => import('@/pages/Parties.vue'),
			},
			{
				path: 'tasks',
				name: 'Tasks',
				component: () => import('@/pages/Tasks.vue'),
			},
			{
				path: 'letters-forms',
				name: 'LettersForms',
				component: () => import('@/pages/LettersForms.vue'),
			},
			{
				// Use a nested route within AppLayout or a separate layout if needed
				path: '/letter/:id',
				name: 'LetterDetails',
				component: () => import('@/components/letters/LetterDetails.vue'), 
				props: true, // Pass route params as props
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
				redirect: (to) => ({ name: 'ProjectOverview', params: { id: to.params.id } }),
			},
			{
				path: 'overview',
				name: 'ProjectOverview',
				component: () => import('@/components/project/ProjectOverview.vue'),
			},
			{
				path: 'chat',
				name: 'ProjectChat',
				component: () => import('@/components/project/ProjectChat.vue'),
			},
			{
				path: 'items',
				name: 'ProjectItems',
				component: () => import('@/components/project/ProjectItems.vue'),
			},
			{
				path: 'invoicing',
				name: 'ProjectInvoicing',
				component: () => import('@/components/project/ProjectInvoicing.vue'),
				children: [
					{
						path: '',
						name: 'ProjectInvoicingDefault',
						redirect: (to) => ({
							name: 'ProjectInvoicingQuotations',
							params: { id: to.params.id },
						}),
					},
					{
						path: 'quotations',
						name: 'ProjectInvoicingQuotations',
						component: () => import('@/components/project/ProjectInvoicing.vue'),
						props: { defaultTab: 'quotations' },
					},
					{
						path: 'purchase-receipts',
						name: 'ProjectInvoicingPurchaseReceipts',
						component: () => import('@/components/project/ProjectInvoicing.vue'),
						props: { defaultTab: 'purchaseReceipts' },
					},
					{
						path: 'invoices',
						name: 'ProjectInvoicingInvoices',
						component: () => import('@/components/project/ProjectInvoicing.vue'),
						props: { defaultTab: 'invoices' },
					},
					{
						path: 'rfqs',
						name: 'ProjectInvoicingRFQs',
						component: () => import('@/components/project/ProjectInvoicing.vue'),
						props: { defaultTab: 'rfqs' },
					},
					{
						path: 'purchase-orders',
						name: 'ProjectInvoicingPurchaseOrders',
						component: () => import('@/components/project/ProjectInvoicing.vue'),
						props: { defaultTab: 'purchaseOrders' },
					},
					{
						path: 'payments',
						name: 'ProjectInvoicingPayments',
						component: () => import('@/components/project/ProjectInvoicing.vue'),
						props: { defaultTab: 'payments' },
					},
				],
			},

			{
				path: 'invoicing/quotation/:quotationId',
				name: 'QuotationDetails',
				component: () => import('@/components/invoicing/quotation/QuotationDetails.vue'),
			},
			{
				path: 'invoicing/lpo/:lpoId',
				name: 'LPODetails',
				component: () => import('@/components/invoicing/lpo/LPODetails.vue'),
			},
			{
				path: 'invoicing/rfq/:rfqId',
				name: 'RFQDetails',
				component: () => import('@/components/invoicing/rfq/RFQDetails.vue'),
			},
			{
				path: 'invoicing/invoice/:invoiceId',
				name: 'InvoiceDetails',
				component: () => import('@/components/invoicing/invoice/InvoiceDetails.vue'),
			},
			{
				path: 'invoicing/payment/:paymentId',
				name: 'PaymentDetails',
				component: () => import('@/components/invoicing/payment/PaymentDetails.vue'),
			},
			{
				path: 'invoicing/receipt/:receiptId',
				name: 'PurchaseReceiptDetails',
				component: () =>
					import('@/components/invoicing/purchaseReceipt/PurchaseReceiptDetails.vue'),
			},
			{
				path: 'branches',
				name: 'ProjectBranches',
				component: () => import('@/components/project/ProjectBranches.vue'),
			},
			{
				path: 'files',
				name: 'ProjectFiles',
				component: () => import('@/components/project/ProjectFiles.vue'),
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
				redirect: (to) => ({ name: 'EmployeeOverview', params: { id: to.params.id } }),
			},
			{
				path: 'overview',
				name: 'EmployeeOverview',
				component: () => import('@/components/employee/EmployeeOverview.vue'),
			},
			{
				path: 'attendance',
				name: 'EmployeeAttendance',
				component: () => import('@/components/employee/EmployeeAttendance.vue'),
			},
			{
				path: 'documents',
				name: 'EmployeeDocuments',
				component: () => import('@/components/employee/EmployeeDocuments.vue'),
			},
		],
	},
	{
		name: 'Login',
		path: '/account/login',
		component: () => import('@/pages/Login.vue'),
	},
	{
		path: '/sign/:token',
		name: 'SignaturePage',
		component: () => import('@/components/common/SignaturePage.vue'),
		meta: {
			public: true, // Mark as public route that doesn't require authentication
		},
	},
	// 404 route - must be last
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: () => import('@/components/common/NotFound.vue'),
		// No requiresAuth meta to ensure 404 is shown even when not logged in
	},
]

let router = createRouter({
  history: createWebHistory('/admin'),
  routes,
})

router.beforeEach(async (to, from, next) => {
  let isLoggedIn = session.isLoggedIn
  try {
    await userResource.promise
  } catch (error) {
    isLoggedIn = false
  }

  // Allow public routes to be accessed without authentication
  if (to.meta.public) {
    next()
    return
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