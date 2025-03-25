const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(albumId, userId) {
    const nano = nanoid(16);
    const id = `liked-${nano}`;

    // definisikan query untuk menampilkan data album
    const albums = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const albumsResult = await this._pool.query(albums);

    // cek apakah datanya ada?
    if (!albumsResult.rows.length) {
      throw new NotFoundError('Data album tidak ditemukan.');
    }

    const liked = {
      text: 'SELECT * FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const likedResult = await this._pool.query(liked);

    if (likedResult.rows.length) {
      throw new InvariantError('Anda tidak dapat menyukai album yang sama dua kali.');
    }

    const insert = {
      text: 'INSERT INTO album_likes (id, album_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId],
    };

    const result = await this._pool.query(insert);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menyukai album.');
    }

    // cache services
    await this._cacheService.delete(`albumLikes:${albumId}`);

    return result.rows[0].id;
  }

  async deleteLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal membatalkan suka pada albums.');
    }

    // cache services
    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async getAlbumLikesById(albumId) {
    try {
      const header = 'cache';
      const res = await this._cacheService.get(`albumLikes:${albumId}`);

      return { likes: parseInt(res), header };
    } catch {
      const header = 'server';
      const query = {
        text: 'SELECT COUNT (album_id) FROM album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const res = await this._pool.query(query);
      const like = parseInt(res.rows[0].count);

      if (!res.rows.length) {
        throw new NotFoundError('Gagal menghapus like. Data album tidak ditemukan.');
      }

      await this._cacheService.set(`albumLikes:${albumId}`, like);

      return { like, header };
    }
  }
}

module.exports = AlbumLikesService;
