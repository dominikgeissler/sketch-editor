// Small server to handle files
const http = require("http")
const fs = require("fs")
const path = require("path")
const formidable = require("formidable")
const { exec } = require("child_process");

let lastFile = null;

const simpleServer = http.createServer(
  (req, res) => {
    // index.html
    if (req.method === "GET" && req.url === "/") {
      console.debug("Loading index.html...");

      fs.readFile(path.resolve(__dirname, "../index.html"), (err, data) => {
        if (!!err) {
          res.writeHead(500, {
            "Content-Type": "text/plain"
          });
          res.end("Internal Server Error");
        } else {
          res.writeHead(200, {
            "Content-Type": "text/html"
          });
          res.end(data);
        }
      })
      // styles
    } else if (req.method === "GET" && req.url === "/styles.css") {
      console.debug("Loading styles.css...");
      fs.readFile(path.resolve(__dirname, "../styles.css"), (err, data) => {
        if (!!err) {
          res.writeHead(500, {
            "Content-Type": "text/plain"
          });
          console.error("Error while loading styles.css", err);
          res.end("Internal Server Error");
        } else {
          res.writeHead(200, {
            "Content-Type": "text/css"
          });
          res.end(data);
        }
      });
      // List of examples
    } else if (req.method === "GET" && req.url === "/examples") {
      console.debug("Loading examples...");
      fs.readdir(path.resolve(__dirname, "../examples"), (err, files) => {
        if (!!err) {
          res.writeHead(500, {
            "Content-Type": "text/plain"
          });
          console.error("Error while loading examples", err);
          res.end("Internal Server Error");
        } else {
          res.writeHead(200, {
            "Content-Type": "application/json"
          });
          res.end(JSON.stringify(files));
        }
      })
      // Get specific example
    } else if (req.method === "POST" && req.url === "/load-example") {
      console.debug("Loading specific example...");
      let body = "";
      req.on("data", (c) => { body += c; })

      req.on("end", () => {
        const selectedFile = decodeURIComponent(body.split("=")[1]);
        const filePath = path.resolve(__dirname, "../examples", selectedFile);
        console.debug(`Loading file: ${filePath}`)
        // Load file
        fs.readFile(filePath, "utf8", (err, data) => {
          if (!!err) {
            res.writeHead(500, {
              "Content-Type": "text/plain"
            });
            console.error("Error while loading example", err);
            res.end("Error reading file content.");
          } else {
            res.writeHead(200, {
              "Content-Type": "text/plain"
            });
            res.end(data);
          }
        });
      });
      // Execute code
    } else if (req.method === "POST" && req.url === "/") {
      console.debug("Executing code request recieved...");
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields) => {
        if (!!err) {
          res.writeHead(500, {
            "Content-Type": "text/plain",
          });
          console.error("Error while parsing form", err);
          res.end("Internal Server Error");
        } else {
          console.log("Valid form received.")
          // Extract the code
          const content = fields.code.join("\n");
          console.debug(content);
          const fileName = `tmp-${Date.now()}.sk`;
          const filePath = path.join(__dirname, fileName);
          // Save the code to a file
          fs.writeFile(filePath, content, (err) => {
            if (!!err) {
              res.writeHead(500, {
                "Content-Type": "text/plain",
              });
              console.error("Error while saving file", err);
              res.end("Error while saving file.");
            } else {
              // Execute the command
              // Capture the output and return it
              lastFile = fileName;
              console.log("Executing sketch...")
              exec(`sketch ${filePath} --fe-tempdir ${path.resolve(__dirname, "d_" + fileName)}`, (err, stdout, stderr) => {
                if (!!err) {
                  res.writeHead(500, {
                    "Content-Type": "text/plain"
                  });
                  console.error(`Error while executing sketch: ${err.message}`, err);
                  res.end(`${stderr}`);
                } else {
                  console.log(`Output: ${stdout}`)
                  res.writeHead(200, {
                    "Content-Type": "text/plain"
                  });
                  res.end(`${stdout}`);
                }
              })
            }
          })
        }
      })
      // Download last file + generated output files
    } else if (req.method === "GET" && req.url === "/download-output") {
      console.debug("Downloading output...");
      if (!!lastFile) {
        /*
          TODO:
            Currently, the archive contains the whole directory structure, i.e. folders.
            This is not ideal, as it makes it harder to understand the files.
            Instead, we should only include the files that are needed.
            These are:
              * The sketch file
              * The tmp files
            The tmp files are only generated if there is an error.
            One can think about also adding the output which is currently logged in the "output" div.
            It could also be considered to directly generate code from sketch.
            This is done via the "--fe-output-code" flag.
            However, this works for now.
        */

        // Create tar.gz archive with all files
        exec(`tar -czvf "output.tar.gz" lib/${lastFile} -C ${"lib/d_" + lastFile} --transform='s,^./d_${lastFile}/,,' tmp`, (err, stdout, stderr) => {
          if (!!err) {
            res.writeHead(500, {
              "Content-Type": "text/plain"
            });
            console.error(`Error while creating archive: ${err.message}`, err);
            res.end(`${stderr}`);
          } else {
            console.log(`Archive created: ${stdout}`);
            // Send file
            res.writeHead(200, {
              "Content-Type": "application/gzip",
              "Content-Disposition": `attachment; filename=output.tar.gz`
            });

            // Send the file to client
            fs.createReadStream(path.resolve(__dirname, "..", "output.tar.gz"))
              .pipe(res)
              .on("finish", () => {
                console.log("File sent");

                // Remove archive
                fs.unlink(path.resolve(__dirname, "..", "output.tar.gz"), (err) => {
                  if (!!err) {
                    console.error("Error while deleting archive", err);
                  } else {
                    console.log("Archive deleted");
                  }
                });
              });

            // Remove tmp files and directory
            fs.unlink(path.resolve(__dirname, lastFile), (err) => {
              if (!!err) {
                console.error("Error while deleting last sketch file", err);
              } else {
                console.log("File deleted");
              }
            });

            // Delete directory, if it exists
            if (fs.existsSync(path.resolve(__dirname, `d_${lastFile}`)))
              fs.rm(path.resolve(__dirname, `d_${lastFile}`), { recursive: true }, (err) => {
                if (!!err) {
                  console.error("Error while deleting tmp sketch directory", err);
                } else {
                  console.log("Directory deleted");
                }
              });

            // Unset last file
            lastFile = null;
          }
        });
      } else {
        res.writeHead(404, {
          "Content-Type": "text/plain"
        });
        res.end("Not found");
      }
      // Not found
    } else {
      console.debug(`Not found ${req.method} ${req.url}`);
      res.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      res.end("Not found");
    }
  }
);

// Listen to port 8080
simpleServer.listen(8080, () => {
  console.log("Server listening on port 8080.")
});