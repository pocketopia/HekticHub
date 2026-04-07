import React from 'react';
import { Brand } from './types';
import { 
  Camera, 
  Code, 
  Film, 
  Church, 
  Music, 
  Radio, 
  ShoppingBag, 
  BookOpen, 
  Tv,
  GraduationCap,
  Clapperboard,
  Gamepad2,
  Video
} from 'lucide-react';

export const BRANDS: Brand[] = [
  // SERVICES
  {
    id: 'premiere-weddings',
    name: 'Premiere Weddings Services & Videography',
    category: 'services',
    description: 'Breathtaking wedding videography, professional officiating, and seamless coordination.',
    longDescription: 'At Premiere Weddings, we believe every love story is a masterpiece waiting to be filmed. Our cinematic approach blends timeless elegance with modern storytelling, capturing not just the events, but the soul of your wedding day. Beyond our premier videography, we offer professional Wedding Officiant services and expert Full or Day-of Wedding Coordination to ensure your special day is seamless, sacred, and perfectly executed from the first look to the final dance.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    packagesImageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
    links: [{ label: 'Inquire Now', url: '#', type: 'primary' }],
    theme: { accent: '#e11d48' } // Rose Red
  },
  {
    id: 'pocketopia',
    name: 'Pocketopia: App Development',
    category: 'services',
    description: 'Innovative app development and digital ecosystem design.',
    longDescription: 'From concept to deployment, Pocketopia builds robust mobile and web applications tailored to your business needs. Our ecosystem is designed for performance, scalability, and stunning user experiences.',
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800',
    links: [
      { label: 'View Portfolio', url: '#', type: 'secondary' },
      { label: 'See my Demo', url: '#', type: 'primary' },
      { label: 'Inquire', url: '#', type: 'primary' }
    ],
    theme: { accent: '#ffffff' },
    appPortfolio: [
      {
        id: 'nexus-pay',
        name: 'Nexus Pay',
        description: 'Next-gen decentralized crypto wallet with zero gas fees.',
        imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=800',
        isHot: true,
        category: 'Fintech'
      },
      {
        id: 'fit-grid',
        name: 'FitGrid',
        description: 'AI-powered personal trainer in your pocket.',
        imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800',
        category: 'Health'
      },
      {
        id: 'synth-flow',
        name: 'SynthFlow',
        description: 'Real-time collaborative music production environment.',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
        category: 'Music'
      }
    ]
  },
  {
    id: 'twizted-images',
    name: 'Twizted Images Cinema',
    category: 'services',
    description: 'High-octane music videos, commercials, and professional VHS conversion.',
    longDescription: 'Twizted Images Cinema brings a raw, edgy, and high-energy aesthetic to every project. Whether it’s a heavy metal music video or a corporate brand launch, we make it cinematic. We also specialize in high-quality VHS conversion, preserving your legacy media for the digital age.',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    links: [{ label: 'Book a Shoot', url: '#', type: 'primary' }],
    theme: { accent: '#dc2626' }
  },
  {
    id: 'innovation-media',
    name: 'Innovation Media: Content Creation Courses',
    category: 'services',
    description: 'Master the art of content creation with our expert-led courses.',
    longDescription: 'Innovation Media is our educational wing dedicated to teaching the next generation of creators. From cinematography basics to advanced editing and brand strategy, our courses are designed to turn your passion into a professional career.',
    imageUrl: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800',
    links: [{ label: 'Coming Soon!', url: '#', type: 'primary' }],
    theme: { accent: '#ffffff' }
  },
  {
    id: 'church-orion',
    name: 'New Church of Orion & School of Ancient Mysticisms',
    category: 'affiliations',
    description: 'A spiritual organization and educational institution dedicated to cosmic enlightenment and ancient wisdom.',
    longDescription: 'A modern religious organization and school exploring the intersection of faith, the cosmos, and personal destiny. Join our community as we seek deeper understanding of the Orion mysteries and the hidden knowledge of the ancient mysticisms.',
    imageUrl: 'https://images.unsplash.com/photo-1548625313-040e90eaa3ef?auto=format&fit=crop&q=80&w=800',
    links: [
      { label: 'Visit the Church of Orion', url: '#', type: 'primary' },
      { label: 'Visit the School of Ancient Mysticisms', url: '#', type: 'primary' }
    ],
    theme: { accent: '#f87171' }
  },
  {
    id: 'band-wars',
    name: 'Band Wars',
    category: 'entertainment',
    description: 'The hit Amazon Prime TV series where bands battle for glory.',
    longDescription: 'Watch as emerging bands go head-to-head in the ultimate musical competition. High stakes, raw talent, and unforgettable performances. Streaming now on Amazon Prime.',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://youtu.be/zBT64BXt5rQ?si=K1xG7hAZgdwZSXaU',
    links: [
      { label: 'Watch on Amazon Prime', url: 'https://www.primevideo.com/detail/0GVHQLW2J8MURUDYCAEURWETSA/ref=atv_dp_share_cu_r', type: 'primary' },
      { label: 'YouTube', url: 'https://youtu.be/zBT64BXt5rQ?si=K1xG7hAZgdwZSXaU', type: 'video' },
      { label: 'App coming soon!', url: '#', type: 'secondary' }
    ],
    theme: { accent: '#ef4444' }
  },
  {
    id: 'hektic-studios',
    name: 'Hektic Studios',
    category: 'entertainment',
    description: 'High-concept film production and narrative storytelling.',
    longDescription: 'Hektic Studios is the home of our narrative cinematic projects. From independent feature films to boundary-pushing shorts, we focus on stories that challenge the status quo and captivate audiences worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    links: [{ label: 'Projects coming soon', url: '#', type: 'primary' }],
    theme: { accent: '#ffffff' }
  },
  {
    id: 'phantasphere-by-kreation',
    name: 'Phantasphere by Kreation',
    category: 'entertainment',
    description: "Kreation has developed a proof of concept for a new gaming console called Phantasphere, which is a revolutionary concept with both atmospheric gameplay, and unique AI attributes, ground-breaking new hardware - made entirely for gamers BY gamers.",
    longDescription: "\"Kreation has developed a proof of concept for a new gaming console called Phantasphere, which is a revolutionary concept with both atmospheric gameplay, and unique AI attributes, ground-breaking new hardware - made entirely for gamers BY gamers. This means we promise the annhialation of Pay-to-Play Ideology, and will include over 30 game concepts with memorable new characters and gameplay to fall in love with, incredible storytelling - it is going to be revolutionary. Join the mailing list to be the first to try the console's interactive main menu concept and a first look at the console!\"",
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
    links: [
      { label: 'Join mailing list', url: '#', type: 'primary' },
      { label: 'Get Pitchdeck', url: '#', type: 'secondary' }
    ],
    theme: { accent: '#dc2626' }
  },
  {
    id: 'hektic-nation',
    name: 'Hektic Nation',
    category: 'entertainment',
    description: 'Our premier podcast and YouTube series covering everything hectic.',
    longDescription: 'Hektic Nation is more than a show; it’s a community. We discuss life, tech, music, and local legends. Tune in for weekly episodes that push the boundaries.',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
    videoUrl: '', // To be added via admin dashboard
    links: [
      { label: 'Subscribe on YouTube', url: 'https://www.youtube.com/@hekticnation', type: 'video' },
      { label: 'Listen to Podcast', url: 'https://open.spotify.com/show/3gr8yVRGhR8fhoVchWMOHM?si=aea844f6b904481f', type: 'secondary' },
      { label: 'Prime Series coming Soon', url: '#', type: 'secondary' }
    ],
    theme: { accent: '#ffffff' }
  },
  {
    id: 'cryptamnesia',
    name: 'Cryptamnesia',
    category: 'entertainment',
    description: 'Industrial metal band delivering sonic chaos and dark energy.',
    longDescription: 'An immersive industrial metal experience. Cryptamnesia blends mechanical rhythms with haunting melodies to create a visceral soundscape of the modern era.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253361-bee8a187449a?auto=format&fit=crop&q=80&w=800',
    links: [
      { label: 'Band EPK', url: '#', type: 'primary' },
      { label: 'Stream Now', url: '#', type: 'primary' },
      { label: 'YouTube', url: '#', type: 'video' }
    ],
    theme: { accent: '#dc2626' }
  },
  // STREAMING PLATFORMS
  {
    id: 'hektic-tv',
    name: 'Hektic TV',
    category: 'streaming',
    description: 'The official streaming home for all Hektic original content.',
    longDescription: 'Hektic TV is our proprietary streaming platform, featuring exclusive series, behind-the-scenes footage, and live broadcasts from across the Hektic ecosystem.',
    links: [
      { label: 'Coming soon', url: '#', type: 'secondary' },
      { label: 'Join the waiting list', url: '#', type: 'primary' }
    ],
    theme: { accent: '#dc2626' }
  },
  {
    id: 'archaven',
    name: 'Archaven',
    category: 'streaming',
    description: 'Buy and rent movies and tv series.',
    longDescription: 'Archaven is the ultimate destination for fans of the macabre, the mysterious, and the epic. Featuring exclusive adaptations and original series.',
    links: [
      { label: 'Coming soon', url: '#', type: 'secondary' },
      { label: 'Join the waiting list', url: '#', type: 'primary' }
    ],
    theme: { accent: '#ef4444' }
  },
  {
    id: 'mvn-global',
    name: 'Music Video Network',
    category: 'streaming',
    description: 'The world’s premier music video network.',
    longDescription: 'MVN Global is a 24/7 music video network featuring the latest hits, underground classics, and exclusive artist interviews from around the world.',
    links: [
      { label: 'Coming soon', url: '#', type: 'secondary' },
      { label: 'Join the waiting list', url: '#', type: 'primary' }
    ],
    theme: { accent: '#ffffff' }
  },
  // AFFILIATIONS
  {
    id: 'acropolis-apparel',
    name: 'Acropolis Apparel & Accessories',
    category: 'affiliations',
    description: 'Custom luxury leather jackets, artisanal jewelry, retro gaming and survivalist apparel.',
    longDescription: 'Exquisite craftsmanship meets rebellious style. Acropolis offers bespoke leather tailoring and unique, handcrafted jewelry pieces that make a bold statement.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
    links: [{ label: 'Shop Collection', url: '#', type: 'store' }],
    theme: { accent: '#ffffff' }
  },
  {
    id: 'rise-of-darkus',
    name: 'Rise of Darkus Series',
    category: 'affiliations',
    description: 'Epic fantasy adventure novel series available on amazon.',
    longDescription: 'Step into a world of shadow, magic, and destiny. The Rise of Darkus series is an epic journey through a beautifully crafted dark fantasy universe. Available in print and digital.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800',
    links: [
      { label: 'Explore the world of Darkus', url: '#', type: 'secondary' },
      { label: 'Audio Book', url: '#', type: 'secondary' },
      { label: 'Buy on Amazon', url: '#', type: 'store' }
    ],
    theme: { accent: '#ef4444' }
  }
];

export const CATEGORY_ICONS = {
  services: <Code className="w-5 h-5" />,
  entertainment: <Film className="w-5 h-5" />,
  streaming: <Tv className="w-5 h-5" />,
  affiliations: <ShoppingBag className="w-5 h-5" />
};

export const BRAND_ICONS: Record<string, React.ReactNode> = {
  'premiere-weddings': <Camera className="w-6 h-6" />,
  'pocketopia': <Code className="w-6 h-6" />,
  'twizted-images': <Film className="w-6 h-6" />,
  'innovation-media': <GraduationCap className="w-6 h-6" />,
  'church-orion': <Church className="w-6 h-6" />,
  'band-wars': <Tv className="w-6 h-6" />,
  'hektic-studios': <Clapperboard className="w-6 h-6" />,
  'phantasphere-by-kreation': <Gamepad2 className="w-6 h-6" />,
  'hektic-nation': <Radio className="w-6 h-6" />,
  'cryptamnesia': <Music className="w-6 h-6" />,
  'acropolis-apparel': <ShoppingBag className="w-6 h-6" />,
  'rise-of-darkus': <BookOpen className="w-6 h-6" />,
  'hektic-tv': <Tv className="w-6 h-6" />,
  'archaven': <Tv className="w-6 h-6" />,
  'mvn-global': <Video className="w-6 h-6" />
};
