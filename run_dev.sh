#!/bin/bash

# Go to the script's directory
cd "$(dirname "$0")"

# Start the Rust server
echo "🚀 Starting Rust backend..."
cd server
# cargo watch -x run &
cargo watch -i "uploads/*" -x run &
SERVER_PID=$!

# Start the web frontend
echo "🌐 Starting web frontend..."
cd ../web_app
npm start &
WEB_PID=$!

# When the script is stopped, kill both
trap "echo '🛑 Stopping...'; kill $SERVER_PID $WEB_PID" SIGINT

# Wait for both processes
wait
echo "🛑 Development environment stopped."