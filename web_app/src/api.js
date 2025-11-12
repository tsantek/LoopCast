import axios from "axios";

const API_BASE = "http://127.0.0.1:3001/api/player";

// Register player and get QR code
export async function registerPlayer(token) {
  const response = await axios.post(`${API_BASE}/register/${token}`);
  return response.data; // { id, registration_token, qr_code_svg }
}

// Check player status
export async function getPlayerStatus(deviceName) {
  const response = await axios.get(`${API_BASE}/info/${deviceName}`);
  return response.data; // { device_id, registration_token, name, status, notes }
}


// Confirm registration from dashboard
export async function confirmDevice(token) {
  const response = await axios.post(`${API_BASE}/confirm-registration/${token}`);
  return response.data; // { message: "confirmed" }
}


export async function fetchPlayers() {
  const response = await axios.get(`${API_BASE}/list`);
  return response.data; // Array of players
}

export async function fetchPlayerDetails(playerId) {
  const response = await axios.get(`${API_BASE}/${playerId}`);
  return response.data; // { device_id, registration_token, name, status, notes }
}


// Fetch schedule for video player
export async function fetchSchedule(deviceId) {
  const response = await axios.get(`${API_BASE}/schedule/${deviceId}`);
  console.log("Fetched schedule from API:", response.data);
  return response.data; // Array of schedule items
}