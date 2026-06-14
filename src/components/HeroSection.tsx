import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onSelectCategory?: (category: string) => void;
  onSelectGender?: (gender: 'all' | 'men' | 'women') => void;
}

export default function HeroSection({ onExploreClick, onSelectCategory, onSelectGender }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videos = [
    '/A_high-fashion_streetwear_editorial_video_202605222248.mp4',
    '/Model_walking_past_brutalist_str…_202605222248.mp4'
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Ensure absolute muted & playsinline state per browser autoplay compliance policies
      video.muted = isMuted;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      
      const playVideo = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Cinematic autoplay deferred until interaction or file loads:", error);
          });
        }
      };

      // Trigger immediately and fallback on loadeddata buffering callback
      video.addEventListener('loadeddata', playVideo);
      playVideo();

      return () => {
        video.removeEventListener('loadeddata', playVideo);
      };
    }
  }, [currentVideoIndex]);

  // Intersection Observer to stop playing video when scrolled out of view
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [currentVideoIndex]);

  // Sync mute state changes reactively
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  const handleGenderAction = (gender: 'men' | 'women') => {
    if (onSelectGender) {
      onSelectGender(gender);
    }
    if (onSelectCategory) {
      onSelectCategory('All'); // Reset category to All under that gender to see the respective collection
    }
    
    // Smooth scroll down to the product catalog action matching CARNAGE split routing logic
    setTimeout(() => {
      const collEl = document.getElementById('collection');
      if (collEl) {
        collEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[100vh] bg-black text-white select-none overflow-hidden flex items-end pb-16 md:pb-24 font-sans"
      id="brand-hero-video-lookbook"
    >
      {/* 📹 Sequential Cinematic Background Videos */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black">
        <video 
          key={currentVideoIndex}
          ref={videoRef}
          autoPlay 
          muted 
          playsInline 
          preload="auto"
          onEnded={() => {
            setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
          }}
          className="w-full h-full object-cover brightness-[0.45] contrast-[1.05] animate-fade-in"
          id="hero-bg-loop-video"
          src={videos[currentVideoIndex]}
        />
        {/* Sleek shadow overlays to ensure excellent visual readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/35 z-10" />
      </div>

      {/* 💥 Interactive Floating Volume Toggle */}
      <div className="absolute bottom-6 left-4 sm:left-6 lg:left-12 z-25 flex items-center space-x-2.5">
        <button
          type="button"
          onClick={() => {
            if (videoRef.current) {
              const prev = !isMuted;
              setIsMuted(prev);
              videoRef.current.muted = prev;
            }
          }}
          className="p-2.5 sm:p-3 rounded-full bg-[#0a0a0a]/75 backdrop-blur-md border border-neutral-800 text-white/95 hover:text-white hover:bg-black hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-md group"
          title={isMuted ? "Unmute Cinematic soundtrack" : "Mute Sound"}
          id="hero-sound-toggle-floating"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors animate-pulse" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
          )}
        </button>
        <span className="text-[7.5px] font-mono uppercase font-bold tracking-widest text-neutral-400/80 bg-black/55 px-2 py-1 rounded select-none shadow">
          {isMuted ? "Audio Muted [Tap to unmute]" : "Sound Live"}
        </span>
      </div>

      {/* 💥 Carnage-Inspired Hero Content Panel overlay */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-6">
        <div
          className={`space-y-2.5 max-w-4xl transition-all duration-1000 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-[10px] md:text-xs font-mono tracking-[0.35em] text-neutral-400 font-extrabold block uppercase">
            EXPLORE OUR COLLECTION
          </span>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black tracking-tight text-white uppercase leading-[0.85] select-none">
            BE BETTER <br />
            EVERYDAY
          </h1>

          <p className="text-[11px] sm:text-xs lg:text-sm text-neutral-450 font-light tracking-widest leading-relaxed uppercase max-w-xl font-sans pt-1">
            Re-engineered premium heavyweight sportswear and contour active apparel. Built for endurance.
          </p>
        </div>

        {/* 🛍️ Dual Collection CTA Action Buttons matching the screenshot exactly */}
        <div 
          className={`flex flex-row gap-3 pt-2 transition-all duration-1000 delay-300 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button 
            onClick={() => handleGenderAction('women')}
            className="px-6 py-3 bg-[#0a0a0a]/90 hover:bg-white hover:text-black border border-neutral-850 text-white text-[9.5px] font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-xl font-sans text-center min-w-[145px] hover:scale-[1.02] cursor-pointer"
            id="hero-shop-womens-btn"
          >
            SHOP WOMENS
          </button>
          
          <button 
            onClick={() => handleGenderAction('men')}
            className="px-6 py-3 bg-[#0a0a0a]/90 hover:bg-white hover:text-black border border-neutral-850 text-white text-[9.5px] font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-xl font-sans text-center min-w-[145px] hover:scale-[1.02] cursor-pointer"
            id="hero-shop-mens-btn"
          >
            SHOP MENS
          </button>
        </div>
      </div>

      {/* Floating interactive scroll cue */}
      <div 
        onClick={() => {
          const collEl = document.getElementById('collection');
          if (collEl) {
            collEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="absolute bottom-6 right-4 sm:right-6 lg:right-12 z-25 hidden sm:flex flex-col items-center space-y-1 opacity-55 hover:opacity-100 transition-all cursor-pointer animate-bounce group"
      >
        <span className="text-[8px] font-mono tracking-[0.35em] text-white uppercase font-bold text-right group-hover:text-amber-400">
          DISCOVER COLLECTION
        </span>
        <ChevronDown className="w-4 h-4 text-white mx-auto group-hover:text-amber-400" />
      </div>
    </section>
  );
}
