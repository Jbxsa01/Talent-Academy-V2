import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { LogOut, User as UserIcon, MessageSquare, Shield, GraduationCap, Plus } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { APP_LOGO } from '../lib/constants';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const anyUnread = snap.docs.some(d => d.data().unread?.[user.uid] === true);
      setHasUnread(anyUnread);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Fixed Background Container - Full Width */}
      <div className="fixed top-0 left-0 right-0 h-20 z-40 bg-white border-b border-border-subtle" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full">
        <div className="px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link to="/" className="flex items-center group">
            <div className="h-12 w-auto transition-transform group-hover:scale-105">
              <img src={APP_LOGO} alt="HESTIM Talent Academy" className="h-full w-auto object-contain" />
            </div>
          </Link>

          <div className="flex items-center space-x-8 text-sm font-bold">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-8">
                  <Link to="/discover" className="text-text-muted hover:text-primary transition-colors flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Découvrir</span>
                  </Link>
                  <Link to="/dashboard" className="text-text-muted hover:text-primary transition-colors flex items-center space-x-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Mon Bureau</span>
                  </Link>
                  <Link to="/messaging" className="text-text-muted hover:text-primary transition-colors flex items-center space-x-2 relative">
                    <div className="relative">
                      <MessageSquare className="w-4 h-4" />
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white shadow-sm" />
                      )}
                    </div>
                    <span>Messagerie</span>
                  </Link>
                </div>

                {/* Create Talent Button for Trainers */}
                <Link 
                  to="/create-talent"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Créer Talent</span>
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="text-text-muted hover:text-accent transition-colors flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-4 pl-4 border-l border-border-subtle">
                  <div className="flex flex-col items-end hidden sm:flex">
                    {user.email?.endsWith('@HESTIM.ma') && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        HESTIM Vérifié
                      </span>
                    )}
                  </div>
                  
                  <div className="relative group">
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-lg border-2 border-primary group-hover:border-accent transition-all cursor-pointer"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-12 right-0 w-56 bg-white border border-border-subtle rounded-xl shadow-xl p-3 hidden group-hover:block transition-all transform origin-top-right scale-95 group-hover:scale-100 duration-200 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-border-subtle mb-2">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Connecté en tant que</p>
                        <p className="text-sm font-bold text-text-main mt-1 truncate">{user.displayName || user.email}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <Link
                        to="/profile"
                        className="w-full text-left px-4 py-2.5 text-text-main hover:bg-primary/5 hover:text-primary rounded-lg transition-all flex items-center space-x-3 font-medium text-sm"
                      >
                        <UserIcon className="w-4 h-4 flex-shrink-0" />
                        <span>Mon Profil</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center space-x-3 font-medium text-sm"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/discover" className="text-text-muted hover:text-primary transition-colors font-bold hidden sm:block">
                  Découvrir
                </Link>
                <Link
                  to="/login"
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                >
                  Accès Portail
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
