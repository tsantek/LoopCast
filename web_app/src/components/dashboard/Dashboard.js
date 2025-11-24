import { useState, useEffect } from "react";
import { Tabs, Tab } from 'react-bootstrap';
import PlayerDetails from "./PlayerDetails";
import { fetchPlayers } from "../../api";
import ScheduleManagement from "./PlayerScheduleManagment";
import PlayerAnalytics from "./PlayerAnalytics";
import AdsManagement from "./Ads";


export default function Dashboard() {

    const [listOfPlayers, setListOfPlayers] = useState([]);
    const [selectedPlayerID, setSelectedPlayerID] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPlayersData = async () => {
        try {
            setLoading(true);
            const players = await fetchPlayers();
            setListOfPlayers(players);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching players:", error);
        }
    };

    useEffect(() => {
        fetchPlayersData();
    }, []);

    const handlePlayerSelect = (player) => {
        setSelectedPlayerID(player.id);
    };

    const [key, setKey] = useState('home');

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
    <div className="container">
      <h1 className="text-center">LoopCast</h1>
      {/* Dashboard list of players in left sidebar */}
      <div className="row">
        <div className="col-3">
          <h3>Player List</h3>
          {/* Search for player */}
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search for player"
              aria-label="Search for player"
            />
            <button className="btn btn-outline-secondary" type="button">
              Search
            </button>
          </div>
          {/* TODO - implement player list */}
            <ul className="list-group">
                {listOfPlayers.map((player) => (
                    <li style={{cursor:"pointer"}} key={player.id} className="list-group-item" onClick={() => handlePlayerSelect(player)}><strong>{player.name}</strong> - {player.status}</li>
                ))}
            </ul>
        </div>
        <div className="col-9">
            {/* TABS for player Details, Schedule Management, and Analytics */}
            <Tabs activeKey={key} onSelect={(k) => setKey(k || 'home')}>
                <Tab eventKey="home" title="Player Details">
                    <h3>Player Details</h3>
                    {selectedPlayerID ? (
                        <PlayerDetails playerId={selectedPlayerID} />
                    ) : (
                        <p>Please select a player to see details.</p>
                    )}
                </Tab>
                <Tab eventKey="schedule" title="Schedule Management">
                    <h3>Schedule Management</h3>
                    {selectedPlayerID ? (
                        <ScheduleManagement playerId={selectedPlayerID} />
                    ) : (
                        <p>Please select a player to manage its schedule.</p>
                    )}
                </Tab>
                <Tab eventKey="analytics" title="Analytics">
                    <h3>Analytics</h3>
                    {selectedPlayerID ? (
                        <PlayerAnalytics playerId={selectedPlayerID} />
                    ) : (
                        <p>Please select a player to view analytics.</p>
                    )}
                </Tab>
                <Tab eventKey="ads_management" title="Ads Management">
                    <h3>Ads Management</h3>
                    <AdsManagement />
                </Tab>
            </Tabs>
        </div>
      </div>
    </div>
  );
}