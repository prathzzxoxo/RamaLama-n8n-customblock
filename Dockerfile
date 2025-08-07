FROM n8nio/n8n:latest

USER root

# Install Python, pip, and other dependencies needed for ramalama
RUN apk add --no-cache \
    python3 \
    py3-pip \
    podman \
    && rm -rf /var/cache/apk/*

# Install ramalama via pip
RUN pip3 install --no-cache-dir ramalama

# Copy the custom nodes folder
COPY ./custom-nodes /home/node/.n8n/custom/node_modules/ramalama-node

# Change ownership of the copied files
RUN chown -R node:node /home/node/.n8n/custom/node_modules/ramalama-node

# Switch back to the node user
USER node

# Set the working directory
WORKDIR /home/node

# Use the default entrypoint and CMD from the base image