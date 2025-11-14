

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MinuteCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState({});
  const [text, setText] = useState("");
  const [time, setTime] = useState("08:00");
  const [repeat, setRepeat] = useState("none");

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

  const handleAdd = () => {
    if (!text.trim()) return;

    const newNotes = { ...notes };

    // Determine how many repetitions based on repeat selection
    let currentDate = new Date(selectedDate);
    for (let i = 0; i < 365; i++) { // limit to 1 year max
      const key = currentDate.toDateString();
      const noteId = `${time}-${Date.now()}-${i}`;

      const newNote = {
        id: noteId,
        time,
        text: text.trim(),
        repeat,
      };

      newNotes[key] = newNotes[key] ? [...newNotes[key], newNote] : [newNote];

      if (repeat === "daily") currentDate.setDate(currentDate.getDate() + 1);
      else if (repeat === "weekly") currentDate.setDate(currentDate.getDate() + 7);
      else if (repeat === "monthly") currentDate.setMonth(currentDate.getMonth() + 1);
      else break;
    }

    setNotes(newNotes);
    setText("");
  };

  const dateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const key = selectedDate.toDateString();
  const todayNotes = notes[key] || [];

  const notesForHour = (hour) => todayNotes.filter(n => n.time.startsWith(hour.split(":")[0]));

  return (
    <div className="container-fluid py-3" style={{ height: "100vh" }}>
      <div className="row h-100">

        {/* Single Add Note Form */}
        <div className="col-3 border-end p-3 d-flex flex-column">
          <h4>Add Note</h4>

          <label className="mt-2">Select Day</label>
          <input
            type="date"
            className="form-control mb-2"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />

          <label className="mt-2">Time</label>
          <input
            type="time"
            className="form-control mb-2"
            value={time}
            onChange={e => setTime(e.target.value)}
          />

          <label>Repeat</label>
          <select
            className="form-control mb-2"
            value={repeat}
            onChange={e => setRepeat(e.target.value)}
          >
            <option value="none">Do not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <label>Note</label>
          <textarea
            className="form-control mb-3"
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button className="btn btn-primary" onClick={handleAdd}>Add</button>
        </div>

        {/* Calendar View */}
        <div className="col-9 p-3 d-flex flex-column" style={{ overflowY: "auto" }}>
          <div className="d-flex align-items-center mb-2">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, selectedDate.getDate()))}
            >
              ◀ Month
            </button>
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate()))}
            >
              Month ▶
            </button>

            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1))}
            >
              ◀ Day
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1))}
            >
              Day ▶
            </button>
          </div>

          <h3>{selectedDate.getFullYear()}</h3>
          <h5>{dateLabel}</h5>

          <div className="mt-3" style={{ maxHeight: "80vh", overflowY: "scroll" }}>
            {hours.map((hr) => (
              <div key={hr} className="border-bottom py-2">
                <strong>{hr}</strong>
                <div className="ms-3">
                  {notesForHour(hr).length === 0 && <div className="text-muted">-</div>}
                  {notesForHour(hr).map(n => (
                    <div key={n.id} className="p-1">
                      <span className="badge bg-secondary me-2">{n.time}</span>
                      {n.text}
                      {n.repeat !== "none" && (
                        <span className="badge bg-info ms-2">{n.repeat}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}