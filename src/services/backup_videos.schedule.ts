

import cron, { ScheduledTask } from 'node-cron';

export default class BackupVideos {
  private timeSchedule = '*/30 * * * *';
  // '*/30 * * * *';
  constructor() {}

  private execute(nickname: string, type_video: string) {

  }

  create(nickname: string, type_video: string) {
    const task = cron.schedule(
      this.timeSchedule,
      () => this.execute(nickname, type_video),
      {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
      }
    );

    this.events(task);
  }

  private events(task: ScheduledTask) {}
}
