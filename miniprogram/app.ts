// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 检查小程序更新
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {})
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        confirmText: '重启',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        },
      })
    })
    updateManager.onUpdateFailed(() => {
      wx.showToast({
        title: '新版本下载失败',
        icon: 'none',
      })
    })
  },
})