Component({
  properties: {
    dateStr: {
      type: String,
      value: '',
    },
    dayRecord: {
      type: Object,
      value: () => ({}),
    },
    mealTypes: {
      type: Array,
      value: [],
    },
  },
  methods: {
    handleAddMeal(e: any) {
      const { date, mealType, mealLabel } = e.currentTarget.dataset
      this.triggerEvent('addMeal', { date, mealType, mealLabel })
    },
    handleDeleteMeal(e: any) {
      const id = e.currentTarget.dataset.id
      this.triggerEvent('deleteMeal', { id })
    },
  },
})
