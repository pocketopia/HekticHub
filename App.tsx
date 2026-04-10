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

// Added for URL Routing
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
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

  // Handle URL parameters for QR code access
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

  // Load custom assets from Firestore
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
            if (overrides[id][key] === undefined) {
              overrides[id][key] = data[key];
            }
          });
        }
      });

      setBrands(BRANDS.map(b => {
        const override = overrides[b.id];
        if (!override) return b;
        return {
          ...b,
          imageUrl: override.imageUrl !== undefined ? (override.imageUrl || b.imageUrl) : b.imageUrl,
          videoUrl: override.videoUrl !== undefined ? (override.videoUrl || b.videoUrl) : b.videoUrl,
          videoThumbnailUrl: override.videoThumbnailUrl !== undefined ? (override.videoThumbnailUrl || b.videoThumbnailUrl) : b.videoThumbnailUrl,
          packagesImageUrl: override.packagesImageUrl !== undefined ? (override.packagesImageUrl || b.packagesImageUrl) : b.packagesImageUrl,
          description: override.description !== undefined ? (override.description || b.description) : b.description,
          longDescription: override.longDescription !== undefined ? (override.longDescription || b.longDescription) : b.longDescription,
          links: override.links !== undefined ? (override.links || b.links) : b.links
        };
      }));
      setIsAssetsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsAssetsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateBrands = (updatedBrands: Brand[]) => {
    setBrands(updatedBrands);
  };

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
      setIsUserMode(false);
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
              <div className="flex-1">
                <h3 className="font-futuristic text-lg sm:text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                  {cat}
                </h3>
              </div>
              <button 
                onClick={() => setActiveCategory(cat)}
                className="group flex items-center gap-2 text-[10px] sm:text-xs font-futuristic text-gray-500 hover:text-red-600 transition-colors uppercase tracking-widest"
              >
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
                      setSelectedBrand(b);
                      navigate(`/${b.id}`); // This updates the URL
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
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-20">
      <div className="bg-red-600 h-1 flex items-center justify-center overflow-hidden hover:h-8 transition-all duration-500 group relative z-[50]">
          <button 
            onClick={handleAdminClick}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-futuristic font-black uppercase text-black tracking-widest transition-opacity"
          >
            <ShieldCheck className="w-3 h-3" /> Enter Command Center
          </button>
      </div>

      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={() => { setActiveCategory('all'); navigate('/'); }} style={{cursor: 'pointer'}}>
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-futuristic font-black text-xl shadow-[0_0_15px_rgba(220,38,38,0.6)]">
              H
            </div>
            <h1 className="font-futuristic text-2xl font-black tracking-tighter uppercase hidden sm:block">
              Hektic <span className="text-red-600">Hub</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => { setActiveCategory('all'); navigate('/'); }}
              className={`font-futuristic text-xs uppercase tracking-widest transition-colors ${activeCategory === 'all' ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}
            >
              All Access
            </button>
            {(Object.keys(CATEGORY_ICONS) as CategoryType[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-futuristic text-xs uppercase tracking-widest transition-colors ${activeCategory === cat ? 'text-red-600' : 'text-gray-400 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleAdminClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-red-600/10 hover:border-red-600/50 transition-all text-[10px] font-futuristic font-bold text-gray-400 hover:text-red-500"
            >
              <ShieldCheck className="w-4 h-4" /> ADMIN
            </button>
            <button className="p-2 rounded-full glass-card hover:bg-white/10 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-red-600/10 rounded-full blur-[80px] sm:blur-[120px] animate-pulse-red" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>
        <div className="relative z-10 max-w-4xl px-6">
          <h2 className="font-futuristic text-3xl md:text-7xl font-black mb-4 sm:mb-6 leading-none tracking-tight">
            THE <span className="text-red-600 red-glow">HEKTIC</span> ECOSYSTEM
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            A premier collective curated for the modern visionary.
          </p>
        </div>
        <div className="absolute bottom-6 sm:bottom-10 animate-bounce">
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
        </div>
      </section>

      {/* Mobile Category Bar */}
      <div className="md:hidden sticky top-20 z-30 bg-black/80 backdrop-blur-md p-4 flex gap-3 overflow-x-auto no-scrollbar border-b border-white/10">
        <button 
          onClick={() => { setActiveCategory('all'); navigate('/'); }}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-futuristic font-bold transition-all ${activeCategory === 'all' ? 'bg-red-600 text-black' : 'glass-card text-gray-400'}`}
        >
          ALL
        </button>
        {(Object.keys(CATEGORY_ICONS) as CategoryType[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-futuristic font-bold transition-all ${activeCategory === cat ? 'bg-red-600 text-black' : 'glass-card text-gray-400'}`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8 sm:mt-12 min-h-[40vh]">
        {activeCategory === 'all' ? (
          <GroupedView />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-600 rounded-lg">
                  {CATEGORY_ICONS[activeCategory as CategoryType]}
                </div>
                <h3 className="font-futuristic text-xl sm:text-2xl font-bold uppercase tracking-widest">
                  {activeCategory}
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
              {filteredBrands.map(brand => (
                <BrandCard 
                  key={brand.id} 
                  brand={brand} 
                  onClick={(b) => {
                    if (b.id === 'rise-of-darkus') {
                      window.open('https://a.co/d/04Bezv58', '_blank');
                    } else {
                      setSelectedBrand(b);
                      navigate(`/${b.id}`);
                    }
                  }} 
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-40 pt-20 pb-10 border-t border-white/10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-6">
            <h4 className="font-futuristic text-xl font-black uppercase">Hektic <span className="text-red-600">Hub</span></h4>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              The central nervous system of our creative enterprise.
            </p>
          </div>
          <div>
            <h5 className="font-futuristic text-xs uppercase tracking-[0.2em] mb-6 text-gray-400">Navigation</h5>
            <ul className="space-y-3 text-sm font-light">
              <li><a href="#" className="hover:text-red-500 transition-colors">The Ecosystem</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Our Story</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-futuristic text-xs uppercase tracking-[0.2em] mb-6 text-gray-400">Join the Hub</h5>
            <div className="flex gap-2 max-w-xs mx-auto md:mx-0">
              <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 flex-1" />
              <button className="bg-red-600 px-4 py-2 rounded-lg text-sm font-bold uppercase font-futuristic">Link</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedBrand && (
        <BrandModal 
          brand={selectedBrand} 
          onClose={() => {
            setSelectedBrand(null);
            navigate('/'); // Clears URL on close
          }} 
        />
      )}
      
      {isAssetsLoading && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-futuristic text-xl font-black uppercase tracking-[0.3em] text-white">Initializing</h3>
        </div>
      )}
      
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsPasswordModalOpen(false)} />
          <div className="relative w-full max-w-md glass-card rounded-3xl border border-white/10 p-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-futuristic text-2xl font-black uppercase tracking-widest mt-4">Security Check</h3>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <input 
                type="password"
                autoFocus
                value={adminPassword}
                onChange={(e) => { setAdminPassword(e.target.value); setPasswordError(false); }}
                className={`w-full bg-white/5 border ${passwordError ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-center text-xl tracking-[0.5em] focus:outline-none focus:border-red-500`}
              />
              {!user && (
                <button 
                  type="button" 
                  onClick={async () => {
                    const provider = new GoogleAuthProvider();
                    await signInWithPopup(auth, provider);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-futuristic text-[10px] font-bold uppercase hover:bg-white/10"
                >
                  <ShieldCheck className="w-4 h-4 text-red-500" /> Login with Google
                </button>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl glass-card text-[10px] font-bold uppercase">Abort</button>
                <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-red-600 text-[10px] font-bold uppercase shadow-[0_0_20px_rgba(220,38,38,0.3)]">Verify</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminOpen && (
        <AdminMenu 
          brands={brands} 
          onUpdateBrands={handleUpdateBrands} 
          onClose={() => {
            setIsAdminOpen(false);
            if (isUserMode) {
              window.history.replaceState({}, '', window.location.pathname);
              setIsUserMode(false);
            }
          }} 
          isUserMode={isUserMode}
          user={user}
          isAuthReady={isAuthReady}
        />
      )}
    </div>
  );
};

// Root wrapper with Router
const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
