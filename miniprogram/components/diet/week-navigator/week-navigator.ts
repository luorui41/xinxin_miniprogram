Component({
  properties: {
    weekLabel: {
      type: String,
      value: '',
    },
    dateRange: {
      type: String,
      value: '',
    },
    viewMode: {
      type: String,
      value: 'record',
    },
  },
  methods: {
    handlePrevWeek() {
      this.triggerEvent('prevWeek')
    },
    handleNextWeek() {
      this.triggerEvent('nextWeek')
    },
    handleViewModeChange(e: any) {
      const mode = e.currentTarget.dataset.mode
      this.triggerEvent('viewModeChange', { mode })
    },
  },
})
