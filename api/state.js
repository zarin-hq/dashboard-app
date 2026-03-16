import { put, list } from '@vercel/blob';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

const EMPTY_STATE = { pages: [], screenshots: [], annotations: [] };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'state.json' });
      const stateBlob = blobs.find((b) => b.pathname === 'state.json');
      if (stateBlob) {
        const response = await fetch(stateBlob.url, { cache: 'no-store' });
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch (e) {
      console.error('Error reading state:', e);
    }
    return res.status(200).json(EMPTY_STATE);
  }

  if (req.method === 'PUT') {
    try {
      await put('state.json', JSON.stringify(req.body), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Error saving state:', e);
      return res.status(500).json({ error: 'Failed to save state' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
