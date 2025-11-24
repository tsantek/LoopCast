import React, { useState } from "react";
import { Button, Form, Modal, ProgressBar, Stack, Table } from "react-bootstrap";
import { uploadAd } from "../../api";

const AdsManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdFile, setNewAdFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [ads, setAds] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");

  const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

  const handleUpload = async () => {
    setNewAdFile(null);
    setProgress(0);

    if (!newAdFile) {
      setAlertMessage("Please select a file to upload.");
      return;
    }

    const file = newAdFile;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
      const start = chunkNumber * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("ad_name", newAdTitle);
      formData.append("file_name", file.name);
      formData.append("chunk_number", chunkNumber.toString());
      formData.append("total_chunks", totalChunks.toString());
      formData.append("chunk_data", chunk, file.name);

      const res = await uploadAd(formData);

      if (!res.status || res.status !== 200) {
        setAlertMessage("Upload failed at chunk " + chunkNumber);
        return;
      }

      setProgress(Math.round(((chunkNumber + 1) / totalChunks) * 100));
    }
    

    setAlertMessage("Upload complete!");
    setProgress(100);
    fetchAds();
  };

  const fetchAds = async () => {
    const res = await fetch("http://localhost:3001/api/ad/all");
    const data = await res.json();
    setAds(data);
  }

  React.useEffect(() => {
    fetchAds();
  }, []);

  const handlePreviewAd = (file_name) => {
    window.open(`http://localhost:3001/api/video_stream/${file_name}`, "_blank");
  };


  const handleDeleteAd = async (adId) => {
    const res = await fetch(`http://localhost:3001/api/ad/${adId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAlertMessage("Ad deleted successfully");
      fetchAds();
    } else {
      setAlertMessage("Failed to delete ad");
    }
  };

  return (
    <div>
      {
        ads && ads.length > 0 ? (
          <div>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Duration <br /> (seconds)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{ad.name}</td>
                    <td>{ad.ad_type}</td>
                    <td>{ad.duration}</td>
                    <td>
                      <Stack direction="horizontal" gap={5}>
                        <Button variant="primary" onClick={() => handlePreviewAd(ad.file_name)}> Preview </Button>
                        <Button variant="danger" onClick={() => handleDeleteAd(ad.id)}>Delete</Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <p>No ads available.</p>
        )
      }
      

      <Button variant="primary" onClick={() => setShowModal(true)}>
        Add Ad
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false} onShow={()=> { setAlertMessage(""); setNewAdTitle(""); setNewAdFile(null); setProgress(0); }}>
        <Modal.Header closeButton>
          <Modal.Title>Upload New Ad</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {alertMessage && (
            <div className="alert alert-info" role="alert" style={{ marginLeft: '20px' }}>
              {alertMessage}
            </div>
          )}
            <Form.Group className="mb-3">
              <Form.Label>Ad Title</Form.Label>
              <Form.Control
                type="text"
                value={newAdTitle}
                onChange={(e) => setNewAdTitle(e.target.value)}
                placeholder={newAdTitle ? "" : "Enter ad title"}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload File</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setNewAdFile(e.target.files[0])}
              />
            </Form.Group>

            {progress > 0 && (
              <ProgressBar now={progress} label={`${progress}%`} />
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          {progress === 100 ? (
            <Button variant="success" onClick={() => { setShowModal(false); setAlertMessage(""); setProgress(0); }}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => { setShowModal(false); setAlertMessage(""); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpload} disabled={!newAdFile || !newAdTitle}>
                Upload
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdsManagement;
