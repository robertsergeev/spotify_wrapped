import { useEffect, useState } from 'react';
import axios from 'axios';
import "./TopArtists.css"

function TopArtists({ token }) {
    const [artists, setArtists] = useState([]);
    const TERMS = {SHORT_TERM: 'short_term', MEDIUM_TERM: 'medium_term', LONG_TERM: 'long_term',}
    const [term, setTerm] = useState(TERMS.LONG_TERM)
    
    useEffect(() => {
        axios
            .get(`https://api.spotify.com/v1/me/top/artists?time_range=${term}&limit=24`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => {
                setArtists(res.data.items)
                console.log(res.data);
            })
            .catch(err => console.error(err));
    }, [token, term]);

    const changeTerm = (term) => {
        setTerm(term)
    }
    
    return (
        <div className='top_artists'>
            <h2>Топ артистов</h2>
            <div>
                <div className='term_choice'>
                    <button onClick={() => changeTerm(TERMS.LONG_TERM)}>За все время</button>
                    <button onClick={() => changeTerm(TERMS.MEDIUM_TERM)}>6 месяцев</button>
                    <button onClick={() => changeTerm(TERMS.SHORT_TERM)}>4 недели</button>
                </div>
            </div>
            <ul>
                {artists.map((artist) => (
                    <li className='artist_card' key={artist.id}>
                        <img src={artist.images[0].url} alt=""/>
                        <p>{artist.name}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TopArtists;
