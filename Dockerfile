FROM python:2.7-stretch

RUN apt-get update && \
    apt-get -y install sudo && \
    apt-get -y install vim

# Install OpenJDK-8
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f

# Setup JAVA_HOME
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
ENV PATH $PATH:$JAVA_HOME/bin
RUN export JAVA_HOME

# Install dumb-init (Very handy for easier signal handling of SIGINT/SIGTERM/SIGKILL etc.)
RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64.deb
RUN dpkg -i dumb-init_*.deb
ENTRYPOINT ["dumb-init"]

# Use new sources since Jessie has been archived
RUN printf "deb http://archive.debian.org/debian/ \
    jessie main\ndeb-src http://archive.debian.org/debian/ \
    jessie main\ndeb http://security.debian.org \
    jessie/updates main\ndeb-src http://security.debian.org \
    jessie/updates main" \
    > /etc/apt/sources.list

# Install Google Chrome for frontend tests and e2e tests
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -y google-chrome-stable python-pip

# Copy oppia files to container
RUN mkdir /home/oppia
COPY . /home/oppia/

RUN useradd -m docker && echo "docker:docker" | chpasswd && adduser docker sudo
USER docker

WORKDIR /home/oppia/
