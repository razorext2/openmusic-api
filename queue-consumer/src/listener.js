class Listener {
  constructor(songsService, mailSender) {
    this._songsService = songsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      const songs = await this._songsService.getSongs(playlistId);
      const result = await this._mailSender.sendMail(targetEmail, JSON.stringify(songs));
      console.log(`MailSender: ${JSON.stringify(result)}`);
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = Listener;