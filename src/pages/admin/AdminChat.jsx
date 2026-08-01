import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Sparkles } from 'lucide-react';
import API from '../../services/api';

export default function AdminChat() {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');

  const fetchChat = () => {
    API.get('/chat').then(res => setMessages(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const res = await API.post('/chat', {
        userId: "user-101",
        userName: "PrimeSupport Agent",
        sender: "admin",
        text: replyText
      });
      setMessages([...messages, res.data]);
      setReplyText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Live Customer Support Desk</h1>
        <p className="text-xs text-slate-400">Respond to customer inquiries and VIP booking requests in real time.</p>
      </div>

      <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-4 max-w-3xl">
        <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" /> Active Conversation Thread
        </h3>

        {/* THREAD CONTAINER */}
        <div className="h-96 overflow-y-auto space-y-3 p-4 rounded-2xl glass-panel border-white/5 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[9px] text-slate-500 mb-0.5">{msg.userName} • {msg.timestamp}</span>
              <div
                className={`p-3 rounded-2xl max-w-[80%] ${
                  msg.sender === 'admin'
                    ? 'bg-cyan-500 text-black font-semibold rounded-tr-none'
                    : 'glass-panel text-white border-white/10 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* REPLY INPUT */}
        <form onSubmit={handleSendReply} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your official support response..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 p-3 rounded-xl glass-input text-xs"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold text-xs glow-cyan cursor-pointer flex items-center gap-1.5"
          >
            <span>Send Reply</span>
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
