//server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const res = require('express/lib/response');
const req = require('express/lib/request');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/sport');

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const UserSchema = new mongoose.Schema({
    password: String,
    email: String,          // Add email field
    firstName: String,      // Add firstName field
    lastName: String,       // Add lastName field
    phoneNumber: String,    // Add phoneNumber field
    sex: String,            // Add sex field
    favoriteSport: String   // Add favoriteSport field
  });
  
  const EventSchema = new mongoose.Schema({
    sport: String,
    description: String,
    numPersonsNeeded: Number,
    dateTime: String,
    location: {
      latitude: Number,
      longitude: Number,
    },
  });
  
  const User = mongoose.model('user', UserSchema);
  // Create Event model
const Event = mongoose.model('event', EventSchema);


app.get("/getuser",(req,res)=>
{
    User.find({}).then(function(users){
        res.json(users)
    }).catch(function(err){
        console.log(err)
    })
}
    
)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    console.log('Login attempt:', { email, password });
  
    try {
      const user = await User.findOne({ email, password });
  
      if (user) {
        res.json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Incorrect username or password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/register', async (req, res) => {
    const { password, email, firstName, lastName, phoneNumber, sex, favoriteSport } = req.body;
  
    console.log('Registration attempt:', { password, email, firstName, lastName, phoneNumber, sex, favoriteSport });
  
    try {
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        res.status(400).json({ message: 'Email already exists' });
      } else {
        const newUser = new User({
          password,
          email,
          firstName,
          lastName,
          phoneNumber,
          sex,
          favoriteSport,
        });
  
        await newUser.save();
        console.log('Registration successful');
        res.json({ message: 'Registration successful' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  // Add a new route for adding events
  app.post('/addEvent', async (req, res) => {
    const { sport, description, numPersonsNeeded, dateTime, location } = req.body;
  
    console.log('Event addition attempt:', { sport, description, numPersonsNeeded, dateTime, location });
  
    try {
      const newEvent = new Event({
        sport,
        description,
        numPersonsNeeded,
        dateTime,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
  
      await newEvent.save();
      console.log('Event added successfully');
      res.json({ message: 'Event added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  app.get('/getEvents', async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
