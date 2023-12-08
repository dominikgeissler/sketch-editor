const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Test initialization of elements', () => {
  let dom;
  let doc;

  beforeEach(() => {
    // Load index.html
    const indexHtml = fs.readFileSync(
      path.resolve(__dirname, '..', 'src/index.html'),
    );

    dom = new JSDOM(indexHtml);
    doc = dom.window.document;
  });

  test.each([
    'example',
    'download',
    'delete',
  ])('Button \'%s\' should be disabled upon start', (id) => {
    const button = doc.getElementById(id);
    expect(button.disabled).toBe(true);
  });

  test.each([
    'output',
    'download-output',
  ])('Element \'%s\' should be hidden upon start', (id) => {
    const el = doc.getElementById(id);
    expect(el.hidden).toBe(true);
  });

  it('Default selection of example-select should be \"\"', () => {
    const select = doc.getElementById('example-select');
    expect(select.value).toBe('');
  });
});
