import { useEffect, useState } from 'react';
import axios from 'axios';

function TopArtists({ token }) {
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        axios
            .get('https://api.spotify.com/v1/me/top/artists?limit=10', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => setArtists(res.data.items))
            .catch(err => console.error(err));
    }, [token]);

    return (
        <div>
            <h2>Топ артистов</h2>
            <ul>
                {artists.map((artist, idx) => (
                    <li key={artist.id}>
                        #{idx + 1} — {artist.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TopArtists;
