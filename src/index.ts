import { createExpressApp } from './loaders/express.js';
import { env } from './config/env.js';
import { logger } from './loaders/logger.js';

async function main() {
  const app = createExpressApp();
  const port = env.PORT;
  app.listen(port, () => {
    logger.info(`Server listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});

