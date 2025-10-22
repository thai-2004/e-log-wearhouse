// Simple test server without MongoDB
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(3001, () => {
  console.log('🚀 Test server running on port 3001');
});
