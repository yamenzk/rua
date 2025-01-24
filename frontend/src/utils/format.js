// @/utils/format.js

export function formatNumber(value) {
	if (!value) return '0'

	// Extract number and unit using regex
	const matches = value.toString().match(/^([\d.]+)\s*(.*)$/)
	if (!matches) return value

	const [, numberStr, unit] = matches
	const num = Number(numberStr)

	// Check if it has decimals
	const hasDecimals = num % 1 !== 0

	return `${num.toLocaleString(undefined, {
		minimumFractionDigits: hasDecimals ? 2 : 0,
		maximumFractionDigits: 2,
	})}${unit ? ' ' + unit : ''}`
}

export function formatCurrency(value) {
	if (!value) return 'AED 0'

	// Convert to number and check if it has decimals
	const num = Number(value)
	const hasDecimals = num % 1 !== 0

	return `AED ${num.toLocaleString(undefined, {
		minimumFractionDigits: hasDecimals ? 2 : 0,
		maximumFractionDigits: 2,
	})}`
}

export function formatDate(dateString, formatAsOrdinal = false) {
	if (!dateString) return ''

	const date = new Date(dateString)

	// Helper function to add ordinal suffix to the day of the month
	const getOrdinalSuffix = (day) => {
		const suffixes = ['th', 'st', 'nd', 'rd']
		const relevantDigit = day % 10
		const exception = day % 100 >= 11 && day % 100 <= 13
		return day + (exception ? 'th' : suffixes[relevantDigit] || 'th')
	}

	if (formatAsOrdinal) {
		const dayWithOrdinal = getOrdinalSuffix(date.getDate())
		return `${date.toLocaleString('en-US', { weekday: 'long' })}, ${dayWithOrdinal} of ${date.toLocaleString('en-US', { month: 'long' })}, ${date.getFullYear()}`
	}

	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function getCurrentDubaiDate() {
  const now = new Date()
  const dubaiDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
  return dubaiDate.toISOString().split('T')[0]
}

export function formatAttendanceDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getMonthName(month) {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'long' })
}


// format.js

export function getIconByDoctype(doctype) {
	switch (doctype) {
	  case 'RUA Invoice':
		return 'file-text'
	  case 'RUA Payment':
		return 'credit-card'
	  case 'RUA Project':
		return 'briefcase'
	  case 'RUA LPO':
		return 'shopping-cart'
	  case 'RUA RFQ':
		return 'clipboard'
	  case 'RUA Purchase Receipt':
		return 'package'
	  case 'RUA Quotation':
		return 'file'
	  case 'RUA Employee':
		return 'user'
	  default:
		return 'file'
	}
  }
  
  export function getStatusTheme(status) {
	switch (status) {
	  case 'Completed':
		return 'green'
	  case 'Open':
		return 'blue'
	  case 'Delayed':
		return 'orange'
	  case 'Cancelled':
		return 'red'
	  default:
		return 'gray'
	}
  }
  
  export function getPriorityTheme(priority) {
	switch (priority) {
	  case 'High':
		return 'red'
	  case 'Medium':
		return 'blue'
	  case 'Low':
		return 'green'
	  default:
		return 'gray'
	}
  }
