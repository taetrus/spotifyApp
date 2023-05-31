import React from "react";
import axios from "axios";
import { generateCodeChallengeFromVerifier, generateCodeVerifier } from "./pkce";
import CONFIG from "./config";

const HomePage: React.FC = () => {
  const handleLogin = async () => {
    // Redirect the user to the Spotify authorization page
    window.location.href =
      "https://accounts.spotify.com/authorize?client_id=b6f5c650285f46a891d0d335e7e3ed7d&response_type=token&redirect_uri=http://localhost:5173/callbackpage&scope=playlist-read-private";
  };

  const onConnect = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier);

    window.location.href =
      "https://accounts.spotify.com/authorize?response_type=code" +
      `&client_id=${CONFIG.SPOTIFY_CLIENT_ID}` +
      `&redirect_uri=${CONFIG.REDIRECT_URL}` +
      "&scope=user-library-read playlist-modify-private playlist-read-private playlist-modify-public playlist-read-collaborative" +
      `&state=${codeVerifier}` +
      `&code_challenge=${codeChallenge}` +
      "&code_challenge_method=S256";
  };

  return (
    <div>
      {/* <button onClick={handleLogin}>Log in with Spotify</button> */}
      <button onClick={onConnect}>Log in with Spotify</button>
    </div>
  );
};

export default HomePage;
