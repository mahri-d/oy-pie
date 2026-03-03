"use client";

import { useState } from "react";

interface HistoryItem {
  prompt: string;
  imageUrl: string;
}

// --- THE TRANSLATION DICTIONARY ---
const translations = {
  EN: {
    newBake: "New Bake",
    chats: "Chats",
    emptyOven: "Your oven is empty.",
    placeholder: "Describe what you want to bake...",
    generate: "Generate",
    disclaimer: "AI can make mistakes. Consider verifying important information."
  },
  TM: { 
    newBake: "Täze Bişirim",
    chats: "Gürrüňler",
    emptyOven: "Tamdyryňyz boş.",
    placeholder: "Näme bişirmek isleýärsiňiz, beýan ediň...",
    generate: "Bişir",
    disclaimer: "AI ýalňyşyp biler. Möhüm maglumatlary barlamagy unutmaň."
  },
  RU: {
    newBake: "Новая выпечка",
    chats: "Чаты",
    emptyOven: "Ваш тандыр пуст.",
    placeholder: "Опишите, что вы хотите испечь...",
    generate: "Создать",
    disclaimer: "ИИ может допускать ошибки. Проверяйте важную информацию."
  },
  AR: {
    newBake: "خبز جديد",
    chats: "المحادثات",
    emptyOven: "فرنك فارغ.",
    placeholder: "صف ما تريد خبزه...",
    generate: "توليد",
    disclaimer: "قد يرتكب الذكاء الاصطناعي أخطاء. يرجى التحقق من المعلومات المهمة."
  }
};

type LanguageCode = "EN" | "TM" | "RU" | "AR";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(undefined);
  const [bakeState, setBakeState] = useState<"idle" | "baking" | "ready">("idle");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [language, setLanguage] = useState<LanguageCode>("EN");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const t = translations[language];

  const languages: { code: LanguageCode; name: string; icon: string }[] = [
    { code: "EN", name: "English", icon: "/assets/en-icon.png" },
    { code: "TM", name: "Türkmençe", icon: "/assets/tm-icon.png" },
    { code: "RU", name: "Русский", icon: "/assets/ru-icon.png" },
    { code: "AR", name: "العربية", icon: "/assets/ar-icon.png" }
  ];

  const generateImage = async () => {
    if (!prompt) return alert("Please enter a prompt!");
    
    const currentPrompt = prompt;
    setSubmittedPrompt(currentPrompt); 
    setBakeState("baking"); 
    setPrompt(""); 
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImageUrl(data.imageUrl); 
      setBakeState("ready");
      setHistory((prev) => [{ prompt: currentPrompt, imageUrl: data.imageUrl }, ...prev]);
      
    } catch (error) {
      console.error(error);
      alert("Something went wrong with the oven! Check the terminal for errors.");
      setBakeState("idle");
    }
  };

  const startNewBake = () => {
    setBakeState("idle");
    setPrompt("");
    setSubmittedPrompt("");
    setGeneratedImageUrl(undefined);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setSubmittedPrompt(item.prompt);
    setGeneratedImageUrl(item.imageUrl);
    setBakeState("ready");
  };

  const deleteHistoryItem = (e: React.MouseEvent, indexToDelete: number) => {
    e.stopPropagation(); 
    setHistory((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  // --- NEW: The Download Function ---
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Stops the modal from closing when you click the button
    if (!selectedImage) return;

    try {
      // Fetches the image data and creates a local link to download it
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `oy-pie-art-${Date.now()}.webp`; // Gives it a cool custom filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: If it fails, open in a new tab
      window.open(selectedImage, "_blank");
    }
  };

  const activeLang = languages.find(l => l.code === language);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#120502]">
      
      {/* --- SIDEBAR --- */}
      <div 
        className={`h-full bg-[#160502] border-r border-[#d4af37]/10 transition-all duration-300 ease-in-out flex flex-col shrink-0 z-40
        ${isSidebarOpen ? "w-72" : "w-0 opacity-0"}`}
      >
        <div className="w-72 flex flex-col h-full overflow-hidden">
          <div className="p-4 pt-6 pb-2">
            <button 
              onClick={startNewBake}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-full px-5 py-3 text-white transition-colors w-full border border-white/5 shadow-sm"
            >
              <span className="text-[#d4af37] text-xl leading-none">+</span>
              <span className="font-semibold text-sm tracking-wide">{t.newBake}</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2 mt-4">{t.chats}</h3>
            <div className="flex flex-col gap-1">
              {history.length === 0 ? (
                <p className="text-[#d4af37]/40 text-sm italic px-2">{t.emptyOven}</p>
              ) : (
                history.map((item, index) => (
                  <div 
                    key={index} 
                    onClick={() => loadHistoryItem(item)}
                    className="group relative flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left cursor-pointer overflow-hidden"
                  >
                    <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-md object-cover opacity-80 shrink-0" />
                    <p className="text-sm text-gray-300 truncate w-full pr-8">{item.prompt}</p>
                    <button 
                      onClick={(e) => deleteHistoryItem(e, index)}
                      className="absolute right-2 text-gray-500 hover:text-[#ff4d4d] hover:bg-white/10 transition-all rounded-md w-7 h-7 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="relative flex-1 h-full w-full flex flex-col items-center justify-between">
        
        {/* Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-[center_85%] bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/background-pattern.png')" }}
        />

        {/* Top Header */}
        <div className="flex w-full justify-between items-center p-4 z-50">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 px-4 rounded-full hover:bg-white/10 text-[#d4af37] transition-colors flex items-center gap-3 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">☰</span>
              <span className="text-xl font-bold tracking-widest">OY-PIE</span>
            </button>

            {/* FUNCTIONAL LANGUAGE DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center justify-between gap-3 px-3 h-11 min-w-[6.5rem] rounded-full bg-black/50 border border-[#d4af37]/20 backdrop-blur-md text-[#d4af37] font-semibold hover:bg-white/10 transition-colors shadow-lg"
              >
                <img 
                  src={activeLang?.icon} 
                  alt={activeLang?.code} 
                  className="w-6 h-6 rounded-full object-cover shadow-sm border border-white/10 bg-[#1e0a05]" 
                />
                <span>{activeLang?.code}</span>
                <span className="text-[10px] opacity-70 ml-1">▼</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-[#160502]/95 border border-[#d4af37]/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-5 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                        language === lang.code ? "text-[#d4af37] font-bold bg-white/5" : "text-white/80 font-medium"
                      }`}
                    >
                      <img 
                        src={lang.icon} 
                        alt={lang.code} 
                        className="w-5 h-5 rounded-full object-cover shadow-sm border border-white/10 bg-[#1e0a05]" 
                      />
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* --- THE TAMDYR MAGIC WRAPPER --- */}
        <div className="relative flex-1 w-full pointer-events-none z-10">
            <div className={`absolute left-[50%] flex flex-col items-center -translate-x-1/2 transition-all duration-[2500ms] ease-in-out
                  ${bakeState === "idle" ? "opacity-0 bottom-[-10%] scale-50" : ""}
                  ${bakeState === "baking" ? "opacity-100 bottom-[2%] scale-[0.3]" : ""} 
                  ${bakeState === "ready" ? "opacity-100 bottom-[60%] scale-100" : ""}
            `}>
                
                <img 
                    src={generatedImageUrl || undefined}
                    alt="Baking Art"
                    onClick={() => {
                      if (bakeState === "ready" && generatedImageUrl) {
                        setSelectedImage(generatedImageUrl);
                      }
                    }}
                    className={`object-cover transition-all duration-[2500ms] ease-in-out pointer-events-auto
                      ${bakeState === "baking" ? "w-[240px] h-[240px] opacity-90 mix-blend-color-dodge [mask-image:linear-gradient(to_top,transparent_15%,black_75%)] filter sepia-[0.8] saturate-[40] hue-rotate-[-20deg] brightness-150 blur-[2px] rounded-[50%_50%_40px_40px] shadow-[0_0_150px_rgba(255,80,0,1)] animate-pulse" : ""}
                      ${bakeState === "ready" ? "w-[240px] h-[240px] opacity-100 mix-blend-normal rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-[#d4af37]/40 hover:scale-105 cursor-pointer hover:border-[#d4af37]" : ""}
                    `}
                />

                <div className={`mt-4 max-w-sm text-center text-[#d4af37] font-semibold text-lg bg-[#1e0a05]/90 px-6 py-2 rounded-full backdrop-blur-md border border-[#d4af37]/20 transition-all duration-[2500ms] delay-300 shadow-xl pointer-events-auto whitespace-nowrap
                    ${bakeState === "ready" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
                `}>
                    {submittedPrompt}
                </div>
            </div>
        </div>

       {/* --- BOTTOM INPUT AREA --- */}
<div className="relative w-full max-w-4xl px-4 mb-8 z-30">
  <div 
    className="flex items-center gap-2 bg-[#1e0a05]/85 backdrop-blur-xl border border-[#d4af37]/30 rounded-[2.5rem] p-2 px-3 sm:px-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all focus-within:border-[#d4af37]/70"
    // Use standard CSS for direction instead of the HTML 'dir' attribute
    style={{ direction: language === "AR" ? "rtl" : "ltr" }} 
  >
    <input
      type="text"
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && bakeState !== "baking") {
          generateImage();
        }
      }}
      placeholder={t.placeholder}
      disabled={bakeState === "baking"}
      // Adding 'text-left' for non-Arabic ensures RU and TM characters align correctly
      className={`flex-1 min-w-0 bg-transparent text-white text-base sm:text-lg placeholder-gray-400 outline-none py-3 disabled:opacity-50 ${language !== "AR" ? "text-left" : "text-right"}`}
    />
    <button 
      onClick={generateImage}
      disabled={bakeState === "baking"}
      className="rounded-full bg-[#8a1c1c] px-5 sm:px-8 py-3 font-bold text-[#d4af37] transition-all hover:bg-[#a02020] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 whitespace-nowrap shrink-0"
    >
      {bakeState === "baking" ? "..." : t.generate}
    </button>
  </div>
  
  <p className="text-center text-xs text-white/40 mt-3 font-light tracking-wide">
     {t.disclaimer}
  </p>
</div>

      {/* --- FULL SCREEN IMAGE MODAL --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#120502]/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            
            {/* The Top Action Buttons Container */}
            <div className="absolute top-0 right-0 sm:top-4 sm:right-4 flex gap-3 z-50">
              
              {/* NEW: Download Button */}
              <button 
                onClick={handleDownload}
                title="Download Image"
                className="text-white/80 hover:text-[#d4af37] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full w-12 h-12 flex items-center justify-center text-xl transition-all shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>

              {/* Close Button */}
              <button 
                className="text-white/50 hover:text-[#d4af37] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full w-12 h-12 flex items-center justify-center text-xl transition-all shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                ✕
              </button>

            </div>
            
            {/* The Huge Image */}
            <img 
              src={selectedImage} 
              alt="Full size baked art" 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-[#d4af37]/20"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

    </main>
  );
}