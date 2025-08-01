import { useEffect, useState } from 'react';
import axios from 'axios';
import "./TopTracks.css"

function TopTracks({ token }) {
    const [tracks, setTracks] = useState([]);
    const TERMS = {SHORT_TERM: 'short_term', MEDIUM_TERM: 'medium_term', LONG_TERM: 'long_term',}
    const [term, setTerm] = useState(TERMS.LONG_TERM)

    useEffect(() => {
        axios
            .get(`https://api.spotify.com/v1/me/top/tracks?time_range=${term}&limit=24`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => {
                setTracks(res.data.items)
                console.log(res.data);
            })
            .catch(err => console.error(err));
    }, [token, term]);
    
    const changeTerm = (term) => {
        setTerm(term)
    }
    
    return (
        <div className={'top_tracks'}>
            <h2>Топ треков</h2>
            <div>
                <div className='term_choice'>
                    <button className={term === TERMS.LONG_TERM ? 'active' : ''} onClick={() => changeTerm(TERMS.LONG_TERM)}>За все время</button>
                    <button className={term === TERMS.MEDIUM_TERM ? 'active' : ''} onClick={() => changeTerm(TERMS.MEDIUM_TERM)}>6 месяцев</button>
                    <button className={term === TERMS.SHORT_TERM ? 'active' : ''} onClick={() => changeTerm(TERMS.SHORT_TERM)}>4 недели</button>
                </div>
            </div>
            <ul>
                {tracks.map((track) => (
                    <li className='track_card' key={track.id}>
                        <img src={track.album.images[0].url} alt=""/>
                        <p>{track.name}</p>
                    </li>
                
                ))}
            </ul>
        </div>
    );
}

export default TopTracks;
