import { useState } from "react";

const PlayerLogin = () => {

    const [loading, setLoading] = useState(false);


    const handleSubmit = (e) => {
        setLoading(true);
        console.log("Submitting login form");
        e.preventDefault();
        // http://localhost:3001/api/player/login
        // name and registration_token from form
        const name = e.target[0].value;
        const registration_token = e.target[1].value;

        fetch("http://localhost:3001/api/player/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, registration_token }),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Login successful:", data);
            localStorage.setItem("player", JSON.stringify(data));
        })
        .catch((error) => {
            setLoading(false);
            console.error("Error during login:", error);
        });
    }

    return (
        // Login form - name and token inputs with submit button - in one line
        <form className="d-flex justify-content-center align-items-center p-3" onSubmit={handleSubmit}>
            <input
                type="text"
                className="form-control me-2"
                style={{ width: "200px" }}
                placeholder="Player Name"
                aria-label="Player Name"
            />
            <input
                type="text"
                className="form-control me-2"
                style={{ width: "200px" }}
                placeholder="Registration Token"
                aria-label="Registration Token"
            />
            {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
                Login
            </button>
        </form>
    );
};
export default PlayerLogin;