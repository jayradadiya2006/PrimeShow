require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// Load & export main PrimeShow backend server engine
module.exports = require('./index.js');
