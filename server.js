const express = require('express');
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const secret = 'medo1';

// In-memory user storage for demo purposes
const users = [];

// Middleware to protect routes
const requireAuth = expressJwt({
  secret,
  algorithms: ['HS256'],
});

// Public Route
app.get('/home', (req, res) => {
  res.send('Welcome to the Home Page!');
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  console.log(username,password);
  console.log(123)
  const existing = users.find(u => u.username === username);
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User created successfully' });
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password} = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, secret, { expiresIn: "1h" });
  res.json({ token });
});


app.get('/dashboard', requireAuth, (req, res) => {
  res.send(`Welcome to your Dashboard, ${req.auth.username}!`);
});

// Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});