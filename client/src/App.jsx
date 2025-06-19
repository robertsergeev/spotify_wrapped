import { useEffect, useState } from 'react';
import TopArtists from './components/TopArtists';
import TopTracks from './components/TopTracks';
import "./App.css"
import {Link, Route, Routes} from "react-router-dom";

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'https://spotify-wrapped-kqxf.onrender.com';

function App() {
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('access_token');
            
            if (accessToken) {
                setToken(accessToken);
                localStorage.setItem('token', accessToken)
                window.history.replaceState({}, document.title, '/');
            }
        } else {
            setToken(localStorage.getItem('token'))
        }
    }, []);

    return (
        <div className="App" style={{ padding: '2rem' }}>
            <header>
                <h1>Твоя Spotify Статистика</h1>
                <nav className='nav'>
                    <Link to={'/artists'} className='nav_link'>Топ Артистов</Link>
                    <Link to={'/tracks'} className='nav_link'>Топ Треков</Link>
                </nav>
            </header>
            {!token ? (
                <a href={`${BASE_URL}/login`}>
                    <button>Войти через Spotify</button>
                </a>
            ) : (
                <main>
                    <Routes>
                    <Route path='/' element={<TopArtists token={token} />}/>
                        <Route path='/artists' element={<TopArtists token={token} />}/>
                        <Route path='/tracks' element={<TopTracks token={token} />}/>
                    </Routes>
                </main>
                
            )}
        </div>
    );
}

export default App;
