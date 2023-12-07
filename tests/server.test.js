/**
 * @fileoverview Tests for the server.
*/

const request = require('supertest');
const { server, closeServer } = require('../src/lib/server.js');

describe('GET /', () => {
  it('correctly loads index.html', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
    expect(res.text).toContain('Sketch-Editor');
  });

  test.each([
    ['styles.css', 'text/css', '#editor'],
    ['favicon.ico', 'image/x-icon', ''],
  ])('correctly loads static files %s', async (path, type, content) => {
    const res = await request(server).get('/static/' + path);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe(type);

    // Favicon is binary
    if (!!content) {
      expect(res.text).toContain(content);
    }
  });

  test.each([
    'index.js',
    'setup.js',
  ])('correctly loads javascript files: %s', async (path) => {
    const res = await request(server).get('/lib/' + path);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/javascript');
    expect(res.text).toContain('document.getElementById');
  });

  it('examples are correctly loaded', async () => {
    const res = await request(server).get('/examples');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/json');
    expect(res.body).toContain('HelloWorld.sk');
  });

  it('non existent file results in 404', async () => {
    const res = await request(server).get('/thisfilesdoesnotexist.txt');
    expect(res.statusCode).toBe(404);
  });

  it('non existent folder results in 404', async () => {
    const res = await request(server).get('/thisfolderdoesnotexist');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /load-example', () => {
  it('correctly loads HelloWorld.sk', async () => {
    const res = await request(server)
      .post('/load-example')
      .send('selectedFile=HelloWorld.sk');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toContain('harness void main');
  });

  it('non existent file results in 404', async () => {
    const res = await request(server)
      .post('/load-example')
      .send('selectedFile=ThisFileDoesNotExist.sk');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /download-output', () => {
  it('returns 404 if no output is available', async () => {
    const res = await request(server).post('/download-output');
    expect(res.statusCode).toBe(404);
  });
});

describe('Not recognized routes', () => {
  it('returns 404 for non existent route', async () => {
    const res = await request(server).post('/thisroutedoesnotexist');
    expect(res.statusCode).toBe(404);
  });
});

afterAll(() => {
  closeServer();
});
