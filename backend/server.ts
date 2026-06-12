import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { playAudit } from './playwright-audit';

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/audit', async (req: Request, res: Response) => {
  try {
    const { url, useChrome, frameData } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    const result = await playAudit(url, useChrome, frameData);
    
    res.json({
      success: true,
      issues: result.issues,
      screenshot: result.screenshot
    });
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Audit failed'
    });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
