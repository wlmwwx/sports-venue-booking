const cloud = require('wx-server-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const JWT_SECRET = 'sports-venue-booking-secret'; // 生产环境替换为安全密钥

/**
 * B 端认证云函数
 * action: 'register' | 'login'
 */
exports.main = async (event) => {
  const { action, phone, password, username } = event;

  if (action === 'register') {
    return register(phone, password, username);
  }

  if (action === 'login') {
    return login(phone, password);
  }

  // 验证 token
  if (action === 'verify') {
    return verifyToken(event.token);
  }

  return { success: false, error: '未知操作' };
};

async function register(phone, password, username) {
  if (!phone || !password) {
    return { success: false, error: '手机号和密码不能为空' };
  }

  // 检查手机号是否已注册
  const { data: existing } = await db.collection('users')
    .where({ phone, role: 'admin' })
    .get();

  if (existing.length > 0) {
    return { success: false, error: '该手机号已注册' };
  }

  // 哈希密码
  const hashedPassword = await bcrypt.hash(password, 10);

  const { _id } = await db.collection('users').add({
    data: {
      phone,
      password: hashedPassword,
      username: username || '',
      role: 'admin',
      openid: '', // B 端用户可能没有 openid，后续微信扫码时绑定
      createdAt: db.serverDate(),
    },
  });

  const token = jwt.sign(
    { userId: _id, phone, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { success: true, userId: _id, token };
}

async function login(phone, password) {
  if (!phone || !password) {
    return { success: false, error: '手机号和密码不能为空' };
  }

  const { data: users } = await db.collection('users')
    .where({ phone, role: 'admin' })
    .get();

  if (users.length === 0) {
    return { success: false, error: '账号不存在' };
  }

  const user = users[0];
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return { success: false, error: '密码错误' };
  }

  const token = jwt.sign(
    { userId: user._id, phone: user.phone, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    success: true,
    userId: user._id,
    token,
    username: user.username,
  };
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { success: true, user: decoded };
  } catch (e) {
    return { success: false, error: '令牌无效或已过期' };
  }
}
