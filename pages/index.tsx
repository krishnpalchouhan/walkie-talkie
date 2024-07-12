import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const audioContext = useRef(null);
  const mediaRecorder = useRef(null);

  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socket');
      const newSocket = io();
      setSocket(newSocket);
    };
    initSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
    }
  };

  const startTalking = async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0 && socket) {
        socket.emit('send-audio', event.data, roomId);
      }
    };

    mediaRecorder.current.start(100);
    setIsTalking(true);
  };

  const stopTalking = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsTalking(false);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('receive-audio', (audioChunk) => {
        const audio = new Audio(URL.createObjectURL(new Blob([audioChunk])));
        audio.play();
      });
    }
  }, [socket]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Walkie-Talkie</h1>
      <div className="space-y-4">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          className="px-4 py-2 border rounded"
        />
        <button
          onClick={joinRoom}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Join Room
        </button>
        <button
          onClick={isTalking ? stopTalking : startTalking}
          className={`px-4 py-2 ${
            isTalking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white rounded`}
        >
          {isTalking ? 'Stop Talking' : 'Start Talking'}
        </button>
      </div>
    </div>
  );
}