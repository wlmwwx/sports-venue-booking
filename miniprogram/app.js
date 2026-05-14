App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'your-env-id', // 替换为云开发环境 ID
      traceUser: true,
    });

    // 自动登录：调用云函数获取 openid
    wx.cloud.callFunction({
      name: 'login',
      success: (res) => {
        this.globalData.openid = res.result.openid;
        console.log('登录成功, openid:', res.result.openid);
      },
      fail: (err) => {
        console.error('登录失败:', err);
      },
    });
  },

  globalData: {
    userInfo: null,
    openid: null,
  },
});
