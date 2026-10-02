import app from './app.js';
import { env } from './config/env.js';
import { initializeDatabase } from './config/database.js';
import { runScheduledBackup } from './services/backup.service.js';
import { refreshSitemapFile } from './services/sitemap.service.js';

const startServer = async () => {
  await initializeDatabase();
  await refreshSitemapFile();

  app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  });
  setInterval(() => {
    runScheduledBackup().catch((error) => {
      console.error('Automatic backup failed.', error);
    });
  }, 60 * 1000);
};

startServer().catch((error) => {
  console.error('MySQL initialization failed.');
  console.error(`Code: ${error?.code || 'UNKNOWN'} | Message: ${error?.message || 'Unknown database error'}`);
  process.exitCode = 1;
});
