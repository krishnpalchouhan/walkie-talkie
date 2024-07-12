const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = new Server(httpServer);

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

    server.all('*', (req, res) => {
        return handle(req, res, parse(req.url, true));
    });

    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
