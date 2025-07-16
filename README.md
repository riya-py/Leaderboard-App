#  Real-Time Leaderboard System

A comprehensive full-stack application featuring a dynamic leaderboard system with real-time updates, user management, and point tracking functionality.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Database Schema](#database-schema)
- [Real-Time Features](#real-time-features)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## 🎯 Overview

This leaderboard system allows users to select participants, claim random points, and view real-time rankings. The application features a modern, responsive UI with live updates powered by Socket.io and a robust backend API built with Node.js and MongoDB.

## ✨ Features

### Core Functionality
- **User Management**: Add new users dynamically through the frontend
- **Point Claiming**: Award random points (1-100) to selected users
- **Real-Time Rankings**: Live leaderboard updates without page refresh
- **Historical Tracking**: Complete audit trail of all point claims
- **Responsive UI**: Modern, mobile-friendly interface

### Advanced Features
- **Socket.io Integration**: Real-time bi-directional communication
- **Multiple Ranking Views**: Wealth, Live, Hourly, and Family rankings
- **Interactive Podium**: Visual top 3 performers display
- **Point History**: Comprehensive claim history with timestamps
- **Database Persistence**: All data stored in MongoDB
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠 Technology Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - Frontend framework
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **Socket.io-client** - Real-time client

## 📁 Project Structure

```
leaderboard-system/
├── server/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── node_modules/          # Backend packages
├── client/
│   ├── src/
│   │   └── components/
│   │       └── LeaderboardApp.js  # Main React component
│   ├── package.json           # Frontend dependencies
│   └── public/                # Static assets
├── README.md                  # Project documentation
└── .gitignore                 # Git ignore rules
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leaderboard-system
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure MongoDB**
   - Ensure MongoDB is running on `mongodb://localhost:27017/ranking_system`
   - Or update the connection string in `server.js`

4. **Start the backend server**
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:3000`

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the React development server**
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3001`

### Initial Data
The system automatically creates 10 sample users when first launched:
- Rahul, Kamal, Sanak, Priya, Amit, Sneha, Rohit, Kavya, Arjun, Meera

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Get All Users
```http
GET /api/users
```
Returns all users sorted by points (descending)

#### Add New User
```http
POST /api/users
Content-Type: application/json

{
  "name": "User Name"
}
```

#### Claim Points
```http
POST /api/claim/:userId
```
Awards random points (1-100) to specified user

#### Get History
```http
GET /api/history
```
Returns point claim history (last 100 records)

#### Get Specific User
```http
GET /api/users/:userId
```
Returns details of a specific user

#### Reset All Data
```http
POST /api/reset
```
Resets all points and clears history

## 🎨 Frontend Components

### LeaderboardApp Component
Main component containing:
- **User Selection Dropdown**: Choose user to claim points for
- **Claim Button**: Award random points with loading state
- **Top 3 Podium**: Visual display of top performers
- **Complete Leaderboard**: Full ranking list with user details
- **Point History**: Real-time history of all claims
- **Tab Navigation**: Multiple ranking views

### Key Features
- Real-time updates via Socket.io
- Responsive design with Tailwind CSS
- Loading states and error handling
- Modern gradient designs and animations

## 💾 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  points: Number (default: 0),
  rank: Number (default: 0),
  createdAt: Date (default: Date.now)
}
```

### History Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  userName: String,
  pointsGained: Number,
  totalPoints: Number,
  timestamp: Date (default: Date.now)
}
```

## ⚡ Real-Time Features

### Socket.io Events
- **Connection**: Client connects to server
- **rankingUpdate**: Broadcasts updated rankings to all clients
- **Real-time Data**: Instant updates when points are claimed
- **Auto-refresh**: Leaderboard updates without page reload

### Implementation
```javascript
// Server-side emission
io.emit('rankingUpdate', {
  users: updatedUsers,
  claimedBy: claimData
});

// Client-side listener
socket.on('rankingUpdate', (data) => {
  setUsers(data.users);
  // Update UI immediately
});
```

## 📱 Usage

### For Users
1. **Select a User**: Choose from the dropdown menu
2. **Claim Points**: Click the "Claim Points" button
3. **View Rankings**: See real-time leaderboard updates
4. **Add Users**: Click "Add User" to create new participants
5. **Check History**: View all past point claims

### For Administrators
- Monitor all user activities through the history panel
- Reset all data using the reset endpoint
- View detailed logs in the server console

## 🎯 Key Achievements

### Technical Excellence
- **Real-time Communication**: Seamless Socket.io integration
- **Scalable Architecture**: Modular backend with clear separation of concerns
- **Modern UI/UX**: Responsive design with smooth animations
- **Data Persistence**: Reliable MongoDB storage with proper indexing
- **Error Handling**: Comprehensive error management and user feedback

### Code Quality
- **Clean Code**: Well-structured, commented codebase
- **Best Practices**: Following React and Node.js conventions
- **Performance**: Optimized database queries and efficient rendering
- **Security**: Input validation and error handling

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ranking_system
```

### CORS Configuration
```javascript
cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
})
```

## 📊 Performance Features

- **Efficient Database Queries**: Optimized MongoDB operations
- **Real-time Updates**: Socket.io for instant data synchronization
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Boundaries**: Graceful error handling and recovery
- **Loading States**: User-friendly feedback during operations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created with ❤️ for the internship technical assessment.

---

**Note**: This system demonstrates full-stack development capabilities with modern web technologies, real-time features, and professional-grade code structure.