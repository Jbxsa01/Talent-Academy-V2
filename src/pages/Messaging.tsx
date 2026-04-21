import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Send, User as UserIcon, Calendar, ArrowLeft, MoreVertical, GraduationCap, MessageSquare, Sparkles, Trash2, ShieldAlert, Loader2, Settings, UserX } from 'lucide-react';
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
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [blockedUsersInfo, setBlockedUsersInfo] = useState<any[]>([]);
  const [showBlocked, setShowBlocked] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'delete' | 'block';
  }>({ isOpen: false, type: 'delete' });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load user's blocked list
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setBlockedUsers(doc.data().blockedUsers || []);
      }
    });
    return () => unsub();
  }, [user]);

  // Load info for blocked users
  useEffect(() => {
    const fetchBlocked = async () => {
      const info = [];
      for (const uid of blockedUsers) {
        const d = await getDoc(doc(db, 'users', uid));
        if (d.exists()) info.push({ id: uid, ...d.data() });
      }
      setBlockedUsersInfo(info);
    };
    if (blockedUsers.length > 0) fetchBlocked();
    else setBlockedUsersInfo([]);
  }, [blockedUsers]);

  // Load chats and handle unread badges
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChats(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Derived filtered & grouped chats
  const filteredChats = chats.filter(chat => {
    const otherId = chat.participants?.find((p: string) => p !== user?.uid);
    return !blockedUsers.includes(otherId || '');
  });

  const talentChats = filteredChats.filter(c => c.type !== 'direct');
  const directChats = filteredChats.filter(c => c.type === 'direct');

  // Load messages and Mark as Read logic
  useEffect(() => {
    if (!urlChatId || !user) {
      setActiveChat(null);
      setMessages([]);
      return;
    }
    
    setLoading(true);
    const q = query(
      collection(db, 'chats', urlChatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, async (snap) => {
      const msgData = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setMessages(msgData);

      // MARK AS READ
      const unreadFromOthers = snap.docs.filter(d => d.data().senderId !== user.uid && !d.data().readBy?.includes(user.uid));
      if (unreadFromOthers.length > 0) {
        unreadFromOthers.forEach(async (d) => {
          await updateDoc(doc(db, 'chats', urlChatId, 'messages', d.id), {
            readBy: [...(d.data().readBy || []), user.uid],
            status: 'seen'
          });
        });

        // Reset unread count for current user
        await updateDoc(doc(db, 'chats', urlChatId), {
          [`unreadCount.${user.uid}`]: 0
        });
      }

      const senderIds = new Set(msgData.map(m => m.senderId));
      const newSenderInfo = { ...senderInfo };
      for (const senderId of senderIds) {
        if (!newSenderInfo[senderId]) {
          const userDoc = await getDoc(doc(db, 'users', senderId));
          if (userDoc.exists()) newSenderInfo[senderId] = userDoc.data();
        }
      }
      setSenderInfo(newSenderInfo);
      setLoading(false);
    });
    
    getDoc(doc(db, 'chats', urlChatId)).then(d => {
      if(d.exists()) setActiveChat({ id: d.id, ...d.data() });
    });

    return () => unsubscribe();
  }, [urlChatId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !urlChatId) return;
    const msg = newMessage;
    setNewMessage('');
    try {
      if (!activeChat?.participants) return;
      
      await addDoc(collection(db, 'chats', urlChatId, 'messages'), {
        senderId: user.uid,
        text: msg,
        createdAt: serverTimestamp(),
        readBy: [user.uid],
        status: 'sent'
      });

      const recipientId = activeChat.participants.find((p: string) => p !== user.uid);
      if (recipientId) {
        await updateDoc(doc(db, 'chats', urlChatId), {
          lastMessage: msg,
          updatedAt: serverTimestamp(),
          [`unreadCount.${recipientId}`]: increment(1)
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const executeAction = async () => {
    if (!user || !activeChat) return;
    const otherId = activeChat.participants?.find((p: string) => p !== user.uid);

    try {
      if (confirmState.type === 'block' && otherId) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { blockedUsers: arrayUnion(otherId) });
      } else if (confirmState.type === 'delete' && urlChatId) {
        await deleteDoc(doc(db, 'chats', urlChatId));
        navigate('/messaging');
      }
    } catch (err) {
      console.error(err);
    }
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleToggleBlock = async () => {
    if (!user || !activeChat) return;
    const otherId = activeChat.participants?.find((p: string) => p !== user.uid);
    if (!otherId) return;

    if (blockedUsers.includes(otherId)) {
      await updateDoc(doc(db, 'users', user.uid), { blockedUsers: arrayRemove(otherId) });
    } else {
      setConfirmState({ isOpen: true, type: 'block' });
    }
  };

  const handleDeleteChat = () => {
    setConfirmState({ isOpen: true, type: 'delete' });
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getChatName = (chat: any) => {
    if (chat.type === 'direct') return chat.trainerId === user?.uid ? chat.learnerName : chat.trainerName;
    return chat.talentTitle || 'Chat';
  };

  const renderChatItems = (chatList: any[]) => (
    chatList.map(chat => {
      const name = getChatName(chat);
      const unreadCount = chat.unreadCount?.[user?.uid] || 0;
      return (
        <button
          key={chat.id}
          onClick={() => navigate(`/messaging/${chat.id}`)}
          className={`w-full text-left p-5 flex items-center gap-4 transition-all border-b border-slate-50 ${
            urlChatId === chat.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : 'hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-400 flex-shrink-0">
            {name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-center mb-1">
              <p className="font-bold text-[14px] text-slate-900 truncate">
                {name}
              </p>
              {chat.updatedAt && <span className="text-[10px] text-slate-400">{formatTime(chat.updatedAt)}</span>}
            </div>
            <div className="flex items-center justify-between">
               <p className="text-xs text-slate-500 truncate leading-snug max-w-[80%]">{chat.lastMessage || 'Lancer la discussion...'}</p>
               {unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
               )}
            </div>
          </div>
        </button>
      );
    })
  );

  const handleUnblock = async (uid: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { blockedUsers: arrayRemove(uid) });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-[350px] border-r border-slate-200 flex flex-col bg-slate-50/20 ${urlChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
           <h2 className="text-xl font-bold text-slate-900">Conversations</h2>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowBlocked(!showBlocked)}
                className={`p-2 rounded-xl transition-all ${showBlocked ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Gérer les bloqués"
              >
                 <UserX className="w-5 h-5" />
              </button>
           </div>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {showBlocked ? (
            <div className="p-4 space-y-4">
               <p className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Utilisateurs Bloqués</p>
               {blockedUsersInfo.length > 0 ? (
                 blockedUsersInfo.map(b => (
                   <div key={b.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{b.displayName?.charAt(0)}</div>
                         <p className="text-sm font-bold text-slate-800">{b.displayName}</p>
                      </div>
                      <button 
                        onClick={() => handleUnblock(b.id)}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all"
                      >
                         Débloquer
                      </button>
                   </div>
                 ))
               ) : (
                 <p className="text-center text-xs text-slate-400 py-10 italic">Aucun utilisateur bloqué</p>
               )}
            </div>
          ) : (
            <>
              {talentChats.length > 0 && (
                <div className="py-2">
                   <p className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">Mes Talents</p>
                   {renderChatItems(talentChats)}
                </div>
              )}

              {directChats.length > 0 && (
                <div className="py-2">
                   <p className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">Messages Directs</p>
                   {renderChatItems(directChats)}
                </div>
              )}
              
              {filteredChats.length === 0 && !loading && (
                <div className="p-10 text-center opacity-30">
                   <MessageSquare className="w-10 h-10 mx-auto mb-4" />
                   <p className="text-xs font-bold text-slate-500">Aucune discussion</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-grow flex flex-col bg-white ${!urlChatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {urlChatId && activeChat ? (
          <>
            {/* Header */}
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/messaging')} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div 
                  onClick={() => {
                    const otherId = activeChat.participants?.find((p: string) => p !== user?.uid);
                    if (otherId) navigate(`/trainer/${otherId}`);
                  }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:ring-2 ring-indigo-500 transition-all">
                    {getChatName(activeChat)?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-indigo-600 transition-colors">{getChatName(activeChat)}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       <p className="text-[11px] text-slate-400 font-medium">En ligne</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleToggleBlock}
                  className={`p-2 rounded-xl transition-all ${blockedUsers.includes(activeChat.participants?.find((p: string) => p !== user?.uid) || '') ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:bg-slate-100'}`}
                  title={blockedUsers.includes(activeChat.participants?.find((p: string) => p !== user?.uid) || '') ? 'Débloquer' : 'Bloquer'}
                >
                  <ShieldAlert className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleDeleteChat}
                  className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                  title="Supprimer la conversation"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages View */}
            <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-[#F8FAFC]">
              {blockedUsers.includes(activeChat.participants?.find((p: string) => p !== user?.uid) || '') && (
                 <div className="flex justify-center my-2">
                    <div className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-[11px] font-bold border border-red-100 flex items-center gap-2">
                       <ShieldAlert className="w-4 h-4" />
                       Vous avez bloqué cet utilisateur.
                    </div>
                 </div>
              )}
              {messages.map((m, idx) => {
                const isOwn = m.senderId === user?.uid;
                return (
                  <div key={m.id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        isOwn ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        {m.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-1">
                        <span className="text-[10px] text-slate-400 font-medium">{formatTime(m.createdAt)}</span>
                        {isOwn && (
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
                            {m.status === 'seen' || m.readBy?.length > 1 ? '• Vu' : '✓ Envoyé'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-5xl mx-auto bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-grow bg-transparent px-4 py-2 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || blockedUsers.includes(activeChat.participants?.find((p: string) => p !== user?.uid) || '')}
                  className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-slate-200" />
             </div>
             <p className="text-slate-400 font-medium">Sélectionnez une discussion pour commencer à échanger</p>
          </div>
        )}
      </div>

      {/* Styled Modals */}
      <AnimatePresence>
        {confirmState.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100"
             >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${
                  confirmState.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                }`}>
                   {confirmState.type === 'delete' ? <Trash2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                   {confirmState.type === 'delete' ? 'Supprimer le chat ?' : 'Bloquer l\'utilisateur ?'}
                </h3>
                <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed px-4">
                   {confirmState.type === 'delete' 
                     ? 'Cette action effacera définitivement tout votre historique de discussion. Vous ne pourrez pas revenir en arrière.' 
                     : 'En bloquant cette personne, vous ne pourrez plus échanger de messages. Vous pouvez le débloquer plus tard.'}
                </p>

                <div className="flex flex-col gap-2">
                   <button 
                     onClick={executeAction}
                     className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                        confirmState.type === 'delete' ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                     }`}
                   >
                      {confirmState.type === 'delete' ? 'Oui, supprimer tout' : 'Oui, bloquer'}
                   </button>
                   <button 
                     onClick={() => setConfirmState({ ...confirmState, isOpen: false })}
                     className="w-full py-4 rounded-2xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                   >
                      Annuler
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messaging;
