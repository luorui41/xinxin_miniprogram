Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    mode: {
      type: String,
      value: 'add',
    },
    recordId: {
      type: Number,
      value: 0,
    },
    startDate: {
      type: String,
      value: '',
    },
    endDate: {
      type: String,
      value: '',
    },
    startTime: {
      type: String,
      value: '',
    },
    endTime: {
      type: String,
      value: '',
    },
    wakeTimes: {
      type: Number,
      value: 0,
    },
    desc: {
      type: String,
      value: '',
    },
    submitting: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    handleClose() {
      this.triggerEvent('close')
    },
    preventBubble() {
      // 阻止事件冒泡
    },
    handleStartDateChange(e: any) {
      this.triggerEvent('fieldChange', { field: 'startDate', value: e.detail.value })
    },
    handleEndDateChange(e: any) {
      this.triggerEvent('fieldChange', { field: 'endDate', value: e.detail.value })
    },
    handleStartTimeChange(e: any) {
      this.triggerEvent('fieldChange', { field: 'startTime', value: e.detail.value })
    },
    handleEndTimeChange(e: any) {
      this.triggerEvent('fieldChange', { field: 'endTime', value: e.detail.value })
    },
    handleWakeTimesInput(e: any) {
      this.triggerEvent('fieldChange', { field: 'wakeTimes', value: Number(e.detail.value) || 0 })
    },
    handleDescInput(e: any) {
      this.triggerEvent('fieldChange', { field: 'desc', value: e.detail.value })
    },
    handleSubmit() {
      if (this.properties.submitting) return
      this.triggerEvent('submit')
    },
    handleDelete() {
      this.triggerEvent('delete')
    },
  },
})