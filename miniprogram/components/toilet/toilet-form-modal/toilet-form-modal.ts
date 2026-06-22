import { get } from '../../../utils/request'

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
    hardnessOptions: [] as { value: number; label: string }[],
    amountOptions: [] as { value: number; label: string }[],
    hardnessLabel: '正常',
    amountLabel: '正常',
  },
  observers: {
    'hardness, hardnessOptions': function(hardness: number, hardnessOptions: any[]) {
      if (hardnessOptions.length > 0) {
        const option = hardnessOptions.find(item => item.value === hardness)
        if (option) {
          this.setData({ hardnessLabel: option.label })
        }
      }
    },
    'amount, amountOptions': function(amount: number, amountOptions: any[]) {
      if (amountOptions.length > 0) {
        const option = amountOptions.find(item => item.value === amount)
        if (option) {
          this.setData({ amountLabel: option.label })
        }
      }
    },
  },
  lifetimes: {
    attached() {
      this.fetchDictOptions()
    },
  },
  methods: {
    async fetchDictOptions() {
      const hardnessRes = await get('/dict/query', { dictType: 'hardness' })
      const hardnessOptions = (hardnessRes || []).map((item: any) => ({
        value: Number(item.dictCode),
        label: item.dictLabel,
      }))

      const amountRes = await get('/dict/query', { dictType: 'amount' })
      const amountOptions = (amountRes || []).map((item: any) => ({
        value: Number(item.dictCode),
        label: item.dictLabel,
      }))

      this.setData({ hardnessOptions, amountOptions })
    },
    handleClose() {
      this.triggerEvent('close')
    },
    handleTimeChange(e: any) {
      this.triggerEvent('fieldChange', { field: 'time', value: e.detail.value })
    },
    handleHardnessChange(e: any) {
      const index = Number(e.detail.value)
      const value = this.data.hardnessOptions[index].value
      this.triggerEvent('fieldChange', { field: 'hardness', value })
    },
    handleAmountChange(e: any) {
      const index = Number(e.detail.value)
      const value = this.data.amountOptions[index].value
      this.triggerEvent('fieldChange', { field: 'amount', value })
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