import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Mic, Send, Zap, Volume2, VolumeX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import * as THREE from 'three';

const AnimatedOrb = ({ isSpeaking }) => {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      
      if (isSpeaking) {
         // Pulse effect when speaking
         const pulse = 2.2 + Math.sin(state.clock.getElapsedTime() * 15) * 0.05;
         sphereRef.current.scale.set(pulse, pulse, pulse);
      } else {
         // Smoothly return to default scale
         sphereRef.current.scale.lerp(new THREE.Vector3(2.2, 2.2, 2.2), 0.1);
      }
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.2}>
      <MeshDistortMaterial
        color="#0f172a"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.9}
        emissive="#1e1b4b"
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
};

const CenterContent = () => {
  const [inputText, setInputText] = useState('');
  const [greeting, setGreeting] = useState('Good evening');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const sendMessageRef = useRef();

  const quickAnswers = [
    "Summarise my day",
    "What's the weather like?",
    "Write an email for me"
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let isFinal = false;
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
          
        setInputText(transcript);
        
        if (isFinal && sendMessageRef.current) {
          sendMessageRef.current(transcript);
          recognition.stop();
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setVoiceError(`Mic error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setVoiceError("Microphone not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    setVoiceError(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        setVoiceError("Microphone not supported.");
        return;
      }
      setInputText('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setVoiceError("Error starting mic.");
      }
    }
  };

  const speakText = (text) => {
    if (!synth || isMuted) return;
    synth.cancel(); // Stop current speech
    
    // Remove markdown for cleaner speech
    const cleanText = text.replace(/[*_#`~]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.pitch = 0.8; // Lower pitch for AI persona
    utterance.rate = 1.05; // Slightly faster
    
    const voices = synth.getVoices();
    if (voices.length > 0) {
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error", e);
      setIsSpeaking(false);
    };
    
    synth.speak(utterance);
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setConversationId(id);
      fetchChatHistory(id);
    } else {
      setConversationId(null);
      setMessages([]);
    }
  }, [searchParams]);

  const fetchChatHistory = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8001/conversations/${id}/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching chat history", error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() && !isTyping) return;

    // Safari requires user interaction to initialize speech synthesis
    if (!hasInteracted && synth) {
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      synth.speak(dummy);
      setHasInteracted(true);
    }

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: text, conversation_id: conversationId })
      });

      if (!response.body) throw new Error('No body in response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = { role: 'assistant', content: '' };

      // Add empty assistant message to start streaming into
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === 'done') {
              speakText(assistantMsg.content);
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.conversation_id) {
                setConversationId(data.conversation_id);
              } else if (data.chunk) {
                assistantMsg.content += data.chunk;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = { ...assistantMsg };
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error("Error parsing SSE data", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleQuickAnswer = (text) => {
    sendMessage(text);
  };

  const isChatActive = messages.length > 0;

  return (
    <div className="flex-1 h-full flex flex-col justify-between items-center py-6 px-8 relative overflow-hidden">

      {/* Top Header / Greeting (Shrinks if chat is active) */}
      <div className={`w-full transition-all duration-700 ${isChatActive ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 mt-4'}`}>
        <h2 className="text-3xl font-light text-brand-purple">{greeting},</h2>
        <h1 className="text-4xl font-semibold text-white mt-1">Test User</h1>
        <p className="text-gray-400 mt-2 text-sm">How can I assist you today?</p>
      </div>

      {/* Avatar / 3D Placeholder - Transitions to Top Right if Chat Active */}
      <div className={`transition-all duration-700 w-full flex relative z-0
        ${isChatActive ? 'h-24 justify-end absolute top-6 right-8 opacity-40 scale-50 origin-top-right' : 'flex-1 items-center justify-center'}`}>

        {/* Glow effect / Platform */}
        {!isChatActive && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none transition-all duration-1000"></div>
            <div className="absolute top-[70%] left-1/2 -translate-x-1/2 w-72 h-16 border border-brand-blue/30 rounded-[100%] bg-brand-blue/5 blur-[2px] shadow-[0_0_40px_rgba(59,130,246,0.6)] transform scale-y-50"></div>
          </>
        )}

        {/* Three.js Canvas */}
        <div className={`z-10 relative transition-all duration-700 ${isChatActive ? 'w-40 h-40' : 'w-[28rem] h-[28rem]'}`}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={2} color="#a855f7" />
            <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#3b82f6" />
            <pointLight position={[0, 0, 2]} intensity={2} color="#ffffff" distance={5} />
            <AnimatedOrb isSpeaking={isSpeaking} />
          </Canvas>
          {/* Facial features */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] flex gap-8">
            <div className="animate-blink flex items-center justify-center">
              <div className={`w-3 h-8 bg-cyan-300 rounded-full shadow-[0_0_15px_#67e8f9] transition-transform duration-300 ${inputText || isChatActive ? 'scale-y-75' : ''}`}></div>
            </div>
            <div className="animate-blink flex items-center justify-center">
              <div className={`w-3 h-8 bg-cyan-300 rounded-full shadow-[0_0_15px_#67e8f9] transition-transform duration-300 ${inputText || isChatActive ? 'scale-y-75' : ''}`}></div>
            </div>
          </div>
          <div className={`absolute top-[65%] left-1/2 -translate-x-1/2 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_15px_#67e8f9] transition-all duration-300 ${inputText || isChatActive ? 'w-16 rotate-0' : 'w-12 rotate-[-5deg]'}`}></div>
        </div>
      </div>

      {/* Chat Messages Area */}
      {isChatActive && (
        <div className="flex-1 w-full max-w-4xl overflow-y-auto no-scrollbar pt-20 pb-4 z-10">
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className={`w-full max-w-3xl flex flex-col items-center gap-4 z-20 ${isChatActive ? 'mt-0' : 'mt-auto mb-4'}`}>

        {/* Quick Answers */}
        {!isChatActive && (
          <div className="flex gap-3 mb-2 flex-wrap justify-center">
            {quickAnswers.map((qa, i) => (
              <button
                key={i}
                onClick={() => handleQuickAnswer(qa)}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-gray-300 hover:text-white hover:border-brand-purple/50 transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                <Zap size={14} className="text-brand-purple" />
                {qa}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {voiceError && (
          <div className="mb-2 text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
            {voiceError}
          </div>
        )}

        {/* Chat Input */}
        <div className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-purple to-brand-blue rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative flex items-center bg-panel-dark rounded-full p-2 border border-glass-border shadow-2xl">
            <button 
              onClick={toggleListening}
              className={`p-3 transition-all ${isListening ? 'text-brand-purple scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse' : 'text-gray-400 hover:text-white hover:scale-110'}`}
            >
              <Mic size={20} />
            </button>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
              className="flex-1 bg-transparent border-none outline-none text-white px-2 placeholder-gray-500"
            />
            <button
              onClick={() => sendMessage(inputText)}
              className={`p-3 transition-all hover:scale-110 ${inputText ? 'text-brand-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-gray-400 hover:text-white'}`}>
              <Send size={20} />
            </button>
          </div>
          
          {/* TTS Toggle */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
            title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-brand-purple" />}
          </button>
        </div>
      </div>

    </div>
  );
};

export default CenterContent;
