import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Bot, Sparkles, User } from 'lucide-react';
import { useAuth, socket } from '../context/AuthContext';

export const SupportChatWidget = () => {
  const { user, supportMessages, sendMessageToSupport } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('Cinema Booking Assistance');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const chatEndRef = useRef(null);

  const activeUserId = user?.id || user?.email || 'usr_1';
  
  // Sort messages in ascending chronological order (oldest to newest)
  const userMessages = (supportMessages || [])
    .filter(m => m.userId === activeUserId || (user?.email && m.userEmail === user.email))
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
      return timeA - timeB;
    });

  useEffect(() => {
    if (socket) {
      socket.emit('JOIN_USER_ROOM', activeUserId);
    }
  }, [activeUserId]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [userMessages.length, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessageToSupport(subject, message);
    setMessage('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 sm:p-4 rounded-full bg-[#D90000] hover:bg-[#b00000] text-white shadow-2xl shadow-red-900/50 hover:scale-105 transition-all flex items-center gap-2 font-black text-xs border border-red-400/40 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <span className="hidden sm:inline-block font-bold">Live Support</span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#DBCEA5] rounded-full border-2 border-black animate-pulse"></span>
        </button>
      )}

      {/* Styled Floating Chat Window */}
      {isOpen && (
        <div className="relative w-80 sm:w-96 h-[500px] bg-[#141414] rounded-3xl border border-[#DBCEA5]/40 shadow-2xl flex flex-col justify-between overflow-hidden text-white animate-fade-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D90000] via-[#B00000] to-[#800000] p-4 flex items-center justify-between shadow-md border-b border-[#DBCEA5]/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#DBCEA5] text-slate-900 flex items-center justify-center font-black text-base shadow-inner">
                  P
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black"></span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white font-sans tracking-wide">Live Support</h4>
                <span className="text-[10px] text-[#DBCEA5] block font-semibold">Online • Instant Reply</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0d0d0d]">
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-[#DBCEA5]/10 text-[#DBCEA5] text-[10px] font-bold border border-[#DBCEA5]/30">
                🔒 Encrypted Direct Support Chat
              </span>
            </div>

            {userMessages.length > 0 ? (
              userMessages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {/* User Right-Aligned Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-none bg-[#D90000]/90 border border-red-400/40 text-xs text-white shadow-md">
                      <p className="text-white font-medium">"{msg.message}"</p>
                      <div className="text-[9px] text-red-200/80 text-right mt-1 flex items-center justify-end gap-1">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[#DBCEA5] font-black">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Reply Left-Aligned Bubble */}
                  {msg.reply && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-none bg-[#242424] border border-[#DBCEA5]/40 text-xs text-white shadow-md">
                        <div className="text-[10px] font-black text-[#DBCEA5] mb-0.5 uppercase tracking-wider">Admin Support</div>
                        <p className="text-slate-100 font-medium">{msg.reply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/50 text-xs font-semibold">
                Welcome! Send us a message for instant support with seat upgrades, bookings, or concessions.
              </div>
            )}

            {sentSuccess && (
              <div className="p-2 rounded-xl bg-[#DBCEA5]/20 border border-[#DBCEA5]/40 text-[#DBCEA5] text-[11px] text-center font-bold">
                ✓ Message delivered to Admin!
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#DBCEA5]/20 flex gap-2 items-center bg-[#1A1A1A]">
            <input
              type="text"
              placeholder="Type message to admin..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-[#262626] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D90000] font-medium"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
