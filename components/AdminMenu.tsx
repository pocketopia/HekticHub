
import React, { useState, useRef, useEffect } from 'react';
import { Brand } from '../types';
import { BRANDS } from '../constants';
import { X, Upload, Save, Image as ImageIcon, Video, Trash2, Shield, Loader2, FileUp, List, Mail, Calendar, Plus, Search, MessageSquare, Clock, Bell } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    providerInfo: any[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

interface Inquiry {
  id: string;
  email: string;
  brandId?: string;
  brandName?: string;
  companyName?: string;
  message?: string;
  type: 'waitlist' | 'quote' | 'inquiry';
  date?: number;
  time?: string;
  interest?: string;
  appType?: string;
  createdAt: any;
}

interface AppTemplate {
  id: string;
  companyName: string;
  imageUrl: string;
  createdAt: any;
}

interface AdminMenuProps {
  brands: Brand[];
  onUpdateBrands: (updatedBrands: Brand[]) => void;
  onClose: () => void;
  isUserMode?: boolean;
  user: User | null;
  isAuthReady: boolean;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ brands, onUpdateBrands, onClose, isUserMode = false, user, isAuthReady }) => {
  console.log("AdminMenu rendering. User:", user?.email, "isAuthReady:", isAuthReady);
  const [activeTab, setActiveTab] = useState<'assets' | 'mail' | 'templates'>(isUserMode ? 'templates' : 'assets');
  const [editingBrands, setEditingBrands] = useState<Brand[]>(brands);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [templates, setTemplates] = useState<AppTemplate[]>([]);
  const [selectedMailbox, setSelectedMailbox] = useState<'all' | 'twizted' | 'wedding' | 'pocketopia' | 'acropolis'>('all');
  const [isLoadingMail, setIsLoadingMail] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  
  // Sync editingBrands with brands prop when not modified
  useEffect(() => {
    if (!isModified && !processingId) {
      console.log("AdminMenu: Syncing editingBrands with brands prop");
      setEditingBrands(brands);
    }
  }, [brands, isModified, processingId]);

  // Debug user state
  useEffect(() => {
    console.log("AdminMenu: User state updated:", user?.email);
  }, [user]);

  // Sync with parent brands prop if it changes (e.g. from Firestore)
  // but only if we haven't made local modifications yet
  useEffect(() => {
    if (!isModified && !processingId) {
      console.log("AdminMenu: Syncing editingBrands with brands prop. Brands count:", brands.length);
      // Log some brand videoUrls to check
      const hektic = brands.find(b => b.id === 'hektic-studios');
      if (hektic) console.log("AdminMenu: Hektic Studios videoUrl in brands prop:", hektic.videoUrl);
      setEditingBrands([...brands]);
    } else {
      console.log("AdminMenu: Skipping sync with brands prop. isModified:", isModified, "processingId:", processingId);
    }
  }, [brands, isModified, processingId]);

  // Template Form State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateImage, setNewTemplateImage] = useState('');
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'mail') {
      setIsLoadingMail(true);
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Inquiry[];
        setInquiries(entries);
        setIsLoadingMail(false);
      }, (error) => {
        console.error("Error fetching inquiries:", error);
        setIsLoadingMail(false);
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'templates') {
      setIsLoadingTemplates(true);
      const q = query(collection(db, 'appTemplates'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AppTemplate[];
        setTemplates(entries);
        setIsLoadingTemplates(false);
      }, (error) => {
        console.error("Error fetching templates:", error);
        setIsLoadingTemplates(false);
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (id: string, field: 'imageUrl' | 'videoThumbnailUrl' | 'packagesImageUrl', file: File | null, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!file) return;
    
    console.log(`Starting upload for ${id} - ${field}. File size: ${file.size} bytes`);

    // Limit to ~700KB to ensure it fits in Firestore (1MB limit including base64 overhead)
    if (file.size > 700 * 1024) {
      alert("FILE TOO LARGE: Please use an image under 700KB for cloud sync. Larger files will fail to save to the database.");
      // Reset input
      if (event.target) event.target.value = '';
      return;
    }

    setProcessingId(`${id}-${field}`);
    setIsModified(true); // Set modified immediately when we start an upload
    try {
      let base64 = await fileToBase64(file);
      console.log(`File converted to base64 successfully for ${id}-${field}. Length: ${base64.length}`);
      
      let brandToSave: Brand | undefined;
      const updatedAllBrands = editingBrands.map(b => {
        if (b.id === id) {
          console.log(`Updating local state for brand: ${id} with new ${field}`);
          brandToSave = { ...b, [field]: base64 };
          return brandToSave;
        }
        return b;
      });

      setEditingBrands(updatedAllBrands);
      
      // Auto-save to Firestore after state update
      if (brandToSave) {
        handleSaveBrand(brandToSave, updatedAllBrands);
      }
      
      // Reset input so the same file can be selected again if needed
      if (event.target) event.target.value = '';
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to process file. It might be corrupted or too large for the browser to handle.");
      // Don't reset isModified here, as there might be other changes
    } finally {
      console.log(`Finished processing upload for ${id}-${field}`);
      setProcessingId(null);
    }
  };

  const handleSaveBrand = async (updatedBrand: Brand, allBrands: Brand[]) => {
    if (!user || user.email !== 'orchestraofdeath@gmail.com' || !user.emailVerified) {
      console.warn("Save skipped: User not authorized or verified");
      return;
    }

    setProcessingId(`saving-${updatedBrand.id}`);
    try {
      console.log(`Saving assets for brand: ${updatedBrand.id} to Firestore (split format)...`);
      
      // Fields to save individually to avoid 1MB document limit
      const fields = ['imageUrl', 'videoUrl', 'videoThumbnailUrl', 'packagesImageUrl', 'description', 'longDescription', 'links'] as const;
      
      const savePromises = fields.map(field => {
        const value = updatedBrand[field];
        // We save even if null/undefined to ensure deletions are synced
        return setDoc(doc(db, 'assets', `${updatedBrand.id}_${field}`), {
          value: value || null,
          brandId: updatedBrand.id,
          updatedAt: serverTimestamp()
        });
      });

      await Promise.all(savePromises);
      console.log(`Successfully saved all asset fields for brand: ${updatedBrand.id}`);
      
      // Update parent state to reflect the change immediately
      onUpdateBrands(allBrands);
      setIsModified(false); // Reset modified state after successful auto-save
    } catch (err) {
      console.error(`Failed to save brand ${updatedBrand.id}:`, err);
      handleFirestoreError(err, OperationType.WRITE, `assets/${updatedBrand.id}_*`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSave = async () => {
    console.log("AdminMenu: handleSave called. User:", user?.email, "Verified:", user?.emailVerified);
    if (!user) {
      alert("You must be logged in with an authorized account to save changes. Click the 'Login for Cloud Sync' button above.");
      return;
    }

    if (user.email !== 'orchestraofdeath@gmail.com') {
      alert(`Unauthorized account: ${user.email}. Please login with orchestraofdeath@gmail.com to save changes.`);
      return;
    }

    setProcessingId('saving-all');
    try {
      console.log("Starting cloud sync for all brands (split format). Current editingBrands count:", editingBrands.length);
      const fields = ['imageUrl', 'videoUrl', 'videoThumbnailUrl', 'packagesImageUrl', 'description', 'longDescription', 'links'] as const;
      const allPromises: Promise<void>[] = [];

      for (const brand of editingBrands) {
        for (const field of fields) {
          const value = brand[field];
          allPromises.push(
            setDoc(doc(db, 'assets', `${brand.id}_${field}`), {
              value: value || null,
              brandId: brand.id,
              updatedAt: serverTimestamp()
            })
          );
        }
      }

      await Promise.all(allPromises);
      console.log("All brands saved to Firestore successfully.");
      
      onUpdateBrands(editingBrands);
      setIsModified(false); // Reset modified state after successful save
      alert("SUCCESS: All assets have been synced to the Cloud Uplink.");
      onClose();
    } catch (error) {
      console.error("Failed to save assets:", error);
      alert("ERROR: Failed to save assets to the cloud. This is usually due to permission issues or file size limits (1MB per asset). Ensure you are logged in as orchestraofdeath@gmail.com and your email is verified.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("AdminMenu: handleGoogleLogin called");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("AdminMenu: Login successful. User:", result.user.email);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  const showToast = (title: string, body: string) => {
    setToast({ title, body });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetBrand = async (brandId: string) => {
    // Using a simpler confirmation for now to avoid window.confirm in iframe
    const confirmed = window.confirm("Are you sure you want to reset this brand to its default settings? This will delete all custom images and content from the cloud.");
    if (!confirmed) return;
    
    setProcessingId(`reset-${brandId}`);
    try {
      const fields = ['imageUrl', 'videoUrl', 'videoThumbnailUrl', 'packagesImageUrl', 'description', 'longDescription', 'links'] as const;
      const deletePromises = fields.map(field => deleteDoc(doc(db, 'assets', `${brandId}_${field}`)));
      
      await Promise.all(deletePromises);
      console.log(`Successfully reset brand: ${brandId}`);
      
      setIsModified(false);
      showToast("Reset Complete", "Brand has been reset to defaults.");
    } catch (err) {
      console.error(`Failed to reset brand ${brandId}:`, err);
      showToast("Reset Failed", "Check console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (selectedMailbox === 'all') return true;
    if (selectedMailbox === 'twizted') return inquiry.brandId === 'twizted-images';
    if (selectedMailbox === 'wedding') return inquiry.brandId === 'premiere-weddings';
    if (selectedMailbox === 'pocketopia') return inquiry.brandId === 'pocketopia';
    if (selectedMailbox === 'acropolis') return inquiry.brandId === 'acropolis-apparel';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-fade-in">
          <div className="bg-black/90 border border-red-600/50 rounded-2xl px-8 py-5 flex items-center gap-4 shadow-[0_0_30px_rgba(220,38,38,0.3)] backdrop-blur-xl max-w-md w-full">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-futuristic text-[10px] font-black uppercase text-red-500 mb-1">{toast.title}</h4>
              <p className="text-xs text-gray-200 font-light leading-snug">{toast.body}</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-2xl h-full bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-red-600/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-futuristic text-xl font-black uppercase tracking-widest text-white">
                {isUserMode ? 'Template Archive' : 'Central Command'}
              </h2>
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">
                {user ? `Logged in as ${user.email}` : 'System Operations'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isUserMode && !user && isAuthReady && (
              <button 
                onClick={handleGoogleLogin}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-futuristic font-bold uppercase tracking-widest text-white transition-all"
              >
                Login for Cloud Sync
              </button>
            )}
            {!isUserMode && !isAuthReady && (
              <div className="px-3 py-1.5 bg-white/5 rounded-lg text-[8px] font-futuristic font-bold uppercase tracking-widest text-gray-500 animate-pulse">
                Checking Auth...
              </div>
            )}
            {user && !isUserMode && (
              <button 
                onClick={() => signOut(auth)}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-[8px] font-futuristic font-bold uppercase tracking-widest text-red-500 transition-all"
              >
                Logout
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {!isUserMode && (
          <div className="flex border-b border-white/10">
            <button 
              onClick={() => setActiveTab('assets')}
              className={`flex-1 py-4 text-[10px] font-futuristic font-bold uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-gray-500 hover:text-white'}`}
            >
              Asset Uplink
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-4 text-[10px] font-futuristic font-bold uppercase tracking-widest transition-all ${activeTab === 'templates' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-gray-500 hover:text-white'}`}
            >
              App Templates
            </button>
            <button 
              onClick={() => setActiveTab('mail')}
              className={`flex-1 py-4 text-[10px] font-futuristic font-bold uppercase tracking-widest transition-all ${activeTab === 'mail' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-gray-500 hover:text-white'}`}
            >
              Mail
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {activeTab === 'assets' && !isUserMode ? (
            <>
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl mb-4">
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-relaxed">
                  Notice: Custom assets are now synced to the Cloud Uplink (Firestore). For best performance, keep image files under 1MB. For videos, use YouTube or Vimeo links for optimal streaming.
                </p>
              </div>

              {editingBrands.map(brand => (
                <div key={brand.id} className="glass-card rounded-2xl border border-white/5 p-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-futuristic text-sm font-bold uppercase text-white truncate max-w-[250px]">{brand.name}</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleResetBrand(brand.id)}
                        className="p-1.5 bg-white/5 hover:bg-red-600/20 rounded-lg text-gray-500 hover:text-red-500 transition-all group/reset"
                        title="Reset to Defaults"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">{brand.category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Section */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-futuristic text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-3 h-3 text-red-500" /> Hero Image
                      </label>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black group">
                        <img src={brand.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          {processingId === `${brand.id}-imageUrl` ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <>
                              <FileUp className="w-6 h-6 text-white mb-2" />
                              <span className="text-[8px] font-bold text-white uppercase tracking-widest">Replace Photo</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(brand.id, 'imageUrl', e.target.files?.[0] || null, e)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Video Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-futuristic text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Video className="w-3 h-3 text-red-500" /> Video URL (YouTube/Vimeo)
                        </label>
                        <div className="relative">
                          <input 
                            type="text"
                            value={brand.videoUrl || ''}
                            onChange={(e) => {
                              setEditingBrands(prev => prev.map(b => b.id === brand.id ? { ...b, videoUrl: e.target.value } : b));
                              setIsModified(true);
                            }}
                            onBlur={() => {
                              const originalBrand = brands.find(b => b.id === brand.id);
                              if (brand.videoUrl !== originalBrand?.videoUrl) {
                                handleSaveBrand(brand, editingBrands);
                              }
                            }}
                            placeholder="https://youtu.be/..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 pr-10 text-[10px] text-white font-mono focus:outline-none focus:border-red-500 transition-all"
                          />
                          {processingId === `saving-${brand.id}` && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="w-3 h-3 text-red-500 animate-spin" />
                            </div>
                          )}
                          {brand.videoUrl && (
                            <button 
                              onClick={() => {
                                const updatedBrand = { ...brand, videoUrl: '' };
                                const updatedAllBrands = editingBrands.map(b => b.id === brand.id ? updatedBrand : b);
                                setEditingBrands(updatedAllBrands);
                                setIsModified(true);
                                handleSaveBrand(updatedBrand, updatedAllBrands);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-futuristic text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon className="w-3 h-3 text-red-500" /> Video Thumbnail
                        </label>
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black group">
                          {brand.videoThumbnailUrl ? (
                            <img src={brand.videoThumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <ImageIcon className="w-8 h-8 opacity-20" />
                            </div>
                          )}
                          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-2">
                            {processingId === `${brand.id}-videoThumbnailUrl` ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-white mb-2" />
                                <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                                  {brand.videoThumbnailUrl ? 'Replace Thumbnail' : 'Upload Thumbnail'}
                                </span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(brand.id, 'videoThumbnailUrl', e.target.files?.[0] || null, e)}
                            />
                          </label>
                          {brand.videoThumbnailUrl && (
                            <button 
                              onClick={() => {
                                const updatedBrand = { ...brand, videoThumbnailUrl: undefined };
                                const updatedAllBrands = editingBrands.map(b => b.id === brand.id ? updatedBrand : b);
                                setEditingBrands(updatedAllBrands);
                                setIsModified(true);
                                handleSaveBrand(updatedBrand, updatedAllBrands);
                              }}
                              className="absolute bottom-2 right-2 p-1.5 bg-red-600/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="pt-6 border-t border-white/5 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-futuristic text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-red-500" /> Short Description
                      </label>
                      <input 
                        type="text"
                        value={brand.description || ''}
                        onChange={(e) => {
                          setEditingBrands(prev => prev.map(b => b.id === brand.id ? { ...b, description: e.target.value } : b));
                          setIsModified(true);
                        }}
                        onBlur={() => {
                          const originalBrand = brands.find(b => b.id === brand.id);
                          if (brand.description !== originalBrand?.description) {
                            handleSaveBrand(brand, editingBrands);
                          }
                        }}
                        placeholder="Short tagline for the card..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-light focus:outline-none focus:border-red-500 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-futuristic text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-red-500" /> Long Description
                      </label>
                      <textarea 
                        value={brand.longDescription || ''}
                        onChange={(e) => {
                          setEditingBrands(prev => prev.map(b => b.id === brand.id ? { ...b, longDescription: e.target.value } : b));
                          setIsModified(true);
                        }}
                        onBlur={() => {
                          const originalBrand = brands.find(b => b.id === brand.id);
                          if (brand.longDescription !== originalBrand?.longDescription) {
                            handleSaveBrand(brand, editingBrands);
                          }
                        }}
                        placeholder="Detailed description for the modal..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-light leading-relaxed min-h-[100px] focus:outline-none focus:border-red-500 transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-futuristic text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <List className="w-3 h-3 text-red-500" /> Links & Buttons
                      </label>
                      <div className="space-y-2">
                        {brand.links.map((link, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input 
                              type="text"
                              value={link.label}
                              onChange={(e) => {
                                const newLinks = [...brand.links];
                                newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                setEditingBrands(prev => prev.map(b => b.id === brand.id ? { ...b, links: newLinks } : b));
                                setIsModified(true);
                              }}
                              placeholder="Label"
                              className="flex-[1] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white focus:outline-none focus:border-red-500"
                            />
                            <input 
                              type="text"
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...brand.links];
                                newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                setEditingBrands(prev => prev.map(b => b.id === brand.id ? { ...b, links: newLinks } : b));
                                setIsModified(true);
                              }}
                              placeholder="URL"
                              className="flex-[2] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white font-mono focus:outline-none focus:border-red-500"
                            />
                            <select 
                              value={link.type}
                              onChange={(e) => {
                                const newLinks = [...brand.links];
                                newLinks[idx] = { ...newLinks[idx], type: e.target.value as any };
                                setEditingBrands(prev => prev.map(b => b.id === brand.id ? { ...b, links: newLinks } : b));
                                setIsModified(true);
                              }}
                              className="flex-[1] bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[8px] text-white uppercase font-bold focus:outline-none focus:border-red-500"
                            >
                              <option value="primary">Primary</option>
                              <option value="secondary">Secondary</option>
                              <option value="video">Video</option>
                              <option value="store">Store</option>
                            </select>
                            <button 
                              onClick={() => {
                                const newLinks = brand.links.filter((_, i) => i !== idx);
                                const updatedBrand = { ...brand, links: newLinks };
                                const updatedAllBrands = editingBrands.map(b => b.id === brand.id ? updatedBrand : b);
                                setEditingBrands(updatedAllBrands);
                                setIsModified(true);
                                handleSaveBrand(updatedBrand, updatedAllBrands);
                              }}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newLinks = [...brand.links, { label: 'New Link', url: '', type: 'primary' as const }];
                            const updatedBrand = { ...brand, links: newLinks };
                            const updatedAllBrands = editingBrands.map(b => b.id === brand.id ? updatedBrand : b);
                            setEditingBrands(updatedAllBrands);
                            setIsModified(true);
                            handleSaveBrand(updatedBrand, updatedAllBrands);
                          }}
                          className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[8px] font-futuristic font-bold uppercase tracking-widest text-gray-500 hover:text-red-500 hover:border-red-500/50 transition-all"
                        >
                          + Add Link
                        </button>
                      </div>
                    </div>
                  </div>

                  {brand.id === 'premiere-weddings' && (
                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <label className="text-[10px] font-futuristic text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-3 h-3 text-red-500" /> Package Tiers Image (Wedding Only)
                      </label>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black group max-w-md">
                        {brand.packagesImageUrl ? (
                          <img src={brand.packagesImageUrl} alt="packages" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                          </div>
                        )}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-2">
                          {processingId === `${brand.id}-packagesImageUrl` ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-white mb-2" />
                              <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                                {brand.packagesImageUrl ? 'Replace Packages Image' : 'Upload Packages Image'}
                              </span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(brand.id, 'packagesImageUrl', e.target.files?.[0] || null, e)}
                          />
                        </label>
                        {brand.packagesImageUrl && (
                          <button 
                            onClick={() => {
                              const updatedBrand = { ...brand, packagesImageUrl: undefined };
                              const updatedAllBrands = editingBrands.map(b => b.id === brand.id ? updatedBrand : b);
                              setEditingBrands(updatedAllBrands);
                              setIsModified(true);
                              handleSaveBrand(updatedBrand, updatedAllBrands);
                            }}
                            className="absolute bottom-2 right-2 p-1.5 bg-red-600/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : activeTab === 'templates' ? (
            <div className="space-y-8">
              {!isUserMode && (
                <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4">
                  <h3 className="font-futuristic text-sm font-bold uppercase text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-red-500" /> Add New Template
                  </h3>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Company Name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-futuristic focus:outline-none focus:border-red-500 transition-all"
                    />
                    <div className="flex gap-4">
                      <div className="flex-1 relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black group">
                        {newTemplateImage ? (
                          <img src={newTemplateImage} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                          </div>
                        )}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <FileUp className="w-6 h-6 text-white mb-2" />
                          <span className="text-[8px] font-bold text-white uppercase tracking-widest">Upload Image</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const base64 = await fileToBase64(file);
                                setNewTemplateImage(base64);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <button 
                        onClick={async () => {
                          if (!newTemplateName || !newTemplateImage) return;
                          setIsAddingTemplate(true);
                          try {
                            await addDoc(collection(db, 'appTemplates'), {
                              companyName: newTemplateName,
                              imageUrl: newTemplateImage,
                              createdAt: serverTimestamp()
                            });
                            setNewTemplateName('');
                            setNewTemplateImage('');
                          } catch (err) {
                            console.error("Add template error:", err);
                          } finally {
                            setIsAddingTemplate(false);
                          }
                        }}
                        disabled={isAddingTemplate || !newTemplateName || !newTemplateImage}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-xl font-bold font-futuristic uppercase text-[10px] tracking-widest disabled:opacity-50 transition-all"
                      >
                        {isAddingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-futuristic text-sm font-bold uppercase text-white flex items-center gap-2">
                  <List className="w-4 h-4 text-red-500" /> {isUserMode ? 'Available Templates' : 'Existing Templates'}
                </h3>
                {isLoadingTemplates ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  </div>
                ) : templates.length === 0 ? (
                  <p className="text-[10px] font-futuristic text-gray-500 uppercase tracking-widest text-center py-10 glass-card rounded-2xl border border-white/5">No templates available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {templates.map(template => (
                      <div key={template.id} className="glass-card rounded-xl border border-white/5 p-4 flex items-center gap-4 group hover:border-red-500/30 transition-all">
                        <div className="w-20 aspect-video rounded-lg overflow-hidden border border-white/10">
                          <img src={template.imageUrl} alt={template.companyName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-futuristic text-xs font-bold uppercase">{template.companyName}</h4>
                          {!isUserMode && <p className="text-[8px] text-gray-500 font-mono uppercase">ID: {template.id}</p>}
                        </div>
                        {!isUserMode && (
                          <button 
                            onClick={async () => {
                              if (confirm(`Delete template for ${template.companyName}?`)) {
                                await deleteDoc(doc(db, 'appTemplates', template.id));
                              }
                            }}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'mail' && !isUserMode ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="font-futuristic text-sm font-bold uppercase text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-500" /> Incoming Transmissions
                </h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                  {(['all', 'twizted', 'wedding', 'pocketopia', 'acropolis'] as const).map(box => (
                    <button
                      key={box}
                      onClick={() => setSelectedMailbox(box)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[8px] font-futuristic font-bold uppercase tracking-widest transition-all border ${selectedMailbox === box ? 'bg-red-600 border-red-600 text-white' : 'glass-card border-white/10 text-gray-500 hover:text-white'}`}
                    >
                      {box === 'all' ? 'All' : box === 'twizted' ? 'Twizted' : box === 'wedding' ? 'Weddings' : box === 'pocketopia' ? 'Pocketopia' : 'Acropolis'}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingMail ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  <p className="text-[10px] font-futuristic text-gray-500 uppercase tracking-widest">Accessing Secure Database...</p>
                </div>
              ) : filteredInquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 glass-card rounded-2xl border border-white/5">
                  <Mail className="w-12 h-12 text-gray-700" />
                  <p className="text-[10px] font-futuristic text-gray-500 uppercase tracking-widest">No transmissions in this mailbox.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInquiries.map(entry => (
                    <div key={entry.id} className="glass-card rounded-xl border border-white/5 p-4 space-y-3 group hover:border-red-500/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${entry.type === 'waitlist' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                            {entry.type === 'waitlist' ? <List className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                          </div>
                          <span className="text-xs font-bold text-white">{entry.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] font-mono text-gray-500 uppercase">
                          <Calendar className="w-2 h-2" />
                          {entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                      
                      <div className="pl-9 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[8px] font-futuristic text-red-500 uppercase tracking-widest">Type: {entry.type}</span>
                          {entry.brandName && (
                            <span className="text-[8px] font-futuristic text-gray-500 uppercase tracking-widest">Brand: {entry.brandName}</span>
                          )}
                          {entry.companyName && (
                            <span className="text-[8px] font-futuristic text-gray-500 uppercase tracking-widest">Company: {entry.companyName}</span>
                          )}
                        </div>
                        
                        {(entry.date || entry.time) && (
                          <div className="flex items-center gap-3 bg-red-600/5 p-2 rounded-lg border border-red-600/10">
                            <div className="flex items-center gap-1 text-[9px] font-bold text-white uppercase tracking-tighter">
                              <Calendar className="w-3 h-3 text-red-500" />
                              June {entry.date}, 2025
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-white uppercase tracking-tighter">
                              <Clock className="w-3 h-3 text-red-500" />
                              {entry.time}
                            </div>
                          </div>
                        )}

                        {(entry.interest || entry.appType) && (
                          <div className="text-[9px] font-futuristic text-red-500 font-bold uppercase tracking-widest pl-1">
                            Focus: {entry.interest || entry.appType}
                          </div>
                        )}

                        {entry.message && (
                          <p className="text-[10px] text-gray-400 font-light leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5 italic">
                            "{entry.message}"
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <button 
                          onClick={async () => {
                            if (confirm('Delete this inquiry?')) {
                              await deleteDoc(doc(db, 'inquiries', entry.id));
                            }
                          }}
                          className="p-1 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="p-6 border-t border-white/10 bg-black">
          {isUserMode ? (
            <div className="text-center">
              <p className="text-[8px] font-futuristic text-gray-600 uppercase tracking-widest">
                Viewing public template archive. Contact admin for custom development.
              </p>
            </div>
          ) : activeTab === 'assets' ? (
            <button 
              onClick={handleSave}
              disabled={!!processingId}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-futuristic font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50"
            >
              {processingId === 'saving-all' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  UPLINKING DATA...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> 
                  SYNC ALL ASSETS
                </>
              )}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-[8px] font-futuristic text-gray-600 uppercase tracking-widest">
                Data is synced in real-time with the secure cloud uplink.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
