const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'TaxPal API is running'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`TaxPal backend running on port ${PORT}`);
  });
};

startServer();