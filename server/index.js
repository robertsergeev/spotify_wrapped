const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

/**
 * Если бэкенд за прокси/на Render/Heroku — это нужно,
 * чтобы secure-куки корректно маркировались.
 */
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URI,
    credentials: true
}));

const PORT = process.env.PORT || 8888;

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI,
    FRONTEND_URI,
    NODE_ENV
} = process.env;

const isProd = NODE_ENV === 'production';

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
    res.json({ name: 'Spotify Wrapped App', repo: 'https://github.com/robertsergeev/spotify_wrapped' });
});

/**
 * 1) Redirect user to Spotify login
 */
app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email user-top-read';
    
    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        state
    });
    
    res.redirect('https://accounts.spotify.com/authorize?' + queryParams);
});

/**
 * 2) Spotify redirects back with code -> exchange it for token
 *    refresh_token кладём в httpOnly cookie,
 *    на фронт отдаём только access_token + expires_in.
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
            code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            grant_type: 'authorization_code'
        })
    };
    
    try {
        const response = await axios(authOptions);
        const { access_token, refresh_token, expires_in } = response.data;
        
        // Кладём refresh_token в httpOnly cookie.
        res.cookie('spotify_refresh', refresh_token, {
            httpOnly: true,
            secure: isProd,                    // в проде требует HTTPS
            sameSite: isProd ? 'none' : 'lax', // если фронт и бэк на разных доменах — нужно 'none'
            path: '/',
            maxAge: 365 * 24 * 60 * 60 * 1000  // 1 год
        });
        
        // На фронт — только access_token и expires_in.
        res.redirect(`${FRONTEND_URI}/?access_token=${access_token}&expires_in=${expires_in}`);
    } catch (error) {
        console.error('Token exchange error:', error.response?.data || error.message);
        res.sendStatus(500);
    }
});

/**
 * 3) Выдаёт новый access_token, читая refresh_token из httpOnly cookie
 *    (более безопасно: фронт не видит refresh_token вообще).
 */
app.get('/refresh_access', async (req, res) => {
    const refresh_token = req.cookies?.spotify_refresh;
    if (!refresh_token) {
        return res.status(401).json({ error: 'No refresh token' });
    }
    
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            Authorization: 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token
        })
    };
    
    try {
        const response = await axios(authOptions);
        
        // Spotify может вернуть НОВЫЙ refresh_token — обновим куку
        if (response.data.refresh_token) {
            res.cookie('spotify_refresh', response.data.refresh_token, {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? 'none' : 'lax',
                path: '/',
                maxAge: 365 * 24 * 60 * 60 * 1000
            });
        }
        
        res.json({
            access_token: response.data.access_token,
            expires_in: response.data.expires_in
        });
    } catch (error) {
        console.error('Refresh token error:', error.response?.data || error.message);
        res.sendStatus(401);
    }
});

/**
 * 4) Логаут: чистим httpOnly cookie с refresh_token
 */
app.post('/logout', (req, res) => {
    res.clearCookie('spotify_refresh', {
        path: '/',
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax'
    });
    res.sendStatus(204);
});

/**
 * (Необязательно) Старый эндпоинт оставлен для обратной совместимости,
 * но фронту лучше использовать /refresh_access.
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
            refresh_token
        })
    };
    
    try {
        const response = await axios(authOptions);
        res.json(response.data);
    } catch (error) {
        console.error('Refresh token error:', error.response?.data || error.message);
        res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
