import React, { useState, useMemo, useEffect } from 'react';
import { CategoryType, Brand } from './types';
import { BRANDS, CATEGORY_ICONS } from './constants';
import { BrandCard } from './components/BrandCard';
import { BrandModal } from './components/BrandModal';
import { AdminMenu } from './components/AdminMenu';
import { ChevronDown, Menu, ArrowRight, ShieldCheck, ArrowLeft, Download, Info, Shield } from 'lucide-react';

import { db, auth } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// --- POCKETOPIA PORTFOLIO COMPONENT (Apple Store Design) ---
interface PortfolioProps {
  onBack: () => void;
  onNavigateToPrivacy: () => void;
}

const PocketopiaPortfolio: React.FC<PortfolioProps> = ({ onBack, onNavigateToPrivacy }) => {
  const apps = [
    {
      id: 'bandtag',
      name: 'BandTag',
      icon: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=200',
      category: 'Music & Networking',
      description: 'The ultimate ecosystem for musicians and venues to connect, book shows, and grow their local scene.',
      details: 'Available for iOS and Android. Features include real-time venue booking, musician matching, and digital EPK hosting.',
      downloadUrl: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans animate-in fade-in duration-500">
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-futuristic text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </button>
          <h2 className="font-futuristic text-lg font-black tracking-tighter uppercase">Pocketopia <span className="text-red-600 text-xs">Portfolio</span></h2>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">App Store <span className="text-red-600">Showcase</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl">Premium digital experiences crafted with precision.</p>
        </header>

        <div className="space-y-8">
          {apps.map((app) => (
            <div key={app.id} className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 hover:bg-[#111111] transition-all duration-500">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <img src={app.icon} alt={app.name} className="w-24 h-24 md:w-32 md:h-32 rounded-[22%] shadow-2xl transition-transform" />
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">{app.name}</h3>
                      <p className="text-red-500 font-medium text-sm uppercase tracking-wide">{app.category}</p>
                    </div>
                    <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 w-fit">
                      <Download className="w-4 h-4" /> Get
                    </button>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{app.description}</p>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex gap-4">
                    <Info className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">Details</p>
                      <p className="text-sm text-gray-300 leading-snug">{app.details}</p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center gap-6">
                    <button onClick={onNavigateToPrivacy} className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Privacy Policy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  // SET DEFAULT TO 'hub' SO IT DOES NOT OPEN ON PRIVACY POLICY
  const [view, setView] = useState<'hub' | 'portfolio' | 'privacy'>('hub');
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>(BRANDS);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Sync state with URL Hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/pocketopia/portfolio') {
        setView('portfolio');
      } else if (hash === '#/pocketopia/privacy-policy') {
        setView('privacy');
      } else {
        setView('hub'); // Forces everything else to the Hub
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash(); // Initial check
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
    const unsubscribe = onSnapshot(collection(db, 'assets'), () => {
      setIsAssetsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredBrands = useMemo(() => {
    return brands.filter(brand => activeCategory === 'all' || brand.category === activeCategory);
  }, [activeCategory, brands]);

  // Navigation Helpers
  const goToPortfolio = () => {
    window.location.hash = '#/pocketopia/portfolio';
    setView('portfolio');
  };

  const goToHub = () => {
    window.location.hash = '';
    setView('hub');
  };

  const goToPrivacy = () => {
    window.location.hash = '#/pocketopia/privacy-policy';
    setView('privacy');
  };

  // Render Logic
  if (view === 'portfolio') {
    return <PocketopiaPortfolio onBack={goToHub} onNavigateToPrivacy={goToPrivacy} />;
  }
  
  if (view === 'privacy') {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 flex flex-col items-center">
        <div className="max-w-3xl w-full text-left space-y-6 bg-[#0A0A0A] p-8 rounded-3xl border border-white/5 mt-10">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
            <Shield className="w-12 h-12 text-red-600" />
            <div>
              <h1 className="text-3xl font-black uppercase font-futuristic">Privacy <span className="text-red-600">Policy</span></h1>
              <p className="text-gray-500 text-sm tracking-widest uppercase mt-1">Pocketopia LLC</p>
            </div>
          </div>
          
          <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
            <p><strong>1. Overview:</strong> This Privacy Policy applies to all applications, services, and websites operated by Pocketopia LLC, including BandTag. We are committed to protecting the privacy of our users.</p>
            <p><strong>2. Information We Collect:</strong> To provide our services, we may collect Account Information (name, email), User Content (event details, EPKs), Device Data, and Usage Data.</p>
            <p><strong>3. Artificial Intelligence & "The Roadie":</strong> Our services utilize AI ("The Roadie") to generate packing lists, equipment inventories, and event schedules. AI processing is used solely to generate content for the user. We do not sell your personal data to third-party AI trainers.</p>
            <p><strong>4. How We Use Your Information:</strong> To facilitate networking and booking, power AI-driven tools, and improve the Pocketopia ecosystem.</p>
            <p><strong>5. Data Sharing & Disclosure:</strong> Pocketopia LLC does not sell your personal data. We only share information when necessary to facilitate a booking or required by law.</p>
            <p><strong>6. Data Deletion & Retention:</strong> Users may request the permanent deletion of their account and all associated data at any time. To request deletion, please use the "Delete Account" feature within the app settings or email us at support@hektichub.com.</p>
            <p><strong>7. Contact Us:</strong> For questions, contact Pocketopia LLC Support at support@hektichub.com.</p>
          </div>

          <div className="pt-8 border-t border-white/10 mt-8 flex justify-between items-center">
            <button onClick={goToPortfolio} className="text-red-500 hover:text-white transition-colors uppercase font-bold tracking-widest text-xs flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Portfolio
            </button>
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">Last Updated: April 2026</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-futuristic text-2xl font-black uppercase cursor-pointer" onClick={goToHub}>
            Hektic <span className="text-red-600">Hub</span>
          </h1>
          <button 
            onClick={goToPortfolio} 
            className="glass-card px-4 py-2 rounded-full text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
          >
            View Apps
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map(brand => (
            <BrandCard 
              key={brand.id} 
              brand={brand} 
              onClick={(b) => {
                if (b.id === 'pocketopia') goToPortfolio();
                else setSelectedBrand(b);
              }} 
            />
          ))}
        </div>
      </main>

      {selectedBrand && <BrandModal brand={selectedBrand} onClose={() => setSelectedBrand(null)} />}
      
      {/* Admin Menu rendered here */}
      <AdminMenu />
    </div>
  );
};

export default App;
