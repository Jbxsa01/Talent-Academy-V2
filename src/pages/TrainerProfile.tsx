import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Plus, Edit2, ArrowLeft, Users, BookOpen } from 'lucide-react';
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

  useEffect(() => {
    const fetchData = async () => {
      if (!trainerId) return;
      
      try {
        // Fetch trainer profile
        const trainerDoc = await getDoc(doc(db, 'users', trainerId));
        if (trainerDoc.exists()) {
          setTrainer({ id: trainerDoc.id, ...trainerDoc.data() });
        }

        // Fetch trainer's talents
        const talentsQuery = query(
          collection(db, 'talents'),
          where('trainerId', '==', trainerId)
        );
        const talentsSnap = await getDocs(talentsQuery);
        setTalents(talentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Check if current user follows this trainer
        if (user) {
          const followQuery = query(
            collection(db, 'follows'),
            where('followerId', '==', user.uid),
            where('followingId', '==', trainerId),
            where('followingType', '==', 'user')
          );
          const followSnap = await getDocs(followQuery);
          setIsFollowing(followSnap.docs.length > 0);
        }

        // Get followers count
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
    if (!user || !trainerId) return;

    try {
      if (isFollowing) {
        // Unfollow
        const followQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', user.uid),
          where('followingId', '==', trainerId),
          where('followingType', '==', 'user')
        );
        const followSnap = await getDocs(followQuery);
        for (const doc of followSnap.docs) {
          await deleteDoc(doc.ref);
        }
        setIsFollowing(false);
        setFollowers(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        await addDoc(collection(db, 'follows'), {
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
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-primary font-black animate-pulse">
      Chargement du profil...
    </div>
  );

  if (!trainer) return (
    <div className="h-screen flex items-center justify-center text-text-muted text-lg">
      Trainer introuvable
    </div>
  );

  const isOwnProfile = user?.uid === trainerId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-text-main italic">Profil Trainer</h1>
        </div>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Cover & Profile */}
          <div className="bg-gradient-to-r from-primary to-accent h-32"></div>

          <div className="px-8 pb-8">
            {/* Profile Info */}
            <div className="flex items-start justify-between -mt-12 mb-8">
              <div className="flex items-end gap-6">
                <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center font-black text-2xl text-primary">
                  {trainer.displayName?.charAt(0).toUpperCase() || '👤'}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-text-main italic">{trainer.displayName}</h2>
                  <p className="text-text-muted text-sm font-medium">{trainer.email}</p>
                </div>
              </div>

              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all active:scale-95 ${
                    isFollowing
                      ? 'bg-slate-100 text-primary border border-primary'
                      : 'bg-primary text-white hover:bg-indigo-700'
                  }`}
                >
                  {isFollowing ? '❤️ Suivi' : '🤍 Suivre'}
                </button>
              )}
            </div>

            {/* Bio */}
            {trainer.bio && (
              <p className="text-text-muted mb-8 leading-relaxed">{trainer.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200">
              <div className="text-center">
                <p className="text-3xl font-black text-primary">{talents.length}</p>
                <p className="text-text-muted text-sm font-medium">Talents</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-primary">{followers}</p>
                <p className="text-text-muted text-sm font-medium">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-primary">
                  {talents.length > 0 ? (talents.reduce((sum, t) => sum + (t.rating || 5), 0) / talents.length).toFixed(1) : '—'}
                </p>
                <p className="text-text-muted text-sm font-medium">Note</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/create-talent')}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Créer un Talent
                </button>
              )}
              <button
                onClick={() => navigate(`/messaging`)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-primary rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </button>
            </div>
          </div>
        </div>

        {/* Talents Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-black text-text-main mb-8 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            Talents du Trainer ({talents.length})
          </h3>

          {talents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {talents.map(talent => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-text-muted font-medium">
                {isOwnProfile ? 'Aucun talent créé pour le moment' : 'Ce trainer n\'a pas encore de talents'}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/create-talent')}
                  className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Créer un Talent
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TrainerProfile;
