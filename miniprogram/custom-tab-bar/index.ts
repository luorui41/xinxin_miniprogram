Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/images/home.png',
        selectedIconPath: '/images/home_on.png',
      },
      {
        pagePath: '/pages/diet/diet',
        text: '饮食',
        iconPath: '/images/diet.png',
        selectedIconPath: '/images/diet_on.png',
      },
    ],
  },
  methods: {
    switchTab(e: any) {
      const { path, index } = e.currentTarget.dataset
      const currentPages = getCurrentPages()
      const currentPage = currentPages[currentPages.length - 1]
      if (currentPage && currentPage.route === path.replace(/^\//, '')) {
        return
      }
      this.setData({ selected: Number(index) })
      wx.switchTab({ url: path })
    },
    setSelected(index: number) {
      this.setData({ selected: index })
    },
  },
})
