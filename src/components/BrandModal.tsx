
import React, { useEffect, useState, useMemo } from 'react';
import { Brand, AppProject } from '../types';
import { 
  X, 
  ExternalLink, 
  Youtube, 
  ShoppingCart, 
  PlayCircle, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Heart, 
  Check, 
  UserCheck, 
  ClipboardCheck, 
  Clock, 
  Sparkles,
  Smartphone,
  Flame,
  Layout,
  ArrowRight,
  Monitor,
  Zap,
  Bell,
  Film,
  Clapperboard,
  History,
  Headphones,
  Compass,
  Search,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { PocketopiaAI } from './PocketopiaAI';

import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

interface BrandModalProps {
  brand: Brand;
  onClose: () => void;
}

type ModalView = 'details' | 'inquiry' | 'success' | 'portfolio' | 'waitlist' | 'demo' | 'epk' | 'pitchdeck';

export const BrandModal: React.FC<BrandModalProps> = ({ brand, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<ModalView>('details');
  const [successType, setSuccessType] = useState<'inquiry' | 'waitlist' | 'demo' | 'pitchdeck'>('inquiry');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [selectedAppType, setSelectedAppType] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: 'Transmission Success', body: 'submission sent! we will send you an email shortly with a digital invite to our appointment!' });
  const [isPlaying, setIsPlaying] = useState(false);

  const isWedding = brand.id === 'premiere-weddings';
  const isBandWars = brand.id === 'band-wars';
  const isPocketopia = brand.id === 'pocketopia';
  const isTwizted = brand.id === 'twizted-images';
  const isDarkus = brand.id === 'rise-of-darkus';
  const isHekticStudios = brand.id === 'hektic-studios';
  const isAcropolis = brand.id === 'acropolis-apparel';
  const isChurchOrion = brand.id === 'church-orion';
  const isInnovationMedia = brand.id === 'innovation-media';
  const isCryptamnesia = brand.id === 'cryptamnesia';
  const isPhantasphere = brand.id === 'phantasphere-by-kreation';
  const isHekticTV = brand.id === 'hektic-tv';
  const isArchaven = brand.id === 'archaven';
  const isMVN = brand.id === 'mvn-global';
  const isHekticNation = brand.id === 'hektic-nation';

  const isLightAccent = isPocketopia || isHekticStudios || brand.theme.accent === '#ffffff';

  useEffect(() => {
    setIsVisible(true);
    if (isAcropolis) {
      setView('waitlist');
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handlePocketopiaSubmit = async () => {
    if (!email) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        email,
        brandId: brand.id,
        brandName: brand.name,
        type: 'inquiry',
        appType: selectedAppType,
        date: selectedDate,
        time: selectedTime,
        createdAt: serverTimestamp()
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setView('success');
      }, 4000);
    } catch (err) {
      console.error("Pocketopia submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInquirySubmit = async () => {
    if (!email) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        email,
        brandId: brand.id,
        brandName: brand.name,
        type: 'inquiry',
        interest: isTwizted ? selectedInterest : (isWedding ? selectedInterest : null),
        date: selectedDate,
        time: selectedTime,
        createdAt: serverTimestamp()
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setView('success');
      }, 4000);
    } catch (err) {
      console.error("Inquiry submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLinkIcon = (label: string, type: string) => {
    if (label.toLowerCase().includes('get the app')) return <Smartphone className="w-4 h-4 mr-2" />;
    if (label.toLowerCase().includes('audio book')) return <Headphones className="w-4 h-4 mr-2" />;
    if (label.toLowerCase().includes('explore the world')) return <Compass className="w-4 h-4 mr-2" />;
    
    switch (type) {
      case 'video': return <Youtube className="w-4 h-4 mr-2" />;
      case 'store': return <ShoppingCart className="w-4 h-4 mr-2" />;
      case 'primary': return <PlayCircle className="w-4 h-4 mr-2" />;
      default: return <ExternalLink className="w-4 h-4 mr-2" />;
    }
  };

  const timeSlots = [
    "09:00 AM", "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM"
  ];

  const interestOptions = useMemo(() => {
    if (isWedding) return ["Cinematic 4K Storytelling", "Full-Day Event Coverage", "Professional Wedding Officiant", "Full & Day-of Wedding Coordination"];
    if (isTwizted) return ["Cinematic Music Video", "Brand Commercial", "Legacy VHS Conversion", "Short Film Production", "Event Coverage"];
    return ["Mobile iOS/Android App", "Web Application", "E-commerce Platform", "AI scheduling/email services", "Custom Enterprise Software", "Other"];
  }, [isWedding, isTwizted]);

  const CalendarComponent = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const accentColor = isWedding ? 'rose' : 'red';
    const accentHex = isWedding ? '#e11d48' : (isPocketopia ? '#ffffff' : '#dc2626');
    
    return (
      <div className={`bg-white/60 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-${accentColor}-200 shadow-xl space-y-4 sm:space-y-6`}>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`${isWedding ? 'font-romantic italic text-rose-900' : 'font-futuristic font-bold text-gray-900'} text-lg sm:text-xl flex items-center gap-2`}>
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Select a Date
            </h4>
            <span className={`text-xs font-medium ${isWedding ? 'text-rose-400' : 'text-gray-400'}`}>June 2025</span>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className={`text-center text-[10px] font-bold ${isWedding ? 'text-rose-300' : 'text-gray-300'} mb-1`}>{d}</div>
            ))}
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`h-8 sm:h-9 w-full rounded-lg text-xs sm:text-sm transition-all duration-300 flex items-center justify-center
                  ${selectedDate === day 
                    ? `text-white shadow-lg scale-110` 
                    : `hover:bg-${accentColor}-100 text-${accentColor}-800`}`}
                style={selectedDate === day ? { backgroundColor: (isPocketopia || isTwizted) ? '#000000' : accentHex } : {}}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className={`animate-fade-in space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-${accentColor}-100`}>
            <h4 className={`${isWedding ? 'font-romantic italic text-rose-900' : 'font-futuristic font-bold text-gray-900'} text-lg sm:text-xl flex items-center gap-2`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> Select a Time
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs transition-all duration-300
                    ${selectedTime === time 
                      ? `text-white shadow-md` 
                      : `bg-white border border-${accentColor}-100 text-${accentColor}-600 hover:border-${accentColor}-300`}`}
                  style={selectedTime === time ? { backgroundColor: (isPocketopia || isTwizted) ? '#000000' : accentHex } : {}}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {(isPocketopia || isTwizted) && selectedTime && !selectedAppType && !selectedInterest && (
           <div className={`animate-fade-in space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-${accentColor}-100`}>
              <h4 className="font-futuristic font-bold text-lg sm:text-xl text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> {isTwizted ? 'Project Type' : 'App Concept'}
              </h4>
              <div className="max-h-24 sm:max-h-32 overflow-y-auto pr-2 space-y-2 no-scrollbar">
                {interestOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => isTwizted ? setSelectedInterest(option) : setSelectedAppType(option)}
                    className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-xs transition-all duration-300 border
                      ${(isTwizted ? selectedInterest : selectedAppType) === option 
                        ? 'bg-red-50 border-red-500 text-red-900 font-bold' 
                        : 'bg-white border-red-100 text-red-600 hover:border-red-200'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
        )}

        {((isWedding && selectedTime) || (isPocketopia && selectedTime && selectedAppType) || (isTwizted && selectedTime && selectedInterest)) && (
          <div className="mt-4 sm:mt-6 animate-fade-in space-y-4">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isWedding ? 'text-rose-400' : 'text-gray-500'}`}>Your Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full bg-white border ${isWedding ? 'border-rose-100 focus:border-rose-300' : 'border-red-100 focus:border-red-300'} rounded-xl px-4 py-3 text-sm focus:outline-none transition-all`}
              />
            </div>
            <button 
              onClick={isPocketopia ? handlePocketopiaSubmit : handleInquirySubmit}
              disabled={isSubmitting || !email}
              className={`w-full ${isWedding ? 'bg-rose-600 font-romantic text-lg sm:text-lg' : 'bg-red-600 font-futuristic text-sm sm:text-base'} text-white py-3 sm:py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50`}
              style={{ backgroundColor: (isPocketopia || isTwizted) ? '#000000' : accentHex }}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 sm:w-6 sm:h-6" />}
              {(isPocketopia || isTwizted) ? 'Submit' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const SuccessScreen = () => (
    <div className="flex flex-col items-center justify-center py-10 sm:py-20 text-center space-y-6 sm:space-y-8 animate-fade-in h-full">
      <div className={`w-16 h-16 sm:w-24 sm:h-24 ${isWedding ? 'bg-rose-100' : 'bg-red-100'} rounded-full flex items-center justify-center animate-bounce`}>
        {isWedding ? <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-rose-600 fill-rose-600" /> : <Check className="w-8 h-8 sm:w-12 sm:h-12 text-red-600" />}
      </div>
      <div className="space-y-3 sm:space-y-4">
        <h2 className={`text-3xl sm:text-5xl ${isWedding ? 'font-romantic' : 'font-futuristic font-black uppercase'} ${isWedding ? 'text-rose-900' : 'text-white'} leading-tight px-4`}>
          {successType === 'waitlist' ? 'YOU\'RE ON THE LIST!' : successType === 'demo' ? 'QUOTE REQUESTED!' : successType === 'pitchdeck' ? 'REQUEST RECEIVED!' : (isWedding ? 'Booking Submitted!' : isTwizted ? 'SHOOT REQUESTED!' : 'INQUIRY SENT!')}
        </h2>
        <p className={`${isWedding ? 'text-rose-700/70 italic' : 'text-gray-400 font-light'} text-base sm:text-xl max-w-xs sm:max-w-md mx-auto px-4`}>
          {successType === 'waitlist' 
            ? "We'll notify you as soon as our stores are live. Stay tuned for the drop!" 
            : successType === 'demo'
            ? "Your request for a quote has been received. Our team will review your demo requirements and get back to you shortly."
            : successType === 'pitchdeck'
            ? "Your request for the Phantasphere pitch deck has been received. Our investment team will review your application and reach out via email."
            : (isWedding ? "We are honored to be considered for your journey. A consultant will reach out within 24 hours." : isTwizted ? "Your high-octane project is in the pipeline. We'll be in touch shortly to finalize the storyboard." : "The Pocketopia engineering team is reviewing your project. Expect a response shortly.")
          }
        </p>
      </div>
      {successType === 'inquiry' && (
        <div className={`${isWedding ? 'bg-white/40 border-rose-200 text-rose-900 font-romantic italic' : 'glass-card border-white/10 text-white font-futuristic'} p-4 sm:p-6 rounded-3xl border text-base sm:text-lg shadow-inner mx-4`}>
          Scheduled for June {selectedDate}, 2025 at {selectedTime}
          <div className={`text-[10px] sm:text-sm mt-2 font-sans not-italic ${isWedding ? 'text-rose-400' : 'text-red-500'} font-bold uppercase tracking-widest`}>
            {isPocketopia ? selectedAppType : selectedInterest}
          </div>
        </div>
      )}
      <button onClick={handleClose} className={`px-8 py-3 sm:px-10 sm:py-4 ${isWedding ? 'bg-rose-600' : 'bg-red-600'} text-white rounded-2xl font-bold transition-all ${isWedding ? 'font-romantic text-base sm:text-lg' : 'font-futuristic text-sm sm:text-base'}`}>
        Return to Hub
      </button>
    </div>
  );

  const WaitlistScreen = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      
      setIsSubmitting(true);
      setError(null);
      
      try {
        await addDoc(collection(db, 'inquiries'), {
          email,
          brandId: brand.id,
          brandName: brand.name,
          type: 'waitlist',
          createdAt: serverTimestamp()
        });
        setSuccessType('waitlist');
        setView('success');
      } catch (err) {
        console.error("Error adding to waitlist:", err);
        setError("Failed to join waitlist. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-20 text-center space-y-8 animate-fade-in h-full max-w-2xl mx-auto px-4">
        <div className="space-y-4">
          <div className="inline-block px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 text-red-500 font-futuristic text-xs font-bold uppercase tracking-widest animate-pulse">
            Coming Soon!
          </div>
          <h2 className="text-4xl sm:text-6xl font-futuristic font-black uppercase text-white leading-tight">
            Join the Waiting List
          </h2>
          <p className="text-gray-400 font-light text-lg sm:text-xl leading-relaxed">
            {brand.id === 'acropolis-apparel' 
              ? "For Acropolis Apparel and Accessories, Retro Rabbit Apparel, and Doomsday Apparatus Apparel, sign up here to be notified when store is up!"
              : brand.id === 'phantasphere-by-kreation'
              ? (
                <span className="whitespace-pre-line">
                  "Kreation has developed a proof of concept for a new gaming console called Phantasphere, which is a revolutionary concept with both atmospheric gameplay, and unique AI attributes, ground-breaking new hardware - made entirely for gamers BY gamers. This means we promise the annhialation of Pay-to-Play Ideology, and will include over 30 game concepts with memorable new characters and gameplay to fall in love with, incredible storytelling - it is going to be revolutionary. Join the mailing list to be the first to try the console's interactive main menu concept and a first look at the console!"
                </span>
              )
              : `Sign up here to be notified when ${brand.name} is live!`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-all font-futuristic"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold uppercase">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold font-futuristic uppercase tracking-widest shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Joining...' : 'Notify Me'}
            <ArrowRight className="w-5 h-5" />
          </button>
          
          {brand.id === 'phantasphere-by-kreation' && (
            <button
              type="button"
              onClick={() => setView('pitchdeck')}
              className="w-full mt-4 text-red-500 font-futuristic text-sm font-bold uppercase tracking-widest hover:text-red-400 transition-colors flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              Get Pitchdeck
            </button>
          )}
        </form>

        <button 
          onClick={() => setView('details')}
          className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
        >
          View Brand Details
        </button>
      </div>
    );
  };

  const PitchdeckScreen = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      reason: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.email || !formData.reason) return;
      
      setIsSubmitting(true);
      setError(null);
      
      try {
        await addDoc(collection(db, 'inquiries'), {
          ...formData,
          brandId: brand.id,
          brandName: brand.name,
          type: 'pitchdeck',
          createdAt: serverTimestamp()
        });
        setSuccessType('pitchdeck');
        setView('success');
      } catch (err) {
        console.error("Error submitting pitchdeck request:", err);
        setError("Failed to submit request. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-20 text-center space-y-8 animate-fade-in h-full max-w-2xl mx-auto px-4">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-futuristic font-black uppercase text-white leading-tight">
            Get Pitchdeck
          </h2>
          <p className="text-gray-400 font-light text-lg sm:text-xl leading-relaxed">
            If you are interested in investing in this ground-breaking new console, please fill out the form below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 font-futuristic ml-2">Full Name</label>
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-all font-futuristic"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 font-futuristic ml-2">Email Address</label>
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-all font-futuristic"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 font-futuristic ml-2">Reason for Interest</label>
            <textarea
              placeholder="Why would you like to see the pitch deck?"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-all font-futuristic resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold uppercase text-center">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold font-futuristic uppercase tracking-widest shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : 'Request Pitchdeck'}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setView('waitlist')}
            className="w-full text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors text-center py-2"
          >
            Back to Waitlist
          </button>
        </form>
      </div>
    );
  };

  const DemoScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [templates, setTemplates] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      setHasSearched(true);
      setSelectedTemplate(null);

      try {
        const q = query(
          collection(db, 'appTemplates'),
          where('companyName', '>=', searchQuery),
          where('companyName', '<=', searchQuery + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTemplates(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const handleQuoteRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !selectedTemplate) return;

      setIsSubmitting(true);
      try {
        await addDoc(collection(db, 'inquiries'), {
          email,
          companyName: selectedTemplate.companyName,
          type: 'quote',
          brandId: brand.id,
          brandName: brand.name,
          message: `Quote request for ${selectedTemplate.companyName} app template.`,
          createdAt: serverTimestamp()
        });
        setSuccessType('demo');
        setView('success');
      } catch (err) {
        console.error("Quote request error:", err);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col items-center justify-start py-10 sm:py-20 space-y-8 animate-fade-in h-full max-w-4xl mx-auto px-4 overflow-y-auto no-scrollbar">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-6xl font-futuristic font-black uppercase text-white leading-tight">
            Find Your Demo
          </h2>
          <p className="text-gray-400 font-light text-lg sm:text-xl leading-relaxed">
            Search for your company to view your custom app template archive.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Enter company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-all font-futuristic"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-2xl font-bold font-futuristic uppercase transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {hasSearched && templates.length === 0 && !isSearching && (
            <div className="col-span-full text-center py-12 glass-card rounded-3xl border border-white/5">
              <p className="text-gray-500 font-futuristic uppercase tracking-widest">No templates found for "{searchQuery}"</p>
            </div>
          )}

          {templates.map(template => (
            <div 
              key={template.id} 
              className={`glass-card rounded-3xl border transition-all overflow-hidden group cursor-pointer ${selectedTemplate?.id === template.id ? 'border-red-500 ring-1 ring-red-500' : 'border-white/5 hover:border-white/20'}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="aspect-video relative">
                <img src={template.imageUrl} alt={template.companyName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <div className="w-full max-w-md animate-slide-up space-y-6 pt-8 border-t border-white/10">
            <div className="text-center space-y-2">
              <h4 className="text-white font-futuristic font-bold uppercase">Request a Quote</h4>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Interested in this template for {selectedTemplate.companyName}?</p>
            </div>
            <form onSubmit={handleQuoteRequest} className="space-y-4">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-all font-futuristic"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-bold font-futuristic uppercase tracking-widest shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                Contact for Quote
              </button>
            </form>
          </div>
        )}

        <button 
          onClick={() => setView('details')}
          className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors pt-8"
        >
          Return to Details
        </button>
      </div>
    );
  };

  const InquiryScreen = () => (
    <div className="animate-fade-in space-y-6 sm:space-y-8 px-4 sm:px-0 py-4 sm:py-0">
      <button onClick={() => setView('details')} className={`flex items-center text-[10px] sm:text-sm font-bold uppercase tracking-widest ${isWedding ? 'text-rose-600' : 'text-gray-400'} mb-2`}>
        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Back to Brand
      </button>
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start pt-2 sm:pt-4">
        <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
          <h2 className={`text-3xl sm:text-5xl ${isWedding ? 'font-romantic text-rose-900' : 'font-futuristic font-black uppercase text-white'} leading-tight`}>
            {isWedding ? 'Begin Your Story With Us' : isTwizted ? 'Book Your Production' : 'Build Your Digital Future'}
          </h2>
          <p className={`${isWedding ? 'text-rose-800/70 italic' : 'text-gray-400 font-light'} text-lg sm:text-xl leading-relaxed`}>
            {isWedding ? '"We don\'t just record weddings; we preserve the light, the laughter, and the legacy of your love."' : isTwizted ? 'Ready for high-octane visuals? Select your project type and schedule a storyboard consultation.' : 'What kind of app do you want to create? Let\'s architect your vision and book an initial consultation.'}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
             {isWedding ? (
               <>
                 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-rose-700 p-3 sm:p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-center sm:text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0"><Heart className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                    <span className="text-[10px] sm:text-sm font-medium">Cinematic 4K Storytelling</span>
                 </div>
                 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-rose-700 p-3 sm:p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-center sm:text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0"><CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                    <span className="text-[10px] sm:text-sm font-medium">Full-Day Coverage</span>
                 </div>
               </>
             ) : (
               <>
                 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-gray-400 p-3 sm:p-4 glass-card rounded-2xl border border-white/10 text-center sm:text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0 text-red-500"><Film className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                    <span className="text-[10px] sm:text-sm font-medium">Professional Production</span>
                 </div>
                 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-gray-400 p-3 sm:p-4 glass-card rounded-2xl border border-white/10 text-center sm:text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0 text-red-500"><History className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                    <span className="text-[10px] sm:text-sm font-medium">Legacy Preserved</span>
                 </div>
               </>
             )}
          </div>
          {(isPocketopia || isTwizted) && (
            <div className="space-y-4 pt-4">
              <h4 className="font-futuristic text-xs uppercase tracking-widest text-red-500">Select {isTwizted ? 'Project' : 'App'} Type</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {interestOptions.map(option => (
                  <button key={option} onClick={() => isTwizted ? setSelectedInterest(option) : setSelectedAppType(option)} className={`text-left px-4 py-3 rounded-xl text-xs transition-all border flex items-center justify-between ${(isTwizted ? selectedInterest : selectedAppType) === option ? 'border-red-600 bg-red-600/10 text-white' : 'border-white/10 hover:border-white/30 text-gray-400'}`}>
                    {option}
                    {(isTwizted ? selectedInterest : selectedAppType) === option && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
           <CalendarComponent />
           {isPocketopia && <PocketopiaAI />}
        </div>
      </div>
    </div>
  );

  const VideoTrailerScreen = ({ title }: { title?: string }) => {
    // Priority: custom uploaded video > department-specific defaults
    const customVideo = brand.videoUrl;

    const youtubeInfo = useMemo(() => {
      if (!customVideo) return null;
      console.log("BrandModal: Parsing video URL:", customVideo);
      
      // Robust YouTube ID extraction
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = customVideo.match(regExp);
      const videoId = (match && match[7].length === 11) ? match[7] : null;
      
      if (videoId) {
        console.log("BrandModal: Extracted YouTube ID:", videoId);
        return {
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
      }
      
      // Fallback for direct video files or other links
      console.log("BrandModal: Not a standard YouTube link or ID not found");
      return null;
    }, [customVideo]);

    const thumbUrl = brand.videoThumbnailUrl || youtubeInfo?.thumbnailUrl || (isWedding ? "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200" : isTwizted ? "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200" : brand.imageUrl || '');

    return (
      <div className={`relative aspect-video lg:aspect-auto w-full h-full rounded-[0.75rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border sm:border-4 border-white/10 group cursor-pointer ${isWedding || isTwizted || isHekticStudios ? 'min-h-[200px] sm:min-h-[400px]' : 'min-h-[110px] sm:min-h-[400px]'}`}>
        {!isPlaying ? (
          <div onClick={() => customVideo && setIsPlaying(true)} className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
             <div className={`bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-white/30 ${isWedding || isTwizted || isHekticStudios ? 'w-10 h-10 sm:w-20 sm:h-20' : 'w-7 h-7 sm:w-20 sm:h-20'}`}>
                <PlayCircle className={`${isWedding || isTwizted || isHekticStudios ? 'w-6 h-6 sm:w-12 sm:h-12' : 'w-4 h-4 sm:w-12 sm:h-12'} text-white`} />
             </div>
          </div>
        ) : null}
        
        {customVideo && isPlaying ? (
          youtubeInfo?.embedUrl ? (
            <iframe 
              src={youtubeInfo.embedUrl} 
              className="w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen 
            />
          ) : (
            <video src={customVideo} className="w-full h-full object-cover" controls autoPlay />
          )
        ) : (
          <img src={thumbUrl} alt={`${brand.name} Trailer`} className="w-full h-full object-cover" />
        )}
      </div>
    );
  };

  const EPKScreen = () => (
    <div className="max-w-5xl mx-auto space-y-12 py-10 px-4 sm:px-10">
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
        <div className="w-full md:w-1/3 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-red-600/20">
          {brand.imageUrl && <img src={brand.imageUrl} alt={brand.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
        </div>
        <div className="w-full md:w-2/3 space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('details')} className="p-2 rounded-full glass-card hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="font-futuristic font-black text-4xl sm:text-6xl uppercase tracking-tighter italic">Band EPK</h2>
          </div>
          <p className="text-xl text-gray-300 font-light leading-relaxed">{brand.longDescription}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Genre</span>
              <p className="font-bold">Industrial Metal</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Origin</span>
              <p className="font-bold">Hektic Hub</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Status</span>
              <p className="font-bold">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="font-futuristic text-2xl font-black uppercase tracking-widest border-l-4 border-red-600 pl-4">Latest Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group cursor-pointer relative">
            <PlayCircle className="w-16 h-16 text-white/20 group-hover:text-red-600 group-hover:scale-110 transition-all" />
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group cursor-pointer relative">
            <Headphones className="w-16 h-16 text-white/20 group-hover:text-red-600 group-hover:scale-110 transition-all" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-white/10">
        <div className="space-y-6">
          <h3 className="font-futuristic text-xl font-black uppercase tracking-widest">Press Contact</h3>
          <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Management</p>
                <p className="font-bold">management@hektichub.com</p>
              </div>
            </div>
            <button onClick={() => setView('inquiry')} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all uppercase tracking-widest text-sm">
              Book the Band
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="font-futuristic text-xl font-black uppercase tracking-widest">Social Presence</h3>
          <div className="flex gap-4">
            {['Instagram', 'Twitter', 'Spotify', 'YouTube'].map(social => (
              <button key={social} className="w-12 h-12 glass-card rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10">
                <ExternalLink className="w-5 h-5" />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 italic">"Cryptamnesia is not just a band, it's a sonic assault on the senses." - Hektic Hub Daily</p>
        </div>
      </div>
    </div>
  );

  const themeClasses = isWedding ? "wedding-bg text-rose-900" : "bg-black/90 text-white";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${isWedding ? 'p-0 sm:p-4' : 'p-2 sm:p-4'}`}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={handleClose} />
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-black/90 border border-red-600/50 rounded-2xl px-8 py-5 flex items-center gap-4 shadow-[0_0_30px_rgba(220,38,38,0.3)] backdrop-blur-xl max-w-md w-full">
           <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse"><Bell className="w-6 h-6 text-white" /></div>
           <div>
             <h4 className="font-futuristic text-xs font-black uppercase text-red-500 mb-1">{toastMessage.title}</h4>
             <p className="text-sm text-gray-200 font-light leading-snug">{toastMessage.body}</p>
           </div>
        </div>
      </div>
      
      <div className={`relative w-full transition-transform duration-500 shadow-2xl ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'} ${themeClasses} no-scrollbar ${isWedding ? 'h-full sm:h-auto sm:max-h-[95vh] sm:max-w-6xl sm:rounded-[3rem] sm:border overflow-y-auto' : 'max-w-6xl max-h-[95vh] rounded-[1.25rem] sm:rounded-[3rem] border overflow-y-auto'}`} style={{ borderColor: isWedding ? '#fecaca' : `${brand.theme.accent}33` }}>
        <button onClick={handleClose} className={`absolute z-30 p-2 sm:p-3 rounded-full transition-all duration-300 hover:rotate-90 ${isWedding ? 'top-4 right-4 bg-rose-100 hover:bg-rose-200 text-rose-900 shadow-md' : 'top-2 right-2 sm:top-8 sm:right-8 glass-card hover:bg-white/10 text-white'}`}>
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className={`${(isWedding || isPocketopia || isTwizted || isDarkus || isHekticStudios || isInnovationMedia || isCryptamnesia || isPhantasphere || isHekticTV || isArchaven || isMVN || isHekticNation) && view === 'details' ? 'p-0 pt-10 sm:p-12 lg:p-20' : 'p-2 sm:p-12 lg:p-20'}`}>
          {view === 'details' ? (
            <div className={`max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-0 sm:space-y-12 ${!isWedding && !isPocketopia && !isTwizted && !isDarkus && !isHekticStudios && !isInnovationMedia && !isCryptamnesia && !isPhantasphere && !isHekticTV && !isArchaven && !isMVN && !isHekticNation ? 'grid lg:grid-cols-2 gap-8 sm:gap-16 items-center' : ''}`}>
              {!isDarkus && !isPocketopia && !isInnovationMedia && !isPhantasphere && !isHekticTV && !isArchaven && !isMVN && !isHekticNation && (isBandWars || isWedding || isTwizted || isHekticStudios || brand.videoUrl) && (
                <div className="w-full mb-6 sm:mb-8">
                  <VideoTrailerScreen title={isWedding ? "The 2025 Wedding Reel" : isTwizted ? "The Twizted Cinema Reel" : isHekticStudios ? "Hektic Studios Projects" : `${brand.name} Reel`} />
                </div>
              )}
              {isHekticNation && (
                <div className="w-full mb-6 sm:mb-8">
                  <VideoTrailerScreen title="Hektic Nation Reel" />
                </div>
              )}
              {!isDarkus && !isPocketopia && !isInnovationMedia && !isPhantasphere && !isHekticTV && !isArchaven && !isMVN && !isHekticNation && !(isBandWars || isWedding || isTwizted || isHekticStudios || brand.videoUrl) && brand.imageUrl && (
                <div className="relative rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl transform transition-transform duration-700 hover:scale-[1.02] w-full max-w-lg mb-6 sm:mb-8">
                  <img src={brand.imageUrl} alt={brand.name} className="w-full aspect-[4/5] lg:aspect-auto h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div className={`${(isWedding || isPocketopia || isTwizted || isDarkus || isHekticStudios || isInnovationMedia || isCryptamnesia) ? 'space-y-6 sm:space-y-10 pb-16 sm:pb-0 px-4' : 'space-y-6 sm:space-y-8 text-center'}`}>
                <div className="flex flex-col items-center">
                  <span className={`inline-block px-3 py-1 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-2 sm:mb-6 font-futuristic ${isWedding ? 'bg-rose-600 text-white shadow-lg' : ''}`} style={!isWedding ? { backgroundColor: brand.theme.accent, color: isLightAccent ? '#000' : '#fff' } : {}}>{brand.category}</span>
                  <h2 className={`mb-2 sm:mb-6 tracking-tight leading-tight ${isWedding ? 'font-romantic italic font-normal text-xl sm:text-4xl md:text-5xl lg:text-6xl' : isChurchOrion ? 'font-futuristic font-black text-lg sm:text-3xl md:text-4xl lg:text-5xl' : 'font-futuristic font-black text-xl sm:text-6xl'}`}>{brand.name}</h2>
                  <div className={`h-0.5 sm:h-1.5 mb-3 sm:mb-10 rounded-full ${isWedding ? 'bg-rose-300 w-20 sm:w-32' : 'w-12 sm:w-32 mx-auto'}`} style={!isWedding ? { backgroundColor: brand.theme.accent } : {}} />
                  <p className={`text-[14px] sm:text-xl leading-relaxed ${isWedding ? 'font-romantic text-rose-800 italic max-w-xl mx-auto px-2' : 'text-gray-300 font-light'}`}>{brand.longDescription || brand.description}</p>
                </div>

                {isWedding && brand.packagesImageUrl && (
                  <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in">
                    <div className="bg-rose-50/50 rounded-3xl p-4 border border-rose-100 shadow-xl">
                      <h4 className="font-romantic italic text-rose-900 text-xl mb-4 text-center">Our Package Tiers</h4>
                      <div className="rounded-2xl overflow-hidden border border-rose-100 shadow-inner">
                        <img src={brand.packagesImageUrl} alt="Wedding Packages" className="w-full h-auto" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 sm:gap-6 pt-2 sm:pt-6 justify-center">
                  {brand.links.map((link, idx) => (
                    <button key={idx} onClick={() => { 
                      if ((isWedding || isPocketopia || isTwizted) && (link.label.includes('Inquire') || link.label.includes('Book'))) setView('inquiry'); 
                      else if (isPocketopia && link.label.includes('See my Demo')) setView('demo');
                      else if (link.label.includes('EPK')) setView('epk');
                      else if (link.label.includes('Join the waiting list') || link.label.includes('Join mailing list')) setView('waitlist');
                      else if (link.label.includes('Get Pitchdeck')) setView('pitchdeck');
                      else if (isChurchOrion || link.label.toLowerCase().includes('coming soon')) {
                        setToastMessage({ title: 'Coming Soon', body: `${link.label} is currently under construction. Please check back later!` });
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                      }
                      else if (link.url !== '#') window.open(link.url, '_blank'); 
                    }} className={`flex items-center px-6 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-bold transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl active:scale-95 ${isWedding ? 'bg-rose-600 text-white shadow-lg hover:bg-rose-700' : link.type === 'primary' ? 'shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'glass-card border-2 border-white/20 hover:border-white/60 text-white'}`} style={!isWedding && link.type === 'primary' ? { backgroundColor: brand.theme.accent, color: isLightAccent ? '#000' : '#fff' } : {}}>
                      {getLinkIcon(link.label, link.type)}
                      <span className={isWedding ? 'font-romantic text-lg sm:text-xl' : 'text-[11px] sm:text-base'}>{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : view === 'epk' ? (
            <EPKScreen />
          ) : view === 'inquiry' ? (
            <InquiryScreen />
          ) : view === 'waitlist' ? (
            <WaitlistScreen />
          ) : view === 'pitchdeck' ? (
            <PitchdeckScreen />
          ) : view === 'demo' ? (
            <DemoScreen />
          ) : view === 'portfolio' ? (
            <div /> 
          ) : (
            <SuccessScreen />
          )}
        </div>
      </div>
    </div>
  );
};
