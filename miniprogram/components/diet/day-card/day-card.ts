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
      const date = e.currentTarget.dataset.date
      this.triggerEvent('deleteMeal', { id, date })
    },
  },
})
