import { get, post } from '../../utils/request'

const TOILET_API = '/toilet'

interface ToiletRecord {
  id: number
  date: string
  time: string
  hardness: number
  hardnessDesc: string
  amount: number
  amountDesc: string
  desc: string
}

interface DayInfo {
  dateStr: string
  dayStr: string
  dayName: string
  toiletRecords: ToiletRecord[]
}

const DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日']

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

Component({
  data: {
    currentDate: Date.now(),
    weekLabel: '',
    dateRange: '',
    days: [] as DayInfo[],
    loading: false,
    // 表单相关
    formVisible: false,
    formMode: 'add' as 'add' | 'edit',
    formRecordId: 0,
    formDate: '',
    formTime: '',
    formHardness: 3,
    formAmount: 3,
    formDesc: '',
    submitting: false,
    // 下拉刷新
    refresherTriggered: false,
  },
  lifetimes: {
    attached() {
      this.initWeekData()
    }
  },
  methods: {
    initWeekData() {
      const currentDate = new Date(this.data.currentDate)
      const weekLabel = getWeekLabel(currentDate)
      const range = getWeekRangeStr(currentDate)
      const weekDaysRaw = getWeekDays(currentDate)

      // 生成当周所有日期
      const days: DayInfo[] = weekDaysRaw.map((item) => {
        const dayIndex = item.date.getDay() === 0 ? 6 : item.date.getDay() - 1
        return {
          dateStr: item.dateStr,
          dayStr: String(item.date.getDate()),
          dayName: DAY_NAMES[dayIndex],
          toiletRecords: [],
        }
      })

      this.setData({
        weekLabel,
        dateRange: `${range.startDate} ~ ${range.endDate}`,
        days,
      }, () => {
        this.fetchWeekRecords()
      })
    },
    fetchWeekRecords() {
      this.setData({ loading: true })
      const currentDate = new Date(this.data.currentDate)
      const { startDate, endDate } = getWeekRangeStr(currentDate)

      get<ToiletRecord[]>(TOILET_API + '/query', {
        startDate,
        endDate,
      }).then((res: ToiletRecord[]) => {
        const days = this.data.days

        // 创建日期到记录的映射
        const recordMap = new Map<string, ToiletRecord[]>()

        if (res && Array.isArray(res)) {
          res.forEach((record) => {
            if (!recordMap.has(record.date)) {
              recordMap.set(record.date, [])
            }
            recordMap.get(record.date)!.push(record)
          })
        }

        // 更新每天的如厕记录
        const updatedDays = days.map((day) => {
          const records = recordMap.get(day.dateStr) || []
          return {
            ...day,
            toiletRecords: records,
          }
        })

        this.setData({ days: updatedDays, loading: false })
      }).catch(() => {
        this.setData({ loading: false })
        wx.showToast({ title: '获取如厕记录失败', icon: 'none' })
      })
    },
    handlePrevWeek() {
      const currentDate = new Date(this.data.currentDate)
      currentDate.setDate(currentDate.getDate() - 7)
      this.setData({ currentDate: currentDate.getTime() }, () => {
        this.initWeekData()
      })
    },
    handleNextWeek() {
      const currentDate = new Date(this.data.currentDate)
      currentDate.setDate(currentDate.getDate() + 7)
      this.setData({ currentDate: currentDate.getTime() }, () => {
        this.initWeekData()
      })
    },
    onRefresherRefresh() {
      this.setData({ refresherTriggered: true })
      this.fetchWeekRecords()
      setTimeout(() => {
        this.setData({ refresherTriggered: false })
      }, 500)
    },
    handleAddToilet(e: any) {
      const { date } = e.detail
      this.setData({
        formVisible: true,
        formMode: 'add',
        formRecordId: 0,
        formDate: date,
        formTime: '08:00',
        formHardness: 3,
        formAmount: 3,
        formDesc: '',
      })
    },
    handleEditToilet(e: any) {
      const { recordId } = e.detail
      // 从 days 数组中查找完整的记录
      const days = this.data.days
      let record = null
      for (const day of days) {
        record = day.toiletRecords.find((r: any) => r.id === recordId)
        if (record) break
      }

      if (record) {
        this.setData({
          formVisible: true,
          formMode: 'edit',
          formRecordId: record.id,
          formDate: record.date,
          formTime: record.time,
          formHardness: record.hardness,
          formAmount: record.amount,
          formDesc: record.desc || '',
        })
      }
    },
    hideForm() {
      this.setData({ formVisible: false })
    },
    handleFieldChange(e: any) {
      const { field, value } = e.detail
      const data: any = {}
      data[`form${field.charAt(0).toUpperCase() + field.slice(1)}`] = value
      this.setData(data)
    },
    handleSubmit() {
      const {
        formMode,
        formRecordId,
        formDate,
        formTime,
        formHardness,
        formAmount,
        formDesc,
      } = this.data

      if (!formDate || !formTime) {
        wx.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }

      this.setData({ submitting: true })

      const payload = {
        date: formDate,
        time: formTime,
        hardness: formHardness,
        amount: formAmount,
        desc: formDesc,
      }

      if (formMode === 'add') {
        post(TOILET_API + '/add', payload).then(() => {
          wx.showToast({ title: '添加成功', icon: 'success' })
          this.setData({ formVisible: false, submitting: false })
          this.fetchWeekRecords()
        }).catch(() => {
          this.setData({ submitting: false })
          wx.showToast({ title: '添加失败', icon: 'none' })
        })
      } else {
        post(TOILET_API + '/update', { id: formRecordId, ...payload }).then(() => {
          wx.showToast({ title: '修改成功', icon: 'success' })
          this.setData({ formVisible: false, submitting: false })
          this.fetchWeekRecords()
        }).catch(() => {
          this.setData({ submitting: false })
          wx.showToast({ title: '修改失败', icon: 'none' })
        })
      }
    },
    handleDelete() {
      const { formRecordId } = this.data
      wx.showModal({
        title: '确认删除',
        content: '确定要删除该如厕记录吗？删除后不可恢复。',
        confirmText: '删除',
        confirmColor: '#ff4d4f',
        success: (res) => {
          if (res.confirm) {
            get(TOILET_API + '/delete/' + formRecordId).then(() => {
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.setData({ formVisible: false })
              this.fetchWeekRecords()
            }).catch(() => {
              wx.showToast({ title: '删除失败', icon: 'none' })
            })
          }
        },
      })
    },
  },
})