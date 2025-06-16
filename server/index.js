const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const querystring = require('querystring');

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 8888;

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI,
    FRONTEND_URI
} = process.env;

const generateRandomString = length => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'spotify_auth_state';

app.get('/', (req, res) => {
    res.json({name: 'Spotify Wrapped App', repo: 'https://github.com/robertsergeev/spotify_wrapped'})
})

/**
 * 1. Redirect user to Spotify login
 */
app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email user-top-read';

    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        state: state
    });

    res.redirect('https://accounts.spotify.com/authorize?' + queryParams);
});

/**
 * 2. Spotify redirects back with code -> exchange it for token
 */
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            Authorization: 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: querystring.stringify({
            code: code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            grant_type: 'authorization_code'
        })
    };

    try {
        const response = await axios(authOptions);
        const { access_token, refresh_token, expires_in } = response.data;

        // Можно передать токены на фронт как query params
        res.redirect(`${FRONTEND_URI}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
    } catch (error) {
        console.error('Token exchange error:', error.response.data);
        res.sendStatus(500);
    }
});

/**
 * 3. Refresh token endpoint
 */
app.get('/refresh_token', async (req, res) => {
    const refresh_token = req.query.refresh_token;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            Authorization: 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        })
    };

    try {
        const response = await axios(authOptions);
        res.json(response.data);
    } catch (error) {
        console.error('Refresh token error:', error.response.data);
        res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log('server running on http://localhost:8888');
});