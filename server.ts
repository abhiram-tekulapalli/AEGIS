import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/backend/routes';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));

  // Mount AEGIS API routes under /api
  app.use('/api', apiRouter);

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AEGIS Server] Running on http://127.0.0.1:${PORT}`);
    console.log(`[AEGIS API] API routes active at http://127.0.0.1:${PORT}/api/health`);
    console.log(`[AEGIS Standalone Extension Backend Target] http://127.0.0.1:8765`);
  });
}

startServer().catch((err) => {
  console.error('[AEGIS Server Startup Error]:', err);
});
