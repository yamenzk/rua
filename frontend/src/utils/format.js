import { dayjs } from 'frappe-ui'


// Base configuration
const TIMEZONE = 'Asia/Dubai'
const dayjsSystem = () => dayjs().tz(TIMEZONE)

// Date formats
export const DATE_FORMATS = {
  FULL_LONG: 'dddd, MMMM D, YYYY', // Added for full date with weekday
  ISO: 'YYYY-MM-DD',
  UAE: 'DD-MM-YYYY',
  FULL_DATE: 'MMMM D, YYYY',
  FULL_DATE_TIME: 'MMMM D, YYYY, hh:mm A',
  SHORT_DATE_TIME: 'DD MMM YYYY, HH:mm',
  ATTENDANCE: 'ddd, MMM D, YYYY',
  SHORT_DATE: 'DD MMM YYYY'
}

// Get current server date
export function getServerDate() {
  return dayjsSystem().format(DATE_FORMATS.ISO)
}

// Format date for display with configurable formats
export function formatDate(dateString, format = DATE_FORMATS.FULL_DATE) {
	if (!dateString) return ''
	// Ensure dateString is converted to a string if it's not already
	const dateToFormat = dateString?.toString ? dateString.toString() : dateString
	return dayjs(dateToFormat).tz(TIMEZONE).format(format)
  }

// Format date with ordinal suffix
export function formatDateWithOrdinal(dateString) {
  if (!dateString) return ''
  const date = dayjs(dateString).tz(TIMEZONE)
  const day = date.date()
  const suffixes = ['th', 'st', 'nd', 'rd']
  const relevantDigit = day % 10
  const exception = day % 100 >= 11 && day % 100 <= 13
  const dayWithOrdinal = day + (exception ? 'th' : suffixes[relevantDigit] || 'th')
  
  return `${date.format('dddd')}, ${dayWithOrdinal} of ${date.format('MMMM')}, ${date.format('YYYY')}`
}

// Format date with time
export function formatDateTime(date) {
  return formatDate(date, DATE_FORMATS.SHORT_DATE_TIME)
}

// Format attendance date
export function formatAttendanceDate(date) {
  return formatDate(date, DATE_FORMATS.ATTENDANCE)
}

// Date comparison functions
export function isBeforeToday(date) {
  return date ? dayjs(date).isBefore(dayjsSystem(), 'day') : false
}

export function isAfterToday(date) {
  return date ? dayjs(date).isAfter(dayjsSystem(), 'day') : false
}

export function isSameDay(date1, date2) {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}

export function isWithinRange(date, startDate, endDate) {
  const checkDate = dayjs(date)
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  return (checkDate.isAfter(start, 'day') || checkDate.isSame(start, 'day')) && 
         (checkDate.isBefore(end, 'day') || checkDate.isSame(end, 'day'))
}

// Date manipulation functions
export function addDays(date, days) {
  return dayjs(date).add(days, 'day').format(DATE_FORMATS.ISO)
}

export function subtractDays(date, days) {
  return dayjs(date).subtract(days, 'day').format(DATE_FORMATS.ISO)
}

export function getDaysDifference(date) {
  return date ? dayjs(date).diff(dayjsSystem(), 'day') : 0
}

// Relative time formatting
export function getRelativeTime(date) {
  if (!date) return ''
  const days = getDaysDifference(date)
  
  if (days < 0) return `${Math.abs(days)} days ago`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

// Number formatting functions
export function formatNumber(value) {
  if (!value) return '0'
  
  const matches = value.toString().match(/^([\d.]+)\s*(.*)$/)
  if (!matches) return value
  
  const [, numberStr, unit] = matches
  const num = Number(numberStr)
  const hasDecimals = num % 1 !== 0
  
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })}${unit ? ' ' + unit : ''}`
}

export function formatCurrency(value) {
  if (!value) return 'AED 0'
  const num = Number(value)
  const hasDecimals = num % 1 !== 0
  
  return `AED ${num.toLocaleString(undefined, {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })}`
}

// Duration formatting
export function formatDateDuration(startDate, endDate) {
  if (!startDate || !endDate) return ''
  const diffDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
}

// Time helpers
export function getCurrentHour() {
  return dayjs().tz('Asia/Dubai').hour()
}

// Due status calculation
export function getDueStatus(dueDate) {
  if (!dueDate) return ''
  
  const days = getDaysDifference(dueDate)

  if (days < 0) {
    return `Overdue by ${Math.abs(days)} days`
  } else if (days === 0) {
    return 'Due today'
  } else if (days === 1) {
    return 'Due tomorrow'
  } else {
    return `Due in ${days} days`
  }
}

export function getMonthName(month) {
	return dayjs().month(month - 1).format('MMMM')
  }

// Database timestamp formatting
export function formatDateForFrappe(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function getDatabaseTimestamp() {
  return formatDateForFrappe(new Date())
}