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
    date: {
      type: String,
      value: '',
    },
    time: {
      type: String,
      value: '',
    },
    hardness: {
      type: Number,
      value: 3,
    },
    amount: {
      type: Number,
      value: 3,
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
  data: {
    hardnessOptions: [
      { value: 1, label: '很稀' },
      { value: 2, label: '偏稀' },
      { value: 3, label: '正常' },
      { value: 4, label: '偏硬' },
      { value: 5, label: '很硬' },
    ],
    amountOptions: [
      { value: 1, label: '很少' },
      { value: 2, label: '偏少' },
      { value: 3, label: '正常' },
      { value: 4, label: '偏多' },
      { value: 5, label: '很多' },
    ],
  },
  methods: {
    handleClose() {
      this.triggerEvent('close')
    },
    handleTimeChange(e: any) {
      this.triggerEvent('fieldChange', { field: 'time', value: e.detail.value })
    },
    handleHardnessChange(e: any) {
      this.triggerEvent('fieldChange', { field: 'hardness', value: Number(e.detail.value) })
    },
    handleAmountChange(e: any) {
      this.triggerEvent('fieldChange', { field: 'amount', value: Number(e.detail.value) })
    },
    handleDescInput(e: any) {
      this.triggerEvent('fieldChange', { field: 'desc', value: e.detail.value })
    },
    handleSubmit() {
      this.triggerEvent('submit')
    },
    handleDelete() {
      this.triggerEvent('delete')
    },
    preventBubble() {
      // 阻止事件冒泡
    },
  },
})