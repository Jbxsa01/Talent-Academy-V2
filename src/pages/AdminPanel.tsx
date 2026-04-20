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



  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-6">
          <div className="w-14 h-14 bg-indigo-50 border border-primary/20 rounded-2xl flex items-center justify-center shadow-sm">
            <Shield className="text-primary w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Pannel d'Administration</h1>
            <p className="text-xs font-medium tracking-wide text-text-muted mt-2">Gestion Centralisée HESTIM</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">


          <button
            onClick={seedMoroccanData}
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm flex items-center space-x-2 transition-all hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>{loading ? 'Init...' : 'Données'}</span>
          </button>

          <button
            onClick={exportData}
            className="bg-surface border border-border-subtle text-text-main px-6 py-3 rounded-lg font-semibold text-sm flex items-center space-x-2 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
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
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">{item.label}</h4>
            <div className="text-2xl font-bold text-text-main leading-none tabular-nums">{item.value}</div>
            <p className="text-xs font-normal text-text-muted mt-3 opacity-70">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-8 p-2 bg-surface rounded-2xl border border-border-subtle w-fit">
        {(['overview', 'users', 'talents', 'transactions', 'chats', 'reviews'] as const).map(tab => {
          const tabConfig = {
            overview: { icon: BarChart3, label: 'Vue d\'ensemble' },
            users: { icon: Users, label: 'Utilisateurs' },
            talents: { icon: Package, label: 'Talents' },
            transactions: { icon: DollarSign, label: 'Transactions' },
            chats: { icon: MessageCircle, label: 'Messages' },
            reviews: { icon: Star, label: 'Avis' }
          };
          const config = tabConfig[tab];
          const IconComponent = config.icon;
          
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transactions */}
          <div className="lg:col-span-2 bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-subtle bg-gray-50/50">
              <h2 className="text-lg font-semibold text-text-main">Flux de Commandes</h2>
            </div>
            <div className="p-8 space-y-6">
              {recentTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between group p-4 hover:bg-gray-50/30 rounded-xl transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-success transition-all shadow-sm">
                      <TrendingUp className="w-5 h-5 text-success group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-main mb-1">Confirmée</p>
                      <p className="text-xs font-normal text-text-muted">120 DHS Reçus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-normal text-text-muted opacity-60">À l'instant</p>
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
              <h3 className="text-base font-semibold text-text-main mb-6">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                  <span className="text-xs font-medium text-text-muted">Conversations</span>
                  <span className="text-lg font-bold text-primary">{stats.totalChats}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                  <span className="text-xs font-medium text-text-muted">Avis Clients</span>
                  <span className="text-lg font-bold text-primary">{stats.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-text-muted">Total Offres</span>
                  <span className="text-lg font-bold text-primary">{stats.totalOffers}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-6 shadow-lg shadow-primary/20 text-white">
              <h3 className="text-sm font-semibold mb-3">Informations Commission</h3>
              <p className="text-xs font-normal opacity-90 mb-4 leading-relaxed">20% de toutes les ventes sont automatiquement conservés pour l'administration de l'école.</p>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                <p className="text-xs font-normal opacity-80 mb-1">Solde Plateforme</p>
                <p className="text-2xl font-bold">{stats.commission.toFixed(0)} DHS</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-surface rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-semibold text-text-main">Membres de l'Académie</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-border-subtle rounded-lg py-2.5 pl-10 pr-4 text-sm font-normal focus:outline-none focus:ring-2 ring-primary/10"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-semibold text-text-muted">
                  <th className="px-6 py-4 text-left">Identité</th>
                  <th className="px-6 py-4 text-left">Rôles</th>
                  <th className="px-6 py-4 text-left">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {users.filter(u => u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group border-b border-border-subtle">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full border border-border-subtle shadow-sm" />
                        <div>
                          <p className="text-sm font-medium text-text-main">{u.displayName}</p>
                          <p className="text-xs font-normal text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 flex-wrap">
                        {u.roles?.map((r: string) => (
                          <span key={r} className={`text-xs font-medium px-2.5 py-1 rounded border ${
                            r === 'admin' ? 'bg-indigo-50 text-primary border-primary/20' : 'bg-gray-50 text-text-muted border-border-subtle'
                          }`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="flex items-center space-x-2 text-xs font-medium text-success">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        <span>Vérifié</span>
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button 
                        onClick={() => toggleRole(u.id, u.roles || [], 'admin')}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all border inline-block ${
                          u.roles?.includes('admin') ? 'bg-indigo-50 text-primary border-primary/30' : 'bg-surface border-border-subtle text-text-muted hover:bg-gray-50'
                        }`}
                      >
                        {u.roles?.includes('admin') ? 'Révoquer' : 'Admin'}
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all border border-border-subtle text-red-600 hover:bg-red-50 inline-block"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Suppr
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
          <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-semibold text-text-main">File de Modération</h2>
            <span className="text-xs font-medium px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">En Attente</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-semibold text-text-muted">
                  <th className="px-6 py-4 text-left">Inform. Talent</th>
                  <th className="px-6 py-4 text-left">Catégorie</th>
                  <th className="px-6 py-4 text-left">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {talents.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/30 transition-colors group border-b border-border-subtle">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <img src={t.imageUrl} alt="" className="w-12 h-8 object-cover rounded-lg border border-border-subtle shadow-sm" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-sm font-medium text-text-main">{t.title}</p>
                          <p className="text-xs font-normal text-text-muted">par {t.trainerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-primary rounded border border-primary/20">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {t.status === 'approved' ? (
                        <span className="flex items-center space-x-2 text-xs font-medium text-success">
                          <CheckCircle className="w-4 h-4" />
                          <span>En Ligne</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2 text-xs font-medium text-amber-600">
                          <MoreHorizontal className="w-4 h-4" />
                          <span>En Attente</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      {t.status !== 'approved' && (
                        <button 
                          onClick={() => approveTalent(t.id)}
                          className="bg-success text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-all shadow-lg shadow-green-500/10 inline-block"
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Approuver
                        </button>
                      )}
                      <button className="bg-gray-100 text-text-muted px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-all inline-block">
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
          <div className="p-6 border-b border-border-subtle bg-gray-50/50">
            <h2 className="text-lg font-semibold text-text-main">Historique des Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-semibold text-text-muted">
                  <th className="px-6 py-4 text-left">ID Transaction</th>
                  <th className="px-6 py-4 text-left">Client</th>
                  <th className="px-6 py-4 text-left">Montant</th>
                  <th className="px-6 py-4 text-left">Commission</th>
                  <th className="px-6 py-4 text-left">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/30 transition-colors border-b border-border-subtle">
                    <td className="px-6 py-5 text-xs font-mono text-text-muted">{t.id?.slice(0, 8)}</td>
                    <td className="px-6 py-5 text-sm font-medium text-text-main">{t.learnerId?.slice(0, 6)}</td>
                    <td className="px-6 py-5 text-sm font-bold text-primary">{t.amount} DHS</td>
                    <td className="px-6 py-5 text-sm font-bold text-success">{(t.amount * 0.2).toFixed(0)} DHS</td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium px-2.5 py-1 bg-green-50 text-success rounded border border-success/20">
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
            <div key={chat.id} className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm hover:border-primary transition-all">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-text-main">{chat.talentTitle}</h3>
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border-subtle pb-2">
                  <span className="text-xs font-medium text-text-muted">Participants</span>
                  <span className="text-sm font-semibold text-text-main">{chat.participants?.length || 2}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-medium text-text-muted">Dernier Message</span>
                  <p className="text-xs text-text-muted text-right truncate max-w-[150px]">{chat.lastMessage?.slice(0, 30)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm hover:border-primary transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-semibold text-xs text-primary">
                    {review.learnerId?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main">Avis Client</p>
                    <div className="flex space-x-1 mt-1">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all border border-border-subtle text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Suppr
                </button>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-16 opacity-30">
              <Star className="w-12 h-12 mx-auto mb-4" />
              <p className="text-xs text-text-muted font-medium">Aucun avis pour le moment</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
