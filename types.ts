// FIX: Removed self-import of 'SocialPlatform' that conflicted with the type declaration in the same file.
export type SocialPlatform = 'Twitter' | 'LinkedIn' | 'Instagram';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface CarouselSlide {
  slideText: string;
  imagePrompt: string;
  imageUrl?: string;
  isImageRegenerating?: boolean;
  imageError?: string;
}

export interface Post {
  platform: SocialPlatform;
  content: string; // This is now the main caption for the post
  imagePrompt: string; // For single image posts
  imageUrl?: string; // For single image posts
  isImageRegenerating?: boolean; // Now used for the main post image
  imageError?: string; // Error message for the main post image
  aspectRatio: AspectRatio;
  isCarousel?: boolean;
  carouselSlides?: CarouselSlide[];
}

export interface FormData {
  topic: string;
  tone: string;
  customInstructions: string;
  customImagePrompt: string;
  generateCarousel: boolean;
  platforms: SocialPlatform[];
}
