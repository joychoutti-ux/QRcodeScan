import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { UserProfile, Message } from '../types';
import { checkMessageSafety } from '../services/geminiService';
import { broadcastMessage } from '../services/messageBus';
import { v4 as uuidv4 } from 'uuid';

const NEON_COLORS = ['#00f3ff', '#ff00ff', '#bc13fe', '#0aff00', '#ffaa00'];

const MobileClient: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('neonflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const newUser: UserProfile = {
      username: nameInput.trim(),
      hasJoined: true
    };
    localStorage.setItem('neonflow_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user || isSending) return;

    setIsSending(true);
    setStatus('AI Analyzing...');

    try {
      // 1. Moderate
      const moderation = await checkMessageSafety(messageInput, user.username);
      
      if (!moderation.isSafe) {
        setStatus('Cleaned by AI protocol.');
      } else {
        setStatus('Transmission Sent.');
      }

      // 2. Construct Message
      const newMessage: Message = {
        id: uuidv4(),
        user: user.username,
        text: moderation.cleanedText,
        timestamp: Date.now(),
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
      };

      // 3. Broadcast
      broadcastMessage(newMessage);
      setMessageInput('');
      
      // Auto clear status after 2 seconds
      setTimeout(() => setStatus(''), 2000);

    } catch (error) {
      console.error(error);
      setStatus('Transmission Failed.');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetUser = () => {
    localStorage.removeItem('neonflow_user');
    setUser(null);
    setNameInput('');
  };

  if (!user) {
    return (
      <Layout className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md border border-neon-cyan p-8 rounded-2xl shadow-[0_0_20px_rgba(0,243,255,0.3)]">
          <h1 className="text-3xl font-orbitron text-center text-neon-cyan mb-2">NEON FLOW</h1>
          <p className="text-center font-rajdhani text-gray-400 mb-8">Identify yourself to access the network.</p>
          
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-neon-cyan uppercase tracking-widest mb-2">Codename</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-gray-800 border-b-2 border-gray-600 text-white px-4 py-3 focus:outline-none focus:border-neon-cyan focus:bg-gray-800/50 transition-colors font-orbitron"
                placeholder="ENTER NAME"
                maxLength={15}
              />
            </div>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan border border-neon-cyan font-orbitron py-4 rounded-xl uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Connect
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="flex flex-col h-screen p-4">
      <header className="flex justify-between items-center py-4 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-orbitron text-sm text-neon-cyan">ONLINE</span>
        </div>
        <button onClick={handleResetUser} className="text-xs font-rajdhani text-gray-500 hover:text-white underline">
          LOGOUT
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-8">
        <div className="text-center">
          <p className="font-rajdhani text-gray-400 text-sm uppercase tracking-widest">Logged in as</p>
          <h2 className="font-orbitron text-2xl text-white mt-1">{user.username}</h2>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white focus:border-neon-pink focus:outline-none focus:ring-1 focus:ring-neon-pink transition-all font-rajdhani text-lg resize-none"
              placeholder="Type your transmission..."
              maxLength={100}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-600 font-mono">
              {messageInput.length}/100
            </div>
          </div>

          <div className="h-6 text-center">
             {status && (
               <span className={`text-xs font-orbitron tracking-widest ${status.includes('Failed') ? 'text-red-500' : 'text-neon-green'}`}>
                 {status}
               </span>
             )}
          </div>

          <button
            type="submit"
            disabled={isSending || !messageInput.trim()}
            className="w-full group relative overflow-hidden bg-transparent border border-neon-pink text-white font-orbitron py-4 rounded-xl uppercase tracking-widest transition-all hover:bg-neon-pink/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSending ? 'PROCESSING...' : 'SEND MESSAGE'}
            </span>
            {/* Hover effect background */}
            <div className="absolute inset-0 bg-neon-pink/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
      </main>

      <footer className="py-4 text-center">
        <p className="text-[10px] font-rajdhani text-gray-600 uppercase">
          Secured by Gemini AI • NeonFlow v1.0
        </p>
      </footer>
    </Layout>
  );
};

export default MobileClient;
