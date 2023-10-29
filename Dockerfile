# Can prob. use a more lightweight image
FROM ubuntu as SKETCH

# Install dependencies and remove unnecessary packages
RUN apt-get update && \
    apt-get -y upgrade && \
    apt-get install -y curl build-essential flex bison tar openjdk-11-jdk && \
    rm -rf /var/lib/apt/lists/*

# Download and extract sketch
RUN curl -o tmp/sketch.tar.gz https://people.csail.mit.edu/asolar/sketch-1.7.6.tar.gz && \
    tar -xzvf /tmp/sketch.tar.gz -C /tmp && \
    mv /tmp/sketch-1.7.6 /home/sketch && \
    rm /tmp/sketch.tar.gz /home/sketch/README

# Install sketch (steps from the README)
RUN cd /home/sketch/sketch-backend && \
    chmod +x ./configure && \
    bash configure && \
    make

# Set up environmental variables and aliases
ENV PATH="${PATH}:/home/sketch/sketch-frontend"
ENV SKETCH_HOME="/home/sketch/sketch-frontend/runtime"

RUN echo 'alias sketch="bash /home/sketch/sketch-frontend/sketch"' >> /root/.bashrc

# -- Simple server setup --

# nodejs stuff
RUN apt-get update && apt-get -y upgrade && apt-get install -y nodejs npm
RUN npm install -g n
RUN n latest

COPY src /home/app

WORKDIR /home/app

RUN npm install

EXPOSE 8080

CMD ["node", "server.js"]