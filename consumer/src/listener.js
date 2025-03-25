const autoBind = require('auto-bind').default;

class Listener {
  constructor(playlistsService, mailSender) {
    this._playlitstService = playlistsService;
    this.mailSender = mailSender;

    autoBind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      const playlists = await this._playlitstService.getPlaylists(playlistId);
      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(playlists));

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;