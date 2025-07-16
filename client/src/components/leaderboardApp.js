import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Gift, Users, TrendingUp, Clock, Award } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const LeaderboardApp = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('wealth');
  const [timeFilter, setTimeFilter] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState(null);
  const [socket, setSocket] = useState(null);

  // API Base URL - Change this to your backend URL
  const API_BASE_URL = 'http://localhost:3000/api';

  // Initialize socket connection and fetch initial data
  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on('rankingUpdate', (data) => {
      setUsers(data.users);
      
      // If someone claimed points, add to history
      if (data.claimedBy) {
        const historyEntry = {
          id: Date.now(),
          userId: data.claimedBy.userId,
          userName: data.claimedBy.name,
          points: data.claimedBy.pointsGained,
          timestamp: new Date().toLocaleString(),
          totalPoints: data.claimedBy.totalPoints
        };
        setPointHistory(prev => [historyEntry, ...prev]);
      }
    });

    // Fetch initial data
    fetchUsers();
    fetchHistory();

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch all users from backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. Please check if backend is running.');
    }
  };

  // Fetch history from backend
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      const formattedHistory = response.data.map(entry => ({
        id: entry._id,
        userId: entry.userId,
        userName: entry.userName,
        points: entry.pointsGained,
        timestamp: new Date(entry.timestamp).toLocaleString(),
        totalPoints: entry.totalPoints
      }));
      setPointHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Claim points API call
  const claimPoints = async () => {
    if (!selectedUser) {
      alert('Please select a user first!');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/claim/${selectedUser._id}`);
      
      if (response.data.success) {
        setLastClaimTime(new Date().toLocaleString());
        alert(`🎉 ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error claiming points:', error);
      alert('Failed to claim points. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get top 3 users for podium
  const topThree = users.slice(0, 3);

  // Get rank badge color
  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  // Get rank styling
  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
  };

  // Add new user function
  const addNewUser = async () => {
    const userName = prompt('Enter new user name:');
    if (!userName || !userName.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, { 
        name: userName.trim() 
      });
      
      if (response.data.success) {
        alert(`User ${userName} added successfully!`);
        fetchUsers(); // Refresh users list
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error.response?.data?.error || 'Failed to add user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-b-3xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Live Ranking</h1>
              <p className="text-sm text-gray-500">Real-time updates enabled</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Gift className="w-6 h-6 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Rewards</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-6">
        <div className="flex bg-white rounded-full p-1 shadow-md">
          {[
            { id: 'wealth', label: 'Wealth Ranking', icon: Trophy },
            { id: 'live', label: 'Live Ranking', icon: TrendingUp },
            { id: 'hourly', label: 'Hourly Ranking', icon: Clock },
            { id: 'family', label: 'Family Ranking', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-full transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div className="px-4 mb-6">
        <div className="flex space-x-2">
          {['daily', 'monthly'].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-6 py-2 rounded-full transition-all ${
                timeFilter === filter
                  ? 'bg-white text-orange-500 shadow-md'
                  : 'bg-white/70 text-gray-600 hover:bg-white'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* User Selection & Claim Section */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Select User & Claim Points
          </h2>
          
          <div className="space-y-4">
            {/* User Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a user to claim points for:
              </label>
              <select
                value={selectedUser?._id || ''}
                onChange={(e) => {
                  const user = users.find(u => u._id === e.target.value);
                  setSelectedUser(user);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.points} points (Rank #{user.rank})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={claimPoints}
                disabled={!selectedUser || isLoading}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  !selectedUser || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Claiming...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Gift className="w-5 h-5 mr-2" />
                    Claim Points
                  </div>
                )}
              </button>
              
              <button
                onClick={addNewUser}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                Add User
              </button>
            </div>

            {lastClaimTime && (
              <p className="text-sm text-green-600 text-center">
                Last claim: {lastClaimTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-2xl p-6 text-white">
          <div className="text-center mb-4">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-xl font-bold">Top Performers</h2>
          </div>
          
          <div className="flex justify-center items-end space-x-4">
            {topThree.map((user, index) => (
              <div key={user._id} className="text-center">
                <div className={`w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2 ${
                  index === 0 ? 'scale-110' : ''
                }`}>
                  <span className="text-2xl">👤</span>
                </div>
                <div className="text-xs font-medium">{user.name}</div>
                <div className="text-lg font-bold">{user.points.toLocaleString()}</div>
                <div className="text-2xl">{getRankBadge(user.rank)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Complete Leaderboard
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(user.rank)}`}>
                    {user.rank}
                  </div>
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-500">Rank #{user.rank}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg text-orange-600">
                      {user.points.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                  
                  <div className="text-2xl">
                    {user.rank <= 3 ? getRankBadge(user.rank) : '🏆'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Point History */}
      {pointHistory.length > 0 && (
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-2xl">
              <h3 className="text-lg font-bold flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Point Claim History
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {pointHistory.map((entry) => (
                <div key={entry.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{entry.userName}</div>
                      <div className="text-sm text-gray-500">{entry.timestamp}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">+{entry.points} points</div>
                      <div className="text-sm text-gray-500">Total: {entry.totalPoints.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardApp;