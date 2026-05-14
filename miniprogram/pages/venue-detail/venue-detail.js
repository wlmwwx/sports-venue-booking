const { getVenueDetail, getCourts, getTimeSlots } = require('../../utils/api');

Page({
  data: {
    venue: null,
    courts: [],
    activeCourt: null,
    date: '',
    slots: [],
    selectedSlot: null,
  },

  onLoad(options) {
    const id = options.id;
    this.setData({ date: this.today() });
    Promise.all([getVenueDetail(id), getCourts(id)]).then(([vr, cr]) => {
      this.setData({ venue: vr.venue, courts: cr.courts });
      if (cr.courts.length) {
        this.selectCourt({ currentTarget: { dataset: { id: cr.courts[0]._id } } });
      }
    });
  },

  today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  selectCourt(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCourt: id, selectedSlot: null });
    this.loadSlots(id);
  },

  loadSlots(courtId) {
    getTimeSlots(courtId, this.data.date).then((res) => {
      this.setData({ slots: res.slots || [] });
    });
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value, selectedSlot: null });
    if (this.data.activeCourt) this.loadSlots(this.data.activeCourt);
  },

  selectSlot(e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({ selectedSlot: this.data.slots[idx] });
  },

  goBook() {
    if (!this.data.selectedSlot) return;
    const { activeCourt, selectedSlot, date } = this.data;
    wx.navigateTo({
      url: `/pages/venue-booking/venue-booking?courtId=${activeCourt}&slotId=${selectedSlot._id}&date=${date}&time=${selectedSlot.startTime}-${selectedSlot.endTime}&price=${selectedSlot.price}`,
    });
  },
});
