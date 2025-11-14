import React, { useState } from "react";
import { Button, Form, Modal, ProgressBar } from "react-bootstrap";

const AdsManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdFile, setNewAdFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

  const handleUpload = async () => {
    if (!newAdFile) {
      alert("Please choose a file");
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

      console.log(`Uploading chunk ${chunkNumber + 1} of ${totalChunks} (${chunk.size} bytes)`);

      const res = await fetch("http://localhost:3001/api/ad/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("Upload failed at chunk " + chunkNumber);
        return;
      }

      setProgress(Math.round(((chunkNumber + 1) / totalChunks) * 100));
    }

    alert("Upload complete!");
    setProgress(0);
    setShowModal(false);
    setNewAdFile(null);
    setNewAdTitle("");
  };

  return (
    <div>
      <h3>Ads Management</h3>

      <Button variant="primary" onClick={() => setShowModal(true)}>
        Add Ad
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload New Ad</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ad Title</Form.Label>
              <Form.Control
                type="text"
                value={newAdTitle}
                onChange={(e) => setNewAdTitle(e.target.value)}
                placeholder="Enter ad title"
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdsManagement;
