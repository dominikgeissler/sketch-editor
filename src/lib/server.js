/**
 * @fileoverview Small server to handle user requests and interact with SKETCH.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const { exec } = require('child_process');

let lastFile = null;

/**
 * Helper function to obtain the Content-Type by file extension
 * @param {string} extension
 * @return {string} The Content-Type
 */
const getContentType = (extension) => {
  switch (extension) {
    case 'css':
      return 'text/css';
    case 'js':
      return 'text/javascript';
    case 'html':
      return 'text/html';
    case 'ico':
      return 'image/x-icon';
    default:
      return 'text/plain';
  }
};

const simpleServer = http.createServer(
  (req, res) => {
    // File or folder requested
    // This is veeerry insecure but convenient
    if (req.method === 'GET') {
      const reqArgs = req.url.split('/');
      let fileName = reqArgs.pop();

      // index.html is requested with url = "/"
      if (fileName === '') {
        fileName = 'index.html';
      }

      if (!fileName) {
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        console.log('File could not be resolved');
        res.end('Request could not be parsed.');
      }

      // If file does not exist, return 404
      if (!fs.existsSync(path.resolve(__dirname, '..', ...reqArgs, fileName))) {
        res.writeHead(404, {
          'Content-Type': 'text/plain',
        });
        res.end('Not found');
        return;
      }

      if (fileName.includes('.')) {
        // File is requested
        console.debug(`Requested: ${fileName}`);
        console.debug('Loading file...');

        // Read the file and return it
        fs.readFile(path.resolve(__dirname, '..', ...reqArgs, fileName),
          (err, data) => {
            if (!!err) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              console.error(`Error while loading file: ${fileName}`, err);
              res.end('Internal Server Error');
            } else {
              res.writeHead(200, {
                'Content-Type': getContentType(fileName.split('.').pop()),
              });
              console.log(`${fileName} found, sending back...`);
              res.end(data);
            }
          });
      } else {
        // File is a directory, probably to get all items
        console.debug(`Requested: ${fileName}`);
        console.debug('Loading folder...');

        fs.readdir(path.resolve(__dirname, '..', ...reqArgs, fileName),
          (err, files) => {
            if (!!err) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              console.error(`Error while loading directory ${fileName}`, err);
              res.end('Internal Server Error');
            } else {
              res.writeHead(200, {
                'Content-Type': 'application/json',
              });
              console.log(`${fileName} found, sending back...`);
              res.end(JSON.stringify(files));
            }
          });
      }
    } else if (req.method === 'POST' && req.url === '/load-example') {
      // Load specific example
      console.debug('Loading specific example...');
      let body = '';
      req.on('data', (c) => {
        body += c;
      });

      req.on('end', () => {
        const selectedFile = decodeURIComponent(body.split('=')[1]);
        const filePath = path.resolve(__dirname, '../examples', selectedFile);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          res.writeHead(404, {
            'Content-Type': 'text/plain',
          });
          console.log(`File does not exist: ${filePath}`);
          res.end('File does not exist.');
          return;
        }
        console.debug(`Loading file: ${filePath}`);
        // Load file
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (!!err) {
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            console.error('Error while loading example', err);
            res.end('Error reading file content.');
          } else {
            res.writeHead(200, {
              'Content-Type': 'text/plain',
            });
            console.log(`${filePath} found, sending back...`);
            res.end(data);
          }
        });
      });
    } else if (req.method === 'POST' && req.url === '/') {
      // Execute code request
      console.debug('Executing code request recieved...');
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields) => {
        if (!!err) {
          res.writeHead(500, {
            'Content-Type': 'text/plain',
          });
          console.error('Error while parsing form', err);
          res.end('Internal Server Error');
        } else {
          console.log('Valid form received.');
          // Extract the code
          const content = fields.code.join('\n');
          console.debug(content);
          const fileName = `tmp-${Date.now()}.sk`;
          const filePath = path.join(__dirname, fileName);
          // Save the code to a file
          fs.writeFile(filePath, content, (err) => {
            if (!!err) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              console.error('Error while saving file', err);
              res.end('Error while saving file.');
            } else {
              // Execute the command
              // Capture the output and return it
              lastFile = fileName;
              console.log('Executing sketch...');
              exec(
                `sketch ${filePath} --fe-tempdir ` +
                `${path.resolve(__dirname, 'd_' + fileName)}`,
                (err, stdout, stderr) => {
                  if (!!err) {
                    res.writeHead(500, {
                      'Content-Type': 'text/plain',
                    });

                    console.error(
                      `Error while executing sketch: ${err.message}`, err,
                    );

                    res.end(`${stderr}`);
                  } else {
                    console.log(`Output: ${stdout}`);
                    res.writeHead(200, {
                      'Content-Type': 'text/plain',
                    });
                    console.log('Sketch successfully executed.');
                    res.end(`${stdout}`);
                  }
                });
            }
          });
        }
      });
    } else if (req.method === 'POST' && req.url === '/download-output') {
      // Download last file + generated output files
      console.debug('Downloading output...');
      if (!!lastFile) {
        /*
          TODO:
            Currently, the archive contains the whole directory
            structure, i.e. folders.
            This is not ideal, as it makes it harder to understand the files.
            Instead, we should only include the files that are needed.
            These are:
              * The sketch file
              * The tmp files
            The tmp files are only generated if there is an error.
            One can think about also adding the output which is currently
            logged in the "output" div.
            It could also be considered to directly generate code from sketch.
            This is done via the "--fe-output-code" flag.
            However, this works for now.
        */

        // Create tar.gz archive with all files
        // eslint-disable-next-line max-len
        exec(`tar -czvf "output.tar.gz" lib/${lastFile} -C ${'lib/d_' + lastFile} --transform='s,^./d_${lastFile}/,,' tmp`,
          (err, stdout, stderr) => {
            if (!!err) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              console.error(`Error while creating archive: ${err.message}`,
                err);
              res.end(`${stderr}`);
            } else {
              console.log(`Archive created: ${stdout}`);
              // Send file
              res.writeHead(200, {
                'Content-Type': 'application/gzip',
                'Content-Disposition': `attachment; filename=output.tar.gz`,
              });

              // Send the file to client
              fs.createReadStream(
                path.resolve(__dirname, '..', 'output.tar.gz'),
              )
                .pipe(res)
                .on('finish', () => {
                  console.log('File sent');

                  // Remove archive
                  fs.unlink(
                    path.resolve(__dirname, '..', 'output.tar.gz'),
                    (err) => {
                      if (!!err) {
                        console.error('Error while deleting archive', err);
                      } else {
                        console.log('Archive deleted');
                      }
                    });
                });

              // Remove tmp files and directory
              fs.unlink(path.resolve(__dirname, lastFile), (err) => {
                if (!!err) {
                  console.error('Error while deleting last sketch file', err);
                } else {
                  console.log('File deleted');
                }
              });

              // Delete directory, if it exists
              if (fs.existsSync(path.resolve(__dirname, `d_${lastFile}`))) {
                fs.rm(
                  path.resolve(__dirname, `d_${lastFile}`),
                  { recursive: true }, (err) => {
                    if (!!err) {
                      console.error(
                        'Error while deleting tmp sketch directory',
                        err);
                    } else {
                      console.log('Directory deleted');
                    }
                  });
              }
              // Unset last file
              lastFile = null;
            }
          });
      } else {
        res.writeHead(404, {
          'Content-Type': 'text/plain',
        });
        console.debug('lastFile is not set...');
        res.end('Not found');
      }
    } else {
      // Not found
      console.debug(`Not found ${req.method} ${req.url}`);
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('Not found');
    }
  },
);

// Listen to port 8080
simpleServer.listen(8080, () => {
  console.log('Server listening on port 8080.');
});

// Close the server
const closeServer = () => {
  simpleServer.close();
};

module.exports = {
  server: simpleServer,
  closeServer,
};
