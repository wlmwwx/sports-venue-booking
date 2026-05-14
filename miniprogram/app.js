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
  },

  globalData: {
    userInfo: null,
    openid: null,
  },
});
