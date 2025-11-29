FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    curl xz-utils ca-certificates git nodejs npm \
 && rm -rf /var/lib/apt/lists/*

# Install Arduino CLI
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh \
 && mv bin/arduino-cli /usr/local/bin/arduino-cli

# Pre-install AVR core for Uno/Nano
RUN arduino-cli config init \
 && arduino-cli core update-index \
 && arduino-cli core install arduino:avr

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY server.js ./

ENV PORT=3000 FQBN=arduino:avr:uno BODY_LIMIT=2mb
EXPOSE 3000
CMD ["npm", "start"]
