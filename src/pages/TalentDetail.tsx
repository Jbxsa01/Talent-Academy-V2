import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Star, Clock, Users, CheckCircle2, MessageSquare, CreditCard, ArrowLeft, LayoutGrid, Radio, Zap, Award, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import FollowTalentButton from '../components/FollowTalentButton';

const TalentDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [talent, setTalent] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const talentDoc = await getDoc(doc(db, 'talents', id));
        if (talentDoc.exists()) {
          setTalent({ id: talentDoc.id, ...talentDoc.data() });
          const offersSnap = await getDocs(collection(db, 'talents', id, 'offers'));
          setOffers(offersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePurchase = async (offer: any) => {
    if (!user) return navigate('/login');
    if (!talent) return;

    setPurchasing(true);
    try {
      // Create transaction
      const transactionData = {
        learnerId: user.uid,
        trainerId: talent.trainerId,
        offerId: offer.id,
        talentId: talent.id,
        amount: offer.price || 120,
        commission: Math.round((offer.price || 120) * 0.2),
        status: 'completed',
        paymentMethod: 'mock',
        createdAt: new Date().toISOString(),
      };
      
      const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);

      // Create chat
      const chatData = {
        participants: [user.uid, talent.trainerId],
        offerId: offer.id,
        offerTitle: offer.title,
        talentTitle: talent.title,
        talentId: talent.id,
        updatedAt: new Date().toISOString(),
        lastMessage: '✅ Accès accordé! Commencez à apprendre.',
      };
      const chatRef = await addDoc(collection(db, 'chats'), chatData);

      // Navigate to chat
      navigate(`/messaging/${chatRef.id}`);
    } catch (err) {
      console.error('Error processing purchase:', err);
      alert('Erreur lors de l\'achat. Veuillez réessayer.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-primary">
        <BookOpen className="w-12 h-12" />
      </motion.div>
    </div>
  );
  if (!talent) return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-text-muted text-lg">Talent introuvable</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header avec bouton retour */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{talent.category}</p>
              <h1 className="text-2xl font-bold text-text-main line-clamp-1">{talent.title}</h1>
            </div>
            <FollowTalentButton talentId={talent.id} size="lg" showLabel={true} />
          </div>
        </div>
      </div>

      {/* Live Banner */}
      {talent.isActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-6 mb-8 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse text-red-100" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase tracking-widest">🔴 Session en direct</p>
              <p className="text-sm text-red-100 mt-1">Cette formation est actuellement en cours. Rejoignez maintenant!</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          {/* Left: Image & Info */}
          <div className="lg:col-span-2 space-y-12">
            {/* Hero Image */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="relative aspect-video bg-slate-200 rounded-[28px] overflow-hidden shadow-xl border border-slate-200">
                {talent.imageUrl && (
                  <img
                    src={talent.imageUrl}
                    alt={talent.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {talent.isActive && (
                  <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase animate-pulse shadow-lg">
                    <Radio className="w-4 h-4" />
                    En direct
                  </div>
                )}
              </div>
            </motion.div>

            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-text-main leading-tight">
                {talent.title}
              </h1>
              <p className="text-lg text-text-muted leading-relaxed whitespace-pre-wrap">
                {talent.description}
              </p>
            </motion.div>

            {/* Mentor Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 border-2 border-slate-200"
            >
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-4">Instructeur</p>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {talent.trainerName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main text-lg">{talent.trainerName || 'Hestim Trainer'}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-text-main">{talent.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                      <span className="text-text-muted text-sm">({talent.reviewCount || 0} avis)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/trainer/${talent.trainerId}`)}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Voir le profil
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: Offers Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-40 space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  Offres Disponibles
                </h2>

                <div className="space-y-4">
                  {offers.map((offer, idx) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white border-2 border-slate-200 hover:border-primary rounded-2xl p-6 transition-all hover:shadow-lg group"
                    >
                      {/* Offer Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-text-main group-hover:text-primary transition-colors">
                            {offer.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-text-muted text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{offer.duration}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-primary">{offer.price}</p>
                          <p className="text-xs text-text-muted font-bold">/DHS</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-muted mb-6 line-clamp-3">
                        {offer.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-text-main">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          <span>Chat direct avec mentor</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-text-main">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          <span>Ressources complètes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-text-main">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          <span>Certificat inclus</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handlePurchase(offer)}
                        disabled={purchasing}
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
                          talent.isActive
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                            : 'bg-primary text-white hover:bg-indigo-700 shadow-lg shadow-primary/30'
                        }`}
                      >
                        {talent.isActive ? (
                          <>
                            <Radio className="w-4 h-4 animate-pulse" />
                            <span>Rejoindre Maintenant</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>S'inscrire</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-900 font-medium">
                  💡 <strong className="block mb-1">Besoin d'aide?</strong>
                  Contactez directement le mentor via chat après votre inscription.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TalentDetail;
