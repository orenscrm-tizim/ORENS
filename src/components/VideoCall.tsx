"use client";

import React, { useEffect, useRef, useState } from 'react';
import Peer, { MediaConnection } from 'peerjs';

// Dynamically import MediaPipe to avoid SSR issues
let SelfieSegmentation: any;
let Camera: any;

interface VideoCallProps {
  myId: string;
  onClose: () => void;
  targetId?: string; // If provided, automatically call this target
}

export default function VideoCall({ myId, onClose, targetId }: VideoCallProps) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [call, setCall] = useState<MediaConnection | null>(null);
  const [isBlur, setIsBlur] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('Initializing...');
  const [targetInput, setTargetInput] = useState(targetId || '');

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const processedStreamRef = useRef<MediaStream | null>(null);

  // Load MediaPipe dynamically
  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        const selfieSegModule = await import('@mediapipe/selfie_segmentation');
        const cameraUtilsModule = await import('@mediapipe/camera_utils');
        SelfieSegmentation = selfieSegModule.SelfieSegmentation || selfieSegModule.default?.SelfieSegmentation;
        Camera = cameraUtilsModule.Camera || cameraUtilsModule.default?.Camera;
      } catch (err) {
        console.error("Failed to load MediaPipe", err);
      }
    };
    loadMediaPipe();
  }, []);

  // Initialize Peer
  useEffect(() => {
    const newPeer = new Peer(myId, {
      debug: 2,
    });

    newPeer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setCallStatus('Ready');
      if (targetId) {
        setCallStatus(`Calling ${targetId}...`);
      }
    });

    newPeer.on('call', (incomingCall) => {
      if (window.confirm("Yangi video qo'ng'iroq kelmoqda! Qabul qilasizmi?")) {
        setCallStatus('Connected');
        // Answer with our stream
        const streamToSend = processedStreamRef.current || rawStreamRef.current;
        if (streamToSend) {
          incomingCall.answer(streamToSend);
          setupCallEvents(incomingCall);
        } else {
          startCamera().then(stream => {
            incomingCall.answer(stream);
            setupCallEvents(incomingCall);
          });
        }
      } else {
        incomingCall.close();
      }
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, [myId]);

  const startCamera = async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      rawStreamRef.current = stream;
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Kamerani yoqishda xatolik", err);
      setCallStatus("Kamera topilmadi");
      throw err;
    }
  };

  const setupCallEvents = (activeCall: MediaConnection) => {
    setCall(activeCall);
    activeCall.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setCallStatus('Connected');
    });
    activeCall.on('close', () => {
      setCallStatus('Call ended');
      endCall();
    });
    activeCall.on('error', (err) => {
      console.error(err);
      setCallStatus('Error: ' + err.message);
    });
  };

  const startCall = async () => {
    if (!peer || !targetInput) return;
    setCallStatus('Calling...');
    const stream = processedStreamRef.current || rawStreamRef.current || await startCamera();
    const newCall = peer.call(targetInput, stream);
    setupCallEvents(newCall);
  };

  const endCall = () => {
    if (call) call.close();
    setCallStatus('Ready');
    setCall(null);
  };

  // Setup Blur effect loop
  useEffect(() => {
    if (!isBlur || !rawStreamRef.current || !canvasRef.current || !myVideoRef.current) {
      if (processedStreamRef.current && !isBlur) {
        // Revert to raw stream if blur is off
        // Note: Dynamically swapping tracks in PeerJS requires replaceTrack, which is complex.
        // For simplicity, we just won't update the blur canvas.
      }
      return;
    }

    if (!SelfieSegmentation) {
      alert("AI Modeli hali yuklanmadi, kuting...");
      setIsBlur(false);
      return;
    }

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    const videoElement = myVideoRef.current;

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      }
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
    });

    selfieSegmentation.onResults((results: any) => {
      if (!canvasCtx) return;
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw segmentation mask
      canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

      // Only overwrite missing pixels
      canvasCtx.globalCompositeOperation = 'source-out';

      // Draw background (blurred)
      canvasCtx.filter = 'blur(10px)';
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      // Only overwrite missing pixels
      canvasCtx.globalCompositeOperation = 'destination-atop';
      canvasCtx.filter = 'none';

      // Draw original image (person)
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.restore();
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (isBlur) {
          await selfieSegmentation.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });
    camera.start();

    // Capture the processed stream from canvas
    const processedStream = canvasElement.captureStream(30);
    // Add audio track from raw stream
    rawStreamRef.current.getAudioTracks().forEach(track => processedStream.addTrack(track));
    processedStreamRef.current = processedStream;

    return () => {
      camera.stop();
      selfieSegmentation.close();
    };
  }, [isBlur]);

  // Handle start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (rawStreamRef.current) {
        rawStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="font-bold text-slate-800">Video Qo'ng'iroq</h2>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-mono">{callStatus}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            ❌
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 bg-slate-900 relative p-4 flex gap-4">
          <div className="flex-1 rounded-2xl overflow-hidden bg-black relative border border-slate-700 shadow-inner">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-md">
              Suhbatdosh
            </div>
          </div>
          
          <div className="w-1/3 rounded-2xl overflow-hidden bg-slate-800 relative border border-slate-700 shadow-inner flex flex-col">
            <div className="relative flex-1">
              {/* Raw Video (Hidden if blur is active, but we need it for MediaPipe) */}
              <video 
                ref={myVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${isBlur ? 'opacity-0 absolute inset-0' : ''}`}
              />
              {/* Canvas for Blur output */}
              <canvas 
                ref={canvasRef} 
                width="640" 
                height="480" 
                className={`w-full h-full object-cover ${isBlur ? 'block' : 'hidden'}`}
              />
            </div>
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-md">
              Siz
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-50 flex items-center justify-center gap-4">
          {!call ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={targetInput}
                onChange={e => setTargetInput(e.target.value)}
                placeholder="ID kiriting..."
                className="px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={startCall}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
              >
                📞 Qong'iroq
              </button>
            </div>
          ) : (
            <button 
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/30"
            >
              🛑 Yakunlash
            </button>
          )}

          <div className="w-px h-10 bg-slate-300 mx-4"></div>

          <button 
            onClick={() => setIsBlur(!isBlur)}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
              isBlur ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🌫️ {isBlur ? 'Smart Blur: ON' : 'Smart Blur: OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}
