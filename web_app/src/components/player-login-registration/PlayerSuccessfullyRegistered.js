


const PlayerSuccessfullyRegistered = (player) => {
    return (
        <div className="container mt-5">
      <div className="card text-center">
        <div className="card-header">
          <h2>Player Status</h2>
        </div>
        <div className="card-body">
          <h5 className="card-title">Player Registered</h5>
          <p className="card-text">Your Player is successfully registered and active.</p>
          {/* Player Information */}
          <ul className="list-unstyled">
            <li>
              <strong>Player ID:</strong> {player.id}
            </li>
            <li>
              <strong>Registration Token:</strong> {player.registration_token}
            </li>
            <li>
              <strong>Status:</strong> {player.status}
            </li>
          </ul>
        </div>
      </div>
    </div>
    );
};

export default PlayerSuccessfullyRegistered;