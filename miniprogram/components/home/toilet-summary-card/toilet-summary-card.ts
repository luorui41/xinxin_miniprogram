interface HardnessItem {
  hardness: number
  count: number
}

interface AmountItem {
  amount: number
  count: number
}

interface HardnessItemWithDesc extends HardnessItem {
  desc: string
  color: string
  percentage: number
  percentageStr: string
}

interface AmountItemWithDesc extends AmountItem {
  desc: string
  color: string
  percentage: number
  percentageStr: string
}

Component({
  data: {
    hardnessItemsWithDesc: [] as HardnessItemWithDesc[],
    amountItemsWithDesc: [] as AmountItemWithDesc[],
    totalCount: 0,
  },
  properties: {
    toiletCount: {
      type: Number,
      value: 0,
      observer: function (newVal: number) {
        this.setData({ totalCount: newVal })
      },
    },
    hardnessItems: {
      type: Array,
      value: [],
      observer: function (newVal: HardnessItem[]) {
        this.updateHardnessItemsWithDesc(newVal)
      },
    },
    amountItems: {
      type: Array,
      value: [],
      observer: function (newVal: AmountItem[]) {
        this.updateAmountItemsWithDesc(newVal)
      },
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
    getHardnessDesc(hardness: number): string {
      const descMap: Record<number, string> = {
        1: '很稀',
        2: '偏稀',
        3: '正常',
        4: '偏硬',
        5: '很硬',
      }
      return descMap[hardness] || '未知'
    },
    getAmountDesc(amount: number): string {
      const descMap: Record<number, string> = {
        1: '很少',
        2: '偏少',
        3: '正常',
        4: '偏多',
        5: '很多',
      }
      return descMap[amount] || '未知'
    },
    getHardnessColor(hardness: number): string {
      const colorMap: Record<number, string> = {
        1: '#e53935',
        2: '#ff9800',
        3: '#4caf50',
        4: '#ff9800',
        5: '#e53935',
      }
      return colorMap[hardness] || '#999999'
    },
    getAmountColor(amount: number): string {
      const colorMap: Record<number, string> = {
        1: '#e53935',
        2: '#ff9800',
        3: '#4caf50',
        4: '#ff9800',
        5: '#e53935',
      }
      return colorMap[amount] || '#999999'
    },
    getPercentage(count: number): number {
      const total = this.data.totalCount
      if (total === 0) return 0
      return Math.round((count / total) * 100)
    },
    getPercentageStr(count: number): string {
      const total = this.data.totalCount
      if (total === 0) return '0.0%'
      return ((count / total) * 100).toFixed(1) + '%'
    },
    updateHardnessItemsWithDesc(items: HardnessItem[]) {
      const hardnessMap = new Map<number, number>()
      items.forEach(item => {
        hardnessMap.set(item.hardness, item.count)
      })
      const allHardness = [1, 2, 3, 4, 5]
      const withDesc = allHardness.map(hardness => {
        const count = hardnessMap.get(hardness) || 0
        return {
          hardness,
          count,
          desc: this.getHardnessDesc(hardness),
          color: this.getHardnessColor(hardness),
          percentage: this.getPercentage(count),
          percentageStr: this.getPercentageStr(count),
        }
      })
      this.setData({ hardnessItemsWithDesc: withDesc })
    },
    updateAmountItemsWithDesc(items: AmountItem[]) {
      const amountMap = new Map<number, number>()
      items.forEach(item => {
        amountMap.set(item.amount, item.count)
      })
      const allAmount = [1, 2, 3, 4, 5]
      const withDesc = allAmount.map(amount => {
        const count = amountMap.get(amount) || 0
        return {
          amount,
          count,
          desc: this.getAmountDesc(amount),
          color: this.getAmountColor(amount),
          percentage: this.getPercentage(count),
          percentageStr: this.getPercentageStr(count),
        }
      })
      this.setData({ amountItemsWithDesc: withDesc })
    },
    handleMore() {
      this.triggerEvent('more')
    },
  },
})