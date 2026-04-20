import React, { useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Database, Check } from 'lucide-react';
import { motion } from 'motion/react';

const talentsData = [
  {
    title: 'Musique / Chant',
    description: 'Cours de musique et de chant professionnel avec des techniques reconnues mondialement.',
    category: 'Musique / Chant',
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
    category: 'Arts visuels',
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
    category: 'Programmation',
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
    category: 'Photographie',
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
    category: 'Langues',
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
    category: 'Jeux stratégiques',
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
    category: 'Sport / Fitness',
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
    category: 'Crochet',
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

const generateRandomTalents = (count: number) => {
  const categoryData = {
    'Musique / Chant': {
      titles: ['Guitare Acoustique', 'Production Musicale', 'Création de Podcast', 'Chant Chorale', 'Solfège Pratique'],
      images: [
        'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=600',
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600',
        'https://images.unsplash.com/photo-1525201548942-d8732f51c7f1?w=600',
        'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600'
      ]
    },
    'Arts visuels': {
      titles: ['Masterclass UI/UX', 'Design 3D Blender', 'Dessin Manga', "Peinture à l'huile", "Design d'intérieur"],
      images: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
        'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600'
      ]
    },
    'Programmation': {
      titles: ['Fullstack React Node', 'Data Science avec Python', 'Cybersécurité base', 'Développement Unity', 'Bases de données SQL', 'Crypto & Blockchain'],
      images: [
        'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600'
      ]
    },
    'Photographie': {
      titles: ['Montage Photo', 'Montage Vidéo Premiere Pro', 'Photographie de Portrait', 'Cadrage Cinématographique'],
      images: [
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
        'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600',
        'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600'
      ]
    },
    'Langues': {
      titles: ['Business Anglais', 'Préparation TOEFL', 'Conversation Espagnole', 'Japonais Débutant', 'Français des Affaires'],
      images: [
        'https://images.unsplash.com/photo-1543269865-cbdf26cecb46?w=600',
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
        'https://images.unsplash.com/photo-1455390582262-044cdead27d8?w=600'
      ]
    },
    'Jeux stratégiques': {
      titles: ['Échecs pour Débutants', 'Stratégie Jeu de Go', 'Analyse de Tactiques Poker', 'E-sport League of Legends'],
      images: [
        'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=600',
        'https://images.unsplash.com/photo-1580541832626-2a7131ee247c?w=600',
        'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=600',
        'https://images.unsplash.com/photo-1553481187-be93c21495a9?w=600'
      ]
    },
    'Sport / Fitness': {
      titles: ['Yoga & Bien-être', 'Danse Contemporaine', 'Coaching Fitness Maison', 'Préparation Marathon'],
      images: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
        'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600'
      ]
    },
    'Crochet': {
      titles: ['Crochet Amigurumi', 'Tricot Pull Hiver', 'Macramé Décoratif', 'Broderie Avancée', 'Art Floral'],
      images: [
        'https://images.unsplash.com/photo-1578926078328-123456789012?w=600',
        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600',
        'https://images.unsplash.com/photo-1627844642677-8b32e60408ea?w=600',
        'https://images.unsplash.com/photo-1584877395420-14c1186e246a?w=600'
      ]
    }
  };

  const categoriesKeys = Object.keys(categoryData) as Array<keyof typeof categoryData>;
  const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

  const generated = [];
  for(let i=0; i<count; i++) {
    const category = categoriesKeys[Math.floor(Math.random() * categoriesKeys.length)];
    const catData = categoryData[category];
    const baseTitle = catData.titles[Math.floor(Math.random() * catData.titles.length)];
    const title = baseTitle + ` - Édition ${Math.floor(Math.random() * 5) + 1}`;
    const imageUrl = catData.images[Math.floor(Math.random() * catData.images.length)];

    generated.push({
      title,
      description: `Formation complète et pratique sur : ${title}. Rejoignez cette cohorte pour accélérer votre apprentissage, maîtriser les fondamentaux et exceller dans votre domaine.`,
      category: category,
      imageUrl: title.includes('Tricot Pull Hiver') ? '/img/images (4).jpg' : imageUrl,
      videoUrl: (title.includes('Data') || title.includes('Bases de données')) ? '/img/WhatsApp Video 2026-04-20 at 23.46.53.mp4' : null,
      rating: Number((Math.random() * (5 - 4.0) + 4.0).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 500) + 10,
      status: 'approved',
      offers: talentsData.find(t => t.category === category)?.offers || []
    });
  }
  return generated;
};

// Combiner les 8 talents fixes originaux avec 42 talents générés pour faire 50 au total
const ALL_TALENTS = [...talentsData, ...generateRandomTalents(42)].map(talent => ({
  ...talent,
  offers: talent.offers.map(offer => ({ ...offer, price: 120 }))
}));

export default function Seed() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<{message: string, type: 'info' | 'success' | 'error'}[]>([]);

  const handleSeed = async () => {
    if (!user) {
      alert("Vous devez être connecté (de préférence en tant qu'admin/formateur) pour lancer l'injection.");
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir injecter ${ALL_TALENTS.length} talents dans Firestore ? (Cela créera de nombreuses entrées)`)) {
      return;
    }

    setLoading(true);
    setLogs([{ message: '🚀 Démarrage du script...', type: 'info' }]);

    try {
      for (const talent of ALL_TALENTS) {
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
            Ce script ajoutera <strong>{ALL_TALENTS.length} nouveaux Talents</strong> ainsi que l'ensemble de leurs Offres (tarifs, durées) à Firestore avec comme auteur votre compte formateur actuel.
            Il est conseillé de ne l'exécuter qu'une seule fois.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={async () => {
              if(!window.confirm('Voulez-vous supprimer TOUS les talents existants de Firebase?')) return;
              setLoading(true);
              try {
                const snapshot = await getDocs(collection(db, 'talents'));
                for (const docSnapshot of snapshot.docs) {
                  const offersSnap = await getDocs(collection(db, 'talents', docSnapshot.id, 'offers'));
                  for(const offer of offersSnap.docs) {
                    await deleteDoc(doc(db, 'talents', docSnapshot.id, 'offers', offer.id));
                  }
                  await deleteDoc(doc(db, 'talents', docSnapshot.id));
                }
                setLogs([{ message: '🗑️ Base de données vidée !', type: 'success' }]);
              } catch(e: any) {
                setLogs([{ message: '❌ Erreur nettoyage: ' + e.message, type: 'error' }]);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex-1 py-4 bg-red-100 text-red-600 rounded-2xl font-black text-lg uppercase tracking-wider hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            Vider
          </button>
          
          <button
            onClick={handleSeed}
            disabled={loading}
            className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/30"
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
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const q = query(collection(db, 'talents'), where('title', '==', 'Fullstack React Node - Édition 4'));
                const snap = await getDocs(q);
                if (snap.empty) {
                  setLogs([{ message: '❌ Talent non trouvé (vérifiez le titre exact)', type: 'error' }]);
                } else {
                  for (const d of snap.docs) {
                    await updateDoc(doc(db, 'talents', d.id), {
                      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600'
                    });
                    setLogs([{ message: '✅ Image mise à jour pour: Fullstack React Node - Édition 4', type: 'success' }]);
                  }
                }
              } catch(e: any) {
                setLogs([{ message: '❌ Erreur: ' + e.message, type: 'error' }]);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
          >
            Fixer Manuellement Image "Fullstack Ed. 4"
          </button>
        </div>

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
