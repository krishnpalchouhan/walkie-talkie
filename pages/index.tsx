import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io();

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [messages, setMessages] = useState<string[]>([]);
    const audioRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        socket.on('chatMessage', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('audioMessage', (audioBlob) => {
            const audio = new Audio(URL.createObjectURL(audioBlob));
            audio.play();
        });
    }, []);

    const joinRoom = () => {
        socket.emit('joinRoom', roomId);
    };

    const sendChatMessage = (message: string) => {
        socket.emit('chatMessage', { roomId, message });
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioRef.current = new MediaRecorder(stream);
        audioRef.current.ondataavailable = (event) => {
            socket.emit('audioMessage', { roomId, audioBlob: event.data });
        };
        audioRef.current.start();
    };

    const stopRecording = () => {
        audioRef.current?.stop();
    };

    return (
        <div className="flex flex-col items-center">
            <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border-2 p-2 m-2"
            />
            <button onClick={joinRoom} className="bg-blue-500 text-white p-2">Join Room</button>
            <button onClick={startRecording} className="bg-green-500 text-white p-2">Start Recording</button>
            <button onClick={stopRecording} className="bg-red-500 text-white p-2">Stop Recording</button>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
        </div>
    );
};

export default Home;
