Component({
  properties: {
    visible: { type: Boolean, value: false },
    formDate: { type: String, value: '' },
    formMealType: { type: Number, value: 1 },
    formDietDesc: { type: String, value: '' },
    recipes: { type: Array, value: [] },
    filteredRecipes: { type: Array, value: [] },
    filterType: { type: Number, value: 0 },
    selectedRecipe: { type: Object, value: () => ({}) },
    selectedRecipeIndex: { type: Number, value: 0 },
    submitting: { type: Boolean, value: false },
    loadingRecipes: { type: Boolean, value: false },
    mealOptions: { type: Array, value: [] },
    recipeTypeOptions: { type: Array, value: [] },
  },
  methods: {
    preventBubble() {
      // 阻止事件冒泡
    },
    hideForm() {
      this.triggerEvent('close')
    },
    handleFilterTypeChange(e: any) {
      const typeValue = Number(e.currentTarget.dataset.type)
      this.triggerEvent('filterTypeChange', { typeValue })
    },
    handleRecipeChange(e: any) {
      const index = e.detail.value
      this.triggerEvent('recipeChange', { index })
    },
    handleDietDescInput(e: any) {
      this.triggerEvent('dietDescInput', { value: e.detail.value })
    },
    handleSubmit() {
      this.triggerEvent('submit')
    },
    handleCancel() {
      this.triggerEvent('cancel')
    },
  },
})
