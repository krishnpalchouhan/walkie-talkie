import { Server } from 'socket.io';

const SocketHandler = (req: any, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);

      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room: ${roomId}`);
      });

      socket.on('send-audio', (audioChunk, roomId) => {
        socket.to(roomId).emit('receive-audio', audioChunk);
        console.log(`Audio chunk sent to room: ${roomId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }
  res.end();
};

export default SocketHandler;
