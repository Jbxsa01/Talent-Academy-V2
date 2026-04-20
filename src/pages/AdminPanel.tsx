import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shield, TrendingUp, Users, Package, Download, Search, MoreHorizontal, DollarSign, Database, CheckCircle, XCircle, MessageCircle, Star, Activity, BarChart3, Settings, Eye, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';

const AdminPanel = () => {
  const [stats, setStats] = useState({ totalSales: 0, totalUsers: 0, totalTalents: 0, commission: 0, totalChats: 0, totalReviews: 0, totalOffers: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'talents' | 'transactions' | 'chats' | 'reviews'>('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const talentsSnap = await getDocs(collection(db, 'talents'));
      const transSnap = await getDocs(collection(db, 'transactions'));
      const chatsSnap = await getDocs(collection(db, 'chats'));
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      
      let totalOffers = 0;
      for (const talent of talentsSnap.docs) {
        const offersSnap = await getDocs(collection(db, 'talents', talent.id, 'offers'));
        totalOffers += offersSnap.size;
      }
      
      const sales = transSnap.size * 120;
      setStats({
        totalSales: sales,
        totalUsers: usersSnap.size,
        totalTalents: talentsSnap.size,
        commission: sales * 0.20,
        totalChats: chatsSnap.size,
        totalReviews: reviewsSnap.size,
        totalOffers
      });

      setRecentTransactions(transSnap.docs.slice(-5).reverse().map(d => ({ id: d.id, ...d.data() })));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTalents(talentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setChats(chatsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRole = async (userId: string, currentRoles: string[], role: string) => {
    const newRoles = currentRoles.includes(role) 
      ? currentRoles.filter(r => r !== role) 
      : [...currentRoles, role];
    
    try {
      await updateDoc(doc(db, 'users', userId), { roles: newRoles });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const seedMoroccanData = async () => {
    setLoading(true);
    const mockData = [
      { title: 'Master UI Marocaine', category: 'Design', trainerName: 'Anas El Alami', description: 'Design Moderne & Zellige.', imageUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750' },
      { title: 'HESTIM Coding Lab', category: 'Coding', trainerName: 'Mehdi Choukri', description: 'Full stack development.', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085' }
    ];

    try {
      for (const item of mockData) {
        await setDoc(doc(collection(db, 'talents')), {
          ...item,
          rating: 5,
          createdAt: new Date().toISOString(),
          trainerId: 'mock-admin',
          status: 'pending'
        });
      }
      await fetchData();
      alert('✅ Données exemple créées avec succès!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveTalent = async (id: string) => {
    try {
      await updateDoc(doc(db, 'talents', id), { status: 'approved' });
      await fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteReview = async (id: string) => {
    if (confirm('Supprimer cet avis de manière permanente?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
        await fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('Supprimer cet utilisateur de manière permanente? Cette action ne peut pas être annulée.')) {
      try {
        await deleteDoc(doc(db, 'users', id));
        await fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const exportData = () => {
    // Simulated export
    const data = JSON.stringify({ stats, recentTransactions, users }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talent-academy-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const resetAllPriceTo120 = async () => {
    if (!confirm('⚠️ ATTENTION: Cela va réinitialiser TOUS les prix à 120 DH et ajouter des talents exemples. Êtes-vous sûr?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/seed-talents', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchData();
        alert(`✅ ${data.stats.updatedOffers} offres mises à jour + ${data.stats.addedTalents} nouveaux talents créés à 120 DH fixe!`);
      } else {
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (err) {
      console.error('Error resetting prices:', err);
      alert('❌ Erreur lors de la mise à jour des prix');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-6">
          <div className="w-14 h-14 bg-indigo-50 border border-primary/20 rounded-2xl flex items-center justify-center shadow-sm">
            <Shield className="text-primary w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-text-main tracking-tight">Pannel d'Administration</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-1">Gestion Centralisée HESTIM</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={resetAllPriceTo120}
            disabled={loading}
            className="bg-amber-500 text-white px-6 py-3.5 rounded-xl font-bold flex items-center space-x-3 transition-all hover:bg-amber-600 shadow-xl shadow-amber-500/20 disabled:opacity-50"
          >
            <DollarSign className="w-4 h-4" />
            <span>{loading ? 'Traitement...' : 'Tarif Fixe 120 DH + Ajouter'}</span>
          </button>

          <button
            onClick={seedMoroccanData}
            disabled={loading}
            className="bg-primary text-white px-6 py-3.5 rounded-xl font-bold flex items-center space-x-3 transition-all hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>{loading ? 'Initialisation...' : 'Données Exemple'}</span>
          </button>

          <button
            onClick={exportData}
            className="bg-surface border border-border-subtle text-text-main px-8 py-3.5 rounded-xl font-bold flex items-center space-x-3 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Chiffre d\'Affaires', value: `${stats.totalSales} DHS`, sub: 'Revenu Brut', icon: TrendingUp, color: 'text-success', bg: 'bg-green-50' },
          { label: 'Commission Plateforme', value: `${stats.commission.toFixed(0)} DHS`, sub: '20% Réservé', icon: DollarSign, color: 'text-primary', bg: 'bg-blue-50' },
          { label: 'Membres Académie', value: stats.totalUsers, sub: 'Utilisateurs Actifs', icon: Users, color: 'text-accent', bg: 'bg-pink-50' },
          { label: 'Catalogue Talents', value: stats.totalTalents, sub: `${stats.totalOffers} Offres`, icon: Package, color: 'text-warning', bg: 'bg-amber-50' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface p-8 rounded-[32px] border border-border-subtle shadow-sm group hover:border-primary transition-all hover:shadow-xl"
          >
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">{item.label}</h4>
            <div className="text-3xl font-black text-text-main leading-none tabular-nums tracking-tighter">{item.value}</div>
            <p className="text-[10px] font-bold text-text-muted mt-3 italic opacity-60">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-8 p-2 bg-surface rounded-2xl border border-border-subtle w-fit">
        {(['overview', 'users', 'talents', 'transactions', 'chats', 'reviews'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all ${
              activeTab === tab 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            {tab === 'overview' ? '📊 Vue d\'ensemble' :
             tab === 'users' ? '👥 Utilisateurs' :
             tab === 'talents' ? '🎓 Talents' :
             tab === 'transactions' ? '💳 Transactions' :
             tab === 'chats' ? '💬 Messages' : '⭐ Avis'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transactions */}
          <div className="lg:col-span-2 bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
            <div className="p-8 border-b border-border-subtle bg-gray-50/50">
              <h2 className="text-xl font-black text-text-main tracking-tight italic">Flux de Commandes</h2>
            </div>
            <div className="p-8 space-y-6">
              {recentTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between group p-4 hover:bg-gray-50/30 rounded-xl transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-success transition-all shadow-sm">
                      <TrendingUp className="w-5 h-5 text-success group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main mb-0.5">Confirmée</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">120 DHS Reçus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">À l'instant</p>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 opacity-20">
                  <Package className="w-12 h-12 mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest">Aucune transaction</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-surface rounded-3xl border border-border-subtle p-8 shadow-sm">
              <h3 className="text-sm font-black text-text-main tracking-tight mb-6 italic">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Conversations</span>
                  <span className="text-lg font-black text-primary">{stats.totalChats}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Avis Clients</span>
                  <span className="text-lg font-black text-primary">{stats.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Offres</span>
                  <span className="text-lg font-black text-primary">{stats.totalOffers}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-8 shadow-lg shadow-primary/20 text-white">
              <h3 className="text-sm font-black tracking-tight mb-4 italic">Informations Commission</h3>
              <p className="text-[10px] font-bold opacity-90 mb-6 leading-relaxed">20% de toutes les ventes sont automatiquement conservés pour l'administration de l'école.</p>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-2">Solde Plateforme</p>
                <p className="text-2xl font-black">{stats.commission.toFixed(0)} DHS</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-black text-text-main tracking-tight italic">Membres de l'Académie</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
              <input 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-[11px] font-semibold focus:outline-none focus:ring-2 ring-primary/10"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <th className="px-8 py-5">Identité</th>
                  <th className="px-8 py-5">Rôles</th>
                  <th className="px-8 py-5">Statut</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {users.filter(u => u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img src={u.photoURL} alt="" className="w-9 h-9 rounded-full border border-border-subtle shadow-sm" />
                        <div>
                          <p className="text-sm font-bold text-text-main leading-tight mb-1">{u.displayName}</p>
                          <p className="text-[10px] font-bold text-text-muted tracking-tight">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-1.5 flex-wrap">
                        {u.roles?.map((r: string) => (
                          <span key={r} className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded shadow-sm border ${
                            r === 'admin' ? 'bg-indigo-50 text-success border-success/10' : 'bg-gray-50 text-text-muted border-border-subtle'
                          }`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-success">
                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        <span>Vérifié</span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button 
                        onClick={() => toggleRole(u.id, u.roles || [], 'admin')}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border inline-block ${
                          u.roles?.includes('admin') ? 'bg-indigo-50 text-primary border-primary' : 'bg-surface border-border-subtle text-text-muted hover:bg-gray-50'
                        }`}
                      >
                        {u.roles?.includes('admin') ? 'Révoquer' : 'Administrateur'}
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border border-border-subtle text-danger hover:bg-red-50 inline-block"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Talents Tab */}
      {activeTab === 'talents' && (
        <div className="bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-black text-text-main tracking-tight italic">File de Modération</h2>
            <span className="text-[10px] font-black px-3 py-1 bg-amber-50 text-warning rounded-full border border-warning/10 uppercase tracking-widest animate-pulse">En Attente</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <th className="px-8 py-5">Inform. Talent</th>
                  <th className="px-8 py-5">Catégorie</th>
                  <th className="px-8 py-5">Statut</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {talents.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img src={t.imageUrl} alt="" className="w-14 h-10 object-cover rounded-lg border border-border-subtle shadow-sm" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-sm font-bold text-text-main leading-tight mb-1">{t.title}</p>
                          <p className="text-[10px] font-bold text-text-muted tracking-tight italic">par {t.trainerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 text-primary rounded border border-primary/10">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {t.status === 'approved' ? (
                        <span className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-success">
                          <CheckCircle className="w-4 h-4" />
                          <span>En Ligne</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-warning">
                          <MoreHorizontal className="w-4 h-4" />
                          <span>En Attente</span>
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      {t.status !== 'approved' && (
                        <button 
                          onClick={() => approveTalent(t.id)}
                          className="bg-success text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/10 inline-block"
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Approuver
                        </button>
                      )}
                      <button className="bg-gray-100 text-text-muted px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-danger transition-all inline-block">
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Rejeter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border-subtle bg-gray-50/50">
            <h2 className="text-xl font-black text-text-main tracking-tight italic">Historique des Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <th className="px-8 py-5">ID Transaction</th>
                  <th className="px-8 py-5">Client</th>
                  <th className="px-8 py-5">Montant</th>
                  <th className="px-8 py-5">Commission</th>
                  <th className="px-8 py-5">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6 text-[10px] font-mono text-text-muted">{t.id?.slice(0, 8)}</td>
                    <td className="px-8 py-6 text-sm font-bold text-text-main">{t.learnerId?.slice(0, 6)}</td>
                    <td className="px-8 py-6 text-sm font-black text-primary">{t.amount} DHS</td>
                    <td className="px-8 py-6 text-sm font-black text-success">{(t.amount * 0.2).toFixed(0)} DHS</td>
                    <td className="px-8 py-6">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-green-50 text-success rounded border border-success/10">
                        Completée
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {chats.map(chat => (
            <div key={chat.id} className="bg-surface rounded-3xl border border-border-subtle p-8 shadow-sm hover:border-primary transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-text-main italic">{chat.talentTitle}</h3>
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border-subtle pb-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Participants</span>
                  <span className="text-sm font-black text-text-main">{chat.participants?.length || 2}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Dernier Message</span>
                  <p className="text-[10px] text-text-muted text-right italictruncate max-w-[150px]">{chat.lastMessage?.slice(0, 30)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-surface rounded-3xl border border-border-subtle p-8 shadow-sm hover:border-primary transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-black text-[11px] text-primary">
                    {review.learnerId?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-main">Learner Review</p>
                    <div className="flex space-x-1 mt-1">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border border-border-subtle text-danger hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Remove
                </button>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <Star className="w-12 h-12 mx-auto mb-4" />
              <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">No reviews yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
