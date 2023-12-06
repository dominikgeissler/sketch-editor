# sketch-editor
[![image](https://github.com/dominikgeissler/sketch-editor/actions/workflows/docker-build.yml/badge.svg?branch=main)](https://github.com/dominikgeissler/sketch-editor/actions/workflows/docker-build.yml)
[![eslint](https://github.com/dominikgeissler/sketch-editor/actions/workflows/eslint.yml/badge.svg?branch=main)](https://github.com/dominikgeissler/sketch-editor/actions/workflows/eslint.yml)

Dockerized editor for the sketch project from [A. Solar-Lezama](https://people.csail.mit.edu/asolar/).

* https://github.com/asolarlez/sketch-backend
* https://github.com/asolarlez/sketch-frontend


## Setup (Docker)
Run the docker container

```bash
docker run --rm -p 8080:8080 ghcr.io/dominikgeissler/sketch-editor
```

## Setup (Docker, locally)
### Build
```bash
docker build . -t sketch-editor
```
or in VSCode _Ctrl + Shift + P_ -> _Run task_ -> _Docker Build_

### Run
```bash
docker run -p 8080:8080 -d sketch-editor
```
or in VSCode _Ctrl + Shift + P_ -> _Run task_ -> _Docker Run_


## References
* [Program Sketching, A . Solar-Lezama, International Journal on Software Tools for Technology Transfer 15, 475 - 495 (2013)](https://doi.org/10.1007/s10009-012-0249-7)
