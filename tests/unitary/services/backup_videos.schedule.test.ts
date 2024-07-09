import { describe, it, expect, jest, beforeEach,} from '@jest/globals';

describe('#services/backup video', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('shuld schedule a task in node-cron', async () => {
    const { default: moduleNodeCron } = await import('node-cron');
    const mockModuleCron = jest.spyOn(moduleNodeCron, 'schedule');

    const { default: ModuleBackupVideoService } = await import('@services/backup_videos.schedule');
    const backupVideoService = new ModuleBackupVideoService();

    const nickname = '@DiguinhoCorujaOficial';
    const type_video = 'steam';
    backupVideoService.create(nickname, type_video);

    expect(mockModuleCron).toHaveBeenCalledTimes(1);
    expect(mockModuleCron).toHaveBeenCalledWith(
      '*/30 * * * *',
      expect.any(Function),
      {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
        name: expect.any(String),
      }
    );
  });


  it('You must run the schedule after 30 minutes of registration', async () => {

    jest.useFakeTimers();
    const { default: ModuleBackupVideoService } = await import('@services/backup_videos.schedule');

    const mockExecuteSchedule = jest
      .spyOn<any, any, any>(ModuleBackupVideoService.prototype, 'execute')
      .mockImplementation(() => {
        return 'ok';
      });

    const backupVideoService = new ModuleBackupVideoService();

    const nickname = '@DiguinhoCorujaOficial';
    const type_video = 'steam';
    backupVideoService.create(nickname, type_video);

    const timeSchedule = 30 * 60 * 1000;
    jest.advanceTimersByTime(timeSchedule);

    expect(mockExecuteSchedule).toHaveBeenCalledTimes(1);
  });
});
