import React, {useEffect, useState} from 'react';
import ViewToggle from "./ViewToggle.jsx";
import axios from "axios";
import "./Header.css"

const Header = ({token, onLogout}) => {
    const [userData, setUserData] = useState({})
    
    useEffect(() => {
        
        async function getUserData () {
            try {
                const response = await axios.get('https://api.spotify.com/v1/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                const data = response.data;
                console.log(data);
                setUserData(data);
            } catch (e) {
                console.log(e);
            }
        }
        
        getUserData();
    }, [token]);
    
    return (
        token ?
            <header>
                {userData && userData.display_name && (
                    <>
                        {userData.images?.[0]?.url && (
                            <div className="user-pfp">
                                <img src={userData.images[0].url} alt="user avatar" />
                            </div>
                        )}
                        <h1>Hi, {userData.display_name}!</h1>
                    </>
                )}
                
                <button onClick={onLogout} className={'logout-btn'}>Logout</button>
                
                
                <ViewToggle/>
            </header>
            : <header></header>
    );
};

export default Header;