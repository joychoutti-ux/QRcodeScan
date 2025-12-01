import React, { useEffect, useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Layout } from './Layout';
import DanmakuItem from './DanmakuItem';
import { subscribeToMessages } from '../services/messageBus';
import { Message, DanmakuItemProps } from '../types';

const CLIENT_URL = `${window.location.protocol}//${window.location.host}${window.location.pathname}#/join`;

const DanmakuScreen: React.FC = () => {
  const [activeMessages, setActiveMessages] = useState<DanmakuItemProps[]>([]);
  // Use a ref to track active messages for the subscription callback closure
  const messagesRef = useRef<DanmakuItemProps[]>([]); 

  // Helper to sync ref and state
  const setMessages = (setter: (prev: DanmakuItemProps[]) => DanmakuItemProps[]) => {
    const newVal = setter(messagesRef.current);
    messagesRef.current = newVal;
    setActiveMessages(newVal);
  };

  const handleMessageComplete = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((msg: Message) => {
      // Logic to determine lane/position
      // We want to distribute messages vertically (5% to 90%)
      const top = 5 + Math.random() * 85;
      
      // Speed depends on length, but let's randomize slightly between 8s and 15s for visual interest
      const duration = 8 + Math.random() * 7;

      const newItem: DanmakuItemProps = {
        ...msg,
        top,
        duration,
        onComplete: handleMessageComplete
      };

      setMessages((prev) => [...prev, newItem]);
    });

    return () => unsubscribe();
  }, [handleMessageComplete]);

  return (
    <Layout className="cursor-none">
       {/* Background Grid Accent */}
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[80vw] h-[80vh] border border-neon-cyan/30 rounded-[3rem]"></div>
          <div className="absolute w-[70vw] h-[70vh] border border-neon-purple/20 rounded-[2rem]"></div>
       </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full">
        {activeMessages.map((msg) => (
          <DanmakuItem key={msg.id} {...msg} />
        ))}
      </div>

      {/* Persistent Info Footer (Sticky) */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-6 px-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-6xl font-orbitron text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            NEON<span className="text-neon-cyan">FLOW</span>
          </h1>
          <p className="text-neon-purple font-rajdhani text-xl mt-2 tracking-[0.2em] uppercase">
            Live Audience Interaction System
          </p>
        </div>

        <div className="flex items-center gap-6 bg-gray-900/90 border border-neon-cyan/50 p-4 rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.15)] backdrop-blur-md">
          <div className="bg-white p-2 rounded-lg">
             <QRCodeSVG value={CLIENT_URL} size={120} level="M" />
          </div>
          <div className="hidden md:block">
            <p className="text-neon-cyan font-orbitron text-lg mb-1">SCAN TO JOIN</p>
            <p className="text-gray-400 font-rajdhani text-sm max-w-[150px] leading-tight">
              Enter your codename and send messages to the screen.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DanmakuScreen;
