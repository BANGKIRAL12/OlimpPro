import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, HelpCircle, Key, RefreshCcw, CheckCircle2, 
  XCircle, ChevronRight, Target, Award, Home, AlertTriangle,
  BrainCircuit, GraduationCap, ChevronLeft, BarChart3, Star, Zap, ShieldCheck,
  Calculator, Pi, FunctionSquare, LayoutGrid, Gem, Crown, Flame, Microscope, 
  Globe2, BookOpen, Clock, Sparkles, Pencil, MessageSquare, X, Eraser, Trash2, Send
} from 'lucide-react';

const apiKey = ""; 

// Database Bidang per Mapel
const MAPEL_CONFIG = {
  matematika: ['Campuran', 'Aljabar', 'Geometri', 'Teori Bilangan', 'Kombinatorika'],
  ipa: ['Campuran', 'Biologi', 'Fisika', 'Kimia', 'Astronomi', 'Kebumian'],
  ips: ['Campuran', 'Geografi', 'Ekonomi', 'Sejarah', 'Sosiologi']
};

const SOAL_DATABASE = {
  matematika: { sd: { kabupaten: [], provinsi: [], nasional: [] }, smp: { kabupaten: [], provinsi: [], nasional: [] } },
  ipa: { sd: { kabupaten: [], provinsi: [], nasional: [] }, smp: { kabupaten: [], provinsi: [], nasional: [] } },
  ips: { smp: { kabupaten: [], provinsi: [], nasional: [] } }
};

const fillTo25 = (pool, subject, grade, level, specificBidang) => {
  if (pool.length >= 25) return pool;
  const needed = 25 - pool.length;
  const mockData = [];
  const availableBidang = MAPEL_CONFIG[subject] || ['Umum'];
  
  for (let i = 0; i < needed; i++) {
    const currentBidang = specificBidang !== 'Campuran' ? (specificBidang || availableBidang[1]) : availableBidang[1 + (i % (availableBidang.length - 1))];
    mockData.push({
      id: `mock-${subject}-${grade}-${level}-${i}`,
      bidang: currentBidang,
      pertanyaan: `[${currentBidang}] Selesaikan soal simulasi ke-${i+1} untuk ${grade.toUpperCase()}. Berapakah nilai variabel $x$ jika $2x + 10 = ${20+i}$?`,
      jawabanBenar: `${(10+i)/2}`,
      opsiLain: [`${(10+i)}`, `${5+i}`, "0"],
      pembahasan: "Pindahkan konstanta ke ruas kanan lalu bagi dengan koefisien variabel untuk menemukan nilai $x$."
    });
  }
  return [...pool, ...mockData];
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const MathText = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\$.*?\$)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          let content = part.slice(1, -1);
          content = content.replace(/\\sqrt/g, '√').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\implies/g, '→').replace(/\\dots/g, '...');
          return <span key={i} className="font-serif italic mx-0.5 text-indigo-400 font-bold">{content}</span>;
        }
        return part;
      })}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [subject, setSubject] = useState('matematika');
  const [grade, setGrade] = useState(null);
  const [level, setLevel] = useState(null);
  const [selectedBidang, setSelectedBidang] = useState(null);
  const [isSimulasi, setIsSimulasi] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(150 * 60); 
  
  // Tools State
  const [showTools, setShowTools] = useState(false);
  const [activeTool, setActiveTool] = useState('ai'); 
  const [calcInput, setCalcInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: 'Halo! Saya asisten AI. Ada yang bisa saya bantu terkait soal ini?' }]);
  
  const scrollTargetRef = useRef(null);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('math_olympiad_v7_stats');
    return saved ? JSON.parse(saved) : { totalPoin: 0, totalSesi: 0, history: [], bidangStats: {} };
  });

  useEffect(() => {
    localStorage.setItem('math_olympiad_v7_stats', JSON.stringify(stats));
  }, [stats]);

  const RANKS = [
    { id: 1, title: "Perunggu", min: 0, color: "text-orange-500", bg: "bg-orange-100", border: "border-orange-200", icon: <Award size={32} /> },
    { id: 2, title: "Perak", min: 1000, color: "text-slate-400", bg: "bg-slate-100", border: "border-slate-200", icon: <ShieldCheck size={32} /> },
    { id: 3, title: "Emas", min: 3000, color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-200", icon: <Trophy size={32} /> },
    { id: 4, title: "Diamond", min: 7000, color: "text-cyan-400", bg: "bg-cyan-100", border: "border-cyan-200", icon: <Gem size={32} /> },
    { id: 5, title: "Legend", min: 15000, color: "text-indigo-500", bg: "bg-indigo-100", border: "border-indigo-200", icon: <Crown size={32} /> },
    { id: 6, title: "Mythic", min: 30000, color: "text-rose-500", bg: "bg-rose-100", border: "border-rose-200", icon: <Zap size={32} /> },
  ];

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(r => stats.totalPoin >= r.min) || RANKS[0];
  }, [stats.totalPoin, RANKS]);

  const nextRank = useMemo(() => RANKS.find(r => r.min > stats.totalPoin), [stats.totalPoin, RANKS]);

  const finishQuiz = () => {
    setStats(prev => ({
      ...prev,
      totalPoin: prev.totalPoin + score,
      totalSesi: prev.totalSesi + 1,
      history: [{ date: new Date().toLocaleDateString(), score, grade, level, bidang: selectedBidang, mode: isSimulasi ? 'Simulasi' : 'Latihan' }, ...prev.history].slice(0, 10)
    }));
    setShowResult(true);
    setShowTools(false);
  };

  useEffect(() => {
    let timer;
    if (quizActive && !showResult && isSimulasi && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && quizActive && isSimulasi) {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [quizActive, showResult, timeLeft, isSimulasi]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const startQuiz = (g, l, bidang, simulasi) => {
    let pool = SOAL_DATABASE[subject]?.[g]?.[l] || [];
    if (bidang !== 'Campuran') {
      pool = pool.filter(q => q.bidang === bidang);
    }
    const fullPool = fillTo25(pool, subject, g, l, bidang);
    const shuffled = [...fullPool].sort(() => Math.random() - 0.5).slice(0, 25);
    
    setQuestions(shuffled);
    setGrade(g);
    setLevel(l);
    setSelectedBidang(bidang);
    setIsSimulasi(simulasi);
    setQuizActive(true);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAiExplanation("");
    setTimeLeft(150 * 60);
    setShowTools(false);
    setChatMessages([{ role: 'ai', text: 'Halo! Saya asisten AI. Ada yang bisa saya bantu terkait soal ini?' }]);
  };

  const handleAnswer = (ans) => {
    if (selectedAnswer) return;
    setSelectedAnswer(ans);
    const currentQ = questions[currentIndex];
    const isCorrect = ans === currentQ.jawabanBenar;
    
    if (isCorrect) setScore(s => s + 4);

    setStats(prev => {
      const newBidangStats = { ...prev.bidangStats };
      if (!newBidangStats[currentQ.bidang]) newBidangStats[currentQ.bidang] = { correct: 0, total: 0 };
      newBidangStats[currentQ.bidang].total += 1;
      if (isCorrect) newBidangStats[currentQ.bidang].correct += 1;
      return { ...prev, bidangStats: newBidangStats };
    });

    setTimeout(() => {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  const handleCalc = (val) => {
    if (val === "=") {
      try {
        // Sanitize input to only allow mathematical expressions
        // Using Function constructor (indirect eval) is better for bundlers
        const indirectEval = (fn) => {
          return new Function('return ' + fn)();
        };

        let expr = calcInput.replace(/x/g, '*').replace(/÷/g, '/').replace(/\^/g, '**').replace(/π/g, 'Math.PI');
        expr = expr.replace(/sin\((.*?)\)/g, 'Math.sin($1*Math.PI/180)')
                   .replace(/cos\((.*?)\)/g, 'Math.cos($1*Math.PI/180)')
                   .replace(/tan\((.*?)\)/g, 'Math.tan($1*Math.PI/180)')
                   .replace(/√\((.*?)\)/g, 'Math.sqrt($1)')
                   .replace(/log\((.*?)\)/g, 'Math.log10($1)');
        
        const res = indirectEval(expr);
        setCalcInput(Number.isFinite(res) ? res.toString() : "Error");
      } catch { setCalcInput("Error"); }
    } else if (val === "AC") setCalcInput("");
    else if (val === "DEL") setCalcInput(p => p.slice(0, -1));
    else setCalcInput(p => p + val);
  };

  const fetchAiExplanation = async () => {
    if (loadingAi || aiExplanation) return;
    setLoadingAi(true);
    const question = questions[currentIndex];
    const prompt = `Jelaskan solusi dari soal olimpiade berikut secara langkah demi langkah: "${question.pertanyaan}". Jawaban benarnya adalah "${question.jawabanBenar}". Berikan tips belajar terkait topik ini.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      setAiExplanation(result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI sedang tidak tersedia.");
    } catch {
      setAiExplanation("Gagal memuat penjelasan AI. Periksa koneksi internet Anda.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || loadingAi) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoadingAi(true);

    const question = questions[currentIndex];
    const prompt = `Konteks: User sedang mengerjakan soal olimpiade ${subject}. Pertanyaan: ${question.pertanyaan}. User bertanya: "${userMsg}". Berikan jawaban singkat, jelas, dan edukatif dalam bahasa Indonesia.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setChatMessages(prev => [...prev, { role: 'ai', text: aiText || "Maaf, saya tidak bisa merespon saat ini." }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Koneksi terputus." }]);
    } finally {
      setLoadingAi(false);
    }
  };

  // Papan Tulis Logic
  useEffect(() => {
    if (activeTool === 'board' && canvasRef.current && showTools) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let drawing = false;

      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
      };

      const start = (e) => { drawing = true; draw(e); };
      const end = () => { drawing = false; ctx.beginPath(); };
      const draw = (e) => {
        if (!drawing) return;
        const pos = getPos(e);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      };

      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });
      canvas.addEventListener('touchend', end);

      return () => {
        canvas.removeEventListener('mousedown', start);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', end);
        canvas.removeEventListener('touchstart', start);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', end);
      };
    }
  }, [activeTool, showTools]);

  const renderBeranda = () => (
    <div className="max-w-md mx-auto pt-8 pb-32 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">OLIMPIA<span className="text-indigo-600">PRO</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">The Champion's Playground</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100"><BrainCircuit className="text-indigo-600" /></div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-slate-400" size={18} />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'matematika', label: 'MTK', icon: <Calculator size={20}/> },
              { id: 'ipa', label: 'IPA', icon: <Microscope size={20}/> },
              { id: 'ips', label: 'IPS', icon: <Globe2 size={20}/> }
            ].map(m => (
              <button key={m.id} onClick={() => { setSubject(m.id); setGrade(null); setLevel(null); }} className={`p-4 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all ${subject === m.id ? 'bg-indigo-600 border-indigo-200 text-white shadow-lg' : 'bg-white border-transparent text-slate-400 shadow-sm'}`}>
                {m.icon}
                <span className="text-[10px] font-black">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="text-slate-400" size={18} />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Jenjang</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['sd', 'smp'].filter(g => subject !== 'ips' || g === 'smp').map(g => (
              <button key={g} onClick={() => { setGrade(g); setLevel(null); }} className={`p-6 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all border-4 ${grade === g ? 'bg-indigo-600 border-indigo-200 text-white shadow-xl' : 'bg-white border-white shadow-sm text-slate-400'}`}>
                <LayoutGrid size={32} />
                <span className="font-black uppercase">{g}</span>
              </button>
            ))}
          </div>
        </section>

        {grade && (
          <section className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 mb-4">
              <Target className="text-slate-400" size={18} />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tingkat</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['kabupaten', 'provinsi', 'nasional'].map((l) => (
                <button key={l} onClick={() => setLevel(l)} className={`p-4 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all ${level === l ? 'bg-indigo-600 border-indigo-200 text-white shadow-lg' : 'bg-white border-transparent text-slate-400 shadow-sm'}`}>
                   <span className="text-[10px] font-black capitalize">{l}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {level && (
          <section className="animate-in slide-in-from-bottom-4 duration-500 pb-10">
             <div className="flex items-center gap-2 mb-4">
              <Star className="text-slate-400" size={18} />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Bidang</h2>
            </div>
            <div className="space-y-4">
              {MAPEL_CONFIG[subject].map((b) => (
                <div key={b} className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-50">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="font-black text-slate-700">{b}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => startQuiz(grade, level, b, false)} className="py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
                      <BookOpen size={14}/> Latihan
                    </button>
                    <button onClick={() => startQuiz(grade, level, b, true)} className="py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
                      <Clock size={14}/> Simulasi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderStatistik = () => (
    <div className="max-w-md mx-auto pt-8 pb-32 px-6">
      <h2 className="text-2xl font-black text-slate-800 mb-6 italic text-center">Analisis Kemampuan</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-black opacity-60 uppercase">Total XP</p>
          <div className="text-4xl font-black">{stats.totalPoin}</div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between aspect-square">
          <p className="text-[10px] font-black text-slate-400 uppercase">Total Sesi</p>
          <div className="text-4xl font-black text-slate-800">{stats.totalSesi}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm mb-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Kekuatan Materi</h3>
        <div className="space-y-6">
          {Object.entries(stats.bidangStats).length > 0 ? Object.entries(stats.bidangStats).map(([bidang, data]) => {
            const ratio = (data.correct / data.total) * 100;
            return (
              <div key={bidang}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-slate-700">{bidang}</span>
                  <span className="text-sm font-black text-indigo-600">{Math.round(ratio)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${ratio < 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${ratio}%` }} />
                </div>
              </div>
            );
          }) : <p className="text-center text-slate-400 text-xs py-10 italic">Data belum tersedia.</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Riwayat Terakhir</h3>
        {stats.history.map((h, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-50 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${h.mode === 'Simulasi' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                 {h.mode === 'Simulasi' ? <Clock size={18}/> : <BookOpen size={18}/>}
               </div>
               <div>
                 <p className="text-sm font-black text-slate-700">{h.bidang}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{h.date} • {h.level}</p>
               </div>
             </div>
             <div className="text-right">
               <p className="text-lg font-black text-indigo-600">+{h.score}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPeringkat = () => (
    <div className="max-w-md mx-auto pt-10 pb-32 px-6">
      <div className={`w-full p-8 rounded-[3.5rem] ${currentRank.bg} border-4 ${currentRank.border} mb-12 flex flex-col items-center shadow-xl relative overflow-hidden`}>
        <div className={`${currentRank.color} mb-4 p-5 bg-white rounded-[2rem] shadow-sm`}>{React.cloneElement(currentRank.icon, { size: 48 })}</div>
        <h3 className={`text-3xl font-black ${currentRank.color}`}>{currentRank.title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase mb-8 mt-1">Peringkat Kamu</p>
        
        <div className="w-full">
           <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-3 px-1">
              <span>Progres</span>
              <span>{stats.totalPoin} / {nextRank ? nextRank.min : 'MAX'} XP</span>
           </div>
           <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden p-1">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-md" style={{ width: nextRank ? `${(stats.totalPoin / nextRank.min) * 100}%` : '100%' }} />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {RANKS.map((r) => (
          <div key={r.id} className={`p-5 rounded-[2.5rem] flex items-center justify-between border-2 ${stats.totalPoin >= r.min ? 'bg-white border-white shadow-sm' : 'bg-slate-100 border-transparent opacity-50 grayscale'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.bg} ${r.color}`}>
                {React.cloneElement(r.icon, { size: 24 })}
              </div>
              <div>
                 <p className="font-black text-slate-700 text-sm">{r.title}</p>
                 <p className="text-[10px] font-bold text-slate-400">{r.min} XP</p>
              </div>
            </div>
            {stats.totalPoin >= r.min && <CheckCircle2 className="text-emerald-500" size={20} />}
          </div>
        ))}
      </div>
    </div>
  );

  const ToolPanel = () => {
    if (!showTools) return null;
    return (
      <div className="fixed inset-x-0 bottom-0 md:inset-x-auto md:right-8 md:bottom-24 z-[200] animate-in slide-in-from-bottom-full md:slide-in-from-right-full duration-300">
        <div className="bg-white w-full md:w-[360px] h-[75vh] md:h-[500px] rounded-t-[3rem] md:rounded-[3rem] shadow-2xl border-t md:border border-slate-100 overflow-hidden flex flex-col ring-1 ring-black/5">
          <div className="flex items-center p-2 bg-slate-50 border-b border-slate-100">
             <div className="flex flex-1 p-1 gap-1">
                {[
                  { id: 'ai', icon: <MessageSquare size={16}/>, label: 'Chat AI' },
                  { id: 'board', icon: <Pencil size={16}/>, label: 'Coretan' },
                  { id: 'calc', icon: <Calculator size={16}/>, label: 'Kalkul' }
                ].map(tool => (
                  <button key={tool.id} onClick={() => setActiveTool(tool.id)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all ${activeTool === tool.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}>
                    {tool.icon} {tool.label}
                  </button>
                ))}
             </div>
             <button onClick={() => setShowTools(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTool === 'calc' && (
              <div className="w-full max-w-[350px] bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-white">
                <div className="h-full flex flex-col box-border p-6">
                  {/* Layar Kalkulator */}
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] mb-6 text-right shadow-lg">
                    <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Result</div>
                      <div className="text-white text-4xl font-light font-mono truncate tracking-tighter">
                        {calcInput || "0"}
                      </div>
                    </div>

                    {/* Grid Tombol */}
                    <div className="grid grid-cols-4 gap-3 flex-1">
                      {[
                        'sin(', 'cos(', 'tan(', 'log(', 
                        '√(', '^', '(', ')', 
                        'AC', 'DEL', '/', '*', 
                        '7', '8', '9', '-', 
                        '4', '5', '6', '+', 
                        '1', '2', '3', '=', 
                        '0', '.'
                      ].map(b => {
                        const isOperator = ['/', '*', '-', '+', '=', 'AC', 'DEL'].includes(b);
                        const isAction = ['AC', 'DEL'].includes(b);
                        const isEquals = b === '=';
                        const isFunction = ['sin(', 'cos(', 'tan(', 'log(', '√(', '^'].includes(b);

                        return (
                          <button
                            key={b}
                            onClick={() => handleCalc(b)}
                            className={`
                              h-12 rounded-2xl font-bold text-[13px] transition-all duration-200 active:scale-90
                              ${isEquals 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 col-span-1' 
                                : isAction
                                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                                : isFunction
                                ? 'bg-slate-50 text-indigo-500 hover:bg-indigo-50 border border-slate-100'
                                : isOperator
                                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }
                            `}
                          >
                            {b === '√(' ? '√' : b}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
            )}

            {activeTool === 'board' && (
              <div className="flex-1 flex flex-col bg-white p-4">
                <div className="flex-1 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden">
                   <canvas ref={canvasRef} width={340} height={360} className="w-full h-full cursor-crosshair touch-none" />
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => { const c = canvasRef.current; c.getContext('2d').clearRect(0,0,c.width,c.height); }} className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><Trash2 size={16}/> Bersihkan</button>
                </div>
              </div>
            )}

            {activeTool === 'ai' && (
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                   {chatMessages.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-[2rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-lg' : 'bg-slate-100 text-slate-700 rounded-bl-none border border-slate-50'}`}>
                           {msg.text}
                        </div>
                     </div>
                   ))}
                   <div ref={chatEndRef} />
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                   <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Tanya sesuatu..." className="flex-1 bg-white px-5 py-3 rounded-2xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                   <button onClick={handleSendMessage} disabled={loadingAi} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50">
                     {loadingAi ? <RefreshCcw size={18} className="animate-spin"/> : <Send size={18}/>}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (quizActive) {
    return (
      <div className="min-h-screen bg-white fixed inset-0 z-[100] flex flex-col overflow-hidden selection:bg-indigo-100">
        <div className="bg-white border-b border-slate-50 px-6 py-4 flex items-center justify-between flex-shrink-0 z-[101]">
          <button onClick={() => setQuizActive(false)} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] hover:text-indigo-600 transition-colors"><Home size={18} /> Keluar</button>
          {isSimulasi ? (
            <div className="flex items-center gap-2 bg-rose-50 px-4 py-1.5 rounded-full text-rose-600 border border-rose-100">
               <Clock size={14} className="animate-pulse" />
               <span className="text-xs font-black tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          ) : <div className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest italic">Latihan Terpandu</div>}
          <div className="text-indigo-600 font-black tracking-tighter text-lg">{score} XP</div>
        </div>

        {!showResult ? (
          <div className="flex-1 overflow-y-auto px-6 py-8 pb-48">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6 px-1">
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic leading-none">No. {currentIndex + 1} dari 25</span>
                 <span className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-md">{questions[currentIndex]?.bidang}</span>
              </div>

              <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl mb-10 text-center relative overflow-hidden min-h-[180px] flex items-center justify-center border-4 border-slate-800">
                <div className="relative z-10 text-xl font-medium leading-relaxed selection:text-indigo-300"><MathText text={questions[currentIndex]?.pertanyaan} /></div>
                <div className="absolute top-0 left-0 h-1.5 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-700" style={{ width: `${((currentIndex + 1) / 25) * 100}%` }} />
              </div>

              <div className="space-y-4">
                {[questions[currentIndex]?.jawabanBenar, ...questions[currentIndex]?.opsiLain].sort().map((opsi, idx) => {
                  const isSelected = selectedAnswer === opsi;
                  const isCorrect = opsi === questions[currentIndex]?.jawabanBenar;
                  let style = "bg-slate-50 border-transparent text-slate-700 active:scale-[0.98]";
                  if (selectedAnswer) {
                    if (isCorrect) style = "bg-emerald-500 border-emerald-300 text-white shadow-lg scale-[1.02]";
                    else if (isSelected) style = "bg-rose-500 border-rose-300 text-white opacity-60";
                    else style = "bg-slate-50 text-slate-300 opacity-40";
                  }
                  return (
                    <button key={idx} disabled={!!selectedAnswer} onClick={() => handleAnswer(opsi)} className={`w-full p-6 rounded-[2.5rem] text-left font-bold border-2 transition-all flex items-center justify-between ${style}`}>
                      <MathText text={opsi} />
                      {selectedAnswer && isCorrect && <CheckCircle2 size={22} className="animate-in zoom-in" />}
                    </button>
                  );
                })}
              </div>

              <div ref={scrollTargetRef} className="h-4" />

              {selectedAnswer && (
                <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="flex items-center gap-3">
                    <button onClick={fetchAiExplanation} className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0">
                      {loadingAi ? <RefreshCcw size={22} className="animate-spin" /> : <Sparkles size={22} />}
                    </button>
                    <button onClick={() => setShowExplanation(!showExplanation)} className={`flex-1 py-5 rounded-[2.2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${showExplanation ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-indigo-100 text-indigo-600'}`}>
                      <Key size={18} /> Lihat Kunci
                    </button>
                    <button onClick={() => currentIndex < questions.length - 1 ? (setCurrentIndex(currentIndex + 1), setSelectedAnswer(null), setShowExplanation(false), setAiExplanation("")) : finishQuiz()} className="flex-1 py-5 bg-slate-900 text-white rounded-[2.2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 group">
                      Selanjutnya <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {showExplanation && (
                    <div className="bg-indigo-50 p-8 rounded-[3rem] border-2 border-indigo-100 shadow-sm animate-in zoom-in-95">
                       <h3 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2"><Target size={14}/> Solusi Konseptual</h3>
                       <div className="text-indigo-800 text-sm font-medium leading-relaxed"><MathText text={questions[currentIndex]?.pembahasan} /></div>
                    </div>
                  )}

                  {aiExplanation && (
                    <div className="bg-amber-50 p-8 rounded-[3rem] border-2 border-amber-100 shadow-sm animate-in zoom-in-95">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-amber-600" />
                        <h3 className="font-black text-amber-900 text-[10px] uppercase tracking-widest italic">Analisis AI Puter</h3>
                      </div>
                      <div className="text-amber-800 text-sm font-medium whitespace-pre-wrap leading-relaxed">{aiExplanation}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center text-center">
            <div className={`w-36 h-36 ${currentRank.bg} rounded-[4rem] flex items-center justify-center mb-10 shadow-2xl ${currentRank.color} ring-8 ring-white animate-bounce`}>{React.cloneElement(currentRank.icon, { size: 72 })}</div>
            <h2 className="text-4xl font-black text-slate-800 mb-2 italic tracking-tight">Luar Biasa!</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">Sesi Kompetisi Selesai</p>
            
            <div className="bg-white w-full max-w-sm p-12 rounded-[4.5rem] mb-12 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4 italic">Perolehan Kamu</span>
                <div className="text-9xl font-black text-indigo-600 leading-none tracking-tighter">{score}</div>
                <div className="mt-8 flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={20} className={score >= (i+1)*20 ? "fill-amber-400 text-amber-400" : "text-slate-100"} />)}
                </div>
            </div>
            
            <button onClick={() => setQuizActive(false)} className="w-full max-w-sm py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">Menu Utama</button>
          </div>
        )}

        {!isSimulasi && !showResult && (
          <>
            <div className="fixed bottom-10 right-8 z-[210]">
              <button onClick={() => setShowTools(!showTools)} className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 ${showTools ? 'bg-rose-500 text-white rotate-[135deg] scale-90' : 'bg-indigo-600 text-white hover:scale-110 active:scale-95'}`}>
                 <LayoutGrid size={28}/>
              </button>
              {!showTools && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <ToolPanel />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="pb-32 animate-in fade-in duration-700">
        {activeTab === 'beranda' && renderBeranda()} 
        {activeTab === 'statistik' && renderStatistik()} 
        {activeTab === 'peringkat' && renderPeringkat()}
      </div>
      
      <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-6">
        <nav className="bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[3rem] p-2.5 flex items-center justify-between w-full max-w-md ring-1 ring-black/5">
          {['beranda', 'statistik', 'peringkat'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-[2.5rem] transition-all duration-300 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-indigo-400'}`}>
              {tab === 'beranda' ? <Home size={22}/> : tab === 'statistik' ? <BarChart3 size={22}/> : <Trophy size={22}/>}
              <span className="text-[10px] font-black uppercase tracking-wider leading-none">{tab}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
