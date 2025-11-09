import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { PostCard } from './components/PostCard';
import { Post, FormData, AspectRatio, CarouselSlide } from './types';
import { generateSocialPosts, refinePost, regeneratePost, regenerateImage, generateViralIdeas, addTextToImage } from './services/geminiService';
import { IdeaForm } from './components/IdeaForm';
import { IdeaList } from './components/IdeaList';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    tone: 'Professional',
    customInstructions: '',
    customImagePrompt: '',
    generateCarousel: false,
    platforms: ['Twitter', 'LinkedIn', 'Instagram'],
  });
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideaError, setIdeaError] = useState<string | null>(null);
  
  const [generatingData, setGeneratingData] = useState<FormData | null>(null);

  const mainFormRef = useRef<HTMLDivElement>(null);

  const handleGenerateIdeas = async (topic: string) => {
    setIsGeneratingIdeas(true);
    setIdeaError(null);
    setIdeas([]);
    setPosts([]); 
    try {
      const generatedIdeas = await generateViralIdeas(topic);
      setIdeas(generatedIdeas);
    } catch (e) {
      setIdeaError(e instanceof Error ? e.message : 'An unknown error occurred while generating ideas.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSelectIdea = (idea: string) => {
    setFormData(prev => ({ ...prev, topic: idea }));
    mainFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const handleClearIdeas = () => {
    setIdeas([]);
    setIdeaError(null);
  }

  const handleGenerate = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setPosts([]);
    setOriginalFormData(data);
    setGeneratingData(data);
    try {
      const generatedPosts = await generateSocialPosts(data);
      setPosts(generatedPosts);
    } catch (e)
 {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setGeneratingData(null);
    }
  };

  const handleRefine = async (postToRefine: Post, instruction: string) => {
    const originalContent = postToRefine.content;
    setPosts(posts.map(p => p.platform === postToRefine.platform ? { ...p, content: 'Refining...' } : p));
    setError(null);
    try {
      const refined = await refinePost(postToRefine, instruction);
      setPosts(posts.map(p => p.platform === refined.platform ? { ...p, content: refined.content } : p));
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during refinement.');
        setPosts(posts.map(p => p.platform === postToRefine.platform ? { ...p, content: originalContent } : p));
    }
  };

  const handleRegenerateText = async (postToRegenerate: Post) => {
      if (!originalFormData) {
          setError("Cannot regenerate without original context. Please generate content first.");
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
          const regenerated = await regeneratePost(postToRegenerate, originalFormData);
          setPosts(posts.map(p => p.platform === regenerated.platform ? regenerated : p));
      } catch (e) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred during regeneration.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleRegenerateImage = async (postToRegenerate: Post) => {
    if (!originalFormData) {
        setError("Cannot regenerate without original context. Please generate content first.");
        return;
    }
    setError(null);
    setPosts(posts.map(p => p.platform === postToRegenerate.platform ? { ...p, isImageRegenerating: true, imageError: undefined } : p));
    try {
        const fullImagePrompt = `${postToRegenerate.imagePrompt}, ${originalFormData.customImagePrompt || ''}`.trim();
        const newImageUrl = await regenerateImage(fullImagePrompt);
        setPosts(posts.map(p => p.platform === postToRegenerate.platform ? { ...p, imageUrl: newImageUrl, isImageRegenerating: false } : p));
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during image regeneration.';
        setError(errorMessage);
        setPosts(posts.map(p => p.platform === postToRegenerate.platform ? { ...p, isImageRegenerating: false, imageError: errorMessage } : p));
    }
  };

  const handleRegenerateCarouselSlideImage = async (post: Post, slideIndex: number) => {
      if (!originalFormData || !post.carouselSlides) return;
      
      const newPosts = posts.map(p => {
          if (p.platform === post.platform && p.carouselSlides) {
              const newSlides = [...p.carouselSlides];
              newSlides[slideIndex] = { ...newSlides[slideIndex], isImageRegenerating: true, imageError: undefined };
              return { ...p, carouselSlides: newSlides };
          }
          return p;
      });
      setPosts(newPosts);

      try {
          const slide = post.carouselSlides[slideIndex];
          const fullImagePrompt = `${slide.imagePrompt}, ${originalFormData.customImagePrompt || ''}`.trim();
          const backgroundImage = await regenerateImage(fullImagePrompt);
          const newImageUrl = await addTextToImage(backgroundImage, slide.slideText);
          
          const finalPosts = posts.map(p => {
              if (p.platform === post.platform && p.carouselSlides) {
                  const newSlides = [...p.carouselSlides];
                  newSlides[slideIndex] = { ...newSlides[slideIndex], isImageRegenerating: false, imageUrl: newImageUrl };
                  return { ...p, carouselSlides: newSlides };
              }
              return p;
          });
          setPosts(finalPosts);
          
      } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "Failed to regenerate slide image.";
          const finalPosts = posts.map(p => {
              if (p.platform === post.platform && p.carouselSlides) {
                  const newSlides = [...p.carouselSlides];
                  newSlides[slideIndex] = { ...newSlides[slideIndex], isImageRegenerating: false, imageError: errorMessage };
                  return { ...p, carouselSlides: newSlides };
              }
              return p;
          });
          setPosts(finalPosts);
      }
  };


  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">

        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">1. Get Viral Ideas</h2>
            <IdeaForm onGenerate={handleGenerateIdeas} isLoading={isGeneratingIdeas} />
          </div>

          {ideaError && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{ideaError}</span>
            </div>
          )}
          {isGeneratingIdeas && (
            <div className="text-center text-gray-400 flex flex-col items-center justify-center space-y-4 p-8 bg-gray-800/50 rounded-lg mb-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              <p className="font-semibold">Generating Viral Ideas...</p>
            </div>
          )}
          {ideas.length > 0 && (
            <div className="mb-8">
              <IdeaList ideas={ideas} onSelectIdea={handleSelectIdea} onClear={handleClearIdeas} />
            </div>
          )}
        </div>
        
        {ideas.length > 0 && (
            <div className="max-w-2xl mx-auto my-10">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-800 px-4 text-lg font-medium text-gray-400 rounded-full">Then</span>
                    </div>
                </div>
            </div>
        )}
        
        <div className="max-w-2xl mx-auto" ref={mainFormRef}>
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">{ideas.length > 0 ? '2. ' : ''}Generate Full Posts</h2>
            <InputForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleGenerate}
              isLoading={isLoading} 
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {isLoading && posts.length === 0 && (
             <div className="text-center text-gray-400 flex flex-col items-center justify-center space-y-4 p-8 bg-gray-800/50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                <p className="font-semibold">Generating Content & Images...</p>
                <p className="text-sm">
                    {generatingData?.generateCarousel 
                        ? "Carousel generation involves multiple images and may take longer." 
                        : "This may take a few moments. Please wait."}
                </p>
             </div>
          )}

          {posts.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Generated Posts</h2>
              {posts.map((post) => (
                <PostCard 
                  key={post.platform} 
                  post={post} 
                  onRefine={handleRefine}
                  onRegenerateText={handleRegenerateText}
                  onRegenerateImage={handleRegenerateImage}
                  onRegenerateCarouselSlideImage={handleRegenerateCarouselSlideImage}
                  isProcessing={isLoading}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;