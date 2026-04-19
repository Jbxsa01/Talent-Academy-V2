import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import TalentCard from '../components/TalentCard';
import { Search, Sparkles, Star, Users, Zap, Award, CheckCircle } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { APP_LOGO } from '../lib/constants';

const CATEGORIES = ['Design', 'Coding', 'Crochets', 'Marketing', 'Photo', 'Musique', 'Soft Skills'];

// Counter Component for animated numbers
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentValue = Math.floor(progress * value);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [inView, value, duration]);

  return (
    <div ref={ref}>
      {displayValue}
    </div>
  );
}

const MOROCCAN_MOCK_DATA = [
  {
    id: 'mock-1',
    title: 'Design Moderne & Zellige UI',
    description: 'Apprenez à fusionner les motifs traditionnels Zellige avec le design UI moderne pour vos projets Web.',
    category: 'Design',
    rating: 4.9,
    trainerName: 'Anas El Alami',
    imageUrl: '/img/idees-idee-vision-conception-plan-objectif-mission-concept_53876-167112.avif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-3',
    title: 'Crochets pour Débutants',
    description: 'Apprenez l\'art du crochet avec des projets amusants et faciles. Créez vos propres accessoires et cadeaux.',
    category: 'Crochets',
    rating: 4.9,
    trainerName: 'Yasmine Bennani',
    imageUrl: '/img/2048.webp',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-4',
    title: 'Développement Full Stack HESTIM',
    description: 'Bâtissez des apps scalables durant vos études à HESTIM. Sessions pratiques de l\'architecture au déploiement.',
    category: 'Coding',
    rating: 4.7,
    trainerName: 'Mehdi Choukri',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400&h=300',
    createdAt: new Date().toISOString()
  }
];

const Home = () => {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const q = query(collection(db, 'talents'), orderBy('createdAt', 'desc'), limit(12));
        const snapshot = await getDocs(q);
        const fbData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Blend real data with mocks for a full experience
        setTalents(fbData.length > 0 ? fbData : MOROCCAN_MOCK_DATA);
      } catch (err) {
        console.error(err);
        setTalents(MOROCCAN_MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchTalents();
  }, []);

  const filteredTalents = talents.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section with Background Shapes */}
      <section className="relative bg-white overflow-hidden">
        {/* Decorative shapes - NO GRADIENTS, just flat colors */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-100 rounded-full opacity-60"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-yellow-50 rounded-full opacity-40"></div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              {/* Hero Badge - Premium Certified */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-block mb-8"
              >
                <div className="relative">
                  {/* Badge Container */}
                  <div className="flex items-center gap-3 px-5 py-2 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    {/* Logo */}
                    <div className="h-8 w-auto">
                      <img src={APP_LOGO} alt="HESTIM" className="h-full w-auto object-contain" />
                    </div>
                    
                    {/* Text Content */}
                    <span className="text-xs font-bold text-text-main">Certifié</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Hero Title */}
              <h1 className="text-6xl md:text-7xl font-black text-text-main mb-8 leading-[1] tracking-tighter">
                Propulsez votre <br />
                <span className="text-primary">Avenir</span> ici.
              </h1>
              
              {/* Hero Description */}
              <p className="text-xl text-text-muted max-w-2xl mb-12 font-medium">
                L'espace d'échange de talents exclusif à <span className="text-primary font-bold">HESTIM.ma</span>. 
                Partagez vos compétences et apprenez de vos pairs dès aujourd'hui.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="text-text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un talent, une compétence ou un étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface border-2 border-border-subtle rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-0 focus:border-primary transition-all shadow-lg text-lg"
                />
              </div>
            </div>

            {/* Right - Hero Image */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <img src="/img/4099329.jpg" alt="Creative talents" className="w-full rounded-3xl shadow-lg" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-24 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-100 rounded-full opacity-20"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-text-main mb-4">Notre Impact</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">Join une communauté en croissance rapide d'étudiants et de talents vérifiés</p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Stat Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative p-8 lg:p-10">
                {/* Icon Badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 text-white rounded-2xl mb-6 font-black text-4xl shadow-lg">
                  <AnimatedCounter value={500} duration={2} />
                </div>
                
                {/* Plus sign */}
                <span className="text-blue-500 text-4xl font-black inline-block mb-6">+</span>

                {/* Content */}
                <h3 className="text-3xl font-black text-text-main mb-3">Talents Vérifiés</h3>
                <p className="text-text-muted text-lg leading-relaxed">Des experts et passionnés de HESTIM prêts à partager leurs connaissances et expériences</p>

                {/* Accent line */}
                <div className="mt-6 h-1 w-12 bg-blue-500 rounded-full"></div>
              </div>
            </motion.div>

            {/* Stat Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative p-8 lg:p-10">
                {/* Icon Badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-500 text-white rounded-2xl mb-6 font-black text-4xl shadow-lg">
                  <AnimatedCounter value={100} duration={2} />
                </div>

                {/* Plus sign */}
                <span className="text-pink-500 text-4xl font-black inline-block mb-6">+</span>

                {/* Content */}
                <h3 className="text-3xl font-black text-text-main mb-3">Compétences</h3>
                <p className="text-text-muted text-lg leading-relaxed">Une variété infinie de domaines à explorer, du coding aux crochets en passant par le design</p>

                {/* Accent line */}
                <div className="mt-6 h-1 w-12 bg-pink-500 rounded-full"></div>
              </div>
            </motion.div>

            {/* Stat Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-50 rounded-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative p-8 lg:p-10">
                {/* Icon Badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 text-white rounded-2xl mb-6 font-black text-3xl shadow-lg">
                  <AnimatedCounter value={1000} duration={2} />
                </div>

                {/* Plus sign */}
                <span className="text-orange-500 text-4xl font-black inline-block mb-6">+</span>

                {/* Content */}
                <h3 className="text-3xl font-black text-text-main mb-3">Échanges/Mois</h3>
                <p className="text-text-muted text-lg leading-relaxed">Une communauté active et dynamique qui s'engage à apprendre et partager chaque jour</p>

                {/* Accent line */}
                <div className="mt-6 h-1 w-12 bg-orange-500 rounded-full"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Join Section with Illustration */}
      <section className="bg-white py-20 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-10 right-0 w-64 h-64 bg-purple-100 rounded-full opacity-40"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-pink-100 rounded-full opacity-30"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }} 
              whileInView={{ opacity: 1, x: 0 }}
              className="order-2 lg:order-1"
            >
              <img src="/img/Wavy_Ppl-05_Single-12.jpg" alt="Team collaboration" className="w-full rounded-3xl" />
            </motion.div>

            {/* Right - Content */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }} 
              whileInView={{ opacity: 1, x: 0 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-5xl font-black text-text-main mb-8">Pourquoi nous rejoindre?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-main mb-2">Apprenez sans pression</h3>
                    <p className="text-text-muted">Des sessions entre pairs, à votre rythme, sans pression académique</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-main mb-2">Réseau exclusif</h3>
                    <p className="text-text-muted">Connectez-vous avec les meilleurs talents de votre promotion</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-main mb-2">Compétences réelles</h3>
                    <p className="text-text-muted">Bâtissez un portfolio enrichi avec des expériences concrètes</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-main mb-2">Reconnaissance</h3>
                    <p className="text-text-muted">Gagnez des badges et certificats reconnus par HESTIM</p>
                  </div>
                </div>
              </div>

              <button className="mt-10 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg">
                Commencer maintenant
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-yellow-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black text-text-main text-center mb-12">Tous nos domaines</h2>
          
          <div className="overflow-x-auto pb-6 scrollbar-hide">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveCategory('All')}
                className={`px-8 py-3 rounded-xl whitespace-nowrap font-bold text-sm transition-all border-2 flex-shrink-0 ${
                  activeCategory === 'All'
                    ? 'bg-primary text-white border-primary shadow-lg'
                    : 'bg-white text-text-muted border-border-subtle hover:border-primary'
                }`}
              >
                Tout voir
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-xl whitespace-nowrap font-bold text-sm transition-all border-2 flex-shrink-0 ${
                    activeCategory === cat
                      ? 'bg-primary text-white border-primary shadow-lg'
                      : 'bg-white text-text-muted border-border-subtle hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Talent Grid Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[4/5] bg-gray-100 border border-border-subtle rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredTalents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTalents.map(talent => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-border-subtle">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-300 w-8 h-8" />
              </div>
              <p className="text-text-muted font-bold uppercase tracking-widest text-sm">Aucun talent trouvé pour "{searchTerm}"</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-purple-50 py-20 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-20 w-64 h-64 bg-pink-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-10 right-20 w-48 h-48 bg-blue-100 rounded-full opacity-40"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-5xl font-black text-text-main text-center mb-16">Comment ça marche?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: "S'inscrire", desc: "Créez votre profil en 2 minutes" },
              { num: 2, title: "Explorer", desc: "Découvrez les talents et compétences" },
              { num: 3, title: "Connecter", desc: "Demandez une session ou une mentorat" },
              { num: 4, title: "Apprendre", desc: "Partagez et croissez ensemble" }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center relative"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white border-4 border-primary rounded-full text-primary font-black text-2xl mb-6 mx-auto shadow-lg relative z-10">
                  {step.num}
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[40%] h-1 bg-primary/30"></div>
                )}
                <h3 className="font-bold text-xl text-text-main mb-3">{step.title}</h3>
                <p className="text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-20 relative overflow-hidden">
        {/* Decorative shapes without gradient */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-black mb-6">Prêt à transformer votre potentiel?</h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
            Rejoignez une communauté de talents vérifiés et commencez votre voyage d'apprentissage dès maintenant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
              S'inscrire gratuitement
            </button>
            <button className="px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors border-2 border-white">
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-white text-text-main py-16 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="col-span-1">
              <div className="mb-6">
                <img src="/img/Gemini_Generated_Image_xal8eexal8eexal8-removebg-preview.png" alt="HESTIM Logo" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                Plateforme d'échange de talents pour la communauté HESTIM. Partagez vos compétences et apprenez ensemble.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-all">
                  <span className="text-sm font-bold">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-all">
                  <span className="text-sm font-bold">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-all">
                  <span className="text-sm font-bold">tw</span>
                </a>
              </div>
            </div>

            {/* Université */}
            <div>
              <h3 className="font-black text-lg mb-6 text-text-main">Université</h3>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><a href="#" className="hover:text-primary transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Nos valeurs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Équipe</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* HESTIM.ma */}
            <div>
              <h3 className="font-black text-lg mb-6 text-text-main">HESTIM.ma</h3>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><a href="https://hestim.ma" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Site Officiel</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Programme Académique</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Admissions</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Campus</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Événements</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-black text-lg mb-6 text-text-main">Support</h3>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><a href="mailto:support@hestim.ma" className="hover:text-primary transition-colors">support@hestim.ma</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Centre d'Aide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border-subtle pt-8">
            {/* Bottom Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-text-muted mb-4 md:mb-0">
                © 2026 HESTIM Talent Academy. Tous droits réservés.
              </p>
              <div className="flex space-x-6 text-sm text-text-muted">
                <a href="#" className="hover:text-primary transition-colors">Conditions</a>
                <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
                <a href="#" className="hover:text-primary transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
