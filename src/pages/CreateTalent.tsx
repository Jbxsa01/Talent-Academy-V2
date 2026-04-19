import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Upload, Sparkles, Info } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORIES = ['Design', 'Coding', 'Cuisine', 'Darija', 'Marketing', 'Photo', 'Musique', 'Soft Skills', 'Business'];

const CreateTalent = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'talent' | 'offer' | 'review'>('talent');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Coding',
    imageUrl: '',
  });
  const [offerData, setOfferData] = useState({
    title: '',
    description: '',
    duration: '4 semaines',
    price: 120,
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!profile?.roles?.includes('trainer')) {
      alert('Seuls les trainers peuvent créer des talents!');
      navigate('/dashboard');
    }
  }, [user, profile]);

  const handleTalentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const talentRef = await addDoc(collection(db, 'talents'), {
        trainerId: user.uid,
        trainerName: profile?.displayName || 'Hestim Trainer',
        ...formData,
        rating: 5.0,
        reviewCount: 0,
        followers: 0,
        isActive: false,
        createdAt: new Date().toISOString(),
      });

      await addDoc(collection(db, 'talents', talentRef.id, 'offers'), {
        ...offerData,
        createdAt: new Date().toISOString(),
      });

      if (!profile?.roles?.includes('trainer')) {
        await updateDoc(doc(db, 'users', user.uid), {
          roles: [...(profile?.roles || []), 'trainer'],
        });
      }

      alert('✅ Talent créé avec succès!');
      navigate(`/talent/${talentRef.id}`);
    } catch (error) {
      console.error('Error creating talent:', error);
      alert('❌ Erreur lors de la création du talent');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.title.trim() && formData.description.trim() && formData.imageUrl;
  const isStep2Valid = offerData.title.trim() && offerData.description.trim() && offerData.price > 0;

  const steps = [
    { id: 'talent', label: 'Talent', number: 1 },
    { id: 'offer', label: 'Offre', number: 2 },
    { id: 'review', label: 'Vérifier', number: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-main flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" />
              Créer un Talent
            </h1>
            <p className="text-text-muted text-sm mt-1">Partagez votre expertise avec la communauté</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    (step === 'talent' && s.number <= 1) ||
                    (step === 'offer' && s.number <= 2) ||
                    (step === 'review' && s.number <= 3)
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s.number}
                </motion.div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-3 bg-slate-200 rounded-full" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            {steps.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id === 'talent') setStep('talent');
                  else if (s.id === 'offer' && isStep1Valid) setStep('offer');
                  else if (s.id === 'review' && isStep1Valid && isStep2Valid) setStep('review');
                }}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  (step === 'talent' && s.id === 'talent') ||
                  (step === 'offer' && s.id === 'offer') ||
                  (step === 'review' && s.id === 'review')
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-slate-100 text-text-muted hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Talent */}
          {step === 'talent' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-slate-200">
                <h2 className="text-2xl font-bold text-text-main mb-8">Informations du Talent</h2>

                <div className="space-y-6">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wide">
                      Titre du Talent *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTalentChange}
                      placeholder="ex: Python Avancé pour Data Science"
                      maxLength={80}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
                    />
                    <p className="text-xs text-text-muted mt-2">{formData.title.length}/80 caractères</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wide">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleTalentChange}
                      placeholder="Décris ton talent en détail. Qu'est-ce que les apprenants vont apprendre..."
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
                    />
                    <p className="text-xs text-text-muted mt-2">{formData.description.length} caractères</p>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wide">
                      Catégorie *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleTalentChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wide">
                      Image du Talent *
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl p-8 text-center transition-colors group cursor-pointer">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-xl shadow-lg"
                          />
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById('image-upload') as HTMLInputElement;
                                input?.click();
                              }}
                              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-indigo-700 transition-all"
                            >
                              Changer l'image
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, imageUrl: '' }));
                                setImagePreview('');
                              }}
                              className="flex-1 px-4 py-2 bg-slate-100 text-text-main rounded-lg font-bold hover:bg-slate-200 transition-all"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3 group-hover:text-primary transition-colors" />
                          <p className="text-text-main font-bold mb-2">Clique pour télécharger une image</p>
                          <p className="text-xs text-text-muted">PNG, JPG jusqu'à 5MB</p>
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setStep('offer')}
                disabled={!isStep1Valid}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Continuer →
              </button>
            </motion.div>
          )}

          {/* Step 2: Offer */}
          {step === 'offer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-slate-200">
                <h2 className="text-2xl font-bold text-text-main mb-8">Première Offre</h2>

                <div className="space-y-6">
                  {/* Titre Offre */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wide">
                      Titre de l'Offre *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={offerData.title}
                      onChange={handleOfferChange}
                      placeholder="ex: Pack Complet - 8 sessions"
                      maxLength={80}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  {/* Description Offre */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wide">
                      Description de l'Offre *
                    </label>
                    <textarea
                      name="description"
                      value={offerData.description}
                      onChange={handleOfferChange}
                      placeholder="Qu'est-ce qui est inclus dans cette offre?"
                      required
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  {/* Duration & Price */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wide">
                        Durée *
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={offerData.duration}
                        onChange={handleOfferChange}
                        placeholder="ex: 4 semaines"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wide">
                        Prix (DHS) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="price"
                          value={offerData.price}
                          onChange={handleOfferChange}
                          placeholder="120"
                          required
                          min="10"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        <span className="absolute right-4 top-3.5 font-bold text-text-muted">DHS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('talent')}
                  className="flex-1 py-4 bg-slate-100 text-text-main rounded-xl font-bold uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  disabled={!isStep2Valid}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  Vérifier →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                {/* Talent Summary */}
                <div className="bg-white rounded-3xl p-8 border-2 border-slate-200">
                  <h3 className="text-xl font-bold text-text-main mb-6">Résumé du Talent</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase">Titre</p>
                      <p className="text-lg font-bold text-text-main mt-1">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase">Catégorie</p>
                      <p className="text-lg font-bold text-primary mt-1">{formData.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase">Description</p>
                      <p className="text-base text-text-muted mt-2 whitespace-pre-wrap line-clamp-3">{formData.description}</p>
                    </div>
                    {imagePreview && (
                      <div>
                        <p className="text-xs text-text-muted font-bold uppercase mb-2">Image</p>
                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Offer Summary */}
                <div className="bg-white rounded-3xl p-8 border-2 border-primary/20 bg-primary/5">
                  <h3 className="text-xl font-bold text-text-main mb-6">Offre Incluse</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-text-muted font-bold uppercase">Titre</p>
                        <p className="text-lg font-bold text-text-main mt-1">{offerData.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-primary">{offerData.price}</p>
                        <p className="text-xs text-text-muted font-bold">DHS</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase">Durée</p>
                      <p className="text-base font-bold text-text-main mt-1">{offerData.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase">Description</p>
                      <p className="text-base text-text-muted mt-2 whitespace-pre-wrap">{offerData.description}</p>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 flex gap-4">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-900 mb-1">Vous pouvez ajouter plus d'offres plus tard</p>
                    <p className="text-sm text-blue-800">Après création, vous pourrez ajouter d'autres offres à ce même talent.</p>
                  </div>
                </div>
              </div>

              {/* Final Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('offer')}
                  className="flex-1 py-4 bg-slate-100 text-text-main rounded-xl font-bold uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95"
                >
                  ← Modifier
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary/30"
                >
                  {loading ? '⏳ Création...' : '✨ Créer le Talent'}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTalent;
