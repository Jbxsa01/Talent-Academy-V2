import React, { useEffect, useState } from 'react';
import { collection, query, where, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';

interface FollowButtonProps {
  talentId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const FollowTalentButton: React.FC<FollowButtonProps> = ({ talentId, size = 'md', showLabel = true }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkFollow = async () => {
      try {
        const followQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', user.uid),
          where('followingId', '==', talentId),
          where('followingType', '==', 'talent')
        );
        const followSnap = await getDocs(followQuery);
        setIsFollowing(followSnap.docs.length > 0);
      } catch (error: any) {
        // Handle gracefully - composite indexes needed in Firebase
        const isPermissionError = error?.code === 'permission-denied' || error?.message?.includes('permission');
        if (!isPermissionError) {
          console.error('Error checking follow:', error);
        }
        // Silently set to false - will work once composite index is created
        setIsFollowing(false);
      }
    };

    checkFollow();
  }, [user, talentId]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Veuillez vous connecter d\'abord');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        const followQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', user.uid),
          where('followingId', '==', talentId),
          where('followingType', '==', 'talent')
        );
        const followSnap = await getDocs(followQuery);
        for (const doc of followSnap.docs) {
          await deleteDoc(doc.ref);
        }
        setIsFollowing(false);
      } else {
        await addDoc(collection(db, 'follows'), {
          followerId: user.uid,
          followingId: talentId,
          followingType: 'talent',
          createdAt: new Date().toISOString(),
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
        isFollowing
          ? 'bg-red-50 hover:bg-red-100 text-red-500'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
      }`}
      title={isFollowing ? 'Ne plus suivre' : 'Suivre ce talent'}
    >
      <Heart className={`${iconSizes[size]} ${isFollowing ? 'fill-current' : ''}`} />
      {showLabel && size === 'lg' && (
        <span className="text-xs font-bold">{isFollowing ? 'Suivi' : 'Suivre'}</span>
      )}
    </button>
  );
};

export default FollowTalentButton;
