
export type CategoryType = 'services' | 'entertainment' | 'affiliations' | 'streaming' | 'music-video-network';

export interface AppProject {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isHot?: boolean;
  category?: string;
}

export interface Brand {
  id: string;
  name: string;
  category: CategoryType;
  description: string;
  longDescription?: string;
  imageUrl?: string;
  videoUrl?: string; // New field for custom video reels
  videoThumbnailUrl?: string; // New field for custom video thumbnails
  packagesImageUrl?: string; // New field for wedding package tiers
  links: {
    label: string;
    url: string;
    type: 'primary' | 'secondary' | 'video' | 'store';
  }[];
  theme: {
    accent: string;
    bg?: string;
    font?: string;
  };
  portfolio?: string[];
  appPortfolio?: AppProject[];
}

export interface HubState {
  activeCategory: CategoryType | 'all';
  selectedBrand: Brand | null;
}
