import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Star, Clock, Users, CheckCircle2, MessageSquare, CreditCard, ArrowLeft, LayoutGrid, Award, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import FollowTalentButton from '../components/FollowTalentButton';
import PaymentModal from '../components/PaymentModal';

// Mock Talents for Development
const MOCK_TALENTS = [
  {
    id: 'talent-1',
    title: 'Musique / Chant',
    description: 'Cours de musique et de chant professionnel avec des techniques reconnues mondialement.',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500',
    rating: 5.0,
    reviewCount: 247,
    trainerId: 'trainer-1',
    trainerName: 'Ahmed Zaki',
    isActive: true,
    offers: [
      { id: 'offer-1-1', title: 'Cours solo', description: 'Leçons de chant en tête-à-tête', duration: '4 semaines', price: 120 }
    ]
  },
  {
    id: 'talent-2',
    title: 'Arts visuels',
    description: 'Dessin, peinture et art numérique - Apprenez à exprimer votre créativité.',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
    rating: 4.9,
    reviewCount: 156,
    trainerId: 'trainer-2',
    trainerName: 'Leila Bennani',
    isActive: true,
    offers: [
      { id: 'offer-2-1', title: 'Dessin débutant', description: 'Initiation au dessin', duration: '4 semaines', price: 120 },
      { id: 'offer-2-2', title: 'Peinture', description: 'Techniques de peinture', duration: '6 semaines', price: 120 },
      { id: 'offer-2-3', title: 'Digital art', description: 'Art numérique et design graphique', duration: '5 semaines', price: 120 },
      { id: 'offer-2-4', title: 'Portfolio', description: 'Création de portfolio professionnel', duration: '3 semaines', price: 120 }
    ]
  },
  {
    id: 'talent-3',
    title: 'Programmation',
    description: 'Développement web et applications mobiles - De zéro à expert.',
    category: 'Coding',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500',
    rating: 5.0,
    reviewCount: 428,
    trainerId: 'trainer-3',
    trainerName: 'Mehdi Choukri',
    isActive: true,
    offers: [
      { id: 'offer-3-1', title: 'Intro Python', description: 'Introduction à Python', duration: '4 semaines', price: 120 },
      { id: 'offer-3-2', title: 'Web', description: 'Développement web - HTML, CSS, JavaScript', duration: '6 semaines', price: 120 },
      { id: 'offer-3-3', title: 'App mobile', description: 'Développement d\'applications mobiles', duration: '8 semaines', price: 120 },
      { id: 'offer-3-4', title: 'Projet guide', description: 'Réalisation de projets complets guidés', duration: '7 semaines', price: 120 }
    ]
  },
  {
    id: 'talent-4',
    title: 'Photographie',
    description: 'Photographie professionnelle et édition - Capturez la beauté du monde.',
    category: 'Photography',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
    rating: 4.9,
    reviewCount: 156,
    trainerId: 'trainer-4',
    trainerName: 'Hassan Bennani',
    isActive: true,
    offers: [
      { id: 'offer-4-1', title: 'Prise de vue', description: 'Techniques de photographie', duration: '4 semaines', price: 120 },
      { id: 'offer-4-2', title: 'Retouche', description: 'Édition et retouche photo', duration: '5 semaines', price: 120 },
      { id: 'offer-4-3', title: 'Sortie terrain', description: 'Photographie en extérieur', duration: '3 semaines', price: 120 },
      { id: 'offer-4-4', title: 'Exposition', description: 'Préparation d\'expositions photo', duration: '4 semaines', price: 120 }
    ]
  },
  {
    id: 'talent-5',
    title: 'Langues',
    description: 'Apprentissage de langues - Arabe, Anglais, Français et plus.',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbdf26cecb46?w=500',
    rating: 4.8,
    reviewCount: 278,
    trainerId: 'trainer-5',
    trainerName: 'Fatima Zohra',
    isActive: true,
    offers: [
      { id: 'offer-5-1', title: 'Conversation', description: 'Pratique de la conversation', duration: '6 semaines', price: 120 },
      { id: 'offer-5-2', title: 'Grammaire', description: 'Grammaire et structures linguistiques', duration: '5 semaines', price: 120 },
      { id: 'offer-5-3', title: 'Preparation examen', description: 'Préparation aux examens officiels', duration: '8 semaines', price: 120 },
      { id: 'offer-5-4', title: 'Echange DIALECT ARABE ANGALIS FRANCAIS', description: 'Échange de dialecte arabe, anglais et français', duration: '6 semaines', price: 120 }
    ]
  },
  {
    id: 'talent-6',
    title: 'Jeux stratégiques',
    description: 'Échecs, jeux de stratégie et coaching - Développez votre esprit stratégique.',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=500',
    rating: 4.9,
    reviewCount: 189,
    trainerId: 'trainer-6',
    trainerName: 'Karim El Kasmi',
    isActive: true,
    offers: [
      { id: 'offer-6-1', title: 'Initiation', description: 'Initiation aux jeux stratégiques', duration: '4 semaines', price: 120 },
      { id: 'offer-6-2', title: 'Tournoi', description: 'Préparation aux tournois', duration: '6 semaines', price: 120 },
      { id: 'offer-6-3', title: 'Coaching', description: 'Coaching personnalisé', duration: '8 semaines', price: 120 },
      { id: 'offer-6-4', title: 'Analyse de partie', description: 'Analyse et stratégies avancées', duration: '5 semaines', price: 120 }
    ]
  },
  {
    id: 'talent-7',
    title: 'Sport / Fitness',
    description: 'Entraînement sportif et fitness - Transformez votre corps et esprit.',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
    rating: 5.0,
    reviewCount: 312,
    trainerId: 'trainer-7',
    trainerName: 'Youssef Hamid',
    isActive: true,
    offers: [
      { id: 'offer-7-1', title: 'Coaching personnalisé', description: 'Entraînement adapté à vos objectifs', duration: '8 semaines', price: 120 },
      { id: 'offer-7-2', title: 'Plan d\'entraînement', description: 'Création de plans d\'entraînement', duration: '4 semaines', price: 120 },
      { id: 'offer-7-3', title: 'Bootcamp', description: 'Bootcamp intensif de fitness', duration: '6 semaines', price: 120 }
    ]
  },
  {
    id: 'talent-8',
    title: 'Crochet',
    description: 'Art du crochet et travaux manuels - Créez de magnifiques projets.',
    category: 'Crochets',
    imageUrl: 'https://images.unsplash.com/photo-1578926078328-123456789012?w=500',
    rating: 4.8,
    reviewCount: 143,
    trainerId: 'trainer-8',
    trainerName: 'Nadia Sami',
    isActive: true,
    offers: [
      { id: 'offer-8-1', title: 'Cours de base', description: 'Les bases du crochet', duration: '4 semaines', price: 120 },
      { id: 'offer-8-2', title: 'Apprentissage en groupe', description: 'Apprentissage en groupe convivial', duration: '6 semaines', price: 120 },
      { id: 'offer-8-3', title: 'Atelier', description: 'Ateliers créatifs et projets', duration: '5 semaines', price: 120 },
      { id: 'offer-8-4', title: 'Cours accéléré', description: 'Cours intensif et accéléré', duration: '3 semaines', price: 120 }
    ]
  }
];

const MOCK_OFFERS = [
  {
    id: 'offer-default-1',
    title: 'Starter Package',
    description: 'Commencez votre apprentissage avec les bases essentielles.',
    price: 120,
    duration: '4 semaines',
  },
  {
    id: 'offer-default-2',
    title: 'Professional Pack',
    description: 'Package professionnel avec mentorat personnalisé et projets concrets.',
    price: 120,
    duration: '8 semaines',
  },
  {
    id: 'offer-default-3',
    title: 'Master Program',
    description: 'Programme complet avec certification et accès à la communauté.',
    price: 120,
    duration: '12 semaines',
  }
];

const TalentDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [talent, setTalent] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const talentDoc = await getDoc(doc(db, 'talents', id));
        if (talentDoc.exists()) {
          setTalent({ id: talentDoc.id, ...talentDoc.data() });
          const offersSnap = await getDocs(collection(db, 'talents', id, 'offers'));
          setOffers(offersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          // Fallback to mock data if not found in Firestore
          const mockTalent = MOCK_TALENTS.find(t => t.id === id);
          if (mockTalent) {
            setTalent(mockTalent);
            setOffers(mockTalent.offers || MOCK_OFFERS);
          }
        }
      } catch (err) {
        console.error(err);
        // Fallback to mock on error
        const mockTalent = MOCK_TALENTS.find(t => t.id === id);
        if (mockTalent) {
          setTalent(mockTalent);
          setOffers(mockTalent.offers || MOCK_OFFERS);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOpenPayment = (offer: any) => {
    if (!user) return navigate('/login');
    setSelectedOffer(offer);
    setIsPaymentModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!user || !talent || !selectedOffer) return;

    setPurchasing(true);
    try {
      // Create transaction
      const transactionData = {
        learnerId: user.uid,
        trainerId: talent.trainerId,
        offerId: selectedOffer.id,
        talentId: talent.id,
        amount: selectedOffer.price || 120,
        commission: Math.round((selectedOffer.price || 120) * 0.2),
        status: 'completed',
        paymentMethod: 'card_mock',
        createdAt: new Date().toISOString(),
      };
      
      const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);

      // Create chat
      const chatData = {
        participants: [user.uid, talent.trainerId],
        offerId: selectedOffer.id,
        offerTitle: selectedOffer.title,
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
                {talent.videoUrl ? (
                  <video 
                    src={talent.videoUrl} 
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                ) : talent.imageUrl && (
                  <img
                    src={talent.imageUrl}
                    alt={talent.title}
                    className="w-full h-full object-cover"
                  />
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
                        onClick={() => handleOpenPayment(offer)}
                        disabled={purchasing}
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 bg-primary text-white hover:bg-indigo-700 shadow-lg shadow-primary/30`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>S'inscrire</span>
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedOffer(null);
        }}
        onConfirm={handlePurchase}
        offer={selectedOffer}
        talent={talent}
        isProcessing={purchasing}
      />
    </div>
  );
};

export default TalentDetail;
