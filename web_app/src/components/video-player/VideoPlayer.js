import { useState, useEffect, useRef } from "react";
import { fetchSchedule } from "../../api";

export default function FullscreenPlayer({ playerId }) {
  const [schedule, setSchedule] = useState([]);
  const [index, setIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0); // which video element is active
  const [showBlack, setShowBlack] = useState(false);
  const containerRef = useRef(null);
  const videoRefs = [useRef(null), useRef(null)];

  const current = schedule[index];

  
  useEffect(() => {
    async function loadSchedule() {
      try {
        const data = await fetchSchedule(playerId);
        console.log("Fetched schedule from API:", data);
        const mappedData = data.map((item) => ({
          ...item,
          url: `http://localhost:3001/api/video_stream/${item.file_name}`,
        }));
        console.log("Mapped schedule data:", mappedData);
        setSchedule(mappedData);
      } catch (err) {
        console.warn("Failed to fetch schedule.", err);
      }
    }
    loadSchedule();
  }, [playerId]);

  useEffect(() => {
    if (!schedule.length) return;
    const first = schedule[0];
    if (first.media_type === "video" && videoRefs[0].current) {
      const video = videoRefs[0].current;
      video.src = first.url;
      video.currentTime = 0;
      video
        .play()
        .then(() => console.log("▶️ Playing first video:", first.url))
        .catch((err) => console.warn("Play failed:", err));
    }
  }, [schedule]); // run when schedule updates


  useEffect(() => {
    if (!current || current.media_type !== "image") return;
    const timer = setTimeout(() => nextItem(), (current.duration || 10) * 1000);
    return () => clearTimeout(timer);
  }, [index, current]);

  const nextItem = () => {
    if (!schedule.length) return;
    const newIndex = (index + 1) % schedule.length;
    const next = schedule[newIndex];

    setShowBlack(true);
    setTimeout(() => {
      if (next.media_type === "video") {
        const inactive = 1 - activeVideo;
        const nextVideo = videoRefs[inactive].current;
        const currentVideo = videoRefs[activeVideo].current;
        if (!nextVideo || !currentVideo) return;

        nextVideo.src = next.url;
        nextVideo.currentTime = 0;
        nextVideo.style.opacity = 0;

        const onLoaded = () => {
          nextVideo.play().catch(() => {});
          requestAnimationFrame(() => {
            nextVideo.style.opacity = 1;
            currentVideo.style.opacity = 0;
            setTimeout(() => {
              setActiveVideo(inactive);
              setIndex(newIndex);
              setShowBlack(false);
            }, 500);
          });
          nextVideo.removeEventListener("loadeddata", onLoaded);
        };
        nextVideo.addEventListener("loadeddata", onLoaded);
      } else {
        setIndex(newIndex);
        setTimeout(() => setShowBlack(false), 500);
      }
    }, 500);
  };

  const handleVideoEnded = () => nextItem();

  const enterFullscreen = () => {
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    }
  };

  if (!current) return <div style={{ color: "white" }}>Loading schedule...</div>;


  return (
    <div
      ref={containerRef}
      onClick={enterFullscreen}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "black",
        overflow: "hidden",
      }}
    >
      {/* Black overlay */}
      {showBlack && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "black",
            zIndex: 10,
          }}
        />
      )}

      {/* Video 1 */}
      <video
        ref={videoRefs[0]}
        autoPlay
        muted
        crossOrigin="anonymous"
        onEnded={handleVideoEnded}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          opacity: activeVideo === 0 ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      />

      {/* Video 2 */}
      <video
        ref={videoRefs[1]}
        autoPlay
        muted
        crossOrigin="anonymous"
        onEnded={handleVideoEnded}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          opacity: activeVideo === 1 ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      />

      {/* Image display */}
      {current.media_type === "image" && !showBlack && (
        <img
          src={current.url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          color: "white",
          fontSize: 12,
        }}
      >
        </div>
    </div>
  );
}
