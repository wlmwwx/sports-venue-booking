const { getVenues } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    venues: [],
    sportTypes: ['全部', '羽毛球', '篮球', '网球', '游泳', '足球', '乒乓球', '健身'],
    activeSport: '全部',
  },

  onLoad() {
    this.loadVenues();
  },

  onShow() {
    if (app.globalData.openid) this.loadVenues();
  },

  loadVenues() {
    const sport = this.data.activeSport === '全部' ? '' : this.data.activeSport;
    getVenues(sport).then((res) => {
      this.setData({ venues: res.venues || [] });
    });
  },

  switchSport(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ activeSport: type });
    this.loadVenues();
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/venue-detail/venue-detail?id=${id}` });
  },
});
