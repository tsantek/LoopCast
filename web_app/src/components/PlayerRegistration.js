import React, {useEffect, useState, useRef } from "react";
import { registerPlayer } from "../api";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export default function PlayerRegistration() {
  const [player, setPlayer] = useState({});
  // const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [token, setToken] = useState("");
  const initialized = useRef(false); // 👈 guard ref

  useEffect(() => {
    if (initialized.current) return; // prevent double-run
    initialized.current = true;

    console.log("Registering player...");

        let token = uuidv4();
        token = token.toString().slice(-6);
        setToken(token);
        // registerPlayer(token)
        //   .then((data) => {
        //     setPlayer(data);
        //     localStorage.setItem("player", JSON.stringify(data));
            // setLoading(false);
        //   })
        //   .catch((error) => {
        //     console.error("Error registering player:", error);
        //     setLoading(false);
        //   });
  }, []);



  // if (loading) return <p>LoopCast Registering player...</p>;
  if (!player) return <p>LoopCast Failed to register player</p>;

  const url = `http://localhost:3000/register/${token}`;
  QRCode.toDataURL(url)
      .then((dataUrl) => setQrCodeUrl(dataUrl))
      .catch((err) => console.error(err));

  return (
    <div className="card text-center mt-3">
      <div className="card-header">
        <h2>LoopCast Player Registration</h2>
      </div>
      <div className="card-body">
        <p><strong>Registration Token:</strong> {token}</p>
        <div dangerouslySetInnerHTML={{ __html: player.qr_code_svg }} />
                  {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" className="img-fluid" style={{ maxWidth: 200 }} />
          ) : (
            <p>Generating QR code...</p>
          )}
          <div>
          <p className="mt-3">
            Scan this QR code with to complete the registration.
          </p>
          <p>
            Or open this URL in your browser: <br />
            <a href={`http://localhost:3000/register/${token}`} target="_blank" rel="noopener noreferrer">
              http://localhost:3000/register/{token}
            </a>
          </p>
          </div>
      </div>
    </div>
  );
}
