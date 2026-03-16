import { put } from '@vercel/blob';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, dataUrl } = req.body;
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    const blob = await put(`screenshots/${id}.jpg`, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'image/jpeg',
    });

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    console.error('Error uploading screenshot:', e);
    return res.status(500).json({ error: 'Failed to upload' });
  }
}
