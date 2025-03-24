const SongsService = require('../../services/postgres/SongsService');
const autoBind = require('auto-bind').default;

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this._songService = new SongsService();

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'untitled', year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._songService.getSongsByAlbumId(id);

    album.songs = songs;

    return {
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          coverUrl: album.coverUrl,
          songs: songs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          }))
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;