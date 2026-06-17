Component({
  properties: {
    days: {
      type: Array,
      value: [],
    },
  },
  methods: {
    handleDayClick(e: any) {
      const dateStr = e.currentTarget.dataset.date
      this.triggerEvent('addSleep', { date: dateStr })
    },
    handleSleepBarClick(e: any) {
      const recordId = e.currentTarget.dataset.recordId
      this.triggerEvent('editSleep', { recordId })
    },
  },
})