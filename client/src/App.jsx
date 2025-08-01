import {useEffect, useState} from 'react';
import TopArtists from './components/TopArtists';
import TopTracks from './components/TopTracks';
import "./App.css"
import {Navigate, Route, Routes} from "react-router-dom";
import Header from "./components/Header.jsx";

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'https://spotify-wrapped-kqxf.onrender.com';

function App() {
    const [token, setToken] = useState(null);
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            setToken(accessToken);
            window.history.replaceState({}, document.title, '/');
        }
        
    }, []);
    
    return (<div className="App" style={{padding: '2rem'}}>
        <Header token={token}/>
        {!token ? (<a href={`${BASE_URL}/login`}>
            <button>Войти через Spotify</button>
        </a>) : (<main>
                <Routes>
                    <Route path='/' element={<Navigate to={'/artists'} replace/>}/>
                    <Route path='/artists' element={<TopArtists token={token}/>}/>
                    <Route path='/tracks' element={<TopTracks token={token}/>}/>
                </Routes>
            </main>
        
        )}
    </div>);
}

export default App;
