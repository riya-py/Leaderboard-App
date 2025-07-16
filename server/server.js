const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"], // Add both ports
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Enhanced CORS middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection with better error handling
mongoose.connect('mongodb://localhost:27017/ranking_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB successfully');
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// History Schema
const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  pointsGained: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const History = mongoose.model('History', historySchema);

// Function to calculate and update rankings
async function updateRankings() {
  try {
    const users = await User.find().sort({ points: -1 });
    
    const updatePromises = users.map((user, index) => {
      return User.findByIdAndUpdate(user._id, { rank: index + 1 });
    });
    
    await Promise.all(updatePromises);
    
    const updatedUsers = await User.find().sort({ points: -1 });
    return updatedUsers;
  } catch (error) {
    console.error('Error updating rankings:', error);
    throw error;
  }
}

// Initialize database with sample users
async function initializeUsers() {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      const sampleUsers = [
        { name: 'Rahul', points: 0 },
        { name: 'Kamal', points: 0 },
        { name: 'Sanak', points: 0 },
        { name: 'Priya', points: 0 },
        { name: 'Amit', points: 0 },
        { name: 'Sneha', points: 0 },
        { name: 'Rohit', points: 0 },
        { name: 'Kavya', points: 0 },
        { name: 'Arjun', points: 0 },
        { name: 'Meera', points: 0 }
      ];
      
      await User.insertMany(sampleUsers);
      await updateRankings();
      console.log('✅ Sample users created successfully!');
    }
  } catch (error) {
    console.error('❌ Error initializing users:', error);
  }
}

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ranking System API is running!',
    timestamp: new Date().toISOString()
  });
});

// Get all users with rankings
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 });
    console.log(`📊 Fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add new user
app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'User name is required' });
    }
    
    const existingUser = await User.findOne({ name: name.trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = new User({
      name: name.trim(),
      points: 0
    });
    
    await newUser.save();
    await updateRankings();
    
    console.log(`✅ User ${name} added successfully`);
    res.json({ 
      success: true, 
      message: 'User added successfully',
      user: newUser 
    });
  } catch (error) {
    console.error('❌ Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Get history
app.get('/api/history', async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 }).limit(100);
    console.log(`📝 Fetched ${history.length} history records`);
    res.json(history);
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get specific user
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Claim points (main functionality)
app.post('/api/claim/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate random points between 1-100
    const randomPoints = Math.floor(Math.random() * 100) + 1;
    
    // Update user points
    user.points += randomPoints;
    await user.save();
    
    // Create history record
    const historyRecord = new History({
      userId: user._id,
      userName: user.name,
      pointsGained: randomPoints,
      totalPoints: user.points
    });
    await historyRecord.save();
    
    // Update all rankings
    const updatedUsers = await updateRankings();
    
    // Emit real-time update
    io.emit('rankingUpdate', {
      users: updatedUsers,
      claimedBy: {
        userId: user._id,
        name: user.name,
        pointsGained: randomPoints,
        totalPoints: user.points
      }
    });
    
    console.log(`🎉 ${user.name} claimed ${randomPoints} points!`);
    
    res.json({
      success: true,
      message: `${user.name} claimed ${randomPoints} points!`,
      user: {
        id: user._id,
        name: user.name,
        points: user.points,
        pointsGained: randomPoints
      },
      rankings: updatedUsers
    });
    
  } catch (error) {
    console.error('❌ Error claiming points:', error);
    res.status(500).json({ error: 'Failed to claim points' });
  }
});

// Reset all points
app.post('/api/reset', async (req, res) => {
  try {
    await User.updateMany({}, { points: 0 });
    await History.deleteMany({});
    const updatedUsers = await updateRankings();
    
    io.emit('rankingUpdate', {
      users: updatedUsers,
      reset: true
    });
    
    console.log('🔄 All points and history reset');
    res.json({ success: true, message: 'All points and history reset successfully' });
  } catch (error) {
    console.error('❌ Error resetting:', error);
    res.status(500).json({ error: 'Failed to reset points' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id);
  
  // Send current rankings to newly connected client
  User.find().sort({ points: -1 }).then(users => {
    socket.emit('rankingUpdate', { users });
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Database connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Connected to MongoDB');
  initializeUsers();
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Disconnected from MongoDB');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/users`);
  console.log(`   - POST http://localhost:${PORT}/api/users`);
  console.log(`   - POST http://localhost:${PORT}/api/claim/:userId`);
  console.log(`   - GET  http://localhost:${PORT}/api/history`);
  console.log(`   - POST http://localhost:${PORT}/api/reset`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});