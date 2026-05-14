const { createOrder } = require('../../utils/api');

Page({
  data: {
    courtId: '',
    slotId: '',
    date: '',
    time: '',
    price: 0,
    loading: false,
  },

  onLoad(options) {
    this.setData({
      courtId: options.courtId,
      slotId: options.slotId,
      date: options.date,
      time: options.time,
      price: options.price,
    });
  },

  confirmBook() {
    this.setData({ loading: true });
    createOrder(this.data.courtId, this.data.slotId).then((res) => {
      if (res.success) {
        wx.showToast({ title: '预定成功', icon: 'success' });
        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1500);
      } else {
        wx.showToast({ title: res.error || '预定失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '预定失败', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },
});
