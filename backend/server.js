
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');

const app = express();


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);


if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}


app.use(
  session({
    name: 'mh.sid', // this is basically a custom name of cookie bcoz it avoid confilict and when hacker see connect.sid they instanly get that we use express-session  but this just a good practice nothing else
    secret: process.env.SESSION_SECRET || 'sdfafdadfjnljkn',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 60 * 60 * 24 * 7, 
    }),
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    },
  })
);





app.get('/health', (_req, res) => res.json({ ok: true })); // this is only for check that the server is running fine or not and _ means i am ignoring this parameter nothing happen without this just a good practice 
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/upload', uploadRoutes);


app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI ,{family: 4 }) 
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(' MongoDB connection failed:', err.message);
    process.exit(1);
    // this is basically we tell nodejs stop the app bcoz db is not connect and we didnn't want to use app which have some feature crashed(all feature which are related to the db)
    
  });

  //  here family 4 means use ipv4 bcoz by default node.js use ipv6 which sometiime show an error so we avoid it 