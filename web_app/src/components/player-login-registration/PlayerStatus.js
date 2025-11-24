import { useState, useEffect, useRef } from "react";
import PlayerRegistration from "./PlayerRegistration";
import PlayerLogin from "./PlayerLogin";
import FullscreenPlayer from "../video-player/VideoPlayer";

export default function PlayerStatus() {

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  const checkStoredPlayer = () => {
    let playerData = localStorage.getItem("player");
    console.log("Retrieved player data from localStorage:", playerData);
    if (playerData) {
      playerData = JSON.parse(playerData);
      setPlayer(playerData);
    }
    setLoading(false);
  };


   // Start the interval once on mount
  useEffect(() => {
    setLoading(true);
    checkStoredPlayer();
    intervalRef.current = setInterval(() => {
      checkStoredPlayer();
      console.log("Running every 10 seconds");
    }, 10000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Stop interval when player becomes active
  useEffect(() => {
    if (player && player.status === "active" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setPlayer(player); // Ensure state is updated

    }
  }, [player]);

  const restartPlayer = () => {
  localStorage.removeItem("player");
  window.location.reload();
  };

  if (player && player.status === "active") {
    console.log("Rendering active player status:", player);
  }

  if (!player && loading) {
    return <p>Loading player status...</p>;
  }

  if (!player || player.status !== "active" && !loading) {
    return (
    <div className="container">
      <PlayerRegistration />
      <div className="card text-center mt-3">
          <p className="mt-3">
            If you have already registered your player, please press the link below to login.
          </p>
          <div className="text-center mt-1">
              <PlayerLogin />
              </div>
          </div>
          <div className="text-center mt-1 p-5">
              <button className="btn btn-danger" onClick={restartPlayer}>Restart Player Registration</button>
          </div>
    </div>)
  }
  return (
    <div>
      <FullscreenPlayer playerId={player.id} />
    </div>
  
  )
  
}
