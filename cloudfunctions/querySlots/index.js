const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { courtId, date } = event;
  const { data: slots } = await db.collection('time_slots')
    .where({ courtId, date })
    .orderBy('startTime', 'asc')
    .get();
  return { success: true, slots };
};
