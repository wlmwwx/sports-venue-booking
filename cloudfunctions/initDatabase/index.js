const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const results = [];

  // ===== 1. users =====
  try {
    await db.createCollection('users');
    results.push('users 集合已创建');
  } catch (e) {
    if (e.errCode === -502005) results.push('users 集合已存在');
    else throw e;
  }

  // ===== 2. venues =====
  try {
    await db.createCollection('venues');
    results.push('venues 集合已创建');
  } catch (e) {
    if (e.errCode === -502005) results.push('venues 集合已存在');
    else throw e;
  }

  // 索引：运动类型 + 地理位置
  try { await db.collection('venues').createIndex({ sportType: 1 }); } catch (e) {}
  try { await db.collection('venues').createIndex({ status: 1 }); } catch (e) {}

  // ===== 3. courts =====
  try {
    await db.createCollection('courts');
    results.push('courts 集合已创建');
  } catch (e) {
    if (e.errCode === -502005) results.push('courts 集合已存在');
    else throw e;
  }

  try { await db.collection('courts').createIndex({ venueId: 1 }); } catch (e) {}

  // ===== 4. time_slots =====
  try {
    await db.createCollection('time_slots');
    results.push('time_slots 集合已创建');
  } catch (e) {
    if (e.errCode === -502005) results.push('time_slots 集合已存在');
    else throw e;
  }

  // 组合索引：按场地号 + 日期快速查询可用时段
  try { await db.collection('time_slots').createIndex({ courtId: 1, date: 1 }); } catch (e) {}
  try { await db.collection('time_slots').createIndex({ status: 1 }); } catch (e) {}

  // ===== 5. orders =====
  try {
    await db.createCollection('orders');
    results.push('orders 集合已创建');
  } catch (e) {
    if (e.errCode === -502005) results.push('orders 集合已存在');
    else throw e;
  }

  try { await db.collection('orders').createIndex({ userId: 1, status: 1 }); } catch (e) {}
  try { await db.collection('orders').createIndex({ courtId: 1, date: 1 }); } catch (e) {}
  try { await db.collection('orders').createIndex({ createdAt: -1 }); } catch (e) {}

  return { success: true, results };
};
