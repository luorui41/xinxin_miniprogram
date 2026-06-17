interface DietRecipeItem {
  recipeName: string
  count: number
}

interface DietSummaryGroup {
  typeDesc: string
  count: number
  recipeCount: number
  recipes: DietRecipeItem[]
}

Component({
  data: {
    recipeModalVisible: false,
    selectedType: null as DietSummaryGroup | null,
  },
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
    handleItemClick(e: any) {
      const item = e.currentTarget.dataset.item
      if (item && item.recipes && item.recipes.length > 0) {
        this.setData({
          recipeModalVisible: true,
          selectedType: item,
        })
      }
    },
    handleCloseModal() {
      this.setData({
        recipeModalVisible: false,
        selectedType: null,
      })
    },
    preventBubble() {
      // 阻止事件冒泡
    },
  },
})