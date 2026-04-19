import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, LayoutGrid, GraduationCap, TrendingUp, Award, Users, Clock, Eye, MessageSquare, Star, Edit2, Trash2, X, Upload, Loader2, Settings, LogOut, Download, Filter, Search, CheckCircle2, Camera, Radio, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'training' | 'active-sessions'>('overview');
  const [learningTalents, setLearningTalents] = useState<any[]>([]);
  const [trainingTalents, setTrainingTalents] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ title: '', category: 'Coding', description: '', imageUrl: '', skills: '', price: '', isActive: false });
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Coding', 'Design', 'Cuisine', 'Darija', 'Marketing', 'Photo', 'Musique', 'Soft Skills', 'Business', 'Langue', 'Art', 'Fitness', 'Autre...'];

  const handleImageError = (talentId: string) => {
    setFailedImages(prev => new Set([...prev, talentId]));
  };

  const hasFetchedRef = useRef(false);

  const fetchData = async () => {
    if (!user) return;

    try {
      const qLearning = query(collection(db, 'transactions'), where('learnerId', '==', user.uid));
      const snapLearning = await getDocs(qLearning);
      setLearningTalents(snapLearning.docs.map(d => ({ id: d.id, ...d.data() })));

      const qTraining = query(collection(db, 'talents'), where('trainerId', '==', user.uid));
      const snapTraining = await getDocs(qTraining);
      setTrainingTalents(snapTraining.docs.map(d => ({ id: d.id, ...d.data() })));

      // Get only active sessions (isActive = true)
      const activeSessionsList = snapTraining.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(t => t.isActive === true);
      setActiveSessions(activeSessionsList);
    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    if (!user || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'talents', isEditing.id), {
          ...formData,
          skills: formData.skills.split(',').map(s => s.trim())
        });
      } else {
        const talentDoc = {
          ...formData,
          skills: formData.skills.split(',').map(s => s.trim()),
          trainerId: user.uid,
          trainerName: user.displayName,
          rating: 5,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        await addDoc(collection(db, 'talents'), talentDoc);
        
        if (!profile.roles.includes('trainer')) {
          await updateDoc(doc(db, 'users', user.uid), {
            roles: [...profile.roles, 'trainer']
          });
        }
      }

      setIsCreating(false);
      setIsEditing(null);
      setCustomCategory('');
      setFormData({ title: '', category: 'Coding', description: '', imageUrl: '', skills: '', price: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (talentId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce talent ?')) return;
    try {
      await deleteDoc(doc(db, 'talents', talentId));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSessionActive = async (talentId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'talents', talentId), { 
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      fetchData();
    } catch (err) {
      console.error('Error toggling session:', err);
      alert('Erreur lors de la modification de la session');
    }
  };

  const openEdit = (talent: any) => {
    setIsEditing(talent);
    setCustomCategory('');
    setFormData({
      title: talent.title,
      category: talent.category,
      description: talent.description,
      imageUrl: talent.imageUrl,
      skills: talent.skills?.join(', ') || '',
      price: talent.price || '',
      isActive: talent.isActive || false
    });
    setIsCreating(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert file to Data URL (works for all images, stored locally)
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        console.log('✅ Image converted to Data URL');
        setIsUploading(false);
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Erreur:", err);
      alert('Erreur lecture image. Entrez une URL directement.');
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const stats = [
    { label: 'Talents Publiés', value: trainingTalents.length, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Revenus Nets', value: `${trainingTalents.length * 120} DHS`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Parcours Actifs', value: learningTalents.length, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Note Moyenne', value: '4.8', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' }
  ];

  const filteredTraining = trainingTalents.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-20 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Tableau de Bord</h1>
            <p className="text-sm text-gray-500 mt-1">Bienvenue, {user?.displayName || 'utilisateur'}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/profile')} className="p-3 hover:bg-gray-100 rounded-2xl transition-all" title="Paramètres">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={handleLogout} className="p-3 hover:bg-red-50 rounded-2xl transition-all" title="Déconnexion">
              <LogOut className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex border-t border-gray-200 overflow-x-auto">
          {[
            { key: 'overview', label: 'Aperçu', icon: LayoutGrid },
            { key: 'training', label: 'Mes Talents', icon: Award },
            { key: 'active-sessions', label: 'Sessions Actives', icon: Radio, badge: activeSessions.length },
            { key: 'learning', label: 'Mes Parcours', icon: GraduationCap }
          ].map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-6 py-4 font-bold text-sm uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="ml-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

      {/* Overview */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[24px] p-8 border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all group"
                >
                  <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-10">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Actions Rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => { setIsEditing(null); setCustomCategory(''); setIsCreating(true); setFormData({ title: '', category: 'Coding', description: '', imageUrl: '', skills: '', price: '' }); }}
                className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl hover:border-primary/50 hover:shadow-xl transition-all group text-left"
              >
                <Plus className="w-8 h-8 text-primary mb-4 group-hover:scale-125 transition-transform" />
                <h3 className="font-black text-gray-900 mb-2">Publier un Talent</h3>
                <p className="text-sm text-gray-600">Partagez votre expertise avec la communauté</p>
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all group text-left"
              >
                <Search className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-125 transition-transform" />
                <h3 className="font-black text-gray-900 mb-2">Découvrir des Talents</h3>
                <p className="text-sm text-gray-600">Explorez plus de 500+ talents certifiés</p>
              </button>

              <button
                onClick={() => window.location.href = '/messaging'}
                className="p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl hover:border-purple-400 hover:shadow-xl transition-all group text-left"
              >
                <MessageSquare className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-125 transition-transform" />
                <h3 className="font-black text-gray-900 mb-2">Messagerie</h3>
                <p className="text-sm text-gray-600">Communiquez avec vos mentors</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-10">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Activité Récente</h2>
            <div className="space-y-4">
              {trainingTalents.slice(0, 3).map((talent, i) => (
                <div key={i} className="flex items-center gap-6 p-4 hover:bg-gray-50 rounded-xl transition-all group">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{talent.title}</p>
                    <p className="text-sm text-gray-500">Publié le {new Date(talent.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                    talent.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {talent.status === 'approved' ? 'En ligne' : 'En vérification'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mes Talents */}
      {activeTab === 'training' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un talent..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
              />
            </div>
            <button
              onClick={() => { setIsEditing(null); setCustomCategory(''); setIsCreating(true); setFormData({ title: '', category: 'Coding', description: '', imageUrl: '', skills: '', price: '' }); }}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Nouveau Talent
            </button>
          </div>

          {/* Talents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTraining.length > 0 ? (
              filteredTraining.map(talent => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[24px] overflow-hidden border border-gray-200 hover:border-primary/30 hover:shadow-2xl transition-all group flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    {!failedImages.has(talent.id) && talent.imageUrl ? (
                      <img
                        src={talent.imageUrl}
                        alt={talent.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(talent.id)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                        <Award className="w-12 h-12" />
                        <span className="text-xs font-bold">Pas d'image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(talent)}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform shadow-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(talent.id)}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 hover:scale-110 transition-transform shadow-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-white rounded-full text-primary font-bold text-xs uppercase tracking-wider shadow-lg">
                        {talent.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <h3 className="font-black text-gray-900 text-lg line-clamp-2 flex-1">{talent.title}</h3>
                      {talent.price && (
                        <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg whitespace-nowrap">
                          <span className="font-black text-primary">{talent.price} DHS</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Skills */}
                    {talent.skills && talent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {talent.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-blue-700">
                            [{skill}]
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-1">{talent.description}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < talent.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({talent.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {talent.isActive && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            <Radio className="w-3 h-3" />
                            Live
                          </span>
                        )}
                        <button
                          onClick={() => toggleSessionActive(talent.id, talent.isActive || false)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            talent.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {talent.isActive ? 'Actif' : 'Inactif'}
                        </button>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          talent.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {talent.status === 'approved' ? 'En ligne' : 'Vérification'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                <p className="font-bold mb-4">Aucun talent trouvé</p>
                <button
                  onClick={() => { setIsEditing(null); setCustomCategory(''); setIsCreating(true); setFormData({ title: '', category: 'Coding', description: '', imageUrl: '', skills: '', price: '' }); }}
                  className="text-primary font-bold hover:underline"
                >
                  Publier votre premier talent
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Sessions Actives */}
      {activeTab === 'active-sessions' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Active Sessions Grid */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              Sessions En Cours ({activeSessions.length})
            </h2>
            
            {activeSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSessions.map((session, idx) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-3xl border-2 border-red-200 shadow-lg shadow-red-100/30 relative overflow-hidden group"
                  >
                    {/* Live Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                      <Radio className="w-3 h-3" />
                      Live
                    </div>

                    {/* Image */}
                    <img
                      src={session.imageUrl}
                      alt={session.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-40 object-cover rounded-2xl mb-6 group-hover:scale-105 transition-transform"
                      onError={() => handleImageError(session.id)}
                    />

                    {/* Content */}
                    <h3 className="text-lg font-black text-gray-900 mb-3 italic line-clamp-2">{session.title}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <LayoutGrid className="w-4 h-4 text-primary" />
                        <span className="font-bold">{session.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-bold">Mentor: {session.trainerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{session.rating || 5}.0 / 5.0</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-6 line-clamp-2">{session.description}</p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleSessionActive(session.id, true)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Arrêter
                      </button>
                      <button
                        onClick={() => navigate(`/talent/${session.id}`)}
                        className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-900 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                      >
                        Voir
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-300 text-center">
                <Radio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold text-lg mb-4">Aucune session active</p>
                <p className="text-gray-400 text-sm mb-6">Activez vos talents pour les rendre visibles aux apprenants</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Mes Parcours */}
      {activeTab === 'learning' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {learningTalents.length > 0 ? (
            <div className="space-y-4">
              {learningTalents.map(talent => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-green-600 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-900 text-lg mb-2">Accès Actif #{talent.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-600">Parcours de formation actif et accessible</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = `/messaging/${talent.id}`}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 group-hover:shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Contacter
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-bold text-gray-900 mb-2">Aucun parcours actif</p>
              <p className="text-sm text-gray-600 mb-6">Explorez les talents et commencez votre formation</p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all inline-block"
              >
                Découvrir les Talents
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>

    {/* Create/Edit Modal */}
    <AnimatePresence>
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {isEditing ? 'Modifier Talent' : 'Publier un Talent'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">HESTIM Academy</p>
              </div>
              <button
                onClick={() => { setIsCreating(false); setCustomCategory(''); }}
                className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Titre</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Master React en 4 Sessions"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Catégorie</label>
                  <select
                    value={formData.category === customCategory && customCategory ? 'Autre...' : formData.category}
                    onChange={e => {
                      if (e.target.value === 'Autre...') {
                        setFormData({...formData, category: ''});
                        setCustomCategory('');
                      } else {
                        setFormData({...formData, category: e.target.value});
                        setCustomCategory('');
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none transition-all"
                  >
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Prix (DHS)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="Ex: 500"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {formData.category === '' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Votre Catégorie</label>
                  <input
                    required
                    value={customCategory}
                    onChange={e => {
                      setCustomCategory(e.target.value);
                      setFormData({...formData, category: e.target.value});
                    }}
                    placeholder="Ex: Photography"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Image</label>
                <div className="flex gap-2">
                  <input
                    required
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="URL ou cliquez Uploader"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none min-h-[100px]"
                  placeholder="Décrivez votre talent..."
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">Compétences</label>
                <input
                  value={formData.skills}
                  onChange={e => setFormData({...formData, skills: e.target.value})}
                  placeholder="React, JavaScript, TypeScript"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Active Session Toggle */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-primary"
                />
                <label htmlFor="isActive" className="flex-1 cursor-pointer">
                  <p className="font-black text-gray-900 uppercase text-sm tracking-wider">Activer cette session</p>
                  <p className="text-xs text-gray-600 mt-1">La rendre visible et accessible aux apprenants en ce moment</p>
                </label>
                {formData.isActive && (
                  <div className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">
                    <Radio className="w-3 h-3" />
                    Live
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setCustomCategory(''); }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  {isEditing ? 'Mettre à jour' : 'Publier'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </div>
  );
};

export default Dashboard;
