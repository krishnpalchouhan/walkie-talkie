const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const channels = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (channel) => {
    socket.join(channel);
    if (!channels[channel]) {
      channels[channel] = new Set();
    }
    channels[channel].add(socket.id);
    console.log(`User joined channel: ${channel}`);
  });

  socket.on('voice', (data) => {
    const channel = Array.from(socket.rooms)[1]; // Get the channel room
    if (channel) {
      socket.to(channel).emit('voice', data);
    }
  });

  socket.on('disconnect', () => {
    for (const channel in channels) {
      channels[channel].delete(socket.id);
      if (channels[channel].size === 0) {
        delete channels[channel];
      }
    }
    console.log('A user disconnected');
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});