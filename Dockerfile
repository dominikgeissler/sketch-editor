# Can prob. use a more lightweight image
FROM ubuntu as BASE

# Install dependencies and remove unnecessary packages
RUN apt-get update && \
    apt-get -y upgrade && \
    apt-get install -y curl build-essential flex bison tar && \
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

# Set up environmental variables
RUN export PATH="$PATH:/home/sketch/sketch-frontend" && \
    export SKETCH_HOME="/home/sketch/sketch-frontend/runtime"

CMD ["bash", "-c", "--", "while true; do sleep 30; done"]