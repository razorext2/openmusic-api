const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylists(playlistId) {
    const playlists = {
      text: 'Select id, name FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const playlistsRes = await this._pool.query(playlists);

    if (!playlistsRes.rows.length) {
      throw new Error('Playlist tidak ditemukan');
    }

    const playlistData = playlistsRes.rows[0];

    const songs = {
      text: `
        SELECT songs.id, songs.title, songs.performer
        FROM songs
        LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
        WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const songsRes = await this._pool.query(songs);
    const songData = songsRes.rows;

    const response = {
      playlist: {
        id: playlistData.id,
        name: playlistData.name,
        songs: songData,
      },
    };

    console.log(response);
    return response;
  }
}

module.exports = PlaylistsService;