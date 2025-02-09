// src/directives/clickOutside.js
export const clickOutside = {
    mounted(el, binding) {
      const handler = (e) => {
        if (!el.contains(e.target) && el !== e.target) {
          binding.value(e)
        }
      }
      el.__clickOutsideHandler = handler
      document.addEventListener('click', handler)
    },
    unmounted(el) {
      document.removeEventListener('click', el.__clickOutsideHandler)
    }
  }