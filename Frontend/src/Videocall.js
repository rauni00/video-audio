import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const VideoCall = () => {
  const [roomName, setRoomName] = useState('');
  const [room, setRoom] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [participantVideoTracks, setParticipantVideoTracks] = useState([]);

  const setupLocalVideo = async () => {
    const videoElement = document.createElement('video');
    videoElement.muted = true;

    const { createLocalVideoTrack } = require('twilio-video');
    const track = await createLocalVideoTrack();

    track.attach(videoElement);
    setLocalVideoTrack(track);

    document.getElementById('local-video-container').appendChild(videoElement);
  };

  const handleJoinRoom = async () => {
    const token = await getTokenFromServer(roomName);
    const room = await connectToRoom(token);
    setRoom(room);
    setupLocalVideo();
  };

  const getTokenFromServer = async (roomName) => {
    const response = await axios.post('http://localhost:8080/join-room', {
      roomName: roomName,
    });
    return response.data.token;
  };

  const connectToRoom = async (token) => {
    const Video = require('twilio-video');

    const room = await Video.connect(token, { name: roomName, video: true });

    room.participants.forEach((participant) => {
      participant.tracks.forEach((publication) => {
        if (publication.track) {
          handleTrackSubscribed(publication.track);
        }
      });
      participant.on('trackSubscribed', handleTrackSubscribed);
    });

    room.on('participantConnected', (participant) => {
      participant.tracks.forEach((publication) => {
        if (publication.track) {
          handleTrackSubscribed(publication.track);
        }
      });

      participant.on('trackSubscribed', handleTrackSubscribed);
    });

    room.on('participantDisconnected', (participant) => {
      participant.tracks.forEach(handleTrackUnsubscribed);
    });

    setRoom(room);
  };

  const handleTrackSubscribed = (track) => {
    setParticipantVideoTracks((prevTracks) => [...prevTracks, track]);
  };

  const handleTrackUnsubscribed = (track) => {
    setParticipantVideoTracks((prevTracks) =>
      prevTracks.filter((t) => t !== track)
    );
  };

  useEffect(() => {
    return () => {
      if (localVideoTrack) {
        localVideoTrack.stop();
      }
    };
  }, []);

  return (
    <div>
      <h1>Twilio Video Chat</h1>
      <input
        type='text'
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder='Enter room name'
      />
      <button onClick={handleJoinRoom}>Join Room</button>
      <br />
      <br />
      <div id='local-video-container'></div>

      {participantVideoTracks.map((track, index) => (
        <div key={track}>
          <video ref={(el) => track.attach(el)} autoPlay width={50} />
        </div>
      ))}

      {room && (
        <div>
          <h2>Room: {roomName}</h2>
          <p>Participants: {room.participants.size}</p>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
