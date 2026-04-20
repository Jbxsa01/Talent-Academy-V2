import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = ['Design', 'Coding', 'Marketing', 'Photo', 'Musique', 'Soft Skills', 'Business', 'Crochets'];
const skills = [
  'Fundamentals', 'Intermediate', 'Advanced', 'Mastery', 'Professional',
  'Basics', 'Techniques', 'Strategies', 'Best Practices', 'Industry Insights',
  'Deep Dive', 'Practical Applications', 'Real-World Projects', 'Expert Tips', 'Certification Prep'
];

const trainers = [
  { name: 'Anas El Alami' },
  { name: 'Fatima Bouchaara' },
  { name: 'Mehdi Choukri' },
  { name: 'Hassan Bennani' },
  { name: 'Leila Mansouri' },
  { name: 'Youssef Karim' },
  { name: 'Amina Khalif' },
  { name: 'Omar Nassar' },
];

const images = [
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
  'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500',
  'https://images.unsplash.com/photo-1460925895917-aeb19be489c7?w=500',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
  'https://images.unsplash.com/photo-1517694712202-14819c9602d2?w=500',
  'https://images.unsplash.com/photo-1507238691715-25ceb3424e5f?w=500',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500',
];

function generateTalent(index: number) {
  const category = categories[index % categories.length];
  const trainer = trainers[index % trainers.length];
  const image = images[index % images.length];
  
  return {
    title: `${category} Mastery - Session ${index + 1}`,
    description: `Apprenez les techniques avancées de ${category.toLowerCase()} avec ${trainer.name}. Un cours complet couvrant tous les aspects professionnels et pratiques.`,
    category,
    imageUrl: image,
    trainerId: `trainer-${index}`,
    trainerName: trainer.name,
    rating: 4.5 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 50) + 10,
    followers: Math.floor(Math.random() * 200) + 50,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

function generateOffers(talentIndex: number): any[] {
  const offers = [];
  const skillCount = 8 + Math.floor(Math.random() * 4); // 8-12 offres par talent
  
  for (let i = 0; i < skillCount; i++) {
    const skill = skills[i % skills.length];
    const duration = [2, 3, 4, 5, 6, 8, 10, 12][Math.floor(Math.random() * 8)];
    
    offers.push({
      title: `${skill} - Level ${i + 1}`,
      description: `Master the ${skill.toLowerCase()} techniques step by step. Perfect for professionals seeking excellence.`,
      duration: `${duration} semaines`,
      price: 120,
      createdAt: new Date().toISOString(),
    });
  }
  
  return offers;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Début de l\'ajout de 50+ talents avec offres...');
    
    let talentCount = 0;
    let offerCount = 0;
    const talentLimit = 50;

    for (let t = 0; t < talentLimit; t++) {
      const talentData = generateTalent(t);
      
      const talentRef = await addDoc(collection(db, 'talents'), talentData);
      talentCount++;
      
      // Générer et ajouter les offres pour ce talent
      const offers = generateOffers(t);
      
      for (const offer of offers) {
        await addDoc(collection(db, 'talents', talentRef.id, 'offers'), offer);
        offerCount++;
      }
      
      // Log de progression tous les 10 talents
      if ((t + 1) % 10 === 0) {
        console.log(`✅ ${t + 1}/50 talents créés avec ${offerCount} offres`);
      }
    }

    console.log(`🎉 Complétion: ${talentCount} talents créés avec ${offerCount} offres!`);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      message: `✅ ${talentCount} talents créés avec succès!`,
      stats: {
        talentsAdded: talentCount,
        totalOffers: offerCount,
        averageOffersPerTalent: (offerCount / talentCount).toFixed(1)
      }
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur inconnue'
    });
  }
}
