import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Send, User as UserIcon, Calendar, ArrowLeft, MoreVertical, GraduationCap, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Messaging = () => {
  const { chatId: urlChatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<any>(null);
  const [senderInfo, setSenderInfo] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChats(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching chats:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!urlChatId) return;
    
    // Load messages
    const q = query(
      collection(db, 'chats', urlChatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, async (snap) => {
      const msgData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgData);

      // Fetch sender info for all messages
      const senderIds = new Set(msgData.map(m => m.senderId));
      const newSenderInfo = { ...senderInfo };
      
      for (const senderId of senderIds) {
        if (!newSenderInfo[senderId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', senderId));
            if (userDoc.exists()) {
              newSenderInfo[senderId] = userDoc.data();
            }
          } catch (err) {
            console.error('Error fetching sender info:', err);
          }
        }
      }
      setSenderInfo(newSenderInfo);
    }, (error) => {
      console.error('Error fetching messages:', error);
    });
    
    // Load chat info
    getDoc(doc(db, 'chats', urlChatId)).then(d => {
      if(d.exists()) setActiveChat({ id: d.id, ...d.data() });
    }).catch(err => console.error('Error fetching chat:', err));

    return () => unsubscribe();
  }, [urlChatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !urlChatId) return;
    const msg = newMessage;
    setNewMessage('');
    try {
      // Add message
      await addDoc(collection(db, 'chats', urlChatId, 'messages'), {
        senderId: user.uid,
        text: msg,
        createdAt: serverTimestamp(),
      });

      // Update chat's lastMessage and updatedAt
      await updateDoc(doc(db, 'chats', urlChatId), {
        lastMessage: msg,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // Format timestamp function
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 h-[calc(100vh-100px)]">
      <div className="bg-surface rounded-3xl shadow-2xl shadow-indigo-500/5 border border-border-subtle h-full flex overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full md:w-80 border-r border-border-subtle flex flex-col bg-gray-50/20 ${urlChatId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 border-b border-border-subtle bg-white">
             <h2 className="text-3xl font-black text-text-main tracking-tight italic">Messages</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => navigate(`/messaging/${chat.id}`)}
                className={`w-full text-left p-5 rounded-2xl transition-all border ${
                  urlChatId === chat.id 
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                    : 'bg-white border-border-subtle hover:bg-gray-50 group'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-black text-sm truncate max-w-[140px] ${urlChatId === chat.id ? 'text-white' : 'text-text-main'}`}>
                    {chat.talentTitle}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    urlChatId === chat.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-primary'
                  }`}>
                    Live
                  </span>
                </div>
                <p className={`text-[11px] truncate font-medium ${urlChatId === chat.id ? 'text-indigo-100' : 'text-text-muted'}`}>
                   {chat.lastMessage || 'Open chat to start discussing...'}
                </p>
              </button>
            ))}
            {chats.length === 0 && (
              <div className="text-center py-20 opacity-30">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">No active chats</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-grow flex flex-col bg-white ${!urlChatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {urlChatId ? (
            <>
              {/* Header */}
              <div className="bg-white/80 backdrop-blur-md px-8 py-6 border-b border-border-subtle flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-5">
                  <button onClick={() => navigate('/messaging')} className="md:hidden p-2 hover:bg-gray-50 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-text-main" />
                  </button>
                  <div className="w-12 h-12 bg-pink-50 border border-accent/20 rounded-2xl flex items-center justify-center shadow-inner">
                    <span className="text-accent font-black text-xs">{activeChat?.talentTitle?.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-text-main leading-tight tracking-tight text-xl italic">{activeChat?.talentTitle}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <p className="text-[10px] text-success font-black uppercase tracking-[0.2em]">Live Mentorship Channel</p>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-border-subtle">
                   <Sparkles className="w-3.5 h-3.5 text-accent" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Direct Portal Unlocked</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-grow overflow-y-auto p-10 space-y-10 bg-gray-50/20 scrollbar-hide">
                {!loading ? (
                  <>
                    <div className="flex flex-col items-center justify-center py-12 text-center border-b border-dashed border-border-subtle mb-10 relative">
                       <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
                       <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-border-subtle">
                          <Calendar className="w-8 h-8 text-primary" />
                       </div>
                       <p className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted">Enrolled on <span className="text-primary italic">{activeChat?.offerTitle}</span></p>
                    </div>
                    
                    {messages.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    
                    {messages.map((m, idx) => {
                      const sender = senderInfo[m.senderId] || {};
                      const senderName = sender.displayName || 'Unknown User';
                      const isOwnMessage = m.senderId === user?.uid;
                      
                      return (
                        <div
                          key={m.id || idx}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] group`}>
                            {/* Sender info */}
                            {!isOwnMessage && (
                              <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2 px-7">
                                {senderName}
                              </p>
                            )}
                            
                            <div
                              className={`px-7 py-5 rounded-[28px] shadow-sm text-sm font-bold leading-relaxed transition-all group-hover:shadow-md ${
                                isOwnMessage
                                  ? 'bg-primary text-white rounded-tr-none shadow-primary/20'
                                  : 'bg-surface text-text-main rounded-tl-none border border-border-subtle'
                              }`}
                            >
                              {m.text}
                            </div>
                            <p className={`text-[9px] font-black uppercase tracking-widest mt-2 opacity-40 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                              {formatTimestamp(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-text-muted text-sm font-bold uppercase tracking-wider">Loading messages...</p>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-8 bg-white border-t border-border-subtle">
                <div className="flex space-x-5 max-w-4xl mx-auto">
                  <div className="relative flex-grow">
                    <input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Discuss with your mentor..."
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold focus:outline-none focus:ring-8 ring-primary/5 focus:border-primary/20 transition-all placeholder:text-text-muted/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white w-16 h-16 rounded-[24px] flex items-center justify-center hover:bg-primary-hover transition-all shadow-2xl shadow-primary/30 active:scale-95 disabled:opacity-30 disabled:grayscale"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center group">
              <div className="w-32 h-32 bg-indigo-50 border border-primary/10 rounded-[48px] flex items-center justify-center mx-auto mb-10 transition-transform group-hover:scale-110 shadow-inner">
                 <MessageSquare className="w-14 h-14 text-primary opacity-20" />
              </div>
              <h3 className="text-4xl font-black text-text-main tracking-widest uppercase italic mb-4">Secure Desk</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Mentorship Network Hub</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
