# |-------------------|
# |==[ Build stage ]==|
# |-------------------|

# TODO: Use a more lightweight image?
FROM ubuntu:23.04 as builder

# Install dependencies and remove unnecessary packages
RUN apt-get update && \
  apt-get -y upgrade && \
  apt-get install -y curl build-essential flex bison tar openjdk-11-jdk && \
  rm -rf /var/lib/apt/lists/*

# Download and extract sketch
RUN curl -o tmp/sketch.tar.gz https://people.csail.mit.edu/asolar/sketch-1.7.6.tar.gz && \
  tar -xzf tmp/sketch.tar.gz -C /tmp && \
  rm -r /tmp/sketch.tar.gz && \
  mv /tmp/sketch-1.7.6 /home/sketch

# Install sketch (steps from the README)
RUN cd /home/sketch/sketch-backend && \
  chmod +x ./configure && \
  bash configure && \
  make

# Remove some files to make the image more compact
RUN rm -r /home/sketch/README \
  /home/sketch/**/README \
  /home/sketch/**/scripts \
  /home/sketch/**/ChangeLog \
  /home/sketch/**/test** \
  /home/sketch/**/.**project \
  /home/sketch/**/.**ignore \
  /home/sketch/**/**config** \
  /home/sketch/**/src/Makefile* \
  /home/sketch/sketch-frontend/LanguageReference.pdf \
  /home/sketch/sketch-frontend/release_benchmarks \
  /home/sketch/sketch-frontend/customcodegen \
  /home/sketch/sketch-frontend/sketchlib \
  /home/sketch/sketch-frontend/runtime \
  /home/sketch/sketch-frontend/src \
  /home/sketch/sketch-backend/AUTHORS \
  /home/sketch/sketch-backend/LICENSE \
  /home/sketch/sketch-backend/INSTALL \
  /home/sketch/sketch-backend/COPYING \
  /home/sketch/sketch-backend/NEWS \
  /home/sketch/sketch-backend/cegis.exe* \
  /home/sketch/sketch-backend/compile \
  /home/sketch/sketch-backend/autom4te.cache \
  /home/sketch/sketch-backend/m4 \
  /home/sketch/sketch-backend/missing \
  /home/sketch/sketch-backend/stamp-h1 \
  /home/sketch/sketch-backend/depcomp \
  /home/sketch/sketch-backend/autogen.sh \
  /home/sketch/sketch-backend/aclocal.m4 \
  /home/sketch/sketch-backend/install-sh \
  /home/sketch/sketch-backend/ltmain.sh \
  /home/sketch/sketch-backend/buildCegisStatic.sh \
  /home/sketch/sketch-backend/bindings \
  /home/sketch/sketch-backend/libtool \
  /home/sketch/sketch-backend/.hgtags \
  /home/sketch/sketch-backend/.settings \
  /home/sketch/sketch-backend/src/.cdtproject \
  /home/sketch/sketch-backend/src/Sketch.* \
  /home/sketch/sketch-backend/src/MiniSat \
  /home/sketch/sketch-backend/src/SketchSolver/**/*.h \
  /home/sketch/sketch-backend/src/SketchSolver/**/*.cpp

# |-----------------|
# |==[ Run stage ]==|
# |-----------------|

FROM ubuntu:23.04 as run

# Copy the sketch files from the build stage
COPY --from=builder /home/sketch /home/sketch

# Install the dependencies for the run stage, also set up node
# Note: cURL is needed for n
# Also add the alias "sketch"
# TODO maybe replace this image with a node-based one?
#   I wasn't able to do this

RUN apt-get update && \
  apt-get -y upgrade && \
  apt-get install -y openjdk-11-jdk nodejs npm curl && \
  npm install -g n && \
  n 18.18.0 && \
  rm -rf /var/lib/apt/lists/* && \
  echo 'alias sketch="bash /home/sketch/sketch-frontend/sketch"' >> /root/.bashrc

# Set up environmental variables
ENV PATH="${PATH}:/home/sketch/sketch-frontend"
ENV SKETCH_HOME="/home/sketch/sketch-frontend/runtime"

# |---------------------------|
# |==[ Simple server setup ]==|
# |---------------------------|

WORKDIR /home/app

# Make some use of layer caching as to not run 'npm install'
# every time something changed
COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "src/lib/server.js"]
