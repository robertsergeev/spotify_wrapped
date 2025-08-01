import React from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import './ViewToggle.css'

const ViewToggle = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="glass-radio-group">
            <input
                type="radio"
                name="view"
                id="view-artists"
                checked={currentPath === '/artists'}
                onChange={() => navigate('/artists')}
            />
            <label htmlFor="view-artists">Artists</label>

            <input
                type="radio"
                name="view"
                id="view-tracks"
                checked={currentPath === '/tracks'}
                onChange={() => navigate('/tracks')}
            />
            <label htmlFor="view-tracks">Tracks</label>

            <div className="glass-glider"></div>
        </div>
    );
};

export default ViewToggle;