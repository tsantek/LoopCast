import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { registerPlayer } from "../api";


export default function Register() {
  const { token } = useParams();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
    zip_code: "",
    city: "",
    country: "USA",
    state: "Arizona",
  });

  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);



  useEffect(() => {
    registerPlayer(token).then((data) => {
      console.log("Player registered with token:", data);
      setFormData((prevData) => ({
        ...prevData,
        id: data.id || "",
      }));
    
    }).catch((error) => {
      console.error("Error registering player with token:", error);
    });
  }, []);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleCancel = () => {
    // Clean up local storage and redirect to home
    localStorage.removeItem("player");
    window.location.href = "/";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {

        const response = await axios.post(
            `http://127.0.0.1:3001/api/player/confirm-registration/${token}`,
            formData,
            {
                headers: {
                    "Content-Type": "application/json", // important!
                    "Access-Control-Allow-Headers": "*",
                },
            }
    );
      localStorage.setItem("player", JSON.stringify(response.data));
      setStatus({ type: "success", message: response.data.message });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to register device - please contact the support" });
    }
    setSubmitting(false);
  };

  if (success) {
    return (
        <div className="container mt-5">
            <div className="card text-center">
                <div className="card-header">
                    <h2>Registration Successful</h2>
                </div>
                <div className="card-body">
                    <p>Your device has been successfully registered!</p>
                </div>
            </div>
        </div>
    );
  }


  return (
    <div className="container mt-5">
      <div className="card mx-auto" style={{ maxWidth: 600 }}>
        <div className="card-header text-center">
          <h2>Register Device</h2>
        </div>
        <div className="card-body">
          <p><strong>Registration Token:</strong> {token}</p>

          {status && (
            <div
              className={`alert ${
                status.type === "success" ? "alert-success" : "alert-danger"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Zip Code</label>
              <input
                type="text"
                name="zip_code"
                className="form-control"
                value={formData.zip_code}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                className="form-control"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            {submitting ? (
              <button type="submit" className="btn btn-primary w-100" disabled>
                Working...
              </button>
            ) : (
                <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary w-100">
                Register Device
              </button>
              <button type="button" className="btn btn-secondary w-100" onClick={handleCancel}>
                Cancel
              </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
