// 调用云函数封装
function callCloud(name, data = {}) {
  return wx.cloud.callFunction({ name, data }).then((res) => res.result);
}

// 场馆列表
function getVenues(sportType) {
  return callCloud('venueAdmin', { action: 'listApproved', sportType });
}

// 场馆详情
function getVenueDetail(venueId) {
  return callCloud('venueAdmin', { action: 'get', venueId });
}

// 场地号列表
function getCourts(venueId) {
  return callCloud('courtAdmin', { action: 'listCourts', venueId });
}

// 可用时段
function getTimeSlots(courtId, date) {
  return callCloud('querySlots', { courtId, date });
}

// 预定
function createOrder(courtId, slotId) {
  return callCloud('createOrder', { courtId, slotId });
}

module.exports = { getVenues, getVenueDetail, getCourts, getTimeSlots, createOrder };
