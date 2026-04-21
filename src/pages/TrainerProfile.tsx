import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, deleteDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  MessageSquare, Edit2, ArrowLeft, 
  BookOpen, ShieldCheck, Mail, MapPin, Loader2, UserPlus, UserCheck 
} from 'lucide-react';
import TalentCard from '../components/TalentCard';

const TrainerProfile = () => {
  const { trainerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [trainer, setTrainer] = useState<any>(null);
  const [talents, setTalents] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      if (!trainerId) return;
      
      try {
        const trainerDoc = await getDoc(doc(db, 'users', trainerId));
        if (trainerDoc.exists()) {
          setTrainer({ id: trainerDoc.id, ...trainerDoc.data() });
        }

        const talentsQuery = query(
          collection(db, 'talents'),
          where('trainerId', '==', trainerId)
        );
        const talentsSnap = await getDocs(talentsQuery);
        setTalents(talentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        if (user) {
          const followId = `${user.uid}_${trainerId}`;
          const followDoc = await getDoc(doc(db, 'follows', followId));
          setIsFollowing(followDoc.exists());
        }

        const followersQuery = query(
          collection(db, 'follows'),
          where('followingId', '==', trainerId),
          where('followingType', '==', 'user')
        );
        const followersSnap = await getDocs(followersQuery);
        setFollowers(followersSnap.docs.length);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trainerId, user]);

  const handleFollow = async () => {
    if (!user || !trainerId) return navigate('/login');
    setFollowLoading(true);

    const followId = `${user.uid}_${trainerId}`;
    const followRef = doc(db, 'follows', followId);

    try {
      if (isFollowing) {
        await deleteDoc(followRef);
        setIsFollowing(false);
        setFollowers(prev => Math.max(0, prev - 1));
      } else {
        await setDoc(followRef, {
          followerId: user.uid,
          followingId: trainerId,
          followingType: 'user',
          createdAt: new Date().toISOString(),
        });
        setIsFollowing(true);
        setFollowers(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) return navigate('/login');
    const isOwnProfile = user.uid === trainerId;
    if (isOwnProfile) return navigate('/messaging');

    try {
      const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
      const chatsSnap = await getDocs(chatsQuery);
      const existingChat = chatsSnap.docs.find(d => {
        const p = d.data().participants;
        return p.includes(trainerId) && p.length === 2;
      });

      if (existingChat) {
        navigate(`/messaging/${existingChat.id}`);
      } else {
        const newChat = await addDoc(collection(db, 'chats'), {
          participants: [user.uid, trainerId],
          trainerId: trainerId,
          learnerId: user.uid,
          trainerName: trainer.displayName,
          learnerName: user.displayName || 'Utilisateur',
          lastMessage: '',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          type: 'direct'
        });
        navigate(`/messaging/${newChat.id}`);
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      navigate('/messaging');
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Chargement du profil...</p>
      </div>
    </div>
  );

  if (!trainer) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500 font-bold">
      Trainer introuvable
    </div>
  );

  const isOwnProfile = user?.uid === trainerId;
  const avgRating = talents.length > 0 
    ? (talents.reduce((sum, t) => sum + (t.rating || 5), 0) / talents.length).toFixed(1) 
    : '5.0';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="h-[280px] relative overflow-hidden bg-slate-900 border-b border-indigo-900/20">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
          style={{ 
            backgroundImage: trainer.bannerURL ? `url(${trainer.bannerURL})` : 'none',
            filter: 'brightness(0.6)'
          }}
        />
        {!trainer.bannerURL && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-slate-900 mix-blend-multiply opacity-80" />
        )}
        
        <div className="absolute top-8 left-8 flex items-center justify-between w-[calc(100%-64px)] z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          {isOwnProfile && (
             <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Modifier mon profil
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-30 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-40 h-40 rounded-[40px] border-8 border-white shadow-2xl overflow-hidden bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center">
                {trainer.photoURL ? (
                  <img 
                    src={trainer.photoURL} 
                    alt={trainer.displayName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl font-black text-slate-200 uppercase">${trainer.displayName?.split(' ').map((n: string) => n[0]).join('') || '?'}</div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-200 uppercase">
                    {trainer.displayName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex items-center gap-2 justify-center">
                  <h2 className="text-2xl font-black text-slate-900">{trainer.displayName}</h2>
                  {trainer.isVerified && <ShieldCheck className="w-6 h-6 text-primary fill-primary/10" />}
                </div>
                <p className="text-slate-500 font-bold flex items-center gap-2 justify-center text-sm">
                  <Mail className="w-4 h-4 text-slate-400" /> {trainer.email}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-slate-50">
                 <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1">Followers</p>
                   <p className="text-xl font-black text-slate-900">{followers}</p>
                 </div>
                 <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1">Note Moyenne</p>
                   <p className="text-xl font-black text-primary">{avgRating}</p>
                 </div>
              </div>

              {!isOwnProfile && (
                <div className="w-full grid grid-cols-4 gap-3 mt-8">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`col-span-3 py-4 rounded-2xl font-black uppercase tracking-wider text-xs transition-all active:scale-95 flex items-center justify-center gap-3 border shadow-lg ${
                      isFollowing
                        ? 'bg-primary text-white border-primary shadow-primary/30'
                        : 'bg-white text-primary border-primary/20 hover:border-primary'
                    }`}
                  >
                    {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     isFollowing ? <UserCheck className="w-4 h-4 text-white" /> : <UserPlus className="w-4 h-4" />}
                    {isFollowing ? 'Suivi' : 'Suivre le Trainer'}
                  </button>
                  <button
                    onClick={handleStartChat}
                    className="aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4"
            >
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 italic">Informations</h4>
               {[
                 { label: 'Localisation', val: trainer.location || 'Maroc', icon: MapPin },
                 { label: 'Talents Actifs', val: `${talents.length} formations`, icon: BookOpen },
                 { 
                   label: 'Vérification', 
                   val: trainer.isVerified ? 'Compte Certifié' : 'En attente', 
                   icon: ShieldCheck,
                   tooltip: 'Ce badge certifie la crédibilité du formateur par Hestim Academy. Pour toute demande, contactez l\'admin.'
                 },
               ].map((item, i) => (
                 <div key={i} className="group relative flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-help">
                    {item.tooltip && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl leading-relaxed">
                         {item.tooltip}
                         <div className="absolute top-full left-6 border-8 border-transparent border-t-slate-900" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.val === 'Compte Certifié' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">{item.label}</p>
                      <p className="text-slate-900 font-bold text-sm tracking-tight">{item.val}</p>
                    </div>
                 </div>
               ))}
            </motion.div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-1 h-8 bg-primary rounded-full" />
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">À propos de l'instructeur</h3>
               </div>
               <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 border border-slate-100 p-8 rounded-[32px] italic">
                 "{trainer.bio || "Ce formateur n'a pas encore rédigé sa présentation. Cependant, son expertise et ses retours élèves témoignent de son excellence dans ses domaines de prédilection."}"
               </p>
            </motion.div>

            <div className="space-y-8">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Liste des Talents <span className="text-slate-300 font-medium">({talents.length})</span>
                  </h3>
               </div>

               {talents.length > 0 ? (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {talents.slice(0, visibleCount).map((talent, i) => (
                      <motion.div
                        key={talent.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <TalentCard talent={talent} />
                      </motion.div>
                    ))}
                  </div>

                  {visibleCount < talents.length && (
                    <div className="flex justify-center pt-4">
                       <button 
                         onClick={() => setVisibleCount(prev => prev + 6)}
                         className="px-10 py-4 bg-white border-2 border-slate-100 text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 shadow-lg shadow-slate-100"
                       >
                          Découvrir plus de talents
                       </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">Aucun talent pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;
