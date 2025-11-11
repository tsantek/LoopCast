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


// Fetch schedule for video player
export async function fetchSchedule() {
  // const res = await fetch("http://localhost:3000/api/schedule");
  // if (!res.ok) throw new Error("Failed to fetch schedule");

  // demo schedule data 
  let fake_data = [
    { id: 2, type: "image", title: "image_1", url: "http://localhost:3001/api/video_stream/image_1.png", duration: 5 },
    { id: 1, type: "video", title: "video_1", url: "http://localhost:3001/api/video_stream/video_1.mp4", duration: 10 },
    { id: 3, type: "video", title: "video_2", url: "http://localhost:3001/api/video_stream/video_2.mp4", duration: 10 },
    { id: 4, type: "image", title: "image_1", url: "http://localhost:3001/api/video_stream/image_1.png", duration: 5 },
    
  ];
  return fake_data;
}