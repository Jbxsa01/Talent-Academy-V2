import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Edit2, Save, X, Upload, Loader2, LogOut, 
  User, Mail, Phone, MapPin, Calendar, ShieldCheck, 
  Star, Briefcase, DollarSign, Camera
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Profile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    photoURL: user?.photoURL || '',
    bannerURL: profile?.bannerURL || '',
  });

  const compressImage = (dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality JPEG
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const compressed = await compressImage(dataUrl, 400, 400); // 400px for avatar
        setFormData(prev => ({ ...prev, photoURL: compressed }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Erreur:", err);
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const compressed = await compressImage(dataUrl, 1200, 400); // 1200px for banner
        setFormData(prev => ({ ...prev, bannerURL: compressed }));
        setUploadingBanner(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Erreur:", err);
      setUploadingBanner(false);
    } finally {
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        photoURL: formData.photoURL,
        bannerURL: formData.bannerURL,
        updatedAt: new Date().toISOString(),
      });

      // SYNC: Update all talents by this trainer
      const talentsQuery = query(collection(db, 'talents'), where('trainerId', '==', user.uid));
      const talentsSnap = await getDocs(talentsQuery);
      const updatePromises = talentsSnap.docs.map(tDoc => 
        updateDoc(doc(db, 'talents', tDoc.id), {
          trainerName: formData.displayName,
          trainerPhotoURL: formData.photoURL
        })
      );
      await Promise.all(updatePromises);

      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error('❌ Erreur mise à jour:', err);
      alert('Erreur lors de la mise à jour du profil');
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Header Background */}
      <div className="h-[300px] relative overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
          style={{ 
            backgroundImage: formData.bannerURL ? `url(${formData.bannerURL})` : 'none',
            filter: 'brightness(0.7)'
          }}
        />
        {!formData.bannerURL && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-900 to-slate-900 mix-blend-multiply opacity-80" />
        )}
        
        {isEditing && (
          <button 
            onClick={() => bannerInputRef.current?.click()}
            className="absolute inset-0 m-auto w-fit h-fit px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-3 text-white font-bold hover:bg-white/20 transition-all z-10"
          >
            {uploadingBanner ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            Changer la bannière
          </button>
        )}
        <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />

        <div className="absolute top-8 left-8 flex items-center justify-between w-[calc(100%-64px)] z-20">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 backdrop-blur-md text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-30 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="relative group">
                <div className="w-40 h-40 rounded-[40px] border-8 border-white shadow-2xl overflow-hidden bg-slate-50 ring-1 ring-slate-100">
                    {formData.photoURL ? (
                      <img 
                        src={formData.photoURL} 
                        alt={formData.displayName} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl font-black text-slate-200 uppercase">${formData.displayName?.split(' ').map((n: string) => n[0]).join('') || '?'}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-200 uppercase">
                        {formData.displayName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                    )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all ring-4 ring-white"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex items-center gap-2 justify-center">
                  <h2 className="text-2xl font-black text-slate-900">{formData.displayName}</h2>
                  <ShieldCheck className="w-6 h-6 text-primary fill-primary/10" />
                </div>
                <p className="text-slate-500 font-bold flex items-center gap-2 justify-center">
                  <Mail className="w-4 h-4" /> {formData.email}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full mt-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest leading-none">Actif</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mt-12 pt-12 border-t border-slate-50">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Membre</p>
                  <p className="font-bold text-slate-700">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Rôle</p>
                  <p className="font-bold text-primary uppercase text-sm">{(profile?.roles?.[0] || 'Apprenant')}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions/Stats */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Revenus cumulés</p>
                    <p className="text-3xl font-black">{profile?.revenue || 0} DHS</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[45%]" />
                </div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter italic">Objectif du mois : 5 000 DHS</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Main Info and Form */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Horizontal Stats Row */}
            <div className="grid grid-cols-3 gap-6">
               {[
                 { label: 'Talents', val: '0', icon: Briefcase, col: 'blue' },
                 { label: 'Note', val: '4.8', icon: Star, col: 'amber' },
                 { label: 'Projets', val: '0', icon: Calendar, col: 'teal' }
               ].map((s, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4"
                 >
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${s.col}-50 text-${s.col}-500`}>
                     <s.icon className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-2xl font-black text-slate-900 leading-none">{s.val}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                   </div>
                 </motion.div>
               ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex-grow"
            >
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Informations Professionnelles</h3>
                  <p className="text-slate-500 font-medium">Gérez votre identité et votre bio publique</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Éditer
                  </button>
                )}
              </div>

              {!isEditing ? (
                 <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {[
                        { label: 'Localisation', val: formData.location || 'Non renseignée', icon: MapPin },
                        { label: 'Téléphone', val: formData.phone || 'Non renseigné', icon: Phone },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{item.label}</p>
                            <p className="text-slate-900 font-bold">{item.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Bio & Présentation</p>
                       <p className="text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-3xl border border-slate-100 italic">
                         "{formData.bio || "Aucune bio enregistrée pour le moment. Cliquez sur éditer pour vous présenter à la communauté."}"
                       </p>
                    </div>
                 </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 ml-2">
                         <User className="w-3 h-3" /> Nom Complet
                       </label>
                       <input
                        required
                        value={formData.displayName}
                        onChange={e => setFormData({...formData, displayName: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 ml-2">
                         <Phone className="w-3 h-3" /> Téléphone
                       </label>
                       <input
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="+212 6XX XXX XXX"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 ml-2">
                       <MapPin className="w-3 h-3" /> Localisation
                     </label>
                     <input
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="Casablanca, Maroc"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 ml-2">
                       <Edit2 className="w-3 h-3" /> Bio
                     </label>
                     <textarea
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none min-h-[150px]"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-8 py-5 bg-slate-100 text-slate-700 rounded-[24px] font-black uppercase tracking-wider text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-3 px-8 py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-wider text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-primary/40"
                    >
                      <Save className="w-5 h-5" /> Enregistrer les modifications
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
