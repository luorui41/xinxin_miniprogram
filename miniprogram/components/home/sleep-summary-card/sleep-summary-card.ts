Component({
  properties: {
    sleepSummary: {
      type: Object,
      value: undefined,
    },
    mondayStr: {
      type: String,
      value: '',
    },
    todayStr: {
      type: String,
      value: '',
    },
    loading: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    handleMore() {
      this.triggerEvent('more')
    },
  },
})