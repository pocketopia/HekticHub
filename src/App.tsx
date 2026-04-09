import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { CategoryType, Brand } from './types';
import { BRANDS } from './constants';
import { BrandCard } from './components/BrandCard';
import { BrandModal } from './components/BrandModal';
import { AdminMenu } from './components/AdminMenu';
import { ShieldCheck, Activity } from 'lucide-react';

import { db, auth } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// --- DEEP LINK HANDLER ---
// This watches the URL and forces the modal open if a user visits a link directly
const BusinessRoute = ({ brands, setSelectedBrand }: { brands: Brand[], setSelectedBrand: (b: Brand) => void }) => {
  const { businessId } = useParams();
  
  useEffect(() => {
    if (businessId) {
      const brand = brands.find(b => b.id.toLowerCase() === businessId.toLowerCase());
      if (brand) {
        setSelectedBrand(brand);
        document.title = `${brand.name} | Hektic Hub`;
      }
    }
  }, [businessId, brands, setSelectedBrand]);

  return null;
};

// --- MAIN APP LOGIC ---
const AppContent: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>(BRANDS);
  const [user, setUser] = useState<User | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);
  
  const navigate = useNavigate();

  // 1. Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // 2. Sync with Firebase (With bypass logic for Quota Errors)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'assets'), 
      (snapshot) => {
        const overrides: Record<string, any> = {};
        snapshot.forEach((doc) => {
          overrides[doc.id] = doc.data();
        });
        setBrands(BRANDS.map(b => ({ ...b, ...(overrides[b.id] || {}) })));
        setIsAssetsLoading(false);
      }, 
      (error) => {
        console.error("FIRESTORE ERROR (Likely Quota):", error);
        // If Firestore fails, we stop the loading spinner so the user can still use the site
        setIsAssetsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Navigation Handler (The Phase 1 Engine)
  const handleBrandSelection = (brand: Brand) => {
    const urlFriendlyId = brand.id.toLowerCase().replace(/\s+/g, '-');
    
    // We navigate FIRST to ensure the URL updates immediately
    navigate(`/${urlFriendlyId}`);
    setSelectedBrand(brand);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-red-600">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link 
            to="/" 
            onClick={() => { setSelectedBrand(null); navigate('/'); }}
            className="text-red-600 font-black text-2xl tracking-tighter flex items-center gap-2"
          >
            <Activity /> HEKTIC HUB
          </Link>
          
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="p-2 text-zinc-700 hover:text-red-600 transition-colors"
          >
            <ShieldCheck size={24} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto p-6">
        <Routes>
          {/* Dashboard View */}
          <Route path="/" element={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brands.map(brand => (
                <BrandCard 
                  key={brand.id} 
                  brand={brand} 
                  onClick={() => handleBrandSelection(brand)} 
                />
              ))}
            </div>
          } />

          {/* Deep Link View */}
          <Route path="/:businessId" element={
            <>
              <BusinessRoute brands={brands} setSelectedBrand={setSelectedBrand} />
              {/* Background stays visible but dimmed */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-20 pointer-events-none blur-sm">
                {brands.map(brand => <BrandCard key={brand.id} brand={brand} onClick={() => {}} />)}
              </div>
            </>
          } />
        </Routes>
      </main>

      {/* The Section Modal */}
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

      {/* Admin Panel */}
      {isAdminOpen && (
        <AdminMenu 
          brands={brands} 
          user={user} 
          onClose={() => setIsAdminOpen(false)} 
          onLogin={async () => {
            const provider = new GoogleAuthProvider();
            try {
              await signInWithPopup(auth, provider);
            } catch (err) {
              console.error("Login Error:", err);
              alert("Ensure hektichub.com is added to Authorized Domains in Firebase.");
            }
          }}
        />
      )}

      {/* Loading Overlay */}
      {isAssetsLoading && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-red-600 animate-pulse font-black tracking-widest uppercase">
            Syncing Ecosystem...
          </div>
        </div>
      )}
    </div>
  );
};

// --- WRAPPER ---
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
