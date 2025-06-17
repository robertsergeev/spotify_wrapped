import { useEffect, useState } from 'react';
import axios from 'axios';

function TopArtists({ token }) {
    const [artists, setArtists] = useState([]);
    const TERMS = {SHORT_TERM: 'short_term', MEDIUM_TERM: 'medium_term', LONG_TERM: 'long_term',}
    const [term, setTerm] = useState(TERMS.LONG_TERM)
    
    useEffect(() => {
        axios
            .get(`https://api.spotify.com/v1/me/top/artists?time_range=${term}&limit=10`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => setArtists(res.data.items))
            .catch(err => console.error(err));
    }, [token, term]);

    const changeTerm = (term) => {
        setTerm(term)
    }
    
    return (
        <div>
            <h2>Топ артистов</h2>
            <div>
                <p>Период:</p>
                <div>
                    <button onClick={() => changeTerm(TERMS.LONG_TERM)}>За все время</button>
                    <button onClick={() => changeTerm(TERMS.MEDIUM_TERM)}>6 меяцев</button>
                    <button onClick={() => changeTerm(TERMS.SHORT_TERM)}>4 недели</button>
                </div>
            </div>
            <ul style={{listStyle: 'none'}}>
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
