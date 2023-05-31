import React, { useEffect, useState } from "react";
import axios from "axios";

const PlaylistsPage: React.FC = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("spotify_access_token")}`,
        },
      });

      setPlaylists(response.data.items);
    };

    fetchPlaylists();
  }, []);

  return (
    <div>
      {playlists.map((playlist: any) => (
        <div key={playlist.id}>
          <h2>{playlist.name}</h2>
          <p>{playlist.description}</p>
        </div>
      ))}
    </div>
  );
};

export default PlaylistsPage;
