import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { IMessage } from '../types';
import { PaymentNoteBanner } from '../components/common/PaymentNoteBanner';
import {
  MessageSquare,
  Send,
  Paperclip,
  Users,
  Briefcase,
  ExternalLink,
  Clock,
  FileText,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRoom = searchParams.get('room') || 'team_sih_energy_grid';

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [showFileModal, setShowFileModal] = useState(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available sample rooms
  const rooms = [
    { id: 'team_sih_energy_grid', label: 'SIH Energy Grid Squad', type: 'team' },
    { id: 'project_kaveri_bakery_01', label: 'Kaveri Bakery Menu Project', type: 'project' },
    { id: 'project_kaveri_bakery_02', label: 'Inventory Dashboard Project', type: 'project' },
  ];

  // Fetch message history
  const fetchMessages = async (roomId: string) => {
    setLoading(true);
    try {
      const res = await api.chat.getMessages(roomId);
      setMessages(res.messages || []);
    } catch {
      // Handle room not initialized yet
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(activeRoom);

    // Socket.io connection
    const token = localStorage.getItem('sb_token');
    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join_room', { roomId: activeRoom });

    socket.on('new_message', (msg: IMessage) => {
      if (msg.roomId === activeRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('user_typing', (data: { name: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setIsTyping(data.name);
      } else {
        setIsTyping(null);
      }
    });

    return () => {
      socket.emit('leave_room', { roomId: activeRoom });
      socket.disconnect();
    };
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !fileUrl.trim()) return;

    const payload = {
      content: inputText,
      fileUrl: fileUrl || undefined,
      fileName: fileName || undefined,
    };

    setInputText('');
    setFileUrl('');
    setFileName('');
    setShowFileModal(false);

    try {
      // Send via socket first, or fallback to REST
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', {
          roomId: activeRoom,
          ...payload,
        });
      } else {
        const res = await api.chat.sendMessage(activeRoom, payload);
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setSearchParams({ room: roomId });
  };

  return (
    <div className="space-y-4">
      <PaymentNoteBanner compact />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-xs overflow-hidden flex flex-col md:flex-row h-[620px]">
        {/* Rooms Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 space-y-3 shrink-0">
          <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Workspaces & Chats
          </div>

          <div className="space-y-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeRoom === room.id
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {room.type === 'team' ? (
                  <Users className="w-4 h-4 shrink-0" />
                ) : (
                  <Briefcase className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{room.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
          {/* Room Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand dark:text-purple-400" />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {rooms.find((r) => r.id === activeRoom)?.label || activeRoom}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Real-time room</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No messages yet. Send a greeting or share project specifications!
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = user && msg.senderId?._id === user._id;

                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {isMe ? 'You' : msg.senderId?.name}
                      </span>
                      <span>•</span>
                      <span>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </span>
                    </div>

                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed space-y-1.5 shadow-2xs ${
                        isMe
                          ? 'bg-brand text-white rounded-br-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                      }`}
                    >
                      {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                      {msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 p-2 rounded-lg text-xs font-semibold ${
                            isMe
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-white dark:bg-slate-700 text-brand hover:underline'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[160px]">
                            {msg.fileName || 'Shared Attachment'}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="text-[11px] text-slate-400 italic">
                {isTyping} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            {fileUrl && (
              <div className="flex items-center justify-between p-2 mb-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-xs text-brand">
                <span className="truncate max-w-xs">Attached: {fileUrl}</span>
                <button onClick={() => setFileUrl('')} className="text-slate-400 hover:text-danger">
                  Cancel
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFileModal(!showFileModal)}
                className="p-2 text-slate-500 hover:text-brand dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-button min-h-touch min-w-touch flex items-center justify-center transition-colors"
                title="Share file URL"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand min-h-touch"
              />

              <button
                type="submit"
                className="p-2 bg-brand hover:bg-brand-hover text-white rounded-button min-h-touch min-w-touch flex items-center justify-center shadow-xs transition-colors"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* File Sharing URL Input */}
            {showFileModal && (
              <div className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2 animate-in fade-in">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Share File by URL (Drive, GitHub, Figma, Dropbox)
                </div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFileModal(false)}
                    className="text-xs text-slate-500 px-2 py-1"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
