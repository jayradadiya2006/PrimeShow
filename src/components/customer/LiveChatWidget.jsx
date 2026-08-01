import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const userId = user?.id || 'user-101';

  const fetchMessages = () => {
    API.get(`/chat?userId=${userId}`)
      .then(res => setMessages(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await API.post('/chat', {
        userId,
        userName: user?.name || 'Customer',
        sender: 'user',
        text
      });
      setMessages([...messages, res.data]);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-cyan-400 to-indigo-600 text-black flex items-center justify-center shadow-2xl glow-cyan cursor-pointer border border-white/20"
        >
          <MessageSquare className="w-6 h-6 stroke-[2.5]" />
        </motion.button>
      )}

      {/* CHAT DRAWER MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 sm:w-96 h-[460px] bg-[#0c0d14] border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* CHAT HEADER */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 fill-black" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">PrimeShow VIP Support</h4>
                  <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Online • Live Agent
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MESSAGES THREAD */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p>Welcome to Live Support! Ask any question about tickets, seat upgrades, or refund policy.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[9px] text-slate-500 mb-0.5">{msg.userName} • {msg.timestamp}</span>
                    <div
                      className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-cyan-500 text-black font-medium rounded-tr-none glow-cyan'
                          : 'glass-panel text-white border-white/10 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/40">
              <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 p-2.5 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-cyan-500 text-black font-bold hover:brightness-110 glow-cyan cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
