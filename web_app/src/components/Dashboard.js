import { useState, useEffect } from "react";
import { Tabs, Tab, Container } from 'react-bootstrap';

export default function Dashboard() {

    const [listOfPlayers, setListOfPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const fetchPlayers = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/player/list");
            const data = await response.json();
            setListOfPlayers(data);
        } catch (error) {
            console.error("Error fetching players:", error);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const handlePlayerSelect = (player) => {
        setSelectedPlayer(player);
    };

    const [key, setKey] = useState('home');
    return (
    <div className="container">
      <h1 className="text-center">LoopCast</h1>
      {/* Dashboard list of devices in left sidebar */}
      <div className="row">
        <div className="col-3">
          <h3>Devices</h3>
          {/* Search for device */}
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search for device"
              aria-label="Search for device"
            />
            <button className="btn btn-outline-secondary" type="button">
              Search
            </button>
          </div>
          {/* TODO - implement device list */}
            <ul className="list-group">
                {listOfPlayers.map((player) => (
                    <li key={player.device_id} className="list-group-item">
                        <a href="#" onClick={() => handlePlayerSelect(player)}>{player.name} - {player.status}</a>
                    </li>
                ))}
            </ul>
        </div>
        <div className="col-9">
            {/* TABS for device Details, Schedule Management, and Analytics */}
            <Tabs activeKey={key} onSelect={(k) => setKey(k || 'home')}>
                <Tab eventKey="home" title="Device Details">
                    <h3>Device Details</h3>
                    <p>Details about the selected device will appear here.</p>
                    {selectedPlayer ? (
                        <Container>
                            <h4>{selectedPlayer.name}</h4>
                            <p><strong>Status:</strong> {selectedPlayer.status}</p>
                            <p><strong>Notes:</strong> {selectedPlayer.notes || 'N/A'}</p>
                            <p><strong>Address:</strong> {selectedPlayer.address || 'N/A'}</p>
                            <p><strong>Device ID:</strong> {selectedPlayer.device_id}</p>
                        </Container>
                    ) : (
                        <p>Please select a device to see details.</p>
                    )}
                </Tab>
                <Tab eventKey="schedule" title="Schedule Management">
                    <h3>Schedule Management</h3>
                    <p>Manage the content schedule for the selected device here.</p>
                </Tab>
                <Tab eventKey="analytics" title="Analytics">
                    <h3>Analytics</h3>
                    <p>View analytics and performance data for the selected device here.</p>
                </Tab>
            </Tabs>
        </div>
      </div>
    </div>
  );
}