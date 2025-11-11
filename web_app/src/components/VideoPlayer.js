// import { useState, useEffect, useRef } from "react";
// import { fetchSchedule } from "../api";

// export default function FullscreenPlayer() {
//   const [schedule, setSchedule] = useState([]);
//   const [index, setIndex] = useState(0);
//   const containerRef = useRef(null);

//   const current = schedule[index];

//   // Fetch schedule from backend
//   useEffect(() => {
//     fetchSchedule().then(setSchedule).catch(console.error);
//   }, []);

//   // Auto-next for images
//   useEffect(() => {
//     if (!current || current.type !== "image") return;
//     const timer = setTimeout(() => next(), (current.duration || 10) * 1000);
//     return () => clearTimeout(timer);
//   }, [index, current]);

//   const next = () => {
//     setIndex((prev) => (prev + 1) % schedule.length);
//   };
//   console.log("Schedule:", schedule);
//   console.log("Current schedule item:", current);

//   // Video ended handler
//   const handleEnded = () => next();

//   // Fullscreen on click/tap (required on mobile)
//   const enterFullscreen = () => {
//     if (containerRef.current && !document.fullscreenElement) {
//       containerRef.current.requestFullscreen?.();
//     }
//   };

//   if (!current) return <div style={{ color: "white" }}>Loading schedule...</div>;

//   return (
//     <div
//       ref={containerRef}
//       onClick={enterFullscreen}
//       style={{
//         width: "100vw",
//         height: "100vh",
//         background: "black",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         overflow: "hidden",
//       }}
//     >
//       {current.type === "video" ? (
//         <video
//           src={current.url}
//           autoPlay
//           muted
//           onEnded={handleEnded}
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "cover",
//           }}
//         />
//       ) : (
//         <img
//           src={current.url}
//           alt={current.title}
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "cover",
//           }}
//         />
//       )}
//     </div>
//   );
// }



import { useState, useEffect, useRef } from "react";
import { fetchSchedule } from "../api";

export default function FullscreenPlayer() {
  const [schedule, setSchedule] = useState([]);
  const [index, setIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0); // 0 or 1
  const [showBlack, setShowBlack] = useState(false);
  const containerRef = useRef(null);
  const videoRefs = [useRef(null), useRef(null)];

  const current = schedule[index];

  // Fetch schedule from backend
  useEffect(() => {
    fetchSchedule().then(setSchedule).catch(console.error);
  }, []);

  // Auto-next for images
  useEffect(() => {
    if (!current || current.type !== "image") return;
    const timer = setTimeout(() => nextItem(), (current.duration || 10) * 1000);
    return () => clearTimeout(timer);
  }, [index, current]);

  const nextItem = () => {
    if (!schedule.length) return;
    const newIndex = (index + 1) % schedule.length;
    const next = schedule[newIndex];

    // Step 1: Fade to black
    setShowBlack(true);

    setTimeout(() => {
      // Step 2: Prepare next content
      if (next.type === "video") {
        const inactive = 1 - activeVideo;
        const nextVideo = videoRefs[inactive].current;
        const currentVideo = videoRefs[activeVideo].current;
        if (!nextVideo || !currentVideo) return;

        nextVideo.src = next.url;
        nextVideo.currentTime = 0;
        nextVideo.style.opacity = 0;
        nextVideo.style.transition = "opacity 0.5s";

        const onLoaded = () => {
          nextVideo.play().catch(() => {});
          requestAnimationFrame(() => {
            // Step 3: Fade in next video
            nextVideo.style.opacity = 1;
            currentVideo.style.opacity = 0;

            setTimeout(() => {
              setActiveVideo(inactive);
              setIndex(newIndex);
              setShowBlack(false); // Step 4: remove black overlay
            }, 500); // match fade duration
          });
          nextVideo.removeEventListener("loadeddata", onLoaded);
        };
        nextVideo.addEventListener("loadeddata", onLoaded);
      } else {
        // Image: just swap index after black screen
        setIndex(newIndex);
        setTimeout(() => setShowBlack(false), 500); // black after image
      }
    }, 500); // 0.5s black before next content
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
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
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

      {/* Image */}
      {current.type === "image" && !showBlack && (
        <img
          src={current.url}
          alt={current.title}
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
    </div>
  );
}
