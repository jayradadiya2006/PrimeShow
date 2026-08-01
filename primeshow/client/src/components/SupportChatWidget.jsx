import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Bot, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SupportChatWidget = () => {
  const { user, supportMessages, sendMessageToSupport } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('Cinema Booking Assistance');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const userMessages = supportMessages.filter(m => m.userId === (user?.id || 'usr_1'));

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
          className="relative group p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all flex items-center gap-2 font-bold text-xs"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="hidden sm:inline-block">WhatsApp Live Support</span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-black animate-pulse"></span>
        </button>
      )}

      {/* WhatsApp Styled Floating Chat Window */}
      {isOpen && (
        <div className="relative w-80 sm:w-96 h-[500px] glass-modal rounded-3xl border border-emerald-500/40 shadow-2xl flex flex-col justify-between overflow-hidden text-white animate-fade-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm">
                  P
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black"></span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-sans">PrimeShow VIP Support</h4>
                <span className="text-[10px] text-emerald-200 block font-medium">Online • Instant WhatsApp Reply</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080d0a]/80">
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                🔒 End-to-end encrypted VIP support chat
              </span>
            </div>

            {userMessages.length > 0 ? (
              userMessages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {/* User Right-Aligned Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-none bg-emerald-600/40 border border-emerald-400/40 text-xs text-white shadow-md">
                      <p className="text-white">"{msg.message}"</p>
                      <div className="text-[9px] text-emerald-200/70 text-right mt-1 flex items-center justify-end gap-1">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-emerald-300 font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Reply Left-Aligned Bubble */}
                  {msg.reply && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-none bg-white/10 border border-white/15 text-xs text-white shadow-md">
                        <div className="text-[10px] font-bold text-amber-400 mb-0.5">Admin Support</div>
                        <p className="text-amber-100">{msg.reply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/50 text-xs">
                Welcome! Send us a message for instant support with seat upgrades, bookings, or concessions.
              </div>
            )}

            {sentSuccess && (
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] text-center font-bold">
                ✓ Message delivered to Admin!
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSend} className="p-3 glass-panel border-t border-white/10 flex gap-2 items-center bg-black/60">
            <input
              type="text"
              placeholder="Type message to admin..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-white/40"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
