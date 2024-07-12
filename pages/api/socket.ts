// pages/api/socket.ts
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { ServerResponse } from 'http';

const SocketHandler = (req: NextApiRequest, res: ServerResponse & { socket: any }) => {
  if (!res.socket) {
    res.statusCode = 500;
    res.end('Socket is not available');
    return;
  }

  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const httpServer: HttpServer = res.socket.server;
    const io = new SocketIOServer(httpServer);
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
