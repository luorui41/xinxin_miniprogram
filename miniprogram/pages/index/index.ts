// index.ts
import { get } from '../../utils/request'

interface UserInfo {
  name: string
  nickName: string
  birthday: string
  age: string
}

interface DietSummaryItem {
  recipeName: string
  recipeType: number
  typeDesc: string
  count: number
}

interface DietSummaryGroup {
  typeDesc: string
  count: number
  recipeCount: number
}

function formatDateStr(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
    mondayStr: '',
    todayStr: '',
    // 下拉刷新
    refresherTriggered: false,
  },
  lifetimes: {
    attached() {
      this.fetchUserInfo()
      this.fetchDietSummary()
    }
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar()?.setSelected(0)
      }
      this.fetchDietSummary()
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
        const res = await get<DietSummaryItem[]>('/diet/summary', {
          startDate: mondayStr,
          endDate: todayStr,
        })
        const list = res as DietSummaryItem[];
        // 按菜谱类型汇总食用次数
        const typeMap = new Map<string, DietSummaryGroup>()
        list.forEach((item) => {
          const key = item.typeDesc || '其他'
          if (typeMap.has(key)) {
            const existing = typeMap.get(key)!
            existing.count += item.count
            existing.recipeCount += 1
          } else {
            typeMap.set(key, { typeDesc: key, count: item.count, recipeCount: 1 })
          }
        })
        const summaryList = Array.from(typeMap.values())
        this.setData({ dietSummary: summaryList, mondayStr, todayStr })
      } catch (err) {
        console.error('获取饮食小结失败:', err)
      } finally {
        this.setData({ dietSummaryLoading: false })
      }
    },
  }
})
