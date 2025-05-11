const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/user/:user_id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user.html'));
});


app.listen(5000, () => console.log('Server running on port 5000'));
