import React, { useEffect, useState } from "react";
import { fetchSchedule, createScheduleEntry } from "../../api";
import CreateScheduleForm from "./CreateSchedule";
import { Modal, Button, Table, Stack } from "react-bootstrap";

export default function ScheduleManagement({ playerId }) {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSchedule(playerId).then((data) => {
      setSchedule(data);
      setLoading(false);
    });
  }, [playerId]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const onSubmit = async (payload) => {
    createScheduleEntry(payload).then((data) => {
      setAlertMessage("Schedule entry created successfully");
      // Optionally reset form state here
      setLoading(true);
      fetchSchedule(playerId).then((data) => {
        setSchedule(data);
        setLoading(false);
      });
    }).catch((error) => {
      console.error("Error creating schedule entry:", error);
      setAlertMessage("Failed to create schedule entry");
    });
    setUpdated(true);
  };

  return (
    <div>
      {loading ? (
        <p>Loading schedule...</p>
      ) : (
        <div>
          <h4>Current Schedule</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Ad Name</th>
                <th>Start Time</th>
                <th>Duration (s)</th>
                <th>Order</th>
                <th>Filler</th>
                <th>Repeat Interval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.start_time}</td>
                  <td>{item.duration}</td>
                  <td>{item.ad_order}</td>
                  <td>{item.is_filler ? "Yes" : "No"}</td>
                  <td>{item.repeat_interval || "-"}</td>
                  <td>
                    <Stack direction="horizontal" gap={5}>
                        <Button variant="warning" size="sm">
                            Edit
                        </Button>
                        <Button variant="danger" size="sm">
                        Delete
                        </Button>
                    </Stack>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button variant="primary" onClick={handleOpenModal}>
            Create New Schedule Entry
          </Button>

          <Modal  backdrop="static" keyboard={false} show={showModal} onHide={handleCloseModal} onShow={() => { setAlertMessage(""); }}>
            <Modal.Header closeButton>
              <Modal.Title>Create Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {alertMessage && (
                <div className="alert alert-info" role="alert" style={{ marginLeft: '20px' }}>
                  {alertMessage}
                </div>
              )}
              <CreateScheduleForm
                playerId={playerId}
                onSubmit={onSubmit}
                onError={(msg) => setAlertMessage(msg)}
                loading={loading}
                updated={updated}
                handleCloseModal={handleCloseModal}
              />
            </Modal.Body>
          </Modal>
        </div>
      )}
    </div>
  );
}
