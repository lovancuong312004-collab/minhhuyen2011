import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'gifts-store-v10.json');
const CURRENT_SCHEMA_VERSION = 10;
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface StoredGift {
  id: string;
  schemaVersion?: number;
  updatedAt: string;
  [key: string]: unknown;
}

interface GiftStore {
  schemaVersion: number;
  defaultGift: StoredGift | null;
  giftsById: Record<string, StoredGift>;
}

const EXCLUDED_FILES = new Set([
  'media_1792494797671_iwh4j3.jpg',
  'media_1792496860242_cg5jpy.jpg',
]);

const PRIORITY_PORTRAIT_ORDER = [
  'media_1792494809466_tnnswj.jpg',
  'media_1792494819141_8t0f7j.jpg',
  'media_1792494810945_relqcd.jpg',
  'media_1792494816507_8ak29j.jpg',
  'media_1792494809752_xi5nnv.jpg',
  'media_1792494810595_1txitr.jpg',
  'media_1792494807824_zp91aa.jpg',
  'media_1792494810438_1evxeb.jpg',
  'media_1792494809755_3p2pvh.jpg',
  'media_1792494810034_3lj5nf.jpg',
  'media_1792494810025_k61vdx.jpg',
  'media_1792494807033_2579ff.jpg',
  'media_1792494802251_1n3kwf.jpg',
];

function scanUploadedMemories() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) return [];
    const rawFiles = fs
      .readdirSync(UPLOADS_DIR)
      .filter(
        (f) =>
          /\.(jpe?g|png|webp|mp4|mov|webm)$/i.test(f) && !EXCLUDED_FILES.has(f)
      );

    const priorityMap = new Map(
      PRIORITY_PORTRAIT_ORDER.map((name, idx) => [name, idx])
    );

    const files = rawFiles.sort((a, b) => {
      const pa = priorityMap.has(a) ? priorityMap.get(a)! : 9999;
      const pb = priorityMap.has(b) ? priorityMap.get(b)! : 9999;
      if (pa !== pb) return pa - pb;
      return a.localeCompare(b);
    });

    return files.map((fileName, idx) => {
      const isVideo = /\.(mp4|mov|webm)$/i.test(fileName);
      const url = `/uploads/${fileName}`;
      return {
        id: `upload-${fileName}`,
        imageUrl: isVideo ? '' : url,
        videoUrl: isVideo ? url : undefined,
        mediaType: isVideo ? 'video' : 'image',
        caption: `Kỷ niệm #${idx + 1}`,
        date: '20/10',
        note: isVideo
          ? 'Khoảnh khắc sống động của hai đứa mình ❤'
          : 'Chúc Minh Huyền lúc nào cũng xinh đẹp, rạng rỡ và hạnh phúc.',
      };
    });
  } catch {
    return [];
  }
}

function readStore(): GiftStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as GiftStore;
      if (parsed && parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
        return {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          defaultGift: parsed.defaultGift || null,
          giftsById: parsed.giftsById || {},
        };
      }
    }
  } catch (err) {
    console.error('Failed to read gift store:', err);
  }
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    defaultGift: null,
    giftsById: {},
  };
}

function writeStore(store: GiftStore): void {
  try {
    store.schemaVersion = CURRENT_SCHEMA_VERSION;
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write gift store:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

  app.post(
    '/api/upload-raw',
    express.raw({ type: '*/*', limit: '250mb' }),
    (req, res) => {
      try {
        const extRaw = String(req.query.ext || 'jpg')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        const allowedExts = new Set([
          'jpg',
          'jpeg',
          'png',
          'webp',
          'gif',
          'mp4',
          'mov',
          'webm',
          'mp3',
          'm4a',
          'wav',
        ]);
        const ext = allowedExts.has(extRaw) ? extRaw : 'jpg';
        const fileName = `media_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, fileName);

        const bodyBuffer = Buffer.isBuffer(req.body)
          ? req.body
          : Buffer.from([]);
        if (bodyBuffer.length === 0) {
          res.status(400).json({ ok: false, error: 'Empty file buffer' });
          return;
        }

        fs.writeFileSync(filePath, bodyBuffer);
        res.json({
          ok: true,
          url: `/uploads/${fileName}`,
        });
      } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ ok: false, error: 'Upload failed' });
      }
    }
  );

  app.use(express.json({ limit: '150mb' }));

  app.get('/api/uploaded-files', (_req, res) => {
    res.json({
      ok: true,
      memories: scanUploadedMemories(),
    });
  });

  app.get('/api/gift', (req, res) => {
    const store = readStore();
    const id = typeof req.query.id === 'string' ? req.query.id : '';
    const diskUploads = scanUploadedMemories();

    let gift =
      id && store.giftsById[id] ? store.giftsById[id] : store.defaultGift;

    if (gift && diskUploads.length > 0) {
      const existingMems = Array.isArray(gift.memories)
        ? (gift.memories as { imageUrl?: string; videoUrl?: string }[])
        : [];
      const existingUrls = new Set(
        existingMems.map((m) => m.videoUrl || m.imageUrl).filter(Boolean)
      );
      const missingFromDisk = diskUploads.filter(
        (u) => !existingUrls.has(u.videoUrl || u.imageUrl)
      );
      if (missingFromDisk.length > 0) {
        gift = {
          ...gift,
          memories: [...existingMems, ...missingFromDisk],
        };
      }
    }

    res.json({
      ok: true,
      gift: gift || null,
      diskUploads,
    });
  });

  app.post('/api/gift', (req, res) => {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ ok: false, error: 'Invalid gift payload' });
      return;
    }

    const store = readStore();
    const id =
      typeof payload.id === 'string' && payload.id.trim()
        ? payload.id.trim()
        : `gift-${Date.now().toString(36)}`;

    const savedGift: StoredGift = {
      ...payload,
      id,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    };

    store.defaultGift = savedGift;
    store.giftsById[id] = savedGift;
    writeStore(store);

    res.json({
      ok: true,
      id,
      gift: savedGift,
    });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
