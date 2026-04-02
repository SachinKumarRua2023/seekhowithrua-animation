// SeekhoWithRua Animation Lab Authentication Handler
// Handles cross-domain login from main app (app.seekhowithrua.com)

const TOKEN_KEY = 'cosmos_auth_token';
const USER_KEY = 'cosmos_user';
const ANIMATION_WATCH_KEY = 'cosmos_animation_watch';

// Check URL for token from main app login
function checkUrlForToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userData = urlParams.get('user');
  
  if (token && userData) {
    try {
      const user = JSON.parse(decodeURIComponent(userData));
      
      // Save to localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      console.log('Animation Lab: Logged in via cross-domain token');
      return true;
    } catch (err) {
      console.error('Failed to parse user data:', err);
    }
  }
  return false;
}

// Check if user is authenticated
function checkAuth() {
  // First check URL for token (from redirect after login)
  if (checkUrlForToken()) {
    return true;
  }
  
  // Then check localStorage
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  
  if (token && user) {
    try {
      const userData = JSON.parse(user);
      return true;
    } catch (err) {
      console.error('Invalid user data in storage');
      logout();
    }
  }
  return false;
}

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem(USER_KEY);
  if (user) {
    try {
      return JSON.parse(user);
    } catch (err) {
      return null;
    }
  }
  return null;
}

// Get auth token
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Get user's display name
function getUserDisplayName() {
  const user = getCurrentUser();
  if (!user) return null;
  
  return user.first_name || user.username || user.name || user.email?.split('@')[0] || 'User';
}

// Get user's avatar URL
function getUserAvatar() {
  const user = getCurrentUser();
  if (!user) return null;
  
  if (user.profile_picture || user.picture || user.avatar) {
    return user.profile_picture || user.picture || user.avatar;
  }
  
  // Generate avatar from email
  const email = user.email || 'user';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=7f77ff&color=fff`;
}

// Show visual lock overlay (matching LMS style)
function showLoginRequiredModal(message = 'Please login to view animations and track your learning progress') {
  // Remove existing modal
  const existingModal = document.getElementById('loginRequiredModal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.id = 'loginRequiredModal';
  modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(4, 4, 15, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: 'Orbitron', sans-serif;
    ">
      <div style="
        width: 120px;
        height: 120px;
        border: 3px solid #7f77ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 60px;
        margin-bottom: 30px;
        animation: pulse 2s infinite;
      ">🎬</div>
      <h2 style="
        color: #fff;
        font-size: 28px;
        margin-bottom: 15px;
        text-align: center;
      ">Animation Lab Locked</h2>
      <p style="
        color: rgba(255,255,255,0.6);
        font-size: 14px;
        margin-bottom: 30px;
        text-align: center;
        max-width: 400px;
      ">${message}</p>
      <button onclick="window.animationAuth.redirectToLogin()" style="
        padding: 15px 40px;
        background: linear-gradient(135deg, #7f77ff, #1D9E75);
        color: #fff;
        border: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        🔐 Login to Watch
      </button>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(127, 119, 255, 0.4); }
        50% { box-shadow: 0 0 0 20px rgba(127, 119, 255, 0); }
      }
    </style>
  `;
  document.body.appendChild(modal);
}

// Close login modal
function closeLoginModal() {
  const modal = document.getElementById('loginRequiredModal');
  if (modal) modal.remove();
}

// Logout
function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.reload();
}

// Redirect to main app login
function redirectToLogin() {
  const currentUrl = encodeURIComponent(window.location.href);
  window.location.href = `https://app.seekhowithrua.com/login?redirect=${currentUrl}`;
}

// Update UI based on auth state
function updateAuthUI() {
  const isLoggedIn = checkAuth();
  const userSection = document.getElementById('userSection');
  
  if (!userSection) return;
  
  if (isLoggedIn) {
    const user = getCurrentUser();
    const displayName = getUserDisplayName();
    const avatar = getUserAvatar();
    
    userSection.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(127, 119, 255, 0.1);
        border: 1px solid rgba(127, 119, 255, 0.3);
        padding: 6px 12px;
        border-radius: 20px;
      ">
        <img src="${avatar}" alt="User" style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #7f77ff;
        ">
        <span style="
          font-size: 11px;
          color: #fff;
          font-family: 'Share Tech Mono', monospace;
        ">${displayName}</span>
        <button onclick="window.animationAuth.logout()" style="
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #ef4444;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 10px;
          cursor: pointer;
          font-family: 'Share Tech Mono', monospace;
          transition: all 0.3s;
        ">Logout</button>
      </div>
    `;
  } else {
    userSection.innerHTML = `
      <button onclick="window.animationAuth.redirectToLogin()" style="
        background: #7f77ff;
        border: none;
        color: #000;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        font-family: 'Share Tech Mono', monospace;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      ">
        <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        Sign in
      </button>
    `;
  }
}

// Animation Watch Time Tracking
// Track time spent on animations
let animationWatchStartTime = null;
let currentAnimationId = null;

// Start tracking watch time for an animation
function startWatchTracking(animationId) {
  if (!checkAuth()) return false;
  
  animationWatchStartTime = Date.now();
  currentAnimationId = animationId;
  
  console.log('Started tracking watch time for:', animationId);
  return true;
}

// Stop tracking and save watch time
function stopWatchTracking() {
  if (!checkAuth() || !animationWatchStartTime || !currentAnimationId) {
    animationWatchStartTime = null;
    currentAnimationId = null;
    return false;
  }
  
  const endTime = Date.now();
  const durationSeconds = Math.floor((endTime - animationWatchStartTime) / 1000);
  
  // Save the watch record
  saveWatchRecord(currentAnimationId, durationSeconds);
  
  console.log('Stopped tracking. Duration:', durationSeconds, 'seconds');
  
  animationWatchStartTime = null;
  currentAnimationId = null;
  
  return durationSeconds;
}

// Save a watch record
function saveWatchRecord(animationId, durationSeconds) {
  if (!checkAuth() || durationSeconds < 5) { // Ignore very short visits
    return false;
  }
  
  const user = getCurrentUser();
  const records = JSON.parse(localStorage.getItem(ANIMATION_WATCH_KEY) || '[]');
  
  const record = {
    id: Date.now(),
    userId: user.id || user.email,
    userName: getUserDisplayName(),
    animationId: animationId,
    animationName: getAnimationName(animationId),
    category: getAnimationCategory(animationId),
    watchTimeSeconds: durationSeconds,
    watchedAt: new Date().toISOString(),
  };
  
  records.push(record);
  localStorage.setItem(ANIMATION_WATCH_KEY, JSON.stringify(records));
  
  console.log('Watch record saved:', record);
  return record;
}

// Get animation name from ID
function getAnimationName(animationId) {
  const names = {
    'packet-flow': 'Packet Flow Visualizer',
    'sorting': 'Sorting Visualizer',
    'neural-network': 'Neural Network Flow'
  };
  return names[animationId] || animationId;
}

// Get animation category from ID
function getAnimationCategory(animationId) {
  const categories = {
    'packet-flow': 'Networking',
    'sorting': 'Algorithms',
    'neural-network': 'AI / ML'
  };
  return categories[animationId] || 'General';
}

// Get user's watch records
function getUserWatchRecords() {
  if (!checkAuth()) return [];
  
  const user = getCurrentUser();
  const records = JSON.parse(localStorage.getItem(ANIMATION_WATCH_KEY) || '[]');
  
  return records.filter(r => r.userId === (user.id || user.email));
}

// Get watch statistics for current user
function getWatchStats() {
  const records = getUserWatchRecords();
  
  if (records.length === 0) {
    return {
      totalWatchTime: 0,
      totalSessions: 0,
      animationsWatched: [],
      watchByCategory: {}
    };
  }
  
  const totalWatchTime = records.reduce((sum, r) => sum + (r.watchTimeSeconds || 0), 0);
  const totalSessions = records.length;
  
  // Get unique animations watched
  const animationIds = [...new Set(records.map(r => r.animationId))];
  const animationsWatched = animationIds.map(id => ({
    id: id,
    name: getAnimationName(id),
    totalTime: records
      .filter(r => r.animationId === id)
      .reduce((sum, r) => sum + (r.watchTimeSeconds || 0), 0),
    sessions: records.filter(r => r.animationId === id).length
  }));
  
  // Watch time by category
  const watchByCategory = records.reduce((acc, r) => {
    const cat = r.category || 'General';
    acc[cat] = (acc[cat] || 0) + (r.watchTimeSeconds || 0);
    return acc;
  }, {});
  
  return {
    totalWatchTime,
    totalSessions,
    animationsWatched,
    watchByCategory
  };
}

// Format time duration (seconds to readable)
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// Export for use in other scripts
window.animationAuth = {
  checkAuth,
  getCurrentUser,
  getToken,
  getUserDisplayName,
  getUserAvatar,
  logout,
  redirectToLogin,
  showLoginRequiredModal,
  closeLoginModal,
  updateAuthUI,
  startWatchTracking,
  stopWatchTracking,
  saveWatchRecord,
  getUserWatchRecords,
  getWatchStats,
  formatDuration,
  checkUrlForToken
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  updateAuthUI();
});

// Track page visibility changes to pause/resume tracking
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Page is hidden (user switched tabs)
    if (animationWatchStartTime && currentAnimationId) {
      stopWatchTracking();
    }
  }
});
