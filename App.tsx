import React, { useState, useMemo, useEffect } from 'react';
import { CategoryType, Brand } from './types';
import { BRANDS, CATEGORY_ICONS } from './constants';
import { BrandCard } from './components/BrandCard';
import { BrandModal } from './components/BrandModal';
import { AdminMenu } from './components/AdminMenu';
import { ChevronDown, Menu, ArrowRight, ShieldCheck } from 'lucide-react';

import { db, auth } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Routing tools
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isUserMode, setIsUserMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [brands, setBrands] = useState<Brand[]>(BRANDS);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // THE QR CODE FIX: Listen to the URL on load and when it changes
  useEffect(() => {
    // Get the ID from the URL (e.g., from /pocketopia)
    const pathId = location.pathname.replace('/', '');
    
    if (pathId) {
      // Find the brand that matches that ID
      const brandToOpen = brands.find(b => b.id === pathId);
      if (brandToOpen) {
        setSelectedBrand(brandToOpen);
      }
    } else {
      setSelectedBrand(null);
    }
  }, [location.pathname, brands]); // Runs whenever the URL changes

  // Handle URL parameters for admin templates
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'templates') {
      setIsUserMode(true);
      setIsAdminOpen(true);
    }
  }, []);

  // Track Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load assets from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'assets'), (snapshot) => {
      const overrides: Record<string, any> = {};
      snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();
        if (id.includes('_')) {
          const lastUnderscoreIndex = id.lastIndexOf('_');
          const brandId = id.substring(0, lastUnderscoreIndex);
          const field = id.substring(lastUnderscoreIndex + 1);
          if (!overrides[brandId]) overrides[brandId] = {};
          overrides[brandId][field] = data.value;
        } else {
          if (!overrides[id]) overrides[id] = {};
          Object.keys(data).forEach(key => {
            if (overrides[id][key] === undefined) overrides[id][key] = data[key];
          });
        }
      });

      setBrands(BRANDS.map(b => {
        const override = overrides[b.id];
        if (!override) return b;
        return {
          ...b,
          imageUrl: override.imageUrl || b.imageUrl,
          videoUrl: override.videoUrl || b.videoUrl,
          videoThumbnailUrl: override.videoThumbnailUrl || b.videoThumbnailUrl,
          packagesImageUrl: override.packagesImageUrl || b.packagesImageUrl,
          description: override.description || b.description,
          longDescription: override.longDescription || b.longDescription,
          links: override.links || b.links
        };
      }));
      setIsAssetsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsAssetsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateBrands = (updatedBrands: Brand[]) => setBrands(updatedBrands);

  const filteredBrands = useMemo(() => {
    return brands.filter(brand => activeCategory === 'all' || brand.category === activeCategory);
  }, [activeCategory, brands]);

  const categories: CategoryType[] = ['services', 'entertainment', 'streaming', 'affiliations'];

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

  const GroupedView = () => (
    <div className="space-y-12 sm:space-y-20">
      {categories.map(cat => {
        const brandsInCat = filteredBrands.filter(b => b.category === cat);
        if (brandsInCat.length === 0) return null;
        return (
          <section key={cat} className="space-y-4 sm:space-y-8">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="p-2 sm:p-3 bg-red-600/10 border border-red-600/30 rounded-xl text-red-600">
                {CATEGORY_ICONS[cat]}
              </div>
              <h3 className="flex-1 font-futuristic text-lg sm:text-2xl font-black uppercase tracking-widest">{cat}</h3>
              <button onClick={() => setActiveCategory(cat)} className="group flex items-center gap-2 text-[10px] sm:text-xs font-futuristic text-gray-500 hover:text-red-600 transition-colors uppercase tracking-widest">
                Expand <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
              {brandsInCat.map(brand => (
                <BrandCard 
                  key={brand.id} 
                  brand={brand} 
                  onClick={(b) => {
                    if (b.id === 'rise-of-darkus') {
                      window.open('https://a.co/d/04Bezv58', '_blank');
                    } else {
                      navigate(`/${b.id}`); // URL changes, useEffect handles the modal
                    }
                  }} 
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="bg-red-600 h-1 flex items-center justify-center overflow-hidden hover:h-8 transition-all duration-500 group relative z-[50]">
          <button onClick={handleAdminClick} className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-futuristic font-black uppercase text-black tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Enter Command Center
          </button>
      </div>

      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveCategory('all'); navigate('/'); }}>
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-futuristic font-black text-xl shadow-[0_0_15px_rgba(220,38,38,0.6)]">H</div>
            <h1 className="font-futuristic text-2xl font-black tracking-tighter uppercase hidden sm:block">Hektic <span className="text-red-600">Hub</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => { setActiveCategory('all'); navigate('/'); }} className={`font-futuristic text-xs uppercase tracking-widest ${activeCategory === 'all' ? 'text-red-600' : 'text-gray-400'}`}>All Access</button>
            {(Object.keys(CATEGORY_ICONS) as CategoryType[]).map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`font-futuristic text-xs uppercase tracking-widest ${activeCategory === cat ? 'text-red-600' : 'text-gray-400'}`}>{cat}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleAdminClick} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[10px] font-futuristic font-bold text-gray-400"><ShieldCheck className="w-4 h-4" /> ADMIN</button>
            <button className="p-2 rounded-full glass-card"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 sm:mt-12">
        {activeCategory === 'all' ? <GroupedView /> : (
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
            {filteredBrands.map(brand => (
              <BrandCard key={brand.id} brand={brand} onClick={(b) => navigate(`/${b.id}`)} />
            ))}
          </div>
        )}
      </main>

      {selectedBrand && <BrandModal brand={selectedBrand} onClose={() => navigate('/')} />}
      
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsPasswordModalOpen(false)} />
          <div className="relative w-full max-w-md glass-card rounded-3xl p-8 space-y-8">
            <h3 className="font-futuristic text-2xl font-black text-center uppercase">Security Check</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <input type="password" autoFocus value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl focus:outline-none" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl glass-card text-[10px] font-bold">Abort</button>
                <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-red-600 text-[10px] font-bold">Verify</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminOpen && <AdminMenu brands={brands} onUpdateBrands={handleUpdateBrands} onClose={() => setIsAdminOpen(false)} user={user} isAuthReady={isAuthReady} />}
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
