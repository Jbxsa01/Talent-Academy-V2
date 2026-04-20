import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

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

const sampleTalents = [
  {
    title: 'Master UI Design Marocaine',
    description: 'Design moderne avec influences Zellige et architecture marocaine',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
    trainerId: 'trainer-1',
    trainerName: 'Anas El Alami',
    rating: 5.0,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Introduction au Design Marocain', description: 'Découvrez les bases', duration: '4 semaines', price: 120 },
      { title: 'Design Avancé Zellige', description: 'Techniques avancées', duration: '8 semaines', price: 120 }
    ]
  },
  {
    title: 'Full Stack Development with React',
    description: 'Apprenez React, Node.js et MongoDB from scratch',
    category: 'Coding',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500',
    trainerId: 'trainer-2',
    trainerName: 'Mehdi Choukri',
    rating: 5.0,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'React Fundamentals', description: 'Concepts de base React', duration: '4 semaines', price: 120 },
      { title: 'Building Real Projects', description: 'Projets pratiques', duration: '6 semaines', price: 120 }
    ]
  },
  {
    title: 'Digital Marketing Essentials',
    description: 'Stratégies marketing numériques modernes',
    category: 'Marketing',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-aeb19be489c7?w=500',
    trainerId: 'trainer-3',
    trainerName: 'Fatima Bouchaara',
    rating: 4.8,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Social Media Strategy', description: 'Maîtrisez les réseaux sociaux', duration: '3 semaines', price: 120 },
      { title: 'SEO & Content Marketing', description: 'Optimisation et contenu', duration: '5 semaines', price: 120 }
    ]
  },
  {
    title: 'Photography & Videography',
    description: 'Techniques professionnelles de photo et vidéo',
    category: 'Photo',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
    trainerId: 'trainer-4',
    trainerName: 'Hassan Bennani',
    rating: 4.9,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Photography Basics', description: 'Principes fondamentaux', duration: '4 semaines', price: 120 },
      { title: 'Video Production', description: 'Production vidéo professionnelle', duration: '6 semaines', price: 120 }
    ]
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Updating all existing offer prices to 120 DH...');
    const talentsSnap = await getDocs(collection(db, 'talents'));
    let updatedCount = 0;

    for (const talentDoc of talentsSnap.docs) {
      const offersSnap = await getDocs(collection(db, 'talents', talentDoc.id, 'offers'));
      for (const offerDoc of offersSnap.docs) {
        await updateDoc(doc(db, 'talents', talentDoc.id, 'offers', offerDoc.id), { price: 120 });
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} offers to 120 DH`);

    // Add sample talents with offers at 120 DH
    console.log('📚 Adding sample talents...');
    let addedCount = 0;

    for (const talent of sampleTalents) {
      const { offers, ...talentData } = talent;
      
      const talentRef = await addDoc(collection(db, 'talents'), {
        ...talentData,
        createdAt: new Date().toISOString(),
      });

      for (const offer of offers) {
        await addDoc(collection(db, 'talents', talentRef.id, 'offers'), {
          ...offer,
          createdAt: new Date().toISOString(),
        });
      }
      addedCount++;
    }

    console.log(`✅ Added ${addedCount} talents with ${sampleTalents.length * 2} offers`);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      message: `✅ Successfully updated ${updatedCount} existing offers and added ${addedCount} new talents, all with 120 DH fixed price`,
      stats: {
        updatedOffers: updatedCount,
        addedTalents: addedCount,
        newOffers: sampleTalents.length * 2
      }
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}
