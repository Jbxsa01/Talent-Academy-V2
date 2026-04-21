import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import FollowTalentButton from './FollowTalentButton';

interface TalentProps {
  talent: {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    trainerId: string;
    trainerName?: string;
    skills?: string[];
  };
}

const TalentCard: React.FC<TalentProps> = ({ talent }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border flex flex-col h-full border-border-subtle`}
    >
      <div className="relative h-32 overflow-hidden bg-gray-100">
        <img
          src={talent.imageUrl || `https://picsum.photos/seed/${talent.id}/400/300`}
          alt={talent.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider text-primary border border-primary/10">
            {talent.category}
          </span>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2 gap-1">
          <h3 className="text-sm font-black text-text-main group-hover:text-primary transition-colors line-clamp-1 leading-tight tracking-tight flex-1">{talent.title}</h3>
          <div className="flex items-center space-x-1 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100 flex-shrink-0">
            <Star className="w-2.5 h-2.5 fill-warning text-warning" />
            <span className="text-[9px] font-black text-warning leading-none">{talent.rating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>
        
        <p className="text-text-muted text-[10px] mb-2 line-clamp-2 leading-snug font-medium opacity-80">
          {talent.description}
        </p>

        {talent.skills && talent.skills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {talent.skills.slice(0, 2).map((skill, idx) => (
              <span key={idx} className="text-[8px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/10">
                {skill}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-auto pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
          <Link
            to={`/trainer/${talent.trainerId}`}
            className="flex items-center space-x-1 min-w-0 hover:opacity-80 transition-opacity group"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[7px] uppercase tracking-tighter flex-shrink-0 text-white bg-accent/10 text-accent group-hover:bg-accent/20 transition-all overflow-hidden`}>
              {talent.trainerPhotoURL ? (
                <img 
                  src={talent.trainerPhotoURL} 
                  alt={talent.trainerName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerText = talent.trainerName?.split(' ').map(n => n[0]).join('') || 'HT';
                  }}
                />
              ) : (
                talent.trainerName?.split(' ').map(n => n[0]).join('') || 'HT'
              )}
            </div>
            <span className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider truncate group-hover:text-primary">{talent.trainerName || 'Hestim Mentor'}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <FollowTalentButton talentId={talent.id} size="sm" showLabel={false} />
            <Link
              to={`/talent/${talent.id}`}
              className={`text-[9px] font-black uppercase tracking-wider transition-all flex-shrink-0 italic text-primary hover:text-accent`}
            >
              Lancer →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TalentCard;
