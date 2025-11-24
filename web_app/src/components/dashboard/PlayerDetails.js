import React, { useEffect, useState } from 'react';
import { fetchPlayerDetails } from '../../api';

export default function PlayerDetails({ playerId }) {
    const [playerDetails, setPlayerDetails] = useState(null);

    // Get info about player with playerId from API
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchPlayerDetails(playerId);
            setPlayerDetails(data);
        };
        fetchData();
    }, [playerId]);

    return (
        <div>
            <h2>Player Details for ID: {playerId}</h2>
            {playerDetails ? (
                <div>
                    <p><strong>Device ID:</strong> {playerDetails.id}</p>
                    <p><strong>Name:</strong> {playerDetails.name}</p>
                    <p><strong>Status:</strong> {playerDetails.status}</p>
                    <p><strong>City:</strong> {playerDetails.city}</p>
                    <p><strong>Zip Code:</strong> {playerDetails.zip_code}</p>
                    <p><strong>Country:</strong> {playerDetails.country}</p>
                    <p><strong>State:</strong> {playerDetails.state}</p>
                    <p><strong>Notes:</strong> {playerDetails.notes}</p>
                </div>
            ) : (
                <p>Loading player details...</p>
            )}
        </div>
    );
}