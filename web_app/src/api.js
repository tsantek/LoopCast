import axios from "axios";

const API_BASE = "http://127.0.0.1:3001/api/player";

// Register player and get QR code
export async function registerPlayer(token) {
  const response = await axios.post(`${API_BASE}/register/${token}`);
  return response.data; // { id, registration_token, qr_code_svg }
}

// Check player status
export async function getDeviceStatus(deviceId) {
  const response = await axios.get(`${API_BASE}/status/${deviceId}`);
  return response.data; // { status: "pending" | "active" }
}

// Confirm registration from dashboard
export async function confirmDevice(token) {
  const response = await axios.post(`${API_BASE}/confirm-registration/${token}`);
  return response.data; // { message: "confirmed" }
}
