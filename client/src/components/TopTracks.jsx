import { useEffect, useState } from 'react';
import axios from 'axios';

function TopTracks({ token }) {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        axios
            .get('https://api.spotify.com/v1/me/top/tracks?limit=10', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => setTracks(res.data.items))
            .catch(err => console.error(err));
    }, [token]);

    return (
        <div>
            <h2>Топ треков</h2>
            <ol>
                {tracks.map((track, idx) => (
                    <li key={track.id}>
                        {track.name} — {track.artists.map(a => a.name).join(', ')}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default TopTracks;
