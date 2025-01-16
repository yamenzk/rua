# QuotationItems.vue
<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Items</h2>
      <div class="flex items-center gap-2">
        <p class="text-sm text-gray-600">
          {{ items?.length || 0 }} items
        </p>
        <Button v-if="isExporting" disabled variant="subtle" size="sm">
          <template #prefix>
            <FeatherIcon name="loader" class="w-4 h-4 animate-spin" />
          </template>
          Exporting...
        </Button>
        <Button v-else variant="subtle" size="sm" @click="exportToExcel">
          <template #prefix>
            <FeatherIcon name="download" class="w-4 h-4" />
          </template>
          Export
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <!-- Table Header -->
      <div class="border-b min-w-[800px]">
        <div class="flex items-center px-6 py-2">
          <div class="flex-1 grid grid-cols-8 gap-4">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="box" class="w-4 h-4" />
              Item
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              <FeatherIcon name="maximize-2" class="w-4 h-4" />
              Dimensions
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              <FeatherIcon name="square" class="w-4 h-4" />
              Area
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              <FeatherIcon name="tag" class="w-4 h-4" />
              Rate
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              <FeatherIcon name="hash" class="w-4 h-4" />
              Qty
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              <FeatherIcon name="dollar-sign" class="w-4 h-4" />
              Net Amount
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              VAT
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              Total
            </div>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="divide-y">
        <template v-if="items?.length">
          <!-- Items -->
          <div 
            v-for="item in items" 
            :key="item.name"
            class="hover:bg-gray-50 transition-colors min-w-[800px]"
          >
            <div class="flex items-center px-6 py-3">
              <div class="flex-1 grid grid-cols-8 gap-4">
                <!-- Item Name with Description Tooltip -->
                <div>
                  <Tooltip
                    :text="item.description"
                    :hover-delay="1"
                    placement="top"
                  >
                    <div class="text-sm text-gray-900">
                      {{ item.item_name }}
                    </div>
                  </Tooltip>
                </div>
                <!-- Dimensions -->
                <div class="text-sm text-gray-600 text-right">
                  {{ formatNumber(item.width) }} x {{ formatNumber(item.height) }}
                </div>
                <!-- Area -->
                <div class="text-sm text-gray-600 text-right">
                  {{ formatNumber(item.area) }}
                </div>
                <!-- Rate -->
                <div class="text-sm text-gray-600 text-right">
                  {{ formatCurrency(item.amount) }}
                </div>
                <!-- Qty -->
                <div class="text-sm text-gray-600 text-right">
                  {{ item.qty }}
                </div>
                <!-- Net Amount -->
                <div class="text-sm text-gray-900 font-medium text-right">
                  {{ formatCurrency(item.total) }}
                </div>
                <!-- VAT -->
                <div class="text-sm text-gray-600 text-right">
                  {{ formatCurrency(item.vat_amount) }}
                </div>
                <!-- Total -->
                <div class="text-sm text-gray-900 font-medium text-right">
                  {{ formatCurrency(item.grand_total) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Totals Row -->
          <div class="bg-gray-50 min-w-[800px]">
            <div class="flex items-center px-6 py-3">
              <div class="flex-1 grid grid-cols-8 gap-4">
                <div class="col-span-5 text-sm font-medium text-gray-900 text-right">
                  Totals:
                </div>
                <div class="text-sm font-medium text-gray-900 text-right">
                  {{ formatCurrency(totals.net) }}
                </div>
                <div class="text-sm font-medium text-gray-900 text-right">
                  {{ formatCurrency(totals.vat) }}
                </div>
                <div class="text-sm font-medium text-gray-900 text-right">
                  {{ formatCurrency(totals.grand) }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div 
          v-else 
          class="flex flex-col items-center justify-center py-12 min-w-[800px]"
        >
          <FeatherIcon 
            name="box" 
            class="w-12 h-12 text-gray-400 mb-4" 
          />
          <p class="text-base font-medium text-gray-900">No Items Found</p>
          <p class="text-sm text-gray-600">This quotation has no items.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Button, 
  FeatherIcon,
  Tooltip
} from 'frappe-ui'
import { formatNumber, formatCurrency } from '@/utils/format'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  totals: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && 'net' in value && 'vat' in value && 'grand' in value
    }
  }
})

defineEmits(['export'])

const isExporting = ref(false)

async function exportToExcel() {
  if (!props.items?.length) {
    return
  }

  isExporting.value = true
  try {
    // Load XLSX from CDN if not already loaded
    if (!window.XLSX) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
    }
    const XLSX = window.XLSX

    // Prepare the data for export
    const items = props.items.map(item => ({
      'Item Name': item.item_name,
      'Description': item.description,
      'Dimensions': `${formatNumber(item.width)} x ${formatNumber(item.height)}`,
      'Area': formatNumber(item.area),
      'Rate': formatCurrency(item.amount).replace('AED ', ''),
      'Quantity': item.qty,
      'Net Amount': formatCurrency(item.total).replace('AED ', ''),
      'VAT': formatCurrency(item.vat_amount).replace('AED ', ''),
      'Total': formatCurrency(item.grand_total).replace('AED ', '')
    }))

    // Add summary rows
    items.push(
      {}, // Empty row for spacing
      {
        'Item Name': 'Summary',
        'Description': '',
        'Dimensions': '',
        'Area': '',
        'Rate': '',
        'Quantity': '',
        'Net Amount': formatCurrency(props.totals.net).replace('AED ', ''),
        'VAT': formatCurrency(props.totals.vat).replace('AED ', ''),
        'Total': formatCurrency(props.totals.grand).replace('AED ', '')
      }
    )

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(items)

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Item Name
      { wch: 30 }, // Description
      { wch: 15 }, // Dimensions
      { wch: 10 }, // Area
      { wch: 12 }, // Rate
      { wch: 10 }, // Quantity
      { wch: 15 }, // Net Amount
      { wch: 15 }, // VAT
      { wch: 15 }, // Total
    ]
    ws['!cols'] = colWidths

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Quotation Items')

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Quotation_Items.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exporting to Excel:', err)
  } finally {
    isExporting.value = false
  }
}

// Helper function for loading scripts
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

</script>