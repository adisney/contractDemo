FROM openethereum/openethereum:v3.0.0

ADD spec.json /home/openethereum
ADD password /home/openethereum
RUN mkdir -p /home/openethereum/.local/share/io.parity.ethereum/keys/Shotgun\ Demo
COPY --chown=openethereum:openethereum ["keys/Shotgun Demo", "/home/openethereum/.local/share/io.parity.ethereum/keys/Shotgun Demo"]
