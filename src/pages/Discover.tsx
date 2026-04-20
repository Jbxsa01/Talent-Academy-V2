import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import TalentCard from '../components/TalentCard';
import { Search, Filter, Grid, List, Compass, Award, BookOpen, TrendingUp, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../lib/constants';

// Mock Talents Data - Professional & Moroccan-focused
const MOCK_TALENTS = [
  {
    id: 'talent-1',
    title: 'Design Moderne & Zellige UI',
    description: 'Apprenez à fusionner les motifs traditionnels Zellige avec le design UI moderne pour vos projets Web.',
    category: 'Design',
    imageUrl: '/img/idees-idee-vision-conception-plan-objectif-mission-concept_53876-167112.avif',
    rating: 4.9,
    reviewCount: 247,
    trainerId: 'trainer-1',
    trainerName: 'Anas El Alami',
    skills: ['Figma', 'UI/UX', 'Design System']
  },
  {
    id: 'talent-3',
    title: 'Crochets pour Débutants',
    description: 'Apprenez l\'art du crochet avec des projets amusants et faciles. Techniques de base et patterns populaires.',
    category: 'Crochets',
    imageUrl: '/img/2048.webp',
    rating: 4.9,
    reviewCount: 156,
    trainerId: 'trainer-3',
    trainerName: 'Yasmine Bennani',
    skills: ['Crochet', 'Créativité', 'Couture']
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



const ITEMS_PER_PAGE = 200; // Large enough to show all cards as requested

const Discover = () => {
  const [talents, setTalents] = useState<any[]>(MOCK_TALENTS);
  const [offers, setOffers] = useState<any[]>(MOCK_OFFERS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const filteredData = talents.filter(item => {
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
  }, [searchTerm, activeCategory]);

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

          {/* Search & Filters Row */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Chercher un talent, une compétence..."
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
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all text-xs ${
                activeCategory === 'All'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tout voir
            </button>
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
              Aucun talent trouvé
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
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3'
                  : 'space-y-3'
              }
            >
              {paginatedData.map(talent => (
                <motion.div key={talent.id} variants={itemVariants}>
                  <TalentCard talent={talent} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {/* Pagination removed as per 'show all' request */}
          </>
        )}
      </section>
    </div>
  );
};

export default Discover;
