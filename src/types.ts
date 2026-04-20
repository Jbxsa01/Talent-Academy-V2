export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  roles: ('learner' | 'trainer' | 'admin')[];
  createdAt: string;
  bio?: string;
  followers?: number;
  following?: number;
}

export interface Talent {
  id: string;
  trainerId: string;
  trainerName: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  followers?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Offer {
  id: string;
  talentId: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  followingType: 'user' | 'talent';
  createdAt: string;
}
