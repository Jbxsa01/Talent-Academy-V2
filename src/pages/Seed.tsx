import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Database, Check } from 'lucide-react';
import { motion } from 'motion/react';

const talentsData = [
  {
    title: 'Musique / Chant',
    description: 'Cours de musique et de chant professionnel avec des techniques reconnues mondialement.',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=600',
    rating: 5.0,
    reviewCount: 247,
    status: 'approved',
    offers: [
      { title: 'Cours solo', description: 'Leçons de chant en tête-à-tête', price: 150, duration: '4 semaines', frequency: '2h/semaine', level: 'Tous niveaux' }
    ]
  },
  {
    title: 'Arts visuels',
    description: 'Dessin, peinture et art numérique - Apprenez à exprimer votre créativité.',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
    rating: 4.9,
    reviewCount: 156,
    status: 'approved',
    offers: [
      { title: 'Dessin débutant', description: 'Initiation au dessin', price: 100, duration: '4 semaines', frequency: '2h/semaine', level: 'Débutant' },
      { title: 'Peinture', description: 'Techniques de peinture', price: 120, duration: '6 semaines', frequency: '2h/semaine', level: 'Intermédiaire' },
      { title: 'Digital art', description: 'Art numérique et design graphique', price: 150, duration: '5 semaines', frequency: '3h/semaine', level: 'Avancé' },
      { title: 'Portfolio', description: 'Création de portfolio professionnel', price: 200, duration: '3 semaines', frequency: '4h/semaine', level: 'Professionnel' }
    ]
  },
  {
    title: 'Programmation',
    description: 'Développement web et applications mobiles - De zéro à expert.',
    category: 'Coding',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600',
    rating: 5.0,
    reviewCount: 428,
    status: 'approved',
    offers: [
      { title: 'Intro Python', description: 'Introduction à Python', price: 150, duration: '4 semaines', frequency: '3h/semaine', level: 'Débutant' },
      { title: 'Web', description: 'Développement web - HTML, CSS, JavaScript', price: 250, duration: '6 semaines', frequency: '4h/semaine', level: 'Intermédiaire' },
      { title: 'App mobile', description: 'Développement d\'applications mobiles', price: 300, duration: '8 semaines', frequency: '4h/semaine', level: 'Avancé' },
      { title: 'Projet guide', description: 'Réalisation de projets complets guidés', price: 400, duration: '7 semaines', frequency: '5h/semaine', level: 'Expert' }
    ]
  },
  {
    title: 'Photographie',
    description: 'Photographie professionnelle et édition - Capturez la beauté du monde.',
    category: 'Photography',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',
    rating: 4.9,
    reviewCount: 156,
    status: 'approved',
    offers: [
      { title: 'Prise de vue', description: 'Techniques de photographie', price: 120, duration: '4 semaines', frequency: '2h/semaine', level: 'Tous niveaux' },
      { title: 'Retouche', description: 'Édition et retouche photo sur Lightroom/Photoshop', price: 150, duration: '5 semaines', frequency: '3h/semaine', level: 'Intermédiaire' },
      { title: 'Sortie terrain', description: 'Photographie en extérieur et composition', price: 180, duration: '3 semaines', frequency: '4h/semaine', level: 'Intermédiaire' },
      { title: 'Exposition', description: 'Préparation d\'expositions photo et curation', price: 200, duration: '4 semaines', frequency: '2h/semaine', level: 'Avancé' }
    ]
  },
  {
    title: 'Langues',
    description: 'Apprentissage de langues - Arabe, Anglais, Français et plus.',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbdf26cecb46?w=600',
    rating: 4.8,
    reviewCount: 278,
    status: 'approved',
    offers: [
      { title: 'Conversation', description: 'Pratique de la conversation', price: 80, duration: '6 semaines', frequency: '2h/semaine', level: 'Tous niveaux' },
      { title: 'Grammaire', description: 'Grammaire et structures linguistiques', price: 90, duration: '5 semaines', frequency: '2h/semaine', level: 'Intermédiaire' },
      { title: 'Preparation examen', description: 'Préparation aux examens officiels (TOEFL, DALF, etc.)', price: 150, duration: '8 semaines', frequency: '3h/semaine', level: 'Avancé' },
      { title: 'Echange', description: 'DIALECT ARABE ANGLAIS FRANCAIS', price: 50, duration: '6 semaines', frequency: '1h/semaine', level: 'Tous niveaux' }
    ]
  },
  {
    title: 'Jeux stratégiques',
    description: 'Échecs, jeux de stratégie et coaching - Développez votre esprit stratégique.',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=600',
    rating: 4.9,
    reviewCount: 189,
    status: 'approved',
    offers: [
      { title: 'Initiation', description: 'Initiation aux jeux stratégiques (Échecs, Go, etc.)', price: 80, duration: '4 semaines', frequency: '2h/semaine', level: 'Débutant' },
      { title: 'Tournoi', description: 'Préparation aux tournois', price: 120, duration: '6 semaines', frequency: '3h/semaine', level: 'Intermédiaire' },
      { title: 'Coaching', description: 'Coaching personnalisé', price: 200, duration: '8 semaines', frequency: '2h/semaine', level: 'Avancé' },
      { title: 'Analyse de partie', description: 'Analyse et stratégies avancées', price: 150, duration: '5 semaines', frequency: '2h/semaine', level: 'Expert' }
    ]
  },
  {
    title: 'Sport / Fitness',
    description: 'Entraînement sportif et fitness - Transformez votre corps et esprit.',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    rating: 5.0,
    reviewCount: 312,
    status: 'approved',
    offers: [
      { title: 'Coaching personnalisé', description: 'Entraînement adapté à vos objectifs', price: 250, duration: '8 semaines', frequency: '3h/semaine', level: 'Tous niveaux' },
      { title: 'Plan d\'entraînement', description: 'Création de plans d\'entraînement sur mesure', price: 100, duration: '4 semaines', frequency: '1h/semaine', level: 'Intermédiaire' },
      { title: 'Bootcamp', description: 'Bootcamp intensif de fitness en groupe', price: 150, duration: '6 semaines', frequency: '4h/semaine', level: 'Avancé' }
    ]
  },
  {
    title: 'Crochet',
    description: 'Art du crochet et travaux manuels - Créez de magnifiques projets.',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1578926078328-123456789012?w=600',
    rating: 4.8,
    reviewCount: 143,
    status: 'approved',
    offers: [
      { title: 'Cours de base', description: 'Les bases du crochet (points, matériel)', price: 70, duration: '4 semaines', frequency: '2h/semaine', level: 'Débutant' },
      { title: 'Apprentissage en groupe', description: 'Apprentissage en groupe convivial', price: 50, duration: '6 semaines', frequency: '2h/semaine', level: 'Tous niveaux' },
      { title: 'Atelier', description: 'Ateliers créatifs et confection de projets', price: 90, duration: '5 semaines', frequency: '3h/semaine', level: 'Intermédiaire' },
      { title: 'Cours accéléré', description: 'Cours intensif et accéléré pour projets spécifiques', price: 150, duration: '3 semaines', frequency: '5h/semaine', level: 'Avancé' }
    ]
  }
];

export default function Seed() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<{message: string, type: 'info' | 'success' | 'error'}[]>([]);

  const handleSeed = async () => {
    if (!user) {
      alert("Vous devez être connecté (de préférence en tant qu'admin/formateur) pour lancer l'injection.");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir injecter tous ces talents et offres dans Firestore ? (Cela créera de nombreuses entrées)")) {
      return;
    }

    setLoading(true);
    setLogs([{ message: '🚀 Démarrage du script...', type: 'info' }]);

    try {
      for (const talent of talentsData) {
        const { offers, ...talentBaseData } = talent;
        
        // Add talent to 'talents' collection
        const talentRef = await addDoc(collection(db, 'talents'), {
          ...talentBaseData,
          skills: ['Enseignement', talent.title],
          trainerId: user.uid,
          trainerName: user.displayName || user.email || 'Admin Trainer',
          price: offers[0]?.price || 100, // default base price based on first offer
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        setLogs(prev => [...prev, { message: `✅ Talent ajouté: ${talent.title}`, type: 'success' }]);

        // Add offers to subcollection
        for (const offer of offers) {
          await addDoc(collection(db, 'talents', talentRef.id, 'offers'), {
            ...offer,
            createdAt: new Date().toISOString()
          });
          setLogs(prev => [...prev, { message: `  ↳ Offre ajoutée: ${offer.title}`, type: 'info' }]);
        }
      }
      setLogs(prev => [...prev, { message: '🎉 Injection terminée avec succès !', type: 'success' }]);
    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, { message: `❌ Erreur critique: ${err.message}`, type: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Script Firebase</h1>
            <p className="text-gray-500 mt-1">Insérer massivement les talents de formation et leurs offres en un clic.</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl mb-8">
          <h2 className="font-bold text-yellow-800 mb-2">Attention</h2>
          <p className="text-sm text-yellow-700">
            Ce script ajoutera <strong>{talentsData.length} nouveaux Talents</strong> ainsi que l'ensemble de leurs Offres (tarifs, durées) à Firestore avec comme auteur votre compte formateur actuel.
            Il est conseillé de ne l'exécuter qu'une seule fois.
          </p>
        </div>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Tâche en cours...
            </>
          ) : (
            'Lancer le Seeding'
          )}
        </button>

        {logs.length > 0 && (
          <div className="mt-8 bg-gray-900 rounded-2xl p-6 font-mono text-sm overflow-hidden border border-gray-800">
            <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
              <span className="text-gray-300 font-bold tracking-wider uppercase text-xs">Console Output</span>
            </div>
            <div className="h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {logs.map((log, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`py-1 ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    'text-blue-300'
                  }`}
                >
                  {log.message}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
