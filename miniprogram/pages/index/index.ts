// index.ts
import { get } from '../../utils/request'

interface UserInfo {
  name: string
  nickName: string
  birthday: string
  age: string
}

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

interface ToiletHardnessItem {
  hardness: number
  count: number
}

interface ToiletAmountItem {
  amount: number
  count: number
}

interface ToiletSummary {
  toiletCount: number
  hardnessItems: ToiletHardnessItem[]
  amountItems: ToiletAmountItem[]
}

interface SleepSummary {
  sleepDuration: string
  wakeupTimes: number
  sleepTimes: number
  sleepDurationDayTime: string
  sleepDurationNightTime: string
}

function formatDateStr(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateStrForDisplay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

Component({
  data: {
    userInfo: null as UserInfo | null,
    loading: true,
    // 饮食小结
    dietSummary: [] as DietSummaryGroup[],
    dietSummaryLoading: false,
    // 如厕小结
    toiletSummary: null as ToiletSummary | null,
    toiletSummaryLoading: false,
    // 睡眠小结
    sleepSummary: null as SleepSummary | null,
    sleepSummaryLoading: false,
    mondayStr: '',
    todayStr: '',
    // 下拉刷新
    refresherTriggered: false,
  },
  lifetimes: {
    attached() {
      this.fetchUserInfo()
      this.fetchDietSummary()
      this.fetchToiletSummary()
      this.fetchSleepSummary()
    }
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar()?.setSelected(0)
      }
      this.fetchDietSummary()
      this.fetchToiletSummary()
      this.fetchSleepSummary()
    }
  },
  methods: {
    async fetchUserInfo() {
      this.setData({ loading: true })
      try {
        const res = await get<UserInfo>('/user/query')
        this.setData({ userInfo: res })
      } catch (err) {
        console.error('获取用户信息失败:', err)
      } finally {
        this.setData({ loading: false })
      }
    },
    async onRefresherRefresh() {
      this.setData({ refresherTriggered: true })
      await this.fetchUserInfo()
      await this.fetchDietSummary()
      await this.fetchToiletSummary()
      await this.fetchSleepSummary()
      setTimeout(() => {
        this.setData({ refresherTriggered: false })
      }, 500)
    },
    goToDiet() {
      wx.switchTab({
        url: '/pages/diet/diet',
      })
    },
    async fetchDietSummary() {
      this.setData({ dietSummaryLoading: true })
      try {
        const today = new Date()
        const monday = getMonday(today)
        const mondayStr = formatDateStr(monday)
        const todayStr = formatDateStr(today)
        const mondayDisplayStr = formatDateStrForDisplay(monday)
        const todayDisplayStr = formatDateStrForDisplay(today)
        const res = await get<any[]>('/diet/summary', {
          startDate: mondayStr,
          endDate: todayStr,
        })
        const typeMap = new Map<string, DietSummaryGroup>()
        res.forEach((item: any) => {
          const key = item.typeDesc || '其他'
          if (typeMap.has(key)) {
            const existing = typeMap.get(key)!
            existing.count += item.count
            existing.recipeCount += 1
            existing.recipes.push({ recipeName: item.recipeName, count: item.count })
          } else {
            typeMap.set(key, { 
              typeDesc: key, 
              count: item.count, 
              recipeCount: 1,
              recipes: [{ recipeName: item.recipeName, count: item.count }]
            })
          }
        })
        const summaryList = Array.from(typeMap.values())
        this.setData({ dietSummary: summaryList, mondayStr: mondayDisplayStr, todayStr: todayDisplayStr })
      } catch (err) {
        console.error('获取饮食小结失败:', err)
      } finally {
        this.setData({ dietSummaryLoading: false })
      }
    },
    goToToilet() {
      wx.navigateTo({
        url: '/pages/toilet/toilet',
      })
    },
    async fetchToiletSummary() {
      this.setData({ toiletSummaryLoading: true })
      try {
        const today = new Date()
        const monday = getMonday(today)
        const mondayStr = formatDateStr(monday)
        const todayStr = formatDateStr(today)
        const res = await get<ToiletSummary>('/toilet/summary', {
          startDate: mondayStr,
          endDate: todayStr,
        })
        this.setData({ toiletSummary: res })
      } catch (err) {
        console.error('获取如厕小结失败:', err)
      } finally {
        this.setData({ toiletSummaryLoading: false })
      }
    },
    goToSleep() {
      wx.navigateTo({
        url: '/pages/sleep/sleep',
      })
    },
    async fetchSleepSummary() {
      this.setData({ sleepSummaryLoading: true })
      try {
        const today = new Date()
        const monday = getMonday(today)
        const mondayStr = formatDateStr(monday)
        const todayStr = formatDateStr(today)
        const res = await get<SleepSummary>('/sleep/summary', {
          startDate: mondayStr,
          endDate: todayStr,
        })
        this.setData({ sleepSummary: res })
      } catch (err) {
        console.error('获取睡眠小结失败:', err)
      } finally {
        this.setData({ sleepSummaryLoading: false })
      }
    },
  }
})
