import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Post, FormData, SocialPlatform, AspectRatio, CarouselSlide } from '../types';

// Client for text-based generation, using the primary API key.
const textAi = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Use a dedicated API key for image generation if available, otherwise fall back to the primary key.
// This helps manage quotas separately for text and image models.
const imageAi = new GoogleGenAI({ apiKey: process.env.IMAGE_API_KEY || process.env.API_KEY! });


const textResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      platform: {
        type: Type.STRING,
        description: 'The social media platform (Twitter, LinkedIn, or Instagram).',
        enum: ['Twitter', 'LinkedIn', 'Instagram'],
      },
      content: {
        type: Type.STRING,
        description: 'The text content for the social media post.',
      },
      imagePrompt: {
        type: Type.STRING,
        description: 'A detailed, creative prompt for generating an accompanying image. This should be a descriptive sentence.',
      },
    },
    required: ['platform', 'content', 'imagePrompt'],
  },
};

const carouselResponseSchema = {
    type: Type.OBJECT,
    properties: {
        mainCaption: {
            type: Type.STRING,
            description: 'The main caption for the entire carousel post.'
        },
        slides: {
            type: Type.ARRAY,
            description: 'An array of 5 to 7 slides for the carousel.',
            items: {
                type: Type.OBJECT,
                properties: {
                    slideText: {
                        type: Type.STRING,
                        description: 'The concise, powerful text to be displayed ON the image for this slide.'
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: 'A detailed prompt for the background image of this slide, maintaining a consistent style.'
                    }
                },
                required: ['slideText', 'imagePrompt']
            }
        }
    },
    required: ['mainCaption', 'slides']
}


const ideasResponseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.STRING,
      description: 'A viral social media post idea.',
    },
};

export const generateViralIdeas = async (topic: string): Promise<string[]> => {
    const prompt = `
        You are a viral marketing expert and social media strategist.
        Given the topic "${topic}", generate a list of 5 to 7 distinct, creative, and highly engaging social media post ideas.
        These ideas should have a high potential to go viral and be adaptable for platforms like Twitter, Instagram, and LinkedIn.
        Focus on unique angles, trending formats (e.g., threads, carousels, short-form video concepts), and emotional hooks.
        Return the ideas as a JSON array of strings. Each string should be a concise, actionable idea.
    `;

    try {
        const response = await textAi.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ideasResponseSchema,
            },
        });
        const jsonText = response.text.trim();
        const ideas = JSON.parse(jsonText) as string[];
        return ideas;
    } catch (error) {
        console.error("Error generating viral ideas:", error);
        throw new Error("Failed to generate ideas. Please try again.");
    }
};

const createTextPrompt = (formData: FormData, platforms: SocialPlatform[]): string => {
  return `
    Generate social media posts for the following platforms: ${platforms.join(', ')}.
    Topic: ${formData.topic}
    Tone: ${formData.tone}
    Custom Instructions: ${formData.customInstructions || 'None'}

    For each platform, you must provide two things:
    1.  The post's text content, meticulously tailored to the specific platform's style, audience, and character limits.
    2.  A detailed, creative, and descriptive image prompt for an AI image generation model (like Midjourney or DALL-E). This prompt MUST strictly follow the specific style guide for that platform to generate a visually compelling and appropriate image.

    --- PLATFORM-SPECIFIC CONTENT & IMAGE PROMPT STYLE GUIDES ---

    **1. LinkedIn**
    -   **Content Goal:** Professional, insightful, and credible. Aim for slightly longer, value-driven content. Use professional hashtags.
    -   **Image Goal:** Professional and clean visuals that signal credibility and clarity.
    -   **Image Prompt Style Guide:**
        -   Generate a prompt for an image with a white or light gray minimal background.
        -   Incorporate bold typography.
        -   Use LinkedIn-blue or neutral accent colors.
        -   The visual should be clean and uncluttered.
        -   For higher engagement, the prompt could describe a context-relevant scene, such as an "ultra-realistic business founder working with a holographic AI interface, with cinematic lighting".

    **2. Instagram**
    -   **Content Goal:** Engaging, story-driven captions that complement a strong visual. Use popular and relevant hashtags.
    -   **Image Goal:** Emotional and aesthetic storytelling.
    -   **Image Prompt Style Guide:**
        -   Generate a prompt for a visually stunning, cinematic image.
        -   Incorporate deep contrast, moody lighting, or a "teal and orange" color palette.
        -   The prompt should aim to create a futuristic or concept-style visual.
        -   It could describe a scene that allows for a short, bold motivational text overlay like "The Future Is Synthetic".

    **3. Twitter (X)**
    -   **Content Goal:** Short, punchy, and high-impact. Use relevant hashtags and stay within the 280-character limit.
    -   **Image Goal:** Punchy, minimalist, and high-contrast.
    -   **Image Prompt Style Guide:**
        -   Generate a prompt for an image with a dark or gradient background.
        -   The image should focus on a single focal object or a powerful quote. It must be uncluttered.
        -   The prompt could specify bold sans-serif fonts if text is part of the image.
  `;
};

const createCarouselPrompt = (formData: FormData, platform: SocialPlatform): string => {
    return `
    You are a social media strategist specializing in creating viral carousels for ${platform}.
    Your task is to deconstruct a topic into a highly engaging, visual, multi-slide carousel post.

    Topic: "${formData.topic}"
    Tone: ${formData.tone}
    Custom Instructions: ${formData.customInstructions || 'None'}
    
    Based on the topic, generate a complete plan for a 5-7 slide carousel. You must provide:
    1. A main caption for the entire post, suitable for ${platform}.
    2. An array of slides. Each slide object must contain:
        a. "slideText": The concise, high-impact text to be displayed ON the slide's image. This should be short and easy to read. Start with a title slide, then content slides, and end with a summary or call-to-action slide.
        b. "imagePrompt": A detailed, creative prompt for an AI to generate the BACKGROUND image for that specific slide. All image prompts should share a consistent artistic style to make the carousel look cohesive and professional. The style should align with the platform's aesthetic (${platform === 'LinkedIn' ? 'clean, professional, corporate' : 'cinematic, aesthetic, engaging'}).
    
    Return the entire output as a single JSON object that strictly follows the provided schema.
    `;
}

const getAspectRatioForPlatform = (platform: SocialPlatform): AspectRatio => {
    switch (platform) {
        case 'Instagram':
        case 'LinkedIn':
            return '3:4'; 
        case 'Twitter':
        default:
            return '16:9';
    }
}

export const addTextToImage = (base64Image: string, text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }

        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            canvas.width = 1080;
            canvas.height = canvas.width / aspectRatio;

            // Draw the base image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Add a dark overlay for text readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Style the text
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Logic to adjust font size and wrap text
            const maxWidth = canvas.width * 0.8;
            let fontSize = 80;
            ctx.font = `bold ${fontSize}px sans-serif`;
            
            // Reduce font size until text fits
            while (ctx.measureText(text).width > maxWidth && fontSize > 30) {
                 fontSize -= 5;
                 ctx.font = `bold ${fontSize}px sans-serif`;
            }

            const words = text.split(' ');
            let line = '';
            const lines = [];
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            const lineHeight = fontSize * 1.2;
            const totalTextHeight = lines.length * lineHeight;
            let y = (canvas.height - totalTextHeight) / 2 + (lineHeight / 2);
            
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 10;

            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i].trim(), canvas.width / 2, y + (i * lineHeight));
            }

            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = reject;
        img.src = base64Image;
    });
};


const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await imageAi.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("Image generation returned no images.");

    } catch (error) {
        console.error("Error generating image:", error);
         if (error instanceof Error) {
            const errorMessage = (error as any).message || JSON.stringify(error);
             if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
                 throw new Error("Image generation quota exceeded. Please check your plan and billing details.");
             }
        }
        throw new Error("Failed to generate image. The model may have refused the request.");
    }
};

export const generateSocialPosts = async (formData: FormData): Promise<Post[]> => {
    const platforms: SocialPlatform[] = formData.platforms;
    
    if (platforms.length === 0) return [];

    if (formData.generateCarousel) {
        // Generate carousels for selected LI/IG and a single post for selected Twitter
        const carouselPlatforms = platforms.filter(p => p === 'LinkedIn' || p === 'Instagram') as SocialPlatform[];
        const singlePostPlatforms = platforms.filter(p => p === 'Twitter') as SocialPlatform[];

        const carouselPromises = carouselPlatforms.map(async (platform) => {
            const prompt = createCarouselPrompt(formData, platform);
            const response = await textAi.models.generateContent({
                model: "gemini-2.5-pro",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: carouselResponseSchema,
                },
            });

            const jsonText = response.text.trim();
            const carouselData = JSON.parse(jsonText) as { mainCaption: string; slides: Omit<CarouselSlide, 'imageUrl'>[] };
            
            const aspectRatio = getAspectRatioForPlatform(platform);
            
            // Generate slide images sequentially to avoid rate limiting
            const slidesWithImages: CarouselSlide[] = [];
            for (const slide of carouselData.slides) {
                try {
                    const fullImagePrompt = `${slide.imagePrompt}, ${formData.customImagePrompt || ''}`.trim();
                    const backgroundImage = await generateImage(fullImagePrompt);
                    const finalSlideImage = await addTextToImage(backgroundImage, slide.slideText);
                    slidesWithImages.push({ ...slide, imageUrl: finalSlideImage });
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
                } catch (e) {
                    console.error(`Failed to generate image for slide: "${slide.slideText}"`, e);
                    slidesWithImages.push({ ...slide, imageUrl: undefined, imageError: e instanceof Error ? e.message : "Image generation failed." });
                }
            }

            return {
                platform,
                content: carouselData.mainCaption,
                aspectRatio,
                isCarousel: true,
                carouselSlides: slidesWithImages,
                imagePrompt: '', // Not needed for carousel post object
            };
        });
        
        const singlePostPromises = singlePostPlatforms.length > 0
            ? generateSinglePosts(formData, singlePostPlatforms)
            : Promise.resolve([]);

        const [carouselResults, singlePostResults] = await Promise.all([
            Promise.all(carouselPromises),
            singlePostPromises
        ]);

        return [...singlePostResults, ...carouselResults];

    } else {
        // Generate single posts for all selected platforms
        return generateSinglePosts(formData, platforms);
    }
};

const generateSinglePosts = async (formData: FormData, platforms: SocialPlatform[]): Promise<Post[]> => {
    const prompt = createTextPrompt(formData, platforms);
    try {
        const textResponse = await textAi.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: textResponseSchema,
            },
        });

        const jsonText = textResponse.text.trim();
        // The API might return a single object if only one platform is requested.
        const responseData = JSON.parse(jsonText);
        const postsWithoutImages = (Array.isArray(responseData) ? responseData : [responseData]) as Omit<Post, 'aspectRatio'>[];
        
        // Generate images sequentially to avoid rate limiting
        const postsWithData: Post[] = [];
        for (const post of postsWithoutImages) {
             try {
                 const fullImagePrompt = `${post.imagePrompt}, ${formData.customImagePrompt || ''}`.trim();
                 const aspectRatio = getAspectRatioForPlatform(post.platform);
                 const imageUrl = await generateImage(fullImagePrompt);
                 postsWithData.push({ ...post, imageUrl, aspectRatio, isCarousel: false });
                 await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
             } catch (e) {
                  console.error(`Failed to generate image for ${post.platform}:`, e);
                  postsWithData.push({ ...post, imageUrl: undefined, aspectRatio: getAspectRatioForPlatform(post.platform), isCarousel: false, imageError: e instanceof Error ? e.message : "Image generation failed." });
             }
        }
        return postsWithData;

    } catch (error) {
        console.error("Error generating single posts:", error);
        throw new Error("Failed to generate content. Please check your API key and try again.");
    }
}


export const regenerateImage = async (prompt: string): Promise<string> => {
    return generateImage(prompt);
};


export const refinePost = async (post: Post, instruction: string): Promise<Post> => {
    const prompt = `
      Refine the following social media post caption for ${post.platform} based on the instruction provided.
      Original Post Caption: "${post.content}"
      Refinement Instruction: "${instruction}"

      Return only the refined caption as a single string.
    `;
    
    try {
        const response = await textAi.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        const refinedContent = response.text.trim();
        return { ...post, content: refinedContent };

    } catch (error) {
        console.error("Error refining post:", error);
        throw new Error("Failed to refine content.");
    }
};

export const regeneratePost = async (post: Post, originalFormData: FormData): Promise<Post> => {
    // This function will now only regenerate single image posts. A new function would be needed for carousels.
    if (post.isCarousel) {
        // For simplicity, we ask the user to regenerate the whole set for now.
        throw new Error("Carousel regeneration is not yet supported. Please start a new generation.");
    }

    const prompt = `
      Regenerate a social media post for ${post.platform}.
      Topic: ${originalFormData.topic}
      Tone: ${originalFormData.tone}
      Custom Instructions: ${originalFormData.customInstructions || 'None'}

      Here is the previous version, please generate a new, different one: "${post.content}"

      Provide the new post content and a new, different image prompt.
      Return the response in JSON format with "content" and "imagePrompt" fields.
    `;

    try {
        const response = await textAi.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        content: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                    },
                    required: ['content', 'imagePrompt'],
                }
            }
        });
        const jsonText = response.text.trim();
        const newContent = JSON.parse(jsonText);
        
        const newImageUrl = await regenerateImage(newContent.imagePrompt);

        return { ...post, ...newContent, imageUrl: newImageUrl };

    } catch (error) {
        console.error("Error regenerating post:", error);
        throw new Error("Failed to regenerate content.");
    }
};