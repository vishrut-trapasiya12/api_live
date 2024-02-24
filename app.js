const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors()); 

const Db = 'mongodb+srv://vishrut2140:vishrutpatel@cluster0.zl4h6gl.mongodb.net/patel123?retryWrites=true&w=majority';


mongoose.connect(Db, {
}).then(() => {
  console.log("CONNECTED TO DATABASE SUCCESSFULLY");
}).catch((err) => console.log('No Connections'));




const userSchema = new mongoose.Schema({

  userId: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  ip: { type: String }
});

// Create User model
const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
  try {
    const { username, password, mobile } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const totalUsers = await User.countDocuments();
    const userId = totalUsers + 1;
    const newUser = new User({
      userId,
      username,
      password: hashedPassword,
      mobile,
      ip: "vss"
    });

    await newUser.save();

    res.status(201).json({ message: 'Signup successful', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error..!' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }


    const token = jwt.sign({ username: user.username }, 'yourSecretKeyHere', { expiresIn: '1h' });

    res.status(200).json({ user: user.username, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/user/:index', async (req, res) => {
  try {
    const index = req.params.index;
    const user = await User.findOne({ userId: index });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/user', async (req, res) => {
  try {
    const allUsers = await User.find();

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const GameSchema = new mongoose.Schema({
  imageurl: { type: String, required: true },
  gameurl: { type: String, required: true },
  gamename: { type: String, required: true },
  orientation: { type: Boolean, required: true },
  category: { type: String, required: true }
})

const Game = mongoose.model('data', GameSchema);

app.post('/addgame', async (req, res) => {
  try {
    const { imageurl, gameurl, gamename, orientation, category } = req.body;

    // Check if all required fields are provided
    if (!imageurl || !gameurl || !gamename || orientation === undefined || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if game already exists
    const existingGame = await Game.findOne({ gamename });
    if (existingGame) {
      return res.status(400).json({ error: 'Game already exists' });
    }

    // Create new games
    const newGame = new Game({
      imageurl,
      gameurl,
      gamename,
      orientation,
      category
    });

    // Save new game to database
    await newGame.save();

    res.status(201).json({ message: 'Game added successfully', game: newGame });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/games', async (req, res) => {
  try {
    const allGame = await Game.find();

    if (!allGame || allGame.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    res.status(200).json({ Games: allGame });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/games/category/:category', async (req, res) => {
  try {
    let category = req.params.category.toLowerCase(); // Convert category to lowercase

    // Find games by the provided category (case-insensitive)
    const gamesByCategory = await Game.find({ category: { $regex: new RegExp(category, 'i') } });

    if (!gamesByCategory || gamesByCategory.length === 0) {
      return res.status(404).json({ error: 'No games found for the specified category' });
    }

    res.status(200).json({ games: gamesByCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(3000);

