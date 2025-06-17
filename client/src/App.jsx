import { useEffect, useState } from 'react';
import TopArtists from './components/TopArtists';
import TopTracks from './components/TopTracks';

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

    return (
        <div className="App" style={{ padding: '2rem' }}>
            <h1>Твоя Spotify Статистика</h1>
            {!token ? (
                <a href={`${BASE_URL}/login`}>
                    <button>Войти через Spotify</button>
                </a>
            ) : (
                <>
                    <TopArtists token={token} />
                    <TopTracks token={token} />
                </>
            )}
        </div>
    );
}

export default App;
