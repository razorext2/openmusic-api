const InvariantError = require('../../exceptions/InvariantError');
const { AlbumLikePayloadSchema } = require('./schema');

const AlbumLikesValidator = {
  validateAlbumLikesPayload: (payload) => {
    const validationResult = AlbumLikePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumLikesValidator;