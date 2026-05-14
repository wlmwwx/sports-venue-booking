const cloud = require('wx-server-sdk');
const jwt = require('jsonwebtoken');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const JWT_SECRET = 'sports-venue-booking-secret';

exports.main = async (event) => {
  const { action, token } = event;
  const user = verifyUser(token);

  switch (action) {
    case 'addCourt': return addCourt(user, event);
    case 'listCourts': return listCourts(event.venueId);
    case 'updateCourt': return updateCourt(user, event);
    case 'deleteCourt': return deleteCourt(user, event.courtId);
    case 'generateSlots': return generateSlots(user, event);
    case 'closeDay': return closeDay(user, event);
    default: return { success: false, error: '未知操作' };
  }
};

function verifyUser(token) {
  if (!token) throw new Error('未登录');
  try { return jwt.verify(token, JWT_SECRET); } catch { throw new Error('令牌无效'); }
}

// 场地号 CRUD
async function addCourt(user, event) {
  const { venueId, name, type, surface, capacity } = event;
  const { data: [v] } = await db.collection('venues').doc(venueId).get();
  if (!v || v.ownerId !== user.userId) return { success: false, error: '无权操作' };

  const { _id } = await db.collection('courts').add({
    data: { venueId, name, type: type || 'indoor', surface: surface || '', capacity: capacity || 0, createdAt: db.serverDate() },
  });
  return { success: true, courtId: _id };
}

async function listCourts(venueId) {
  const { data } = await db.collection('courts').where({ venueId }).get();
  return { success: true, courts: data };
}

async function updateCourt(user, event) {
  const { courtId, ...fields } = event;
  const { data: [c] } = await db.collection('courts').doc(courtId).get();
  if (!c) return { success: false, error: '不存在' };
  const { data: [v] } = await db.collection('venues').doc(c.venueId).get();
  if (v.ownerId !== user.userId) return { success: false, error: '无权操作' };
  await db.collection('courts').doc(courtId).update({ data: fields });
  return { success: true };
}

async function deleteCourt(user, courtId) {
  const { data: [c] } = await db.collection('courts').doc(courtId).get();
  if (!c) return { success: false, error: '不存在' };
  const { data: [v] } = await db.collection('venues').doc(c.venueId).get();
  if (v.ownerId !== user.userId) return { success: false, error: '无权操作' };
  await db.collection('courts').doc(courtId).remove();
  return { success: true };
}

// 时段生成
async function generateSlots(user, event) {
  const { courtId, dates, startTime, endTime, slotDuration, weekdayPrice, weekendPrice, peakPrice } = event;
  const { data: [c] } = await db.collection('courts').doc(courtId).get();
  if (!c) return { success: false, error: '场地不存在' };
  const { data: [v] } = await db.collection('venues').doc(c.venueId).get();
  if (v.ownerId !== user.userId) return { success: false, error: '无权操作' };

  const duration = slotDuration || 60; // 默认60分钟
  const slots = [];
  for (const date of dates) {
    let current = parseTime(startTime);
    const end = parseTime(endTime);
    while (current + duration <= end) {
      const startStr = formatTime(current);
      const endStr = formatTime(current + duration);
      const dayOfWeek = new Date(date).getDay();
      let price = dayOfWeek === 0 || dayOfWeek === 6 ? (weekendPrice || weekdayPrice) : weekdayPrice;
      if (peakPrice && ((current >= 1080 && current <= 1200) || (current >= 1020 && current <= 1260))) price = peakPrice;
      slots.push({ courtId, date, startTime: startStr, endTime: endStr, price, status: 'available' });
      current += duration;
    }
  }

  // 批量 upsert：删除旧记录再插入
  for (const date of dates) {
    await db.collection('time_slots').where({ courtId, date }).remove();
  }
  for (const s of slots) {
    await db.collection('time_slots').add({ data: s });
  }
  return { success: true, count: slots.length };
}

async function closeDay(user, event) {
  const { courtId, date } = event;
  const { data: [c] } = await db.collection('courts').doc(courtId).get();
  const { data: [v] } = await db.collection('venues').doc(c.venueId).get();
  if (v.ownerId !== user.userId) return { success: false, error: '无权操作' };
  await db.collection('time_slots').where({ courtId, date }).update({ data: { status: 'unavailable' } });
  return { success: true };
}

function parseTime(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function formatTime(m) { const h = Math.floor(m / 60).toString().padStart(2, '0'); const min = (m % 60).toString().padStart(2, '0'); return `${h}:${min}`; }
