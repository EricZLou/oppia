FROM python:2.7-stretch
RUN apt-get update && \
    apt-get -y install sudo

# Install OpenJDK-8
RUN apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;
# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

RUN mkdir /home/oppia
COPY . /home/oppia/

WORKDIR /home/oppia/
RUN ls
RUN bash scripts/install_prerequisites.sh
# RUN bash scripts/start.sh
