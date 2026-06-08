Component({
  properties: {
    dietSummary: {
      type: Array,
      value: [],
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
