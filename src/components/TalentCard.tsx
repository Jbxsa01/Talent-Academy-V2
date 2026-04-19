import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Radio } from 'lucide-react';
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
    isActive?: boolean;
  };
}

const TalentCard: React.FC<TalentProps> = ({ talent }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border flex flex-col h-full ${
        talent.isActive ? 'border-red-300 shadow-red-100/50' : 'border-border-subtle'
      }`}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={talent.imageUrl || `https://picsum.photos/seed/${talent.id}/400/300`}
          alt={talent.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Live Badge */}
        {talent.isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse shadow-lg shadow-red-500/50 border border-red-400">
            <Radio className="w-3 h-3" />
            <span>Live</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/10">
            {talent.category}
          </span>
        </div>

        {/* Live Gradient Overlay */}
        {talent.isActive && (
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 to-transparent pointer-events-none" />
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-lg font-black text-text-main group-hover:text-primary transition-colors line-clamp-1 leading-tight tracking-tight flex-1">{talent.title}</h3>
          <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex-shrink-0">
            <Star className="w-3 h-3 fill-warning text-warning" />
            <span className="text-[10px] font-black text-warning leading-none">{talent.rating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>
        
        <p className="text-text-muted text-xs mb-4 line-clamp-2 leading-relaxed font-medium">
          {talent.description}
        </p>

        {talent.skills && talent.skills.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {talent.skills.map((skill, idx) => (
              <span key={idx} className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                [{skill}]
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between gap-3">
          <Link
            to={`/trainer/${talent.trainerId}`}
            className="flex items-center space-x-2 min-w-0 hover:opacity-80 transition-opacity group"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[8px] uppercase tracking-tighter flex-shrink-0 text-white ${
              talent.isActive ? 'bg-red-500 animate-pulse group-hover:scale-110' : 'bg-accent/10 text-accent group-hover:bg-accent/20'
            } transition-all`}>
              {talent.trainerName?.split(' ').map(n => n[0]).join('') || 'HT'}
            </div>
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider truncate group-hover:text-primary">{talent.trainerName || 'Hestim Mentor'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <FollowTalentButton talentId={talent.id} size="md" showLabel={false} />
            <Link
              to={`/talent/${talent.id}`}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all flex-shrink-0 italic ${
                talent.isActive 
                  ? 'text-red-500 hover:text-red-700 font-extrabold' 
                  : 'text-primary hover:text-accent'
              }`}
            >
              {talent.isActive ? 'Rejoindre ➜' : 'Lancer →'}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TalentCard;
