Component({
  properties: {
    monthLabel: {
      type: String,
      value: '',
    },
  },
  methods: {
    handlePrevMonth() {
      this.triggerEvent('prevMonth')
    },
    handleNextMonth() {
      this.triggerEvent('nextMonth')
    },
  },
})