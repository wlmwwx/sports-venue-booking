const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();

  const db = cloud.database();
  const users = db.collection('users');

  // 查询用户是否已存在
  const { data: existing } = await users.where({ openid: OPENID }).get();

  if (existing.length === 0) {
    // 新用户，创建记录
    await users.add({
      data: {
        openid: OPENID,
        createdAt: db.serverDate(),
        role: 'user', // C 端普通用户
      },
    });
  }

  return {
    openid: OPENID,
    isNew: existing.length === 0,
  };
};
