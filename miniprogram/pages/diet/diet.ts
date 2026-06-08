// diet.ts
import { get, post } from '../../utils/request'

const DIET_API = '/diet'
const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getWeekDays(referenceDate: Date): { date: Date; dateStr: string }[] {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const day = referenceDate.getDate()
  const dayOfWeek = referenceDate.getDay()

  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(year, month, day + mondayOffset)

  const days: { date: Date; dateStr: string }[] = []
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000)
    days.push({
      date: currentDate,
      dateStr: formatDate(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
      ),
    })
  }

  return days
}

function getWeekLabel(referenceDate: Date): string {
  const days = getWeekDays(referenceDate)
  const firstDay = days[0].date
  const lastDay = days[6].date

  const firstMonth = firstDay.getMonth() + 1
  const lastMonth = lastDay.getMonth() + 1
  const firstDate = firstDay.getDate()
  const lastDate = lastDay.getDate()
  const year = firstDay.getFullYear()

  if (firstMonth === lastMonth) {
    return `${year}年${firstMonth}月${firstDate}日 - ${lastDate}日`
  } else {
    return `${year}年${firstMonth}月${firstDate}日 - ${lastMonth}月${lastDate}日`
  }
}

function getWeekRangeStr(referenceDate: Date): { startDate: string; endDate: string } {
  const days = getWeekDays(referenceDate)
  return {
    startDate: days[0].dateStr,
    endDate: days[6].dateStr,
  }
}

interface DietItem {
  id: number
  time: number
  recipeId: string
  recipeName: string
  recipeType: number
}

interface DayRecord {
  dayName: string
  dayDate: string
  isToday: boolean
  isFuture: boolean
  meals: {
    [mealType: number]: DietItem[]
  }
}

type ViewMode = 'record' | 'plan'

const MEAL_TYPES = [
  { value: 1, label: '早餐' },
  { value: 2, label: '午餐' },
  { value: 3, label: '晚餐' },
  { value: 4, label: '其他' },
]

interface WeekDayInfo {
  dateStr: string
  month: number
  day: number
  dayIndex: number
}

const MEAL_OPTIONS = [
  { value: 1, label: '早餐' },
  { value: 2, label: '午餐' },
  { value: 3, label: '晚餐' },
  { value: 4, label: '其他' },
]

const RECIPE_TYPE_OPTIONS = [
  { value: 0, label: '全部' },
  { value: 4, label: '主食' },
  { value: 1, label: '荤菜' },
  { value: 2, label: '素菜' },
  { value: 3, label: '水果' },
  { value: 5, label: '其他' },
]

interface Recipe {
  id: number
  name: string
  type: number
  typeDesc: string
  desc: string
  recipeRes: string
}

Component({
  data: {
    currentDate: Date.now(),
    weekLabel: '',
    dateRange: '',
    weekDays: [] as WeekDayInfo[],
    weekRecords: {} as { [date: string]: DayRecord },
    viewMode: 'record' as ViewMode,
    loading: false,
    todayStr: formatDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
    mealTypes: MEAL_TYPES,
    // 表单相关
    formVisible: false,
    formMode: 'add' as 'add' | 'edit',
    formDate: '',
    formMealType: 1,
    formDietDesc: '',
    recipes: [] as Recipe[],
    filteredRecipes: [] as { id: number; name: string; label: string; type: number }[],
    filterType: 0,
    selectedRecipe: null as Recipe | null,
    selectedRecipeIndex: 0,
    submitting: false,
    loadingRecipes: false,
    recipeTypeOptions: RECIPE_TYPE_OPTIONS,
    mealOptions: MEAL_OPTIONS,
    // 下拉刷新
    refresherTriggered: false,
  },
  lifetimes: {
    attached() {
      this.refreshWeekData()
    },
  },
  methods: {
    refreshWeekData() {
      const currentDate = new Date(this.data.currentDate)
      const weekDaysRaw = getWeekDays(currentDate)
      const weekLabel = getWeekLabel(currentDate)
      const range = getWeekRangeStr(currentDate)
      const weekDays: WeekDayInfo[] = weekDaysRaw.map((item) => ({
        dateStr: item.dateStr,
        month: item.date.getMonth() + 1,
        day: item.date.getDate(),
        dayIndex: item.date.getDay() === 0 ? 6 : item.date.getDay() - 1,
      }))
      this.setData({
        weekDays,
        weekLabel,
        dateRange: `${range.startDate} ~ ${range.endDate}`,
      }, () => {
        this.fetchWeekRecords()
      })
    },
    fetchWeekRecords() {
      this.setData({ loading: true })
      const currentDate = new Date(this.data.currentDate)
      const { startDate, endDate } = getWeekRangeStr(currentDate)
      const type = this.data.viewMode === 'record' ? 1 : 2

      get<{ date: string; recipes: DietItem[] }[]>(DIET_API + '/query', {
        startDate,
        endDate,
        type,
      }).then((res: { date: string; recipes: DietItem[] }[]) => {
        const weekDays = this.data.weekDays
        const todayStr = this.data.todayStr
        const records: { [date: string]: DayRecord } = {}

        weekDays.forEach((dayInfo) => {
          const dateStr = dayInfo.dateStr
          const date = new Date(dateStr)
          records[dateStr] = {
            dayName: DAY_NAMES[dayInfo.dayIndex],
            dayDate: `${dayInfo.month}月${dayInfo.day}日`,
            isToday: dateStr === todayStr,
            isFuture: date > new Date(),
            meals: { 1: [], 2: [], 3: [], 4: [] }
          }
        })

        if (res && Array.isArray(res)) {
          res.forEach((dietDate) => {
            const dateStr = dietDate.date
            if (dateStr && records[dateStr] && dietDate.recipes) {
              dietDate.recipes.forEach((item: DietItem) => {
                const mealType = item.time
                if (records[dateStr].meals[mealType]) {
                  records[dateStr].meals[mealType].push(item)
                }
              })
            }
          })
        }

        this.setData({ weekRecords: records, loading: false })
      }).catch(() => {
        this.setData({ loading: false })
        wx.showToast({ title: '获取饮食记录失败', icon: 'none' })
      })
    },
    handlePrevWeek() {
      const currentDate = new Date(this.data.currentDate)
      currentDate.setDate(currentDate.getDate() - 7)
      this.setData({ currentDate: currentDate.getTime() }, () => {
        this.refreshWeekData()
      })
    },
    handleNextWeek() {
      const currentDate = new Date(this.data.currentDate)
      currentDate.setDate(currentDate.getDate() + 7)
      this.setData({ currentDate: currentDate.getTime() }, () => {
        this.refreshWeekData()
      })
    },
    handleViewModeChange(e: any) {
      const mode = e.currentTarget.dataset.mode as ViewMode
      this.setData({ viewMode: mode }, () => {
        this.fetchWeekRecords()
      })
    },
    handleAddMeal(e: any) {
      const { date, mealType, mealLabel } = e.currentTarget.dataset
      this.showAddForm(date, Number(mealType))
    },
    handleDeleteMeal(e: any) {
      const id = e.currentTarget.dataset.id
      wx.showModal({
        title: '确认删除',
        content: '确定要删除该饮食记录吗？删除后不可恢复。',
        confirmText: '删除',
        confirmColor: '#ff4d4f',
        success: (res) => {
          if (res.confirm) {
            get(DIET_API + '/delete/' + id).then(() => {
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.fetchWeekRecords()
            }).catch(() => {
              wx.showToast({ title: '删除失败', icon: 'none' })
            })
          }
        },
      })
    },
    onRefresherRefresh() {
      this.setData({ refresherTriggered: true })
      this.fetchWeekRecords()
      // 延迟关闭刷新状态，避免闪烁太快
      setTimeout(() => {
        this.setData({ refresherTriggered: false })
      }, 500)
    },
    showAddForm(date: string, mealType: number) {
      this.setData({
        formVisible: true,
        formMode: 'add',
        formDate: date,
        formMealType: mealType,
        formDietDesc: '',
        filterType: 0,
        selectedRecipe: null,
      }, () => {
        this.loadRecipes()
      })
    },
    hideForm() {
      this.setData({ formVisible: false })
    },
    loadRecipes() {
      this.setData({ loadingRecipes: true })
      get<{ list: Recipe[] }>('/recipe/query', { pageNum: 1, pageSize: 1000 }).then((res: { list: Recipe[] }) => {
        const recipes = res.list || []
        this.setData({ recipes, loadingRecipes: false }, () => {
          this.updateFilteredRecipes()
        })
      }).catch(() => {
        this.setData({ loadingRecipes: false })
        wx.showToast({ title: '加载菜谱列表失败', icon: 'none' })
      })
    },
    updateFilteredRecipes() {
      const { recipes, filterType } = this.data
      const filtered = (filterType === 0 ? recipes : recipes.filter((r: Recipe) => Number(r.type) === filterType)).map((r: Recipe) => ({
        id: r.id,
        name: r.name,
        label: `${r.name} (${r.typeDesc || (r.type === 1 ? '荤菜' : r.type === 2 ? '素菜' : r.type === 3 ? '水果' : r.type === 4 ? '主食' : '其他')})`,
        type: r.type,
      }))
      this.setData({ filteredRecipes: filtered, selectedRecipeIndex: 0, selectedRecipe: null })
    },
    handleFilterTypeChange(e: any) {
      const typeValue = Number(e.currentTarget.dataset.type)
      this.setData({ filterType: typeValue }, () => {
        this.updateFilteredRecipes()
      })
    },
    handleRecipeChange(e: any) {
      const index = e.detail.value
      const filteredRecipes = this.data.filteredRecipes
      if (index >= 0 && index < filteredRecipes.length) {
        const recipeId = filteredRecipes[index].id
        const recipes: Recipe[] = this.data.recipes
        const recipe = recipes.find((r: Recipe) => r.id === recipeId)
        this.setData({
          selectedRecipe: recipe || null,
          selectedRecipeIndex: index,
        })
      }
    },
    preventBubble() {
      // 阻止事件冒泡
    },
    handleDietDescInput(e: any) {
      this.setData({ formDietDesc: e.detail.value })
    },
    handleSubmit() {
      const { formDate, formMealType, selectedRecipe, formDietDesc, formMode } = this.data
      if (!selectedRecipe) {
        wx.showToast({ title: '请选择菜谱', icon: 'none' })
        return
      }
      this.setData({ submitting: true })
      const type = this.data.viewMode === 'record' ? 1 : 2
      if (formMode === 'add') {
        post(DIET_API + '/add', {
          date: formDate,
          time: formMealType,
          recipeId: String(selectedRecipe.id),
          type,
          desc: formDietDesc,
        }).then(() => {
          wx.showToast({ title: '添加成功', icon: 'success' })
          this.setData({ formVisible: false, submitting: false })
          this.fetchWeekRecords()
        }).catch(() => {
          this.setData({ submitting: false })
          wx.showToast({ title: '添加失败', icon: 'none' })
        })
      }
    },
  },
})
