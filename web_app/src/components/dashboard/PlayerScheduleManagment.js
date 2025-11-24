import React, { useEffect, useState } from "react";
import {
  fetchSchedule,
  createScheduleEntry,
  deleteScheduleEntry,
  updateScheduleEntry,
} from "../../api";

import CreateEditScheduleForm from "./CreateEditSchedule";
import { Modal, Button, Table, Stack } from "react-bootstrap";

export default function ScheduleManagement({ playerId }) {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInitialData, setEditInitialData] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  // Load schedule
  useEffect(() => {
    setLoading(true);
    fetchSchedule(playerId).then((data) => {
      setSchedule(data);
      setLoading(false);
    });
  }, [playerId]);

  const refreshSchedule = () => {
    setLoading(true);
    fetchSchedule(playerId).then((data) => {
      setSchedule(data);
      setLoading(false);
    });
  };

  const onSubmit = async (payload) => {
    setAlertMessage("");

    try {
      if (payload.id) {
        await updateScheduleEntry(payload);
        setAlertMessage("Schedule entry updated successfully");
      } else {
        await createScheduleEntry(payload);
        setAlertMessage("Schedule entry created successfully");
      }

      refreshSchedule();
      setShowModal(false);
      setShowEditModal(false);
      setEditInitialData(null);
    } catch (error) {
      console.error(error);
      setAlertMessage("Failed to save schedule entry");
    }
  };

  const deleteSchedule = async (entryId) => {
    setAlertMessage("");

    try {
      await deleteScheduleEntry(entryId);
      setAlertMessage("Schedule entry deleted successfully");
      refreshSchedule();
    } catch (err) {
      console.error(err);
      setAlertMessage("Failed to delete schedule entry");
    }
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
                <tr key={item.schedule_id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.start_time}</td>
                  <td>{item.duration}</td>
                  <td>{item.ad_order}</td>
                  <td>{item.is_filler ? "Yes" : "No"}</td>
                  <td>{item.repeat_interval || "-"}</td>

                  <td>
                    <Stack direction="horizontal" gap={3}>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => {
                          setEditInitialData({
                            id: item.schedule_id,
                            ad_id: item.ad_id,
                            start_time: item.start_time,
                            ad_order: item.ad_order,
                            is_filler: item.is_filler,
                            repeat_interval: item.repeat_interval,
                            ad_duration: item.duration,
                          });
                          setShowEditModal(true);
                          setAlertMessage("");
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteSchedule(item.schedule_id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button variant="primary" onClick={() => setShowModal(true)}>
            Create New Schedule Entry
          </Button>

          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title>Create Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {alertMessage && (
                <div className="alert alert-info">{alertMessage}</div>
              )}
              <CreateEditScheduleForm
                playerId={playerId}
                onSubmit={onSubmit}
                onError={(msg) => setAlertMessage(msg)}
                loading={loading}
                handleCloseModal={() => setShowModal(false)}
              />
            </Modal.Body>
          </Modal>

          <Modal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {alertMessage && (
                <div className="alert alert-info">{alertMessage}</div>
              )}

              {editInitialData && (
                <CreateEditScheduleForm
                  playerId={playerId}
                  initialData={editInitialData}
                  onSubmit={onSubmit}
                  onError={(msg) => setAlertMessage(msg)}
                  loading={loading}
                  handleCloseModal={() => {
                    setShowEditModal(false);
                    setEditInitialData(null);
                  }}
                />
              )}
            </Modal.Body>
          </Modal>
        </div>
      )}
    </div>
  );
}
