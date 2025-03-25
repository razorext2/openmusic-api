const autoBind = require('auto-bind').default;

class AlbumLikesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumLikesHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.addLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album.',
    });

    response.code(201);
    return response;
  }

  async deleteAlbumLikesHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.deleteLike(albumId, userId);

    return {
      status: 'success',
      message: 'Batal menyukai album.',
    };
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, header } = await this._service.getAlbumLikesById(albumId);
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    response.header('X-Data-Source', header);

    return response;
  }
}

module.exports = AlbumLikesHandler;