     import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { CategoryType, Brand } from './types';
import { BRANDS, CATEGORY_ICONS } from './constants';
import { BrandCard } from './components/BrandCard';
import { BrandModal } from './components/BrandModal';
import { AdminMenu } from './components/AdminMenu';
import { ChevronDown, Menu, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

import { db, auth } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// --- HELPER: Handles Deep Linking & Tab Titles ---
const BusinessRoute = ({ brands, setSelectedBrand }: { brands: Brand[], setSelectedBrand: (b: Brand) => void }) => {
  const { businessId } = useParams();
  useEffect(() => {
    const brand = brands.find(b => b.id.toLowerCase() === businessId?.toLowerCase());
    if (brand) {
      setSelectedBrand(brand);
      document.title = `${brand.name} | Hektic Hub`;
    }
  }, [businessId, brands, setSelectedBrand]);
  return null;
};

// --- MAIN CONTENT ---
const AppContent: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [brands, setBrands] = useState<Brand[]>(BRANDS);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const navigate = useNavigate();

  // 1. Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync Firebase Assets (The "Sticky" data)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'assets'), (snapshot) => {
      const overrides: Record<string, any> = {};
      snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();
        if (id.includes('_')) {
          const lastIndex = id.lastIndexOf('_');
          const bId = id.substring(0, lastIndex);
          const field = id.substring(lastIndex + 1);
          if (!overrides[bId]) overrides[bId] = {};
          overrides[bId][field] = data.value;
        } else {
          if (!overrides[id]) overrides[id] = {};
          Object.assign(overrides[id], data);
        }
      });

      setBrands(BRANDS.map(b => ({ ...b, ...(overrides[b.id] || {}) })));
      setIsAssetsLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setIsAssetsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredBrands = useMemo(() => 
    activeCategory === 'all' ? brands : brands.filter(b => b.category === activeCategory),
    [activeCategory, brands]
  );

  const handleAdminClick = () => {
    setIsPasswordModalOpen(true);
    setPasswordError(false);
    setAdminPassword('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'hektic2024') {
      setIsAdminOpen(true);
      setIsPasswordModalOpen(false);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 font-mono">
      {/* Security Top Bar */}
      <div className="bg-red-600 h-1 flex items-center justify-center overflow-hidden hover:h-8 transition-all duration-500 group relative z-[50]">
         <button onClick={handleAdminClick} className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-black uppercase text-black tracking-widest transition-opacity">
           <ShieldCheck className="w-3 h-3" /> Enter Command Center
         </button>
      </div>

      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" onClick={() => { setSelectedBrand(null); document.title = "Hektic Hub"; }} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(220,38,38,0.6)]">H</div>
            <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">Hektic <span className="text-red-600">Hub</span></h1>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => {setActiveCategory('all'); navigate('/');}} className={`text-xs uppercase tracking-widest ${activeCategory === 'all' ? 'text-red-600' : 'text-gray-400'}`}>All Access</button>
            {['services', 'entertainment', 'streaming', 'affiliations'].map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat as CategoryType)} className={`text-xs uppercase tracking-widest ${activeCategory === cat ? 'text-red-600' : 'text-gray-400'}`}>{cat}</button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleAdminClick} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[10px] font-bold text-gray-400 hover:text-red-500 transition-all">
              <ShieldCheck className="w-4 h-4" /> ADMIN
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <Routes>
          <Route path="/" element={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrands.map(brand => (
                <BrandCard 
                  key={brand.id} 
                  brand={brand} 
                  onClick={() => {
                    if (brand.id === 'rise-of-darkus') {
                      window.open('https://a.co/d/04Bezv58', '_blank');
                    } else {
                      setSelectedBrand(brand);
                      navigate(`/${brand.id.toLowerCase()}`); // THIS FIXES PHASE 1
                    }
                  }} 
                />
              ))}
            </div>
          } />
          
          <Route path="/:businessId" element={
            <>
              <BusinessRoute brands={brands} setSelectedBrand={setSelectedBrand} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-20 blur-sm pointer-events-none">
                {filteredBrands.map(brand => <BrandCard key={brand.id} brand={brand} onClick={() => {}} />)}
              </div>
            </>
          } />
        </Routes>
      </main>

      {/* Brand View Modal */}
      {selectedBrand && (
        <BrandModal 
          brand={selectedBrand} 
          onClose={() => {
            setSelectedBrand(null);
            navigate('/');
            document.title = "Hektic Hub | Mothership";
          }} 
        />
      )}

      {/* Admin UI Overlays */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsPasswordModalOpen(false)} />
          <form onSubmit={handlePasswordSubmit} className="relative w-full max-w-md glass-card rounded-3xl p-8 space-y-6 text-center">
            <ShieldCheck className="w-12 h-12 text-red-600 mx-auto" />
            <h3 className="text-xl font-black uppercase tracking-widest">Security Check</h3>
            <input 
              type="password" 
              autoFocus 
              value={adminPassword} 
              onChange={(e) => setAdminPassword(e.target.value)} 
              placeholder="••••••••" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl tracking-widest focus:border-red-500 outline-none" 
            />
            {passwordError && <p className="text-[10px] text-red-500 uppercase font-bold">Access Denied</p>}
            
            {!user && (
              <button 
                type="button" 
                onClick={async () => {
                  const provider = new GoogleAuthProvider();
                  await signInWithPopup(auth, provider);
                }} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-[10px] font-bold uppercase border border-white/10"
              >
                <Activity size={14} className="text-red-500" /> Login for Cloud Sync
              </button>
            )}
            <button type="submit" className="w-full py-4 bg-red-600 rounded-xl font-bold uppercase text-[10px]">Verify Identity</button>
          </form>
        </div>
      )}

      {isAdminOpen && <AdminMenu brands={brands} onUpdateBrands={setBrands} user={user} onClose={() => setIsAdminOpen(false)} />}
      
      {isAssetsLoading && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl animate-pulse flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <p className="mt-4 text-[10px] text-red-500 font-bold uppercase tracking-widest">Uplink Active...</p>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
