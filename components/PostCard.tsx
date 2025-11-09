import React, { useState } from 'react';
import { Post, AspectRatio, CarouselSlide } from '../types';
import { TwitterIcon } from './icons/TwitterIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { CopyIcon } from './icons/CopyIcon';
import { RefineIcon } from './icons/RefineIcon';
import { RegenerateIcon } from './icons/RegenerateIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface PostCardProps {
  post: Post;
  onRefine: (post: Post, instruction: string) => void;
  onRegenerateText: (post: Post) => void;
  onRegenerateImage: (post: Post) => void;
  onRegenerateCarouselSlideImage: (post: Post, slideIndex: number) => void;
  isProcessing: boolean;
}

const platformIcons: Record<Post['platform'], React.ReactNode> = {
  Twitter: <TwitterIcon className="h-6 w-6 text-[#1DA1F2]" />,
  LinkedIn: <LinkedInIcon className="h-6 w-6 text-[#0A66C2]" />,
  Instagram: <InstagramIcon className="h-6 w-6 text-pink-500" />,
};

const ImageErrorPlaceholder: React.FC<{
    error: string;
    prompt: string;
    onRetry: () => void;
    isRegenerating?: boolean;
}> = ({ error, prompt, onRetry, isRegenerating }) => (
    <div className="bg-red-900/20 border border-red-700/50 p-4 text-center text-sm flex flex-col items-center justify-center h-full">
        <h4 className="font-bold text-red-300 mb-2">Image Generation Failed</h4>
        <p className="text-red-400 text-xs mb-3" title={error}>{error}</p>
        <div className="bg-gray-900/50 p-2 rounded-md mb-3 w-full">
             <p className="text-gray-400 text-xs font-mono break-words text-left" title={prompt}>
                <span className="font-semibold text-gray-300">Prompt:</span> {prompt}
             </p>
        </div>
        <button
            onClick={onRetry}
            disabled={isRegenerating}
            className="flex items-center justify-center space-x-2 rounded-md bg-red-600/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600/70 disabled:opacity-50"
        >
            <RegenerateIcon className="h-4 w-4" />
            <span>{isRegenerating ? 'Retrying...' : 'Retry Image'}</span>
        </button>
    </div>
);


const SingleImageViewer: React.FC<{ post: Post; onRegenerateImage: (post: Post) => void; isProcessing: boolean; }> = ({ post, onRegenerateImage, isProcessing }) => {
    
    const handleDownload = () => {
        if (!post.imageUrl) return;
        const link = document.createElement('a');
        link.href = post.imageUrl;
        link.download = `${post.platform.toLowerCase()}-post-${Date.now()}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isLoading = isProcessing || post.isImageRegenerating;

    return (
        <>
            <div className={`aspect-video bg-gray-900 flex items-center justify-center relative ${post.aspectRatio === '16:9' ? 'aspect-video' : post.aspectRatio === '1:1' ? 'aspect-square' : post.aspectRatio === '3:4' ? 'aspect-[3/4]' : post.aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-[9/16]'}`}>
                {post.imageUrl && !post.imageError && <img src={post.imageUrl} alt={`${post.platform} post image`} className="w-full h-full object-cover" />}
                {!post.imageUrl && post.imageError && (
                    <ImageErrorPlaceholder
                        error={post.imageError}
                        prompt={post.imagePrompt}
                        onRetry={() => onRegenerateImage(post)}
                        isRegenerating={post.isImageRegenerating}
                    />
                )}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-3"></div>
                        <span className="text-sm font-medium">Generating Image...</span>
                    </div>
                )}
            </div>
            
            <div className="p-3 bg-gray-900/40 border-y border-gray-700/50 flex items-center justify-end text-sm">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onRegenerateImage(post)} disabled={isLoading} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50" title="Regenerate Image"><RegenerateIcon className="h-5 w-5" /></button>
                    <button onClick={handleDownload} disabled={isLoading || !post.imageUrl} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50" title="Download Image"><DownloadIcon className="h-5 w-5" /></button>
                </div>
            </div>
        </>
    );
};

const CarouselViewer: React.FC<{ post: Post; onRegenerateCarouselSlideImage: (post: Post, slideIndex: number) => void; isProcessing: boolean; }> = ({ post, onRegenerateCarouselSlideImage, isProcessing }) => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const slides = post.carouselSlides || [];
    const currentSlide = slides[currentSlideIndex];

    const nextSlide = () => setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);

    const handleDownload = () => {
        if (!currentSlide?.imageUrl) return;
        const link = document.createElement('a');
        link.href = currentSlide.imageUrl;
        link.download = `${post.platform.toLowerCase()}-carousel-slide-${currentSlideIndex + 1}-${Date.now()}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <>
            <div className={`relative group aspect-video bg-gray-900 flex items-center justify-center ${post.aspectRatio === '16:9' ? 'aspect-video' : post.aspectRatio === '1:1' ? 'aspect-square' : post.aspectRatio === '3:4' ? 'aspect-[3/4]' : post.aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-[9/16]'}`}>
                {currentSlide && currentSlide.imageUrl && !currentSlide.imageError && (
                    <img src={currentSlide.imageUrl} alt={`Carousel slide ${currentSlideIndex + 1}`} className="w-full h-full object-cover" />
                )}
                {currentSlide && !currentSlide.imageUrl && currentSlide.imageError && (
                    <ImageErrorPlaceholder
                        error={currentSlide.imageError}
                        prompt={currentSlide.imagePrompt}
                        onRetry={() => onRegenerateCarouselSlideImage(post, currentSlideIndex)}
                        isRegenerating={currentSlide.isImageRegenerating}
                    />
                )}
                {currentSlide?.isImageRegenerating && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-3"></div>
                        <span className="text-sm font-medium">Generating Slide...</span>
                    </div>
                )}

                 {slides.length > 1 && (
                    <>
                        <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeftIcon className="h-6 w-6" /></button>
                        <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRightIcon className="h-6 w-6" /></button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs rounded-full px-2 py-0.5">{currentSlideIndex + 1} / {slides.length}</div>
                    </>
                 )}
            </div>
            
            <div className="p-3 bg-gray-900/40 border-y border-gray-700/50 flex items-center justify-between text-sm">
                 <div className="text-xs font-medium text-gray-400">Carousel Controls</div>
                 <div className="flex items-center space-x-2">
                    <button onClick={handleDownload} disabled={isProcessing || !currentSlide?.imageUrl} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50" title="Download Current Slide"><DownloadIcon className="h-5 w-5" /></button>
                </div>
            </div>
        </>
    )
}


export const PostCard: React.FC<PostCardProps> = ({ post, onRefine, onRegenerateText, onRegenerateImage, onRegenerateCarouselSlideImage, isProcessing }) => {
  const [copied, setCopied] = useState(false);
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refineInstruction.trim()) {
      onRefine(post, refineInstruction);
      setShowRefineInput(false);
      setRefineInstruction('');
    }
  };
  
  const isAnyImageRegenerating = post.isImageRegenerating || post.carouselSlides?.some(s => s.isImageRegenerating);

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden transition-opacity duration-300">
      {post.isCarousel ? (
        <CarouselViewer post={post} onRegenerateCarouselSlideImage={onRegenerateCarouselSlideImage} isProcessing={isProcessing} />
      ) : (
        <SingleImageViewer post={post} onRegenerateImage={onRegenerateImage} isProcessing={isProcessing} />
      )}

      <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {platformIcons[post.platform]}
              <h3 className="text-xl font-semibold text-white">{post.platform}</h3>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition"
              title="Copy content"
            >
              <CopyIcon className="h-5 w-5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
          
          <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-gray-700/50">
            <button
              onClick={() => setShowRefineInput(!showRefineInput)}
              disabled={isProcessing || isAnyImageRegenerating}
              className="flex items-center space-x-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
              title="Refine post caption"
            >
              <RefineIcon className="h-4 w-4" />
              <span>Refine Caption</span>
            </button>
            <button
              onClick={() => onRegenerateText(post)}
              disabled={isProcessing || isAnyImageRegenerating || post.isCarousel}
              className="flex items-center space-x-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title={post.isCarousel ? "Carousel regeneration not supported" : "Regenerate post and image"}
            >
              <RegenerateIcon className="h-4 w-4" />
              <span>Regenerate All</span>
            </button>
          </div>
          {showRefineInput && (
            <form onSubmit={handleRefineSubmit} className="mt-4 flex space-x-2">
              <input
                type="text"
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                placeholder="e.g., Make it shorter and more punchy"
                className="flex-grow rounded-md border-gray-600 bg-gray-900/50 text-white py-2 px-3 text-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Submit
              </button>
            </form>
          )}
      </div>
    </div>
  );
};