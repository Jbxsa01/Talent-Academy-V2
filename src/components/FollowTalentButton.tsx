import React, { useEffect, useState } from 'react';
import { collection, query, where, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

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
        const followId = `${user.uid}_${talentId}`;
        const followDoc = await getDoc(doc(db, 'follows', followId));
        setIsFollowing(followDoc.exists());
      } catch (error: any) {
        setIsFollowing(false);
      }
    };

    checkFollow();
  }, [user, talentId]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Veuillez vous connecter d\'abord');
      return;
    }

    setLoading(true);
    const followId = `${user.uid}_${talentId}`;
    const followRef = doc(db, 'follows', followId);

    try {
      if (isFollowing) {
        await deleteDoc(followRef);
        setIsFollowing(false);
      } else {
        await setDoc(followRef, {
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
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border ${
        isFollowing
          ? 'bg-primary text-white border-primary shadow-sm'
          : 'bg-white text-primary border-primary/20 hover:border-primary hover:bg-primary/5'
      }`}
      title={isFollowing ? 'Ne plus suivre' : 'Suivre ce talent'}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isFollowing ? (
        <UserCheck className={`${iconSizes[size]}`} />
      ) : (
        <UserPlus className={`${iconSizes[size]}`} />
      )}
      {showLabel && (
        <span className={`${size === 'lg' ? 'text-sm' : 'text-[9px]'} font-bold`}>
          {isFollowing ? 'Suivi' : 'Suivre'}
        </span>
      )}
    </button>
  );
};

export default FollowTalentButton;
