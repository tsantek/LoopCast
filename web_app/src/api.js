import axios from "axios";

const API_BASE_PLAYER = "http://127.0.0.1:3001/api/player";
const API_BASE_SCHEDULE = "http://127.0.0.1:3001/api/schedule";
const API_BASE_AD = "http://127.0.0.1:3001/api/ad";

// Register player and get QR code
export async function registerPlayer(token) {
  const response = await axios.post(`${API_BASE_PLAYER}/register/${token}`);
  return response.data; // { id, registration_token, qr_code_svg }
}

// Check player status
export async function getPlayerStatus(deviceName) {
  const response = await axios.get(`${API_BASE_PLAYER}/info/${deviceName}`);
  return response.data; // { device_id, registration_token, name, status, notes }
}


// Confirm registration from dashboard
export async function confirmDevice(token) {
  const response = await axios.post(`${API_BASE_PLAYER}/confirm-registration/${token}`);
  return response.data; // { message: "confirmed" }
}


export async function fetchPlayers() {
  const response = await axios.get(`${API_BASE_PLAYER}/list`);
  return response.data; // Array of players
}

export async function fetchPlayerDetails(playerId) {
  const response = await axios.get(`${API_BASE_PLAYER}/${playerId}`);
  return response.data; // { device_id, registration_token, name, status, notes }
}


// Fetch schedule for video player
export async function fetchSchedule(deviceId) {
  const response = await axios.get(`${API_BASE_SCHEDULE}/${deviceId}`);
  console.log("Fetched schedule from API:", response.data);
  return response.data; // Array of schedule items
}


// Fetch all ads
export async function fetchAds() {
  const response = await axios.get(`${API_BASE_AD}/all`);
  return response.data; // Array of ads
}

// Upload a new ad
export async function uploadAd(formData) {
  const response = await axios.post(`${API_BASE_AD}/upload`, formData);
  return response; // Uploaded ad info
}

 // Create a new schedule entry
export async function createScheduleEntry(payload) {
  const response = await axios.post(`${API_BASE_SCHEDULE}/create`, payload);
  return response.data; // Created schedule entry
}


// Update an existing schedule entry
export async function updateScheduleEntry(scheduleId, payload) {
  const response = await axios.put(`${API_BASE_SCHEDULE}/update/${scheduleId}`, payload);
  return response.data; // Updated schedule entry
}

// Delete a schedule entry
export async function deleteScheduleEntry(scheduleId) {
  const response = await axios.delete(`${API_BASE_SCHEDULE}/delete/${scheduleId}`);
  return response.data; // { message: "deleted" }
}