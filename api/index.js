// PrimeShow Vercel Serverless Function Bridge
// Automatically mounts Express REST API on Vercel deployment (/api/*)
const app = require('../backend/server.js');

module.exports = app;
