const cloud = require('wx-server-sdk');
const jwt = require('jsonwebtoken');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const JWT_SECRET = 'sports-venue-booking-secret';

exports.main = async (event) => {
  const { action, token } = event;
  const user = verifyUser(token);

  switch (action) {
    case 'create': return createVenue(user, event);
    case 'update': return updateVenue(user, event);
    case 'myVenues': return getMyVenues(user);
    case 'get': return getVenue(event.venueId);
    case 'listPending': return listPending(user); // 平台运营
    case 'approve': return approve(user, event.venueId);
    case 'reject': return reject(user, event.venueId, event.reason);
    case 'suspend': return suspend(user, event.venueId);
    default: return { success: false, error: '未知操作' };
  }
};

function verifyUser(token) {
  if (!token) throw new Error('未登录');
  try { return jwt.verify(token, JWT_SECRET); }
  catch { throw new Error('令牌无效'); }
}

// === B 端操作 ===

async function createVenue(user, event) {
  const { name, sportTypes, address, latitude, longitude, businessHours, phone, photos, description } = event;
  if (!name || !sportTypes || !address || !phone) {
    return { success: false, error: '必填字段不完整' };
  }
  const { _id } = await db.collection('venues').add({
    data: {
      name, sportTypes, address, latitude: latitude || 0, longitude: longitude || 0,
      businessHours: businessHours || '', phone,
      photos: photos || [], description: description || '',
      status: 'pending', ownerId: user.userId,
      createdAt: db.serverDate(), updatedAt: db.serverDate(),
    },
  });
  return { success: true, venueId: _id };
}

async function updateVenue(user, event) {
  const { venueId, ...fields } = event;
  const { data: [venue] } = await db.collection('venues').doc(venueId).get();
  if (!venue) return { success: false, error: '场馆不存在' };
  if (venue.ownerId !== user.userId) return { success: false, error: '无权操作' };
  if (!['pending', 'rejected'].includes(venue.status)) return { success: false, error: '当前状态不可编辑' };

  await db.collection('venues').doc(venueId).update({
    data: { ...fields, status: 'pending', updatedAt: db.serverDate() },
  });
  return { success: true };
}

async function getMyVenues(user) {
  const { data } = await db.collection('venues').where({ ownerId: user.userId }).orderBy('createdAt', 'desc').get();
  return { success: true, venues: data };
}

async function getVenue(venueId) {
  const { data: [venue] } = await db.collection('venues').doc(venueId).get();
  return { success: true, venue };
}

// === 平台运营操作 ===

async function listPending(user) {
  if (user.role !== 'admin' && user.role !== 'super') return { success: false, error: '权限不足' };
  const { data } = await db.collection('venues').where({ status: 'pending' }).orderBy('createdAt', 'desc').get();
  return { success: true, venues: data };
}

async function approve(user, venueId) {
  if (user.role !== 'admin' && user.role !== 'super') return { success: false, error: '权限不足' };
  await db.collection('venues').doc(venueId).update({ data: { status: 'approved', updatedAt: db.serverDate() } });
  return { success: true };
}

async function reject(user, venueId, reason) {
  if (user.role !== 'admin' && user.role !== 'super') return { success: false, error: '权限不足' };
  if (!reason) return { success: false, error: '驳回原因不能为空' };
  await db.collection('venues').doc(venueId).update({
    data: { status: 'rejected', rejectReason: reason, updatedAt: db.serverDate() },
  });
  return { success: true };
}

async function suspend(user, venueId) {
  if (user.role !== 'admin' && user.role !== 'super') return { success: false, error: '权限不足' };
  await db.collection('venues').doc(venueId).update({ data: { status: 'suspended', updatedAt: db.serverDate() } });
  return { success: true };
}
