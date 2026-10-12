import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

process.env.VERCEL = '1';
process.env.AI_PROVIDER = 'demo';
process.env.AI_API_KEY = '';
const { app } = await import('../index.js');
let server: ReturnType<typeof app.listen>;
let baseUrl: string;
before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');
  baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
});
after(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); });

async function post(path: string, body: unknown) {
  return fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
describe('authentication and protected API', () => {
  it('rejects wardrobe access without a session', async () => {
    const response = await fetch(`${baseUrl}/wardrobe`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).success, false);
  });
  it('validates registration before attempting persistence', async () => {
    const response = await post('/auth/register', { name: 'A', email: 'bad', password: 'short' });
    assert.equal(response.status, 400);
  });
  it('validates login before attempting persistence', async () => {
    const response = await post('/auth/login', { email: 'bad', password: 'short' });
    assert.equal(response.status, 400);
  });
});
describe('photo transformation privacy boundary', () => {
  it('rejects transformation without explicit consent', async () => {
    const response = await post('/ai/transform', { image: 'a'.repeat(120), mimeType: 'image/jpeg', style: 'Watercolor', prompt: '' });
    assert.equal(response.status, 400);
  });
  it('returns a clear configuration response without a provider key', async () => {
    const response = await post('/ai/transform', { consent: true, image: 'a'.repeat(120), mimeType: 'image/jpeg', style: 'Watercolor', prompt: '' });
    assert.equal(response.status, 503);
    assert.match((await response.json()).message, /not configured/i);
  });
});
