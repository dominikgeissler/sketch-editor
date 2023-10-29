# Sketch
Dockerfile for the sketch project from [A. Solar-Lezama](https://people.csail.mit.edu/asolar/).

* https://github.com/asolarlez/sketch-backend
* https://github.com/asolarlez/sketch-frontend

## Setup (Docker)

### Build
```bash
docker build . -t sketch
```
or in VSCode _Ctrl + Shift + P_ -> _Run task_ -> _Docker Build_

### Run
```bash
docker run -p 8080:8080 -d sketch
```
or in VSCode _Ctrl + Shift + P_ -> _Run task_ -> _Docker Run_
