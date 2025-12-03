import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Instagram, Menu, X, ChevronUp, Twitter, Facebook, Coffee, Sparkles, MessageCircle, Send } from 'lucide-react';

/**
 * ユーティリティ: 要素が画面内に入ったかどうかを検知するフック
 */
const useOnScreen = (options) => {
  const ref = useRef(null);
  const [intersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, intersecting];
};

/**
 * アニメーション付きセクションラッパー
 */
const FadeInSection = ({ children, delay = 0, className = "" }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function CafeWebsite() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gemini API Call
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsGenerating(true);
    setChatResponse("");
    
    const apiKey = ""; // The execution environment provides the key at runtime.
    const systemPrompt = `
      あなたは「喫茶灯（きっさ ともる）」という、山形県遊佐町にある静かで温かいカフェの店主です。
      お店のコンセプトは「心に灯りがともる、そんな日常を届ける場所」。
      
      あなたの役割は、お客様が入力した「今の気持ち」や「つぶやき」に対して、
      その気持ちに優しく寄り添い、心が少し軽くなるような言葉をかけることです。
      そして、その気分にぴったり合いそうな当店のメニューを1つか2つ、さりげなく提案してください。
      
      【当店のメニュー】
      - 灯ブレンドコーヒー（深みと甘みのバランスが良い）
      - カフェオレ（たっぷりのミルクで優しい味）
      - 自家製ジンジャーエール（スパイス香る大人の辛口）
      - 特製ホットサンド（サクッと香ばしい）
      - クラシックプリン（固めでほろ苦いカラメル）
      - 本日のケーキ（季節の果物を使用）
      
      【口調のガイドライン】
      - 丁寧ですが、堅苦しくなく、柔らかく、詩的な表現を好みます。
      - 短すぎず長すぎず、相手がほっとするような長さで（100〜200文字程度）。
      - 最後に「ゆっくりしていってくださいね」といった温かい言葉を添えてください。
    `;
    
    const userQuery = chatInput;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setChatResponse(text || "申し訳ありません、少し考え事をしていました。もう一度お話しいただけますか？");
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setChatResponse("申し訳ありません。今は少し言葉が出てこないようです。また後で話しかけてくださいね。");
    } finally {
      setIsGenerating(false);
    }
  };

  // 画像URLのマッピング（表示を確実にするためUnsplashの画像を使用）
  const images = {
    // 湯気の立つコーヒー
    hero: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop", 
    // ランプ・照明のイメージ（ロゴの代わり）
    logo_light: "https://images.unsplash.com/photo-1542827727-4c07b7896409?q=80&w=800&auto=format&fit=crop", 
    // 看板・雰囲気（落ち着いた店内）
    sign: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop",
    // 手元（カップを持つ温かい手）
    hands: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop",
    // ドリップ（丁寧に淹れる様子）
    drip: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
    // 影のあるコーヒー（情緒的な一枚）
    cup_shadow: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop",
    // ホットサンド（美味しそうな食事）
    food: "https://images.unsplash.com/photo-1628191010210-a59de33e5941?q=80&w=800&auto=format&fit=crop",
  };

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="font-sans text-stone-800 bg-stone-50 selection:bg-orange-200 selection:text-orange-900">
      
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6 text-white'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className={`text-2xl font-serif tracking-widest cursor-pointer flex items-center gap-2 ${scrolled ? 'text-stone-800' : 'text-white'}`} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            喫茶灯
            <span className="text-xs opacity-80 mt-1">- tomoru -</span>
          </h1>
          
          {/* Desktop Menu */}
          <div className={`hidden md:flex space-x-8 text-sm tracking-widest ${scrolled ? 'text-stone-600' : 'text-white/90'}`}>
            <button onClick={() => scrollToSection('concept')} className="hover:text-orange-400 transition-colors">想い</button>
            <button onClick={() => scrollToSection('menu')} className="hover:text-orange-400 transition-colors">メニュー</button>
            <button onClick={() => scrollToSection('gallery')} className="hover:text-orange-400 transition-colors">写真</button>
            <button onClick={() => scrollToSection('access')} className="hover:text-orange-400 transition-colors">店舗情報</button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden ${scrolled ? 'text-stone-800' : 'text-white'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-stone-100/95 backdrop-blur-sm transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden flex items-center justify-center`}>
        <div className="flex flex-col space-y-8 text-center text-xl font-serif text-stone-800">
          <button onClick={() => scrollToSection('concept')}>想い</button>
          <button onClick={() => scrollToSection('menu')}>メニュー</button>
          <button onClick={() => scrollToSection('gallery')}>写真</button>
          <button onClick={() => scrollToSection('access')}>店舗情報</button>
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={images.hero} 
            alt="湯気の立つ温かいコーヒー" 
            className="w-full h-full object-cover animate-slow-zoom"
            style={{ animation: 'pulse 20s infinite alternate' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-stone-900/60"></div>
        </div>

        <div className="relative z-10 text-center text-white p-4">
          <FadeInSection>
            <div className="mb-8 opacity-90">
               {/* ロゴの代わりに雰囲気のあるライトの画像を使用 */}
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-white/20 shadow-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                 <img src={images.logo_light} alt="灯り" className="w-full h-full object-cover" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-light tracking-[0.2em] mb-4 leading-relaxed drop-shadow-lg">
              心に灯りがともる<br />
              そんな日常を
            </h2>
            <p className="mt-8 text-sm md:text-base tracking-widest opacity-80 font-light">
            </p>
          </FadeInSection>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
          <ChevronUp className="rotate-180" />
        </div>
      </header>

      {/* Concept Section (Text) */}
      <section id="concept" className="py-24 md:py-32 px-6 bg-[#fdfbf7] overflow-hidden">
        <div className="container mx-auto max-w-4xl relative">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-10 opacity-60"></div>

          <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start md:items-center">
            
            {/* 縦書きテキスト（PC表示時） */}
            <div className="hidden md:block writing-vertical-rl text-lg leading-loose tracking-widest font-serif h-[500px] text-stone-700">
              <FadeInSection delay={100}>
                <p className="mb-12">ふーっとひと息をついて、カップを両手で包む。</p>
                <p className="mb-12">周りをゆっくり見渡してみると</p>
                <p>自分の中に流れる小さな声に気づく。</p>
              </FadeInSection>
            </div>

            {/* モバイル用テキスト & 続き */}
            <div className="md:hidden space-y-8 font-serif leading-loose tracking-wide text-stone-700">
              <FadeInSection>
                <p>ふーっとひと息をついて、<br/>カップを両手で包む。</p>
                <p>周りをゆっくり見渡してみると<br/>自分の中に流れる小さな声に気づく。</p>
                <p>いまの気持ちを感じたり、<br/>これまでの自分をそっとねぎらう。</p>
              </FadeInSection>
            </div>

            <div className="flex-1 space-y-12 font-serif leading-loose tracking-wide text-stone-700">
               {/* PCでの続きのテキストブロック */}
              <FadeInSection delay={300}>
                <div className="hidden md:block mb-12">
                   <p>いまの気持ちを感じたり、これまでの自分をそっとねぎらう。</p>
                </div>
                
                <p>
                  店主やお客さんと話したり、<br />
                  ノートをひらいたり、本をめくったり。<br />
                  人の生き方や言葉に触れるたび、<br />
                  胸の奥に新しい光が差し込んでくる。
                </p>
                <p>
                  そんな時間を重ねるうちに、<br />
                  気持ちが少しずつ晴れやかになっていく。<br />
                  やってみたかったことを思い出したり、<br />
                  誰かに声をかけてみたくなったり、<br />
                  日々のなかに、ひとつふたつと楽しみが生まれていく。
                </p>
              </FadeInSection>

              <FadeInSection delay={500}>
                <div className="mt-12 p-8 bg-white shadow-sm border border-stone-100 relative">
                  <div className="absolute -top-3 -left-3 text-4xl text-orange-200">❝</div>
                  <h3 className="text-xl md:text-2xl mb-4 font-medium text-stone-800">喫茶灯は、<br/>感じて、ひらいて、動き出せる場所。</h3>
                  <p className="text-stone-600">
                    心に灯りがともる<br />
                    そんな日常を届けています。
                  </p>
                  <div className="absolute -bottom-3 -right-3 text-4xl text-orange-200 rotate-180">❝</div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Button (Floating) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-stone-800 text-white p-4 rounded-full shadow-xl hover:bg-stone-700 transition-all duration-300 flex items-center gap-2 group"
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
          <span className={`max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap ${isChatOpen ? 'max-w-xs pl-2' : ''}`}>
             {isChatOpen ? '閉じる' : '店主に話しかける'}
          </span>
        </button>
      </div>

      {/* AI Chat Modal */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-xl shadow-2xl z-40 overflow-hidden border border-stone-200 animate-fade-in-up">
          <div className="bg-stone-800 p-4 text-white flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-full">
               <Sparkles size={18} className="text-yellow-200" />
             </div>
             <div>
               <h3 className="font-serif tracking-wider text-sm">AI店主の言葉</h3>
               <p className="text-xs text-stone-400">心に灯りをともすお手伝い</p>
             </div>
          </div>
          
          <div className="p-6 bg-stone-50 min-h-[300px] max-h-[400px] overflow-y-auto flex flex-col gap-4">
            {/* Initial Message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                 <img src={images.logo_light} alt="icon" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-stone-100 text-sm text-stone-700 leading-relaxed">
                いらっしゃいませ。<br/>
                今日はどのような気分ですか？<br/>
                よろしければ、少しお話ししませんか。
              </div>
            </div>

            {/* User Message (if any) */}
            {chatResponse && (
               <div className="flex justify-end">
                  <div className="bg-orange-100 text-stone-800 p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl text-sm max-w-[80%]">
                    {chatInput}
                  </div>
               </div>
            )}

            {/* AI Response */}
            {isGenerating ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                   <img src={images.logo_light} alt="icon" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-stone-100 text-sm text-stone-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            ) : chatResponse ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                   <img src={images.logo_light} alt="icon" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-stone-100 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {chatResponse}
                </div>
              </div>
            ) : null}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-stone-100">
             <form onSubmit={handleChatSubmit} className="flex gap-2">
               <input
                 type="text"
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 placeholder="今の気持ちを書いてみて..."
                 className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300 transition-all"
                 disabled={isGenerating}
               />
               <button 
                 type="submit" 
                 disabled={isGenerating || !chatInput.trim()}
                 className="bg-stone-800 text-white p-2 rounded-full hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Send size={18} />
               </button>
             </form>
          </div>
        </div>
      )}

      {/* Menu Section (New) */}
      <section id="menu" className="py-24 bg-stone-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif tracking-widest text-stone-800 mb-2">Menu</h2>
              <div className="w-12 h-[1px] bg-stone-400 mx-auto mb-4"></div>
              <p className="text-stone-500 text-sm font-light">心と体を温める、こだわりの一品</p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-16 font-serif">
            {/* Drink Menu */}
            <FadeInSection delay={100}>
              <h3 className="text-xl text-stone-700 border-b border-stone-200 pb-2 mb-8 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-orange-400" />
                Drink
              </h3>
              <ul className="space-y-8">
                <li className="flex justify-between items-baseline group cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-lg text-stone-800 group-hover:text-orange-500 transition-colors">灯ブレンド</h4>
                    <p className="text-sm text-stone-500 mt-1">深みと甘みのバランスが良い、当店一番人気の一杯。</p>
                  </div>
                  <span className="text-stone-600 ml-4">¥550</span>
                </li>
                <li className="flex justify-between items-baseline group cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-lg text-stone-800 group-hover:text-orange-500 transition-colors">カフェオレ</h4>
                    <p className="text-sm text-stone-500 mt-1">たっぷりのミルクで優しく仕上げました。</p>
                  </div>
                  <span className="text-stone-600 ml-4">¥600</span>
                </li>
                <li className="flex justify-between items-baseline group cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-lg text-stone-800 group-hover:text-orange-500 transition-colors">自家製ジンジャーエール</h4>
                    <p className="text-sm text-stone-500 mt-1">スパイス香る、大人の辛口ジンジャーエール。</p>
                  </div>
                  <span className="text-stone-600 ml-4">¥650</span>
                </li>
              </ul>
            </FadeInSection>

            {/* Food Menu */}
            <FadeInSection delay={200}>
              <h3 className="text-xl text-stone-700 border-b border-stone-200 pb-2 mb-8 flex items-center gap-2">
                <span className="text-xl">🥪</span>
                Food & Sweet
              </h3>
              <ul className="space-y-8">
                <li className="flex justify-between items-baseline group cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-lg text-stone-800 group-hover:text-orange-500 transition-colors">特製ホットサンド</h4>
                    <p className="text-sm text-stone-500 mt-1">外はサクッ、中はとろり。日替わり具材で。</p>
                  </div>
                  <span className="text-stone-600 ml-4">¥750</span>
                </li>
                <li className="flex justify-between items-baseline group cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-lg text-stone-800 group-hover:text-orange-500 transition-colors">クラシックプリン</h4>
                    <p className="text-sm text-stone-500 mt-1">固めでほろ苦いカラメル。昔ながらの味わい。</p>
                  </div>
                  <span className="text-stone-600 ml-4">¥450</span>
                </li>
                <li className="flex justify-between items-baseline group cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-lg text-stone-800 group-hover:text-orange-500 transition-colors">本日のケーキ</h4>
                    <p className="text-sm text-stone-500 mt-1">季節の果物を使った手作りケーキ。</p>
                  </div>
                  <span className="text-stone-600 ml-4">¥500~</span>
                </li>
              </ul>
            </FadeInSection>
          </div>
          
          <FadeInSection delay={300}>
             <div className="mt-16 text-center">
                <p className="text-xs text-stone-400">※ メニューは季節や仕入れ状況により変更になる場合がございます。</p>
             </div>
          </FadeInSection>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-stone-100">
        <div className="container mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif tracking-widest text-stone-800 mb-2">Atmosphere</h2>
              <div className="w-12 h-[1px] bg-stone-400 mx-auto"></div>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[300px]">
            {/* Image 1: Hands with cup */}
            <div className="md:col-span-8 md:row-span-2 relative group overflow-hidden shadow-md">
              <FadeInSection className="h-full w-full">
                <img src={images.hands} alt="カップを包む手" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
              </FadeInSection>
            </div>

            {/* Image 2: Drip */}
            <div className="md:col-span-4 md:row-span-1 relative group overflow-hidden shadow-md">
              <FadeInSection delay={200} className="h-full w-full">
                <img src={images.drip} alt="丁寧に淹れるドリップコーヒー" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </FadeInSection>
            </div>

            {/* Image 3: Sign/Vibe */}
            <div className="md:col-span-4 md:row-span-1 relative group overflow-hidden shadow-md bg-stone-200 flex items-center justify-center">
              <FadeInSection delay={300} className="h-full w-full">
                <img src={images.sign} alt="喫茶灯の雰囲気" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </FadeInSection>
            </div>

            {/* Image 4: Cup shadow */}
            <div className="md:col-span-4 md:row-span-2 relative group overflow-hidden shadow-md">
              <FadeInSection delay={400} className="h-full w-full">
                <img src={images.cup_shadow} alt="コーヒーと影" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </FadeInSection>
            </div>

            {/* Image 5: Sandwich (Menu teaser) */}
            <div className="md:col-span-8 md:row-span-2 relative group overflow-hidden shadow-md">
               <FadeInSection delay={500} className="h-full w-full">
                <img src={images.food} alt="ホットサンド" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent text-white">
                  <p className="font-serif text-lg tracking-wider">Coffee & Toast</p>
                  <p className="text-sm opacity-90">香ばしいホットサンドと、深みのある一杯。</p>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section id="access" className="py-24 bg-[#3c3836] text-stone-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
            
            {/* Info */}
            <div className="flex-1 max-w-md w-full">
              <FadeInSection>
                <h2 className="text-3xl font-serif tracking-widest mb-8 border-l-4 border-orange-400 pl-4">店舗情報</h2>
                
                <div className="space-y-8 font-light tracking-wide">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-orange-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-medium mb-1">住所</p>
                      <p>〒999-8301</p>
                      <p>山形県飽海郡遊佐町遊佐字小原田沼田12-12</p>
                      <p className="text-sm text-stone-400 mt-1">（遊佐町エルパ内）</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-orange-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-medium mb-1">営業時間</p>
                      <p>10:00 - 17:00 (L.O. 16:30)</p>
                      <p className="text-sm text-stone-400 mt-2">※ 定休日はInstagramをご確認ください</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>

            {/* Map */}
            <div className="flex-1 w-full h-[400px] bg-stone-200 rounded-lg overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
              <FadeInSection delay={200} className="w-full h-full">
                <iframe 
                  src="https://maps.google.com/maps?q=山形県遊佐町小原田沼田12-12+エルパ&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{border:0}} 
                  allowFullScreen="" 
                  loading="lazy" 
                  title="Google Map"
                ></iframe>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & SNS Links */}
      <footer className="bg-[#2d2a28] text-stone-400">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center gap-8">
            
            <FadeInSection className="w-full">
               <div className="flex justify-center items-center space-x-8">
                  <a href="#" className="group flex flex-col items-center gap-2 hover:text-white transition-colors">
                    <div className="p-3 rounded-full bg-stone-800 group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-red-500 group-hover:to-purple-500 transition-all duration-300">
                      <Instagram className="w-6 h-6 text-stone-300 group-hover:text-white" />
                    </div>
                    <span className="text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Instagram</span>
                  </a>

                  <a href="#" className="group flex flex-col items-center gap-2 hover:text-white transition-colors">
                    <div className="p-3 rounded-full bg-stone-800 group-hover:bg-black transition-all duration-300">
                      <Twitter className="w-6 h-6 text-stone-300 group-hover:text-white" />
                    </div>
                     <span className="text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">X (Twitter)</span>
                  </a>

                  <a href="#" className="group flex flex-col items-center gap-2 hover:text-white transition-colors">
                    <div className="p-3 rounded-full bg-stone-800 group-hover:bg-[#1877F2] transition-all duration-300">
                      <Facebook className="w-6 h-6 text-stone-300 group-hover:text-white" />
                    </div>
                     <span className="text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Facebook</span>
                  </a>
               </div>
            </FadeInSection>

            <div className="w-12 h-[1px] bg-stone-700"></div>

            <p className="font-serif tracking-widest text-sm text-stone-500">© 喫茶灯 - tomoru -</p>
          </div>
        </div>
      </footer>

      <style>{`
        .writing-vertical-rl {
          writing-mode: vertical-rl;
          text-orientation: upright;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
