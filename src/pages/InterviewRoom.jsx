import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const InterviewRoom = () => {
  const { roomId } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetLink, setMeetLink] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`/api/interviews/room/${roomId}`);
        setInterview(response.data);
      } catch (error) {
        setInterview(null);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [roomId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!interview) {
    return <div className="text-center mt-10">Interview not found.</div>;
  }

  const handleSetMeetLink = (e) => {
    e.preventDefault();
    setMeetLink(inputValue);
    setShowInput(false);
  };

  return (
    <div className="interview-room-container fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 className="text-3xl font-bold mb-4">Interview Room</h1>
      <p className="text-lg mb-6">Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span></p>
      {showInput ? (
        <form onSubmit={handleSetMeetLink} className="mb-6">
          <label className="block mb-2 font-semibold">Enter Google Meet Link or ID:</label>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="form-input px-3 py-2 border rounded w-64"
            placeholder="https://meet.google.com/xyz-abc-def or xyz-abc-def"
            required
          />
          <button type="submit" className="btn btn-primary ml-2">Set</button>
        </form>
      ) : (
        <a
          href={meetLink.startsWith('http') ? meetLink : `https://meet.google.com/${meetLink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mb-6"
        >
          Join Google Meet
        </a>
      )}
      <div className="bg-white rounded shadow p-6 max-w-lg mx-auto">
        <p className="text-gray-600">This is a placeholder for your video call, chat, or interview features.</p>
        <p className="text-gray-500 mt-2">You can add video, audio, and collaborative tools here.</p>
      </div>
    </div>
  );
};

export default InterviewRoom; 