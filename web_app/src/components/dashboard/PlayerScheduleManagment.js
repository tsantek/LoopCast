import React, { useEffect, useState } from 'react';
import { fetchSchedule } from '../../api';
import MinuteCalendar from '../dashboard/Calendar';

export default function ScheduleManagement({ playerId }) {
    const [loadin, setLoading] = useState(true);

    const [schedule, setSchedule] = useState([]);

    // Schedule management logic goes here
    useEffect(() => {
        setLoading(true);
        // fetchSchedule
        fetchSchedule(playerId).then(data => {
            console.log("Fetched schedule for player:", data);
            setSchedule(data);
            setLoading(false);
        });
    }, [playerId]);

    return (
        <div>
            <h2>Schedule Management for Player ID: {playerId}</h2>
            <ul>
                {schedule.map((item, index) => (
                    <li key={index}>
                        {item.video_name} - {item.media_type} - {item.duration ? `${item.duration}s` : 'N/A'}
                    </li>
                ))}
            </ul>
        </div>
    );
}
