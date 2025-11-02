import {useEffect, useState} from 'react';
import TopArtists from './components/TopArtists';
import TopTracks from './components/TopTracks';
import "./App.css"
import {Navigate, Route, Routes} from "react-router-dom";
import Header from "./components/Header.jsx";
import {useSpotifyAuth} from "./hooks/useSpotifyAuth.js";

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'https://spotify-wrapped-kqxf.onrender.com';

function App() {
    const { token, logout } = useSpotifyAuth();
    
    return (
        <div className="App" style={{ padding: "2rem" }}>
            <Header token={token} onLogout={logout} />
            
            {!token ? (
                <a href={`${BASE_URL}/login`}>
                    <button>Войти через Spotify</button>
                </a>
            ) : (
                <main>
                    <Routes>
                        <Route path="/" element={<Navigate to="/artists" replace />} />
                        <Route path="/artists" element={<TopArtists token={token} />} />
                        <Route path="/tracks" element={<TopTracks token={token} />} />
                    </Routes>
                </main>
            )}
        </div>
    );
}

export default App;
