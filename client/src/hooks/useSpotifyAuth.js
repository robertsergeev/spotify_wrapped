import { useEffect, useRef, useState } from "react";

const BASE_URL = import.meta.env.VITE_SERVER_URL || "https://spotify-wrapped-kqxf.onrender.com";

function loadAuth() {
    try {
        const raw = localStorage.getItem("spotify_auth");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveAuth(auth) {
    localStorage.setItem("spotify_auth", JSON.stringify(auth));
}

function clearAuth() {
    localStorage.removeItem("spotify_auth");
}

export function useSpotifyAuth() {
    const [token, setToken] = useState(null);
    const refreshTimer = useRef(null);
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        const expiresIn = params.get("expires_in");
        
        if (accessToken && expiresIn) {
            const expires_at = Date.now() + Number(expiresIn) * 1000;
            saveAuth({ access_token: accessToken, expires_at });
            setToken(accessToken);
            window.history.replaceState({}, document.title, "/");
            scheduleRefresh(expires_at);
        } else {
            const stored = loadAuth();
            if (stored) {
                setToken(stored.access_token);
                scheduleRefresh(stored.expires_at);
            }
        }
    }, []);
    
    async function refreshAccessToken() {
        try {
            const resp = await fetch(`${BASE_URL}/refresh_access`, {
                method: "GET",
                credentials: "include",
            });
            if (!resp.ok) throw new Error("refresh failed");
            const data = await resp.json();
            const newAccess = data.access_token;
            const newExpiresIn = Number(data.expires_in);
            const updated = {
                access_token: newAccess,
                expires_at: Date.now() + newExpiresIn * 1000,
            };
            saveAuth(updated);
            setToken(newAccess);
            scheduleRefresh(updated.expires_at);
        } catch (e) {
            console.error(e);
            clearAuth();
            setToken(null);
        }
    }
    
    function scheduleRefresh(expires_at) {
        if (!expires_at) return;
        if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
        const msLeft = expires_at - Date.now();
        const delay = Math.max(msLeft - 60_000, 5_000);
        refreshTimer.current = window.setTimeout(refreshAccessToken, delay);
    }
    
    async function logout() {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (e) {
            console.warn("logout request failed (ignored):", e);
        } finally {
            clearAuth();
            setToken(null);
            if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
        }
    }
    
    useEffect(() => {
        const stored = loadAuth();
        if (!stored) return;
        if (stored.expires_at <= Date.now() + 60_000) {
            refreshAccessToken();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);
    
    return { token, logout, refreshAccessToken };
}
