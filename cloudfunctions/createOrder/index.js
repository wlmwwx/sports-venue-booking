const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { courtId, slotId } = event;

  const transaction = await db.startTransaction();

  try {
    // 1. 查询时段状态
    const { data: slots } = await transaction.collection('time_slots').where({
      _id: slotId, courtId, status: 'available',
    }).get();

    if (slots.length === 0) {
      await transaction.rollback();
      return { success: false, error: '该时段已被预定或不可用' };
    }

    const slot = slots[0];

    // 2. 锁定时段
    await transaction.collection('time_slots').doc(slotId).update({
      data: { status: 'booked', orderId: null }, // orderId 在创建订单后更新
    });

    // 3. 创建订单
    const { _id: orderId } = await transaction.collection('orders').add({
      data: {
        userId: OPENID,
        courtId,
        slotId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        status: 'pending', // 待使用
        createdAt: db.serverDate(),
      },
    });

    // 4. 更新时段关联订单
    await transaction.collection('time_slots').doc(slotId).update({
      data: { orderId },
    });

    await transaction.commit();
    return { success: true, orderId, slot };
  } catch (err) {
    await transaction.rollback();
    return { success: false, error: err.message };
  }
};
