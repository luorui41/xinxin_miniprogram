Component({
  properties: {
    dateStr: {
      type: String,
      value: '',
    },
    dayStr: {
      type: String,
      value: '',
    },
    dayName: {
      type: String,
      value: '',
    },
    toiletRecords: {
      type: Array,
      value: [],
    },
  },
  methods: {
    handleAddClick() {
      this.triggerEvent('addToilet', { date: this.data.dateStr })
    },
    handleRecordClick(e: any) {
      const recordId = e.currentTarget.dataset.recordId
      this.triggerEvent('editToilet', { recordId })
    },
  },
})