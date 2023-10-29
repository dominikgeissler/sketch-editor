// Small server to handle files
const http = require("http")
const fs = require("fs")
const path = require("path")
const formidable = require("formidable")
const { exec } = require("child_process");


const simpleServer = http.createServer(
  (req, res) => {
    // index.html
    if (req.method === "GET" && req.url === "/") {
      fs.readFile("index.html", (err, data) => {
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
      fs.readFile("styles.css", (err, data) => {
        if (!!err) {
          res.writeHead(500, {
            "Content-Type": "text/plain"
          });
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
      fs.readdir("examples", (err, files) => {
        if (!!err) {
          res.writeHead(500, {
            "Content-Type": "text/plain"
          });
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
      let body = "";
      req.on("data", (c) => { body += c; })

      req.on("end", () => {
        const selectedFile = decodeURIComponent(body.split("=")[1]);
        const filePath = path.join("examples", selectedFile);

        fs.readFile(filePath, "utf8", (err, data) => {
          if (!!err) {
            res.writeHead(500, {
              "Content-Type": "text/plain"
            });
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
      const form = new formidable.IncomingForm();
      console.log("Form: " + form)
      form.parse(req, (err, fields) => {
        if (!!err) {
          res.writeHead(500, {
            "Content-Type": "text/plain",
          });
          res.end("Internal Server Error");
        } else {
          // Extract the code
          const content = fields.code.join("\n");
          const filePath = path.join(__dirname, `tmp-${Date.now()}.sk`);

          fs.writeFile(filePath, content, (err) => {
            if (!!err) {
              res.writeHead(500, {
                "Content-Type": "text/plain",
              });
              res.end("Error while saving file.");
            } else {
              // Execute the command
              // Capture the output and return it
              exec(`sketch ${filePath}`, (err, stdout, stderr) => {
                if (!!err) {
                  console.error(`Error: ${err.message}`)
                  res.writeHead(500, {
                    "Content-Type": "text/plain"
                  });
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
      // Not found
    } else {
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
