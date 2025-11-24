// import React, { useState, useEffect } from "react";
// import { Form, Button, Row, Col } from "react-bootstrap";
// import { fetchAds } from "../../api";

// export default function CreateScheduleForm({playerId, onSubmit, onError, loading, updated, handleCloseModal}) {
//   const [adId, setAdId] = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [isFiller, setIsFiller] = useState(false);
//   const [adOrder, setAdOrder] = useState(0);
//   const [adDuration, setAdDuration] = useState(30);
//   const [repeatInterval, setRepeatInterval] = useState("0 seconds");
//   const [ads, setAds] = useState([]);

//   useEffect(() => {
//     async function loadAds() {
//       const ads = await fetchAds();
//             setAds(ads);
//         }

//         loadAds();
//     }, [fetchAds]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!adId) {
//       onError("Please select an ad");
//       return;
//     }

//     const payload = {
//       ad_id: adId,
//       player_id: playerId, // automatically set
//       start_time: startTime,
//       is_filler: isFiller,
//       ad_order: adOrder,
//       ad_duration: adDuration,
//       repeat_interval: repeatInterval,
//     };

//     onSubmit(payload);

//   };

//   return (
//     <Form onSubmit={handleSubmit}>
//       <Row className="mb-3">
//         <Col>
//           <Form.Label>Ad</Form.Label>
//           <Form.Select value={adId} onChange={(e) => setAdId(e.target.value)}>
//             <option value="">Select Ad</option>
//             {ads.map((ad) => (
//               <option key={ad.id} value={ad.id}>
//                 {ad.name} ({ad.duration}s)
//               </option>
//             ))}
//           </Form.Select>
//         </Col>

//         <Col>
//           <Form.Label>Start Time</Form.Label>
//           <Form.Control
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//             required
//           />
//         </Col>
//       </Row>

//       <Row className="mb-3">
//         <Col>
//           <Form.Label>Order / Priority</Form.Label>
//           <Form.Control
//             type="number"
//             value={adOrder}
//             onChange={(e) => setAdOrder(Number(e.target.value))}
//             min={0}
//           />
//         </Col>


//         <Col>
//           <Form.Label>Filler Ad</Form.Label>
//           <Form.Select value={isFiller} onChange={(e) => setIsFiller(e.target.value)}>
//             <option value={false}>No</option>
//             <option value={true}>Yes</option>
//           </Form.Select>
//         </Col>
//       </Row>

//       <Row className="mb-3">
//         <Col>
//           <Form.Label>Repeat Interval</Form.Label>
//           <Form.Select
//             value={repeatInterval}
//             onChange={(e) => setRepeatInterval(e.target.value)}
//           >
//             <option value="0 seconds">No Repeat</option>
//             <option value="15min">Every 15 Minutes</option>
//             <option value="30min">Every 30 Minutes</option>
//             <option value="1hr">Every 1 Hour</option>
//             <option value="6hr">Every 6 Hours</option>
//             <option value="12hr">Every 12 Hours</option>
//             <option value="daily">Daily</option>
//             <option value="weekly">Weekly</option>
//             <option value="monthly">Monthly</option>
//           </Form.Select>
//         </Col>
//       </Row>

//       <Button type="submit" variant="primary" disabled={loading}>
//         Create Schedule
//       </Button>

//       <Button variant="secondary" onClick={handleCloseModal} style={{ marginLeft: '10px' }}>
//         Cancel
//       </Button>
//     </Form>
//   );
// }



import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { fetchAds } from "../../api";

export default function CreateEditScheduleForm({
  playerId,
  onSubmit,
  onError,
  loading,
  updated,
  handleCloseModal,
  initialData,      
}) {
  const [adId, setAdId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [isFiller, setIsFiller] = useState(false);
  const [adOrder, setAdOrder] = useState(0);
  const [adDuration, setAdDuration] = useState(30);
  const [repeatInterval, setRepeatInterval] = useState("0 seconds");
  const [ads, setAds] = useState([]);

  // Load ads list
  useEffect(() => {
    async function loadAds() {
      const ads = await fetchAds();
      setAds(ads);
    }
    loadAds();
  }, []);

  // Load initial data for EDIT MODE
  useEffect(() => {
    if (initialData) {
      setAdId(initialData.ad_id);
      setStartTime(initialData.start_time);
      setIsFiller(initialData.is_filler);
      setAdOrder(initialData.ad_order);
      setAdDuration(initialData.ad_duration);
      setRepeatInterval(initialData.repeat_interval);
    }
  }, [initialData]);

  console.log("Initial Data:", initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!adId) {
      onError("Please select an ad");
      return;
    }

    const payload = {
      ad_id: adId,
      player_id: playerId,
      start_time: startTime,
      is_filler: isFiller,
      ad_order: adOrder,
      ad_duration: adDuration,
      repeat_interval: repeatInterval,
    };

    if (initialData?.id) {
      payload.id = initialData.id; // <-- RETURN ID for updating
    }

    onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Col>
          <Form.Label>Ad</Form.Label>
          <Form.Select value={adId} onChange={(e) => setAdId(e.target.value)}>
            <option value="">Select Ad</option>
            {ads.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.name} ({ad.duration}s)
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col>
          <Form.Label>Start Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Label>Order / Priority</Form.Label>
          <Form.Control
            type="number"
            value={adOrder}
            onChange={(e) => setAdOrder(Number(e.target.value))}
            min={0}
          />
        </Col>

        <Col>
          <Form.Label>Filler Ad</Form.Label>
          <Form.Select
            value={isFiller}
            onChange={(e) => setIsFiller(e.target.value === "true")}
          >
            <option value={false}>No</option>
            <option value={true}>Yes</option>
          </Form.Select>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Label>Repeat Interval</Form.Label>
          <Form.Select
            value={repeatInterval}
            onChange={(e) => setRepeatInterval(e.target.value)}
          >
            <option value="0 seconds">No Repeat</option>
            <option value="15min">Every 15 Minutes</option>
            <option value="30min">Every 30 Minutes</option>
            <option value="1hr">Every 1 Hour</option>
            <option value="6hr">Every 6 Hours</option>
            <option value="12hr">Every 12 Hours</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Form.Select>
        </Col>
      </Row>

      <Button type="submit" variant="primary" disabled={loading}>
        {initialData ? "Update Schedule" : "Create Schedule"}
      </Button>

      <Button
        variant="secondary"
        onClick={handleCloseModal}
        style={{ marginLeft: "10px" }}
      >
        Cancel
      </Button>
    </Form>
  );
}
