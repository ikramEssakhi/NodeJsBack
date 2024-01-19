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
    userEmail:String
  });
  
  const RequestSchema = new mongoose.Schema({
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'event',
    },
    userId: String, // Change the type to String
    status: {
      type: String,
      default: 'InProgress',
    },
    // Add any additional fields needed for the request
  });
  const Request = mongoose.model('request', RequestSchema);
  
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
    const { sport, description, numPersonsNeeded, dateTime, location, userEmail } = req.body;
  
    console.log('Event addition attempt:', { sport, description, numPersonsNeeded, dateTime, location, userEmail });
  
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
        userEmail, // Include the user's email in the event document
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

  app.post('/sendRequestToJoin', async (req, res) => {
    const { eventId, userId } = req.body;
  
    console.log('Request to join event:', { eventId, userId });
  
    try {
      const newRequest = new Request({
        eventId,
        userId,
      });
  
      await newRequest.save();
      console.log('Request sent successfully');
      res.json({ message: 'Request sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/getRequests', async (req, res) => {
    try {
      const requests = await Request.find();
      res.json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/getUser/:email', async (req, res) => {
    const email = req.params.email;
  
    try {
      const user = await User.findOne({ email });
  
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
app.post('/acceptRequest', async (req, res) => {
  const { eventId, userId } = req.body;

  try {
    const request = await Request.findOne({ eventId, userId });

    if (request) {
      request.status = 'Accepted';
      await request.save();

      res.json({ message: 'Request accepted successfully' });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/refuseRequest', async (req, res) => {
  const { eventId, userId } = req.body;

  try {
    const request = await Request.findOne({ eventId, userId });

    if (request) {
      request.status = 'Refused';
      await request.save();

      res.json({ message: 'Request refused successfully' });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    console.error('Error refusing request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/getEventsByEMail', async (req, res) => {
  try {
    const userEmail = req.query.userEmail;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    const events = await Event.find({ userEmail });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/getRequestsByUserEmail', async (req, res) => {
  try {
    const userEmail = req.query.userEmail;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEvents = await Event.find({ userEmail });
    const eventIds = userEvents.map((event) => event._id);

    const requests = await Request.find({ eventId: { $in: eventIds } });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
