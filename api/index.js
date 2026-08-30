const app = require('../server.js');

module.exports = (req, res) => {
  if (req.url && (req.url.includes('user_sync') || req.url.includes('user-sync'))) {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    return res.status(200).json({ status: 'ok', message: 'User sync operational' });
  }
  return app(req, res);
};