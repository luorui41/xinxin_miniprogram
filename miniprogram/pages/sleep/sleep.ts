import { get, post } from '../../utils/request'

const SLEEP_API = '/sleep'

interface SleepRecord {
  id: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  wakeTimes: number
  desc: string
}

interface DayInfo {
  dateStr: string
  dayStr: string
  dayName: string
  sleepRecords: SleepRecordWithPosition[]
}

const DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日']

interface SleepRecordWithPosition extends SleepRecord {
  startPercent: number
  widthPercent: number
}

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

// 将日期字符串增加一天
function addOneDay(dateStr: string): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + 1)
  return formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

// 计算单天内睡眠的位置
function calculateSingleDayPosition(startTime: string, endTime: string): { startPercent: number; widthPercent: number } {
  const startHour = parseInt(startTime.split(':')[0], 10)
  const startMinute = parseInt(startTime.split(':')[1], 10)
  const endHour = parseInt(endTime.split(':')[0], 10)
  const endMinute = parseInt(endTime.split(':')[1], 10)
  
  const startPercent = ((startHour * 60 + startMinute) / (24 * 60)) * 100
  const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
  const widthPercent = (durationMinutes / (24 * 60)) * 100
  
  return { startPercent, widthPercent }
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
    formStartDate: '',
    formEndDate: '',
    formStartTime: '',
    formEndTime: '',
    formWakeTimes: 0,
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
          sleepRecords: [],
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
      
      get<SleepRecord[]>(SLEEP_API + '/query', {
        startDate,
        endDate,
      }).then((res: SleepRecord[]) => {
        const days = this.data.days
        
        // 创建日期到记录的映射
        const recordMap = new Map<string, SleepRecordWithPosition[]>()
        
        if (res && Array.isArray(res)) {
          res.forEach((record) => {
            // 计算第一天的睡眠位置
            const firstDayPosition = calculateSingleDayPosition(record.startTime, record.endDate === record.startDate ? record.endTime : '24:00')
            
            // 添加到开始日期
            if (!recordMap.has(record.startDate)) {
              recordMap.set(record.startDate, [])
            }
            recordMap.get(record.startDate)!.push({
              ...record,
              startPercent: firstDayPosition.startPercent,
              widthPercent: firstDayPosition.widthPercent,
            })
            
            // 如果跨天，计算第二天的睡眠位置并添加
            if (record.endDate !== record.startDate) {
              const secondDayDate = addOneDay(record.startDate)
              // 检查第二天是否在当前周范围内
              if (secondDayDate >= startDate && secondDayDate <= endDate) {
                const secondDayPosition = calculateSingleDayPosition('00:00', record.endTime)
                
                if (!recordMap.has(secondDayDate)) {
                  recordMap.set(secondDayDate, [])
                }
                recordMap.get(secondDayDate)!.push({
                  ...record,
                  startPercent: secondDayPosition.startPercent,
                  widthPercent: secondDayPosition.widthPercent,
                })
              }
            }
          })
        }
        
        // 更新每天的睡眠记录
        const updatedDays = days.map((day) => {
          const records = recordMap.get(day.dateStr) || []
          return {
            ...day,
            sleepRecords: records,
          }
        })
        
        this.setData({ days: updatedDays, loading: false })
      }).catch(() => {
        this.setData({ loading: false })
        wx.showToast({ title: '获取睡眠记录失败', icon: 'none' })
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
    handleAddSleep(e: any) {
      const { date } = e.detail
      this.setData({
        formVisible: true,
        formMode: 'add',
        formRecordId: 0,
        formStartDate: date,
        formEndDate: date,
        formStartTime: '22:00',
        formEndTime: '06:00',
        formWakeTimes: 0,
        formDesc: '',
      })
    },
    handleEditSleep(e: any) {
      const { recordId } = e.detail
      // 从 days 数组中查找完整的记录
      const days = this.data.days
      let record = null
      for (const day of days) {
        record = day.sleepRecords.find((r: any) => r.id === recordId)
        if (record) break
      }
      
      if (record) {
        this.setData({
          formVisible: true,
          formMode: 'edit',
          formRecordId: record.id,
          formStartDate: record.startDate,
          formEndDate: record.endDate,
          formStartTime: record.startTime,
          formEndTime: record.endTime,
          formWakeTimes: record.wakeTimes,
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
        formStartDate,
        formEndDate,
        formStartTime,
        formEndTime,
        formWakeTimes,
        formDesc,
      } = this.data
      
      if (!formStartDate || !formEndDate || !formStartTime || !formEndTime) {
        wx.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      this.setData({ submitting: true })
      
      const payload = {
        startDate: formStartDate,
        endDate: formEndDate,
        startTime: formStartTime,
        endTime: formEndTime,
        wakeTimes: formWakeTimes,
        desc: formDesc,
      }
      
      if (formMode === 'add') {
        post(SLEEP_API + '/add', payload).then(() => {
          wx.showToast({ title: '添加成功', icon: 'success' })
          this.setData({ formVisible: false, submitting: false })
          this.fetchWeekRecords()
        }).catch(() => {
          this.setData({ submitting: false })
          wx.showToast({ title: '添加失败', icon: 'none' })
        })
      } else {
        post(SLEEP_API + '/update', { id: formRecordId, ...payload }).then(() => {
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
        content: '确定要删除该睡眠记录吗？删除后不可恢复。',
        confirmText: '删除',
        confirmColor: '#ff4d4f',
        success: (res) => {
          if (res.confirm) {
            get(SLEEP_API + '/delete/' + formRecordId).then(() => {
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