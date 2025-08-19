import React, { useEffect, useState } from 'react'

interface Playlist { id: string; name: string }
interface Track {
  id: string
  name: string
  album?: string
  artists?: string[]
  uri?: string
}

const buttonStyle: React.CSSProperties = {
  padding: '8px',
  margin: '4px',
  cursor: 'pointer'
}

const listStyle: React.CSSProperties = { listStyle: 'none', padding: 0 }
const listItemStyle: React.CSSProperties = { margin: '4px 0', cursor: 'pointer' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '4px',
  textAlign: 'left'
}
const tdStyle: React.CSSProperties = { border: '1px solid #ccc', padding: '4px' }

const App: React.FC = () => {
  const [spotifyToken, setSpotifyToken] = useState('')
  const [youtubeToken, setYoutubeToken] = useState('')
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([])
  const [youtubePlaylists, setYoutubePlaylists] = useState<Playlist[]>([])
  const [spotifyTracks, setSpotifyTracks] = useState<Track[]>([])
  const [youtubeTracks, setYoutubeTracks] = useState<Track[]>([])
  const [selectedSpotifyPlaylist, setSelectedSpotifyPlaylist] = useState<Playlist | null>(null)
  const [selectedYoutubePlaylist, setSelectedYoutubePlaylist] = useState<Playlist | null>(null)

  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1))
      const token = params.get('access_token')
      const state = params.get('state')
      if (token && state === 'spotify') setSpotifyToken(token)
      if (token && state === 'youtube') setYoutubeToken(token)
      window.location.hash = ''
    }
  }, [])

  const loginSpotify = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = window.location.origin
    const scopes = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public'
    const url =
      'https://accounts.spotify.com/authorize' +
      `?response_type=token&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      '&state=spotify'
    window.location.href = url
  }

  const loginYoutube = () => {
    const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID
    const redirectUri = window.location.origin
    const scopes = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube'
    const url =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&response_type=token' +
      `&scope=${encodeURIComponent(scopes)}` +
      '&state=youtube'
    window.location.href = url
  }

  const fetchSpotifyPlaylists = async () => {
    const res = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    })
    const data: { items: { id: string; name: string }[] } = await res.json()
    setSpotifyPlaylists(data.items?.map((p) => ({ id: p.id, name: p.name })) || [])
  }

  const fetchSpotifyTracks = async (playlist: Playlist) => {
    setSelectedSpotifyPlaylist(playlist)
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    })
    const data: {
      items: {
        track: {
          id: string
          name: string
          album: { name: string }
          artists?: { name: string }[]
          uri: string
        }
      }[]
    } = await res.json()
    setSpotifyTracks(
      data.items?.map((i) => ({
        id: i.track.id,
        name: i.track.name,
        album: i.track.album.name,
        artists: i.track.artists?.map((a) => a.name),
        uri: i.track.uri
      })) || []
    )
  }

  const fetchYoutubePlaylists = async () => {
    const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true', {
      headers: { Authorization: `Bearer ${youtubeToken}` }
    })
    const data: { items: { id: string; snippet: { title: string } }[] } = await res.json()
    setYoutubePlaylists(data.items?.map((p) => ({ id: p.id, name: p.snippet.title })) || [])
  }

  const fetchYoutubeTracks = async (playlist: Playlist) => {
    setSelectedYoutubePlaylist(playlist)
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist.id}`,
      {
        headers: { Authorization: `Bearer ${youtubeToken}` }
      }
    )
    const data: {
      items: {
        snippet: {
          resourceId: { videoId: string }
          title: string
          videoOwnerChannelTitle?: string
        }
      }[]
    } = await res.json()
    setYoutubeTracks(
      data.items?.map((i) => ({
        id: i.snippet.resourceId.videoId,
        name: i.snippet.title,
        album: '',
        artists: i.snippet.videoOwnerChannelTitle
          ? [i.snippet.videoOwnerChannelTitle]
          : undefined
      })) || []
    )
  }

  const transferSpotifyTrackToYoutube = async (track: Track) => {
    if (!selectedYoutubePlaylist) return
    const query = encodeURIComponent(`${track.name} ${track.artists?.[0] ?? ''}`)
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${query}`, {
      headers: { Authorization: `Bearer ${youtubeToken}` }
    })
    const searchData: { items: { id: { videoId: string } }[] } = await searchRes.json()
    const videoId = searchData.items?.[0]?.id?.videoId
    if (!videoId) return
    await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${youtubeToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          playlistId: selectedYoutubePlaylist.id,
          resourceId: { kind: 'youtube#video', videoId }
        }
      })
    })
  }

  const transferYoutubeTrackToSpotify = async (track: Track) => {
    if (!selectedSpotifyPlaylist) return
    const query = encodeURIComponent(track.name)
    const searchRes = await fetch(`https://api.spotify.com/v1/search?type=track&limit=1&q=${query}`, {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    })
    const searchData: { tracks: { items: { uri: string }[] } } = await searchRes.json()
    const uri = searchData.tracks?.items?.[0]?.uri
    if (!uri) return
    await fetch(`https://api.spotify.com/v1/playlists/${selectedSpotifyPlaylist.id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: [uri] })
    })
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Spotify ↔ YouTube Music</h1>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-around' }}>
        <div style={{ flex: 1 }}>
          {!spotifyToken && (
            <button style={buttonStyle} onClick={loginSpotify}>Connect Spotify</button>
          )}
          {spotifyToken && (
            <>
              <button style={buttonStyle} onClick={fetchSpotifyPlaylists}>Load Spotify Playlists</button>
              <ul style={listStyle}>
                {spotifyPlaylists.map((pl) => (
                  <li key={pl.id} style={listItemStyle} onClick={() => fetchSpotifyTracks(pl)}>
                    {pl.name}
                  </li>
                ))}
              </ul>
              {spotifyTracks.length > 0 && (
                <div>
                  <h3>Songs in {selectedSpotifyPlaylist?.name}</h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Track</th>
                        <th style={thStyle}>Album</th>
                        <th style={thStyle}>Artist</th>
                        {youtubeToken && selectedYoutubePlaylist && (
                          <th style={thStyle}>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {spotifyTracks.map((t) => (
                        <tr key={t.id}>
                          <td style={tdStyle}>{t.name}</td>
                          <td style={tdStyle}>{t.album}</td>
                          <td style={tdStyle}>{t.artists?.join(', ')}</td>
                          {youtubeToken && selectedYoutubePlaylist && (
                            <td style={tdStyle}>
                              <button
                                style={buttonStyle}
                                onClick={() => transferSpotifyTrackToYoutube(t)}
                              >
                                To YouTube
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {!youtubeToken && (
            <button style={buttonStyle} onClick={loginYoutube}>Connect YouTube</button>
          )}
          {youtubeToken && (
            <>
              <button style={buttonStyle} onClick={fetchYoutubePlaylists}>Load YouTube Playlists</button>
              <ul style={listStyle}>
                {youtubePlaylists.map((pl) => (
                  <li key={pl.id} style={listItemStyle} onClick={() => fetchYoutubeTracks(pl)}>
                    {pl.name}
                  </li>
                ))}
              </ul>
              {youtubeTracks.length > 0 && (
                <div>
                  <h3>Songs in {selectedYoutubePlaylist?.name}</h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Track</th>
                        <th style={thStyle}>Album</th>
                        <th style={thStyle}>Artist</th>
                        {spotifyToken && selectedSpotifyPlaylist && (
                          <th style={thStyle}>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {youtubeTracks.map((t) => (
                        <tr key={t.id}>
                          <td style={tdStyle}>{t.name}</td>
                          <td style={tdStyle}>{t.album || 'N/A'}</td>
                          <td style={tdStyle}>{t.artists?.join(', ')}</td>
                          {spotifyToken && selectedSpotifyPlaylist && (
                            <td style={tdStyle}>
                              <button
                                style={buttonStyle}
                                onClick={() => transferYoutubeTrackToSpotify(t)}
                              >
                                To Spotify
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
