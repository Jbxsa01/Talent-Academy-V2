import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import TalentCard from '../components/TalentCard';
import { Search, Filter, Grid, List, Compass, Award, BookOpen, TrendingUp, Briefcase, Radio } from 'lucide-react';
import { motion } from 'motion/react';

// Mock Talents Data - Professional & Moroccan-focused
const MOCK_TALENTS = [
  {
    id: 'talent-1',
    title: 'Design Moderne & Zellige UI',
    description: 'Apprenez à fusionner les motifs traditionnels Zellige avec le design UI moderne pour vos projets Web.',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 4.9,
    reviewCount: 247,
    trainerId: 'trainer-1',
    trainerName: 'Anas El Alami',
    skills: ['Figma', 'UI/UX', 'Design System']
  },
  {
    id: 'talent-2',
    title: 'Masterclass Darija Business',
    description: 'Darija professionnelle pour négocier avec clients et fondateurs. Expressions clés des startups marocaines.',
    category: 'Darija',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 5.0,
    reviewCount: 189,
    trainerId: 'trainer-2',
    trainerName: 'Ghita Benani',
    skills: ['Communication', 'Business', 'Négociation']
  },
  {
    id: 'talent-3',
    title: 'L\'Art du Tajine Parfait',
    description: 'Des épices à la cuisson lente. Secrets des chefs marocains pour impressionner lors des événements HESTIM.',
    category: 'Cuisine',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 4.8,
    reviewCount: 312,
    trainerId: 'trainer-3',
    trainerName: 'Chef Youssef',
    skills: ['Cuisine', 'Épices', 'Tradition']
  },
  {
    id: 'talent-4',
    title: 'Développement Full Stack HESTIM',
    description: 'Bâtissez des apps scalables. Sessions pratiques de l\'architecture au déploiement avec technologies modernes.',
    category: 'Coding',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 4.7,
    reviewCount: 428,
    trainerId: 'trainer-4',
    trainerName: 'Mehdi Choukri',
    skills: ['React', 'Node.js', 'Architecture']
  },
  {
    id: 'talent-5',
    title: 'Photography Pro: Moments aux Paysages',
    description: 'Capturez la beauté des paysages marocains et des moments authentiques. Technique professionnelle et post-production.',
    category: 'Photo',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 4.9,
    reviewCount: 156,
    trainerId: 'trainer-5',
    trainerName: 'Khalid Younes',
    skills: ['Portrait', 'Paysage', 'Post-production']
  },
  {
    id: 'talent-6',
    title: 'Digital Marketing: Growth Hacking',
    description: 'Stratégies éprouvées pour croître sur Instagram, TikTok et LinkedIn. Cas d\'études de startups marocaines.',
    category: 'Marketing',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-adf4e565016a?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 4.6,
    reviewCount: 278,
    trainerId: 'trainer-6',
    trainerName: 'Lina Riad',
    skills: ['Social Media', 'Analytics', 'Copywriting']
  },
  {
    id: 'talent-7',
    title: 'Production Musicale & Beatmaking',
    description: 'Créez des beats professionnels avec Ableton Live. Fusion de styles marocains et électroniques modernes.',
    category: 'Musique',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 4.8,
    reviewCount: 203,
    trainerId: 'trainer-7',
    trainerName: 'Yassir El',
    skills: ['Ableton', 'Production', 'Mixing']
  },
  {
    id: 'talent-8',
    title: 'Leadership & Soft Skills pour Cadres',
    description: 'Développez votre leadership et communication en environnement multiculturel. Préparation pour management.',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 4.7,
    reviewCount: 195,
    trainerId: 'trainer-8',
    trainerName: 'Dr. Amina Zahra',
    skills: ['Leadership', 'Communication', 'Coaching']
  },
  {
    id: 'talent-9',
    title: 'Web Design Responsive & Accessibility',
    description: 'Créez des sites accessibles et responsifs. Standards WCAG et best practices pour tous les appareils.',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1545235617-7465005b00fc?auto=format&fit=crop&q=80&w=400&h=300',
    rating: 4.9,
    reviewCount: 341,
    trainerId: 'trainer-9',
    trainerName: 'Sarah Bennani',
    skills: ['HTML/CSS', 'Responsive', 'A11y']
  }
];

// Mock Offers Data
const MOCK_OFFERS = [
  {
    id: 'offer-1',
    title: 'Starter Design Package',
    description: 'Refonte de votre portfolio avec les meilleures pratiques design UI/UX modernes.',
    category: 'Design',
    price: 1200,
    duration: '4 semaines',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=400&h=300',
    deliverables: 5,
    rating: 4.9
  },
  {
    id: 'offer-2',
    title: 'Web Application Development',
    description: 'Développement complet d\'une application web scalable avec architecture moderne.',
    category: 'Coding',
    price: 3500,
    duration: '8-12 semaines',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400&h=300',
    deliverables: 12,
    rating: 4.8
  },
  {
    id: 'offer-3',
    title: 'Social Media Strategy',
    description: 'Stratégie complète de croissance digitale et augmentation d\'engagement garantie.',
    category: 'Marketing',
    price: 800,
    duration: '6 semaines',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-adf4e565016a?auto=format&fit=crop&q=80&w=400&h=300',
    deliverables: 8,
    rating: 4.7
  },
  {
    id: 'offer-4',
    title: 'Professional Photography Session',
    description: 'Session photo professionnel avec retouche et album digital haute résolution.',
    category: 'Photo',
    price: 600,
    duration: '1 jour + 5 jours retouche',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400&h=300',
    deliverables: 50,
    rating: 4.9
  },
  {
    id: 'offer-5',
    title: 'Consulting Leadership',
    description: 'Accompagnement personnel pendant 3 mois pour développer votre leadership et influence.',
    category: 'Soft Skills',
    price: 1500,
    duration: '12 semaines',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400&h=300',
    deliverables: 12,
    rating: 4.8
  }
];

const CATEGORIES = ['All', 'Design', 'Coding', 'Cuisine', 'Darija', 'Marketing', 'Photo', 'Musique', 'Soft Skills'];

const ITEMS_PER_PAGE = 10;

const Discover = () => {
  const [talents, setTalents] = useState<any[]>(MOCK_TALENTS);
  const [offers, setOffers] = useState<any[]>(MOCK_OFFERS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'talents' | 'offers' | 'live'>('talents');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const talentsQuery = query(collection(db, 'talents'), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(talentsQuery);
        const fbTalents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fbTalents.length > 0) {
          setTalents(fbTalents);
        }
      } catch (err) {
        console.error('Error fetching talents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = (activeTab === 'talents' ? talents : offers).filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, activeTab]);

  return (
    <div className="w-full bg-gradient-to-b from-white to-slate-50">
      {/* Header Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Title & Description */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Compass className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Découvrez les Talents</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Explorez les meilleurs cours et services personnalisés de la communauté HESTIM
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 flex-wrap">
            {(['talents', 'live', 'offers'] as const).map(tab => {
              const liveCount = talents.filter(t => t.isActive).length;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveCategory('All'); // Reset category filter
                    setSearchTerm(''); // Reset search
                  }}
                  className={`flex items-center gap-2 px-5 py-2 font-semibold text-sm transition-all rounded-lg ${
                    activeTab === tab
                      ? tab === 'live'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'talents' && '🎓 Tous les Talents'}
                  {tab === 'live' && (
                    <>
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>Sessions Live ({liveCount})</span>
                    </>
                  )}
                  {tab === 'offers' && '💼 Offres'}
                </button>
              );
            })}
          </div>

          {/* Search & Filters Row */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'talents' ? 'Chercher un talent, une compétence...' : 'Chercher une offre...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all text-xs ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Aucun {activeTab === 'talents' ? 'talent' : 'offre'} trouvé
            </h3>
            <p className="text-slate-600">Essayez une autre recherche ou catégorie</p>
          </motion.div>
        ) : (
          <>
            {/* Results Counter */}
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="text-slate-600 font-medium">{filteredData.length} résultats trouvés</span>
              {totalPages > 1 && <span className="text-slate-500 text-sm ml-auto">Page {currentPage} sur {totalPages}</span>}
            </div>

            {/* Talents Grid/List View */}
            {activeTab === 'talents' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'
                    : 'space-y-4'
                }
              >
                {paginatedData.map(talent => (
                  <motion.div key={talent.id} variants={itemVariants}>
                    <TalentCard talent={talent} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Live Sessions Grid View */}
            {activeTab === 'live' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                    : 'space-y-6'
                }
              >
                {talents.filter(t => t.isActive).length > 0 ? (
                  talents.filter(t => t.isActive).map(talent => (
                    <motion.div key={talent.id} variants={itemVariants}>
                      <TalentCard talent={talent} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <Radio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Aucune session en direct</h3>
                    <p className="text-slate-600">Revenez plus tard pour voir les sessions live</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Offers Grid/List View */}
            {activeTab === 'offers' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'
                    : 'space-y-4'
                }
              >
                {paginatedData.map(offer => (
                  <motion.div
                    key={offer.id}
                    variants={itemVariants}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 flex flex-col group cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative h-32 overflow-hidden bg-slate-100">
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-2 left-2">
                        <div className="bg-white rounded-lg px-2 py-1 shadow-lg">
                          <p className="text-sm font-extrabold text-indigo-600">
                            {offer.price.toLocaleString()} DHS
                          </p>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                          {offer.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 flex flex-col flex-grow min-h-fit">
                      <h3 className="text-xs font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">
                        {offer.title}
                      </h3>

                      {/* Rating & Button */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="font-bold text-slate-900 text-xs">{offer.rating.toFixed(1)}</span>
                        </div>
                        <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-xs transition-colors">
                          Voir
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty State */}
                {paginatedData.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-slate-500 font-medium">Aucune offre trouvée</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Précédent
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Discover;
