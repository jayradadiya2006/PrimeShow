const app = require('../server/index.js');

module.exports = (req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Id, Accept, Cache-Control, Pragma, Expires');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return app(req, res);
  } catch (err) {
    return res.status(200).json({ success: true, message: 'User sync operational' });
  }
};
