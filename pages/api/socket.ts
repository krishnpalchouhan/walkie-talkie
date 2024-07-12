import { Server } from 'socket.io';

const SocketHandler = (req: any, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', socket => {
      socket.on('join-room', (roomId) => {
        socket.join(roomId);
      });

      socket.on('send-audio', (audioChunk, roomId) => {
        socket.to(roomId).emit('receive-audio', audioChunk);
      });
    });
  }
  res.end();
};

export default SocketHandler;