import React, { useState, useEffect, useRef, useMemo } from 'react';
import { marked } from 'marked';
import {
  Wand2,
  History,
  Code2,
  PenTool,
  Layers,
  CheckCircle2,
  RotateCcw,
  Copy,
  Download,
  Trash2,
  X,
  ExternalLink,
  Info,
  AlertTriangle,
  FolderOpen,
  Sparkles,
  Zap,
  ShieldCheck,
  Brain,
  Target,
  FileCode2,
  LayoutDashboard
} from 'lucide-react';
import { FrameworkType, HistoryItem, AnatomyCard, PresetItem, ToastMessage } from './types';

const PRESETS: Record<string, PresetItem> = {
  fullstack_saas: {
    text: "Bangun aplikasi web SaaS B2B manajemen tim & proyek dengan autentikasi multi-tenant, workspace switcher, subscription billing Stripe, REST API Express/Next.js, database PostgreSQL/Drizzle ORM, dan antarmuka Tailwind CSS modern dengan Dark Mode.",
    model: "Claude 3.7 Sonnet (Hybrid Thinking)",
    framework: "elite",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "Fullstack Web App (Frontend + Backend + DB)"
  },
  antigravity: {
    text: "Bertindaklah sebagai autonomous web dev agent untuk mengaudit, merefactor, dan memodernisasi web app ini: pasang strict TypeScript types, hapus dependensi yang tidak terpakai di package.json, perbaiki arsitektur komponen, buat build green 100%, dan jalankan verifikasi CLI tanpa regresi.",
    model: "Google Antigravity Agent",
    framework: "agentic",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "System Refactoring, Clean Architecture & Optimization"
  },
  rest_api: {
    text: "Rancang arsitektur backend REST API produksi untuk sistem e-commerce: validasi request dengan Zod schema, otorisasi JWT bearer token, rate limiting, logging terstruktur, error handling middleware global, dan database migration Drizzle/Prisma.",
    model: "Gemini 4 Argon & 3.8 Flash",
    framework: "elite",
    techStack: "Node.js (Express / Fastify) + PostgreSQL / SQLite REST API",
    devRole: "Backend REST API, Auth & Database Layer"
  },
  dashboard_ui: {
    text: "Rancang antarmuka dashboard analitik web responsif mobile-first: KPI stat cards dengan tren persentase, chart interaktif, filter rentang tanggal, data table dengan sorting/pagination, modal drawer, dan status empty/loading skeleton.",
    model: "Claude 3.7 Sonnet (Hybrid Thinking)",
    framework: "elite",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "Frontend UI & Interactive Dashboard SPA"
  },
  refactor: {
    text: "Lakukan refactoring arsitektur pada web app monolithic yang lambat: pisahkan business logic ke custom hooks/services, terapkan Clean Architecture, eliminasi prop-drilling, optimasi render cycle, dan sertakan unit test Vitest.",
    model: "DeepSeek R1 & V3",
    framework: "elite",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "System Refactoring, Clean Architecture & Optimization"
  },
  auth_security: {
    text: "Implementasikan sistem autentikasi & keamanan web tingkat tinggi: Role-Based Access Control (Admin, Manager, Member), proteksi CSRF, Content Security Policy (CSP), sanitasi XSS, password hashing argon2/bcrypt, dan audit log sesi pengguna.",
    model: "OpenAI o3 & GPT-4o",
    framework: "elite",
    techStack: "Node.js (Express / Fastify) + PostgreSQL / SQLite REST API",
    devRole: "Web App Security, RBAC & Protection"
  }
};

export default function App() {
  const [promptInput, setPromptInput] = useState('');
  const [framework, setFramework] = useState<FrameworkType>('elite');
  const [targetModel, setTargetModel] = useState('Google Antigravity Agent');
  const [techStack, setTechStack] = useState('TypeScript + React / Next.js + Tailwind CSS');
  const [devRole, setDevRole] = useState('Fullstack Web App (Frontend + Backend + DB)');
  const [tone, setTone] = useState('teknis');
  const [language, setLanguage] = useState('id');

  const [currentMarkdown, setCurrentMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');
  const [activeView, setActiveView] = useState<'rendered' | 'anatomy' | 'raw'>('rendered');

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('master_prompt_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse history:', e);
    }
  }, []);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const saveToHistory = (idea: string, markdown: string, model: string, currentTone: string) => {
    const newItem: HistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleString('id-ID'),
      idea: idea.slice(0, 100),
      fullIdea: idea,
      markdown,
      model,
      tone: currentTone,
      framework
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((item) => item.id !== newItem.id)].slice(0, 20);
      try {
        localStorage.setItem('master_prompt_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      return updated;
    });
  };

  const deleteHistoryItem = (id: number) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      localStorage.setItem('master_prompt_history', JSON.stringify(updated));
      return updated;
    });
    showToast('Item riwayat dihapus.', 'info');
  };

  const clearAllHistory = () => {
    if (window.confirm('Hapus seluruh riwayat prompt tersimpan?')) {
      localStorage.removeItem('master_prompt_history');
      setHistory([]);
      showToast('Riwayat berhasil dibersihkan.', 'info');
    }
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    setPromptInput(item.fullIdea || item.idea);
    setCurrentMarkdown(item.markdown);
    if (item.model) setTargetModel(item.model);
    if (item.tone) setTone(item.tone);
    if (item.framework && (item.framework === 'elite' || item.framework === 'agentic' || item.framework === 'standard')) {
      setFramework(item.framework as FrameworkType);
    }
    setIsHistoryOpen(false);
    showToast('Prompt dari riwayat berhasil dibuka!', 'info');
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setPromptInput(preset.text);
    if (preset.model) setTargetModel(preset.model);
    if (preset.framework) setFramework(preset.framework);
    if (preset.techStack) setTechStack(preset.techStack);
    if (preset.devRole) setDevRole(preset.devRole);
    textareaRef.current?.focus();
    showToast(`Preset Web Dev dimuat untuk ${preset.model}!`, 'info');
  };

  const handleGenerate = async (refinementText = '') => {
    if (isGenerating) return;

    const trimmedInput = promptInput.trim();
    if (!trimmedInput) {
      showToast('Harap masukkan topik atau ide prompt terlebih dahulu.', 'error');
      return;
    }

    const isRefiningCall = Boolean(refinementText);
    if (isRefiningCall) {
      setIsRefining(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmedInput,
          targetModel,
          tone,
          language,
          framework,
          techStack,
          devRole,
          refinement: refinementText,
          previousPrompt: currentMarkdown
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.text) {
        setCurrentMarkdown(result.text);
        saveToHistory(trimmedInput, result.text, targetModel, tone);
        showToast(
          isRefiningCall ? 'Prompt berhasil disempurnakan!' : 'Master Prompt berhasil dibangun!',
          'success'
        );
        setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error('Respon AI tidak menghasilkan teks yang valid.');
      }
    } catch (err: any) {
      console.error('Error generating prompt:', err);
      showToast(err.message || 'Terjadi kendala saat menghubungi server AI.', 'error');
    } finally {
      setIsGenerating(false);
      setIsRefining(false);
    }
  };

  const handleRefine = () => {
    const text = refinementInput.trim();
    if (!text) {
      showToast('Tuliskan modifikasi yang diinginkan terlebih dahulu.', 'error');
      return;
    }
    handleGenerate(text);
    setRefinementInput('');
  };

  const copyToClipboard = async (text: string, successMsg = 'Master Prompt disalin ke clipboard!') => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast(successMsg, 'success');
        return;
      }
    } catch (e) {
      console.warn('Clipboard API error, fallback to execCommand:', e);
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg, 'success');
    } catch (err) {
      showToast('Gagal menyalin teks secara otomatis.', 'error');
    }
    document.body.removeChild(ta);
  };

  const downloadPrompt = () => {
    if (!currentMarkdown) return;
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-prompt-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Berkas .md berhasil diunduh!', 'success');
  };

  // Metrics
  const metrics = useMemo(() => {
    if (!currentMarkdown) return { words: 0, chars: 0, tokens: 0 };
    const words = currentMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const chars = currentMarkdown.length;
    const tokens = Math.round(words * 1.33);
    return { words, chars, tokens };
  }, [currentMarkdown]);

  // Anatomy Cards
  const anatomyCards = useMemo<AnatomyCard[]>(() => {
    if (!currentMarkdown) return [];
    const sectionRegex = /###\s+([^\n]+)\n([\s\S]*?)(?=(?:###\s+[^\n]+)|$)/g;
    let match;
    const parsed: AnatomyCard[] = [];

    while ((match = sectionRegex.exec(currentMarkdown)) !== null) {
      const rawTitle = match[1].trim();
      const content = match[2].trim();
      if (content) {
        const titleLower = rawTitle.toLowerCase();
        let icon = 'cube';
        let color = 'orange';

        if (titleLower.includes('role') || titleLower.includes('persona')) {
          icon = 'user-tie';
          color = 'amber';
        } else if (titleLower.includes('task') || titleLower.includes('objective') || titleLower.includes('tugas')) {
          icon = 'target';
          color = 'orange';
        } else if (titleLower.includes('context') || titleLower.includes('konteks') || titleLower.includes('environment')) {
          icon = 'layers';
          color = 'sky';
        } else if (titleLower.includes('constraint') || titleLower.includes('guardrail') || titleLower.includes('safety') || titleLower.includes('batasan')) {
          icon = 'shield';
          color = 'rose';
        } else if (titleLower.includes('reasoning') || titleLower.includes('penalaran') || titleLower.includes('plan')) {
          icon = 'brain';
          color = 'purple';
        } else if (titleLower.includes('few-shot') || titleLower.includes('calibration') || titleLower.includes('example') || titleLower.includes('contoh')) {
          icon = 'sparkles';
          color = 'emerald';
        } else if (titleLower.includes('stop') || titleLower.includes('exit') || titleLower.includes('criteria') || titleLower.includes('kondisi')) {
          icon = 'check-circle';
          color = 'red';
        } else if (titleLower.includes('output') || titleLower.includes('format') || titleLower.includes('deliverable') || titleLower.includes('keluaran')) {
          icon = 'file-code';
          color = 'indigo';
        }

        parsed.push({
          title: rawTitle,
          content,
          icon,
          color
        });
      }
    }

    if (parsed.length === 0) {
      parsed.push({
        title: 'Master Prompt',
        content: currentMarkdown,
        icon: 'cube',
        color: 'orange'
      });
    }

    return parsed;
  }, [currentMarkdown]);

  // Structural Quality Audit
  const audit = useMemo(() => {
    if (!currentMarkdown) return { score: 70, checks: [] };
    let score = 70;
    const checks: string[] = [];

    const hasRole = anatomyCards.some((c) => c.title.toLowerCase().includes('role'));
    if (hasRole) {
      score += 5;
      checks.push('✓ Persona Ahli');
    }

    const hasTask = anatomyCards.some(
      (c) => c.title.toLowerCase().includes('task') || c.title.toLowerCase().includes('objective')
    );
    if (hasTask) {
      score += 5;
      checks.push('✓ Tugas Objektif');
    }

    const hasGuardrails = anatomyCards.some(
      (c) =>
        c.title.toLowerCase().includes('constraint') ||
        c.title.toLowerCase().includes('guardrail') ||
        c.title.toLowerCase().includes('safety')
    );
    if (hasGuardrails) {
      score += 10;
      checks.push('✓ Guardrails Negatif');
    }

    const hasStop = anatomyCards.some(
      (c) => c.title.toLowerCase().includes('stop') || c.title.toLowerCase().includes('exit')
    );
    if (hasStop) {
      score += 5;
      checks.push('✓ Kriteria Berhenti');
    }

    const hasFewShot = anatomyCards.some(
      (c) => c.title.toLowerCase().includes('few-shot') || c.title.toLowerCase().includes('calibration')
    );
    if (hasFewShot) {
      score += 5;
      checks.push('✓ Kalibrasi Few-Shot');
    }

    if (score > 100) score = 100;
    return { score, checks };
  }, [currentMarkdown, anatomyCards]);

  const renderedHtml = useMemo(() => {
    if (!currentMarkdown) return '';
    return marked.parse(currentMarkdown, { breaks: true, gfm: true }) as string;
  }, [currentMarkdown]);

  const frameworkIndicatorText = useMemo(() => {
    if (framework === 'elite') {
      return 'Framework Aktif: Elite 8-Anatomi (Zero-Drift & Defensive Guardrails)';
    } else if (framework === 'agentic') {
      return 'Framework Aktif: Agentik Otonom (Tools Authority & Exit Criteria)';
    }
    return 'Framework Aktif: Standar Klasik (6-Bagian Claude Anatomy Asli)';
  }, [framework]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Master Prompt Studio</h1>
                <span className="text-[10px] font-semibold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-wider">
                  Claude Anatomy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Framework 6-Bagian: Role • Task • Context • Reasoning • Stop conditions • Output
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-2"
            >
              <History className="w-4 h-4 text-orange-400" />
              <span>
                Riwayat (<span>{history.length}</span>)
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono">Gemini AI Aktif</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Input Section */}
        <section className="glass-panel rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-orange-500" />
                Masukan Ide / Tugas Anda
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Tuliskan ide awal Anda. Sistem akan menstrukturkannya menjadi Master Prompt yang tajam dan teruji.
              </p>
            </div>
            {/* Shortcut tip */}
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/70 px-2.5 py-1 rounded-md border border-slate-700/50">
              Tekan <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700 font-mono text-slate-300">Ctrl</kbd> +{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700 font-mono text-slate-300">Enter</kbd> untuk hasilkan
            </span>
          </div>

          {/* Preset Inspiration Chips (Web Dev Focused) */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-orange-400" />
              Preset Khusus Web App Development (Siap Pakai AI Coding):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadPreset('fullstack_saas')}
                className="text-xs bg-slate-800/90 hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1.5"
              >
                <span>🌐</span> Fullstack SaaS Web App
              </button>
              <button
                type="button"
                onClick={() => loadPreset('antigravity')}
                className="text-xs bg-slate-800/90 hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1.5"
              >
                <span>⚡</span> Google Antigravity Web Agent
              </button>
              <button
                type="button"
                onClick={() => loadPreset('rest_api')}
                className="text-xs bg-slate-800/90 hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1.5"
              >
                <span>🛠️</span> REST API + Auth & Database
              </button>
              <button
                type="button"
                onClick={() => loadPreset('dashboard_ui')}
                className="text-xs bg-slate-800/90 hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1.5"
              >
                <span>🎨</span> Responsive SaaS Dashboard
              </button>
              <button
                type="button"
                onClick={() => loadPreset('refactor')}
                className="text-xs bg-slate-800/90 hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1.5"
              >
                <span>🔄</span> Refactor & Clean Architecture
              </button>
              <button
                type="button"
                onClick={() => loadPreset('auth_security')}
                className="text-xs bg-slate-800/90 hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1.5"
              >
                <span>🛡️</span> Web Security & Auth (RBAC)
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={4}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-y shadow-inner text-sm leading-relaxed"
              placeholder="Contoh: Buatkan prompt untuk membangun aplikasi web inventaris gudang real-time dengan barcode scanner, REST API Express, SQLite/Drizzle ORM, dan dashboard Tailwind responsif..."
            />
            <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 font-mono pointer-events-none">
              {promptInput.length} karakter
            </div>
          </div>

          {/* Customization Bar (Web Dev Augmented) */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                Arsitektur Framework
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as FrameworkType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="elite">⭐ Elite 8-Anatomi (Produksi: Guardrails & Few-Shot)</option>
                <option value="agentic">🤖 Agentik Otonom (8-Bagian: Tools & Exit Criteria)</option>
                <option value="standard">📜 Standar Klasik (6-Bagian Claude Anatomy Asli)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Model AI Coding</label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Google Antigravity Agent">Google Antigravity Agent (Autonomous Agentic & Tools)</option>
                <option value="Claude 3.7 Sonnet (Hybrid Thinking)">Claude 3.7 Sonnet (Hybrid Thinking / Flagship)</option>
                <option value="Gemini 4 Argon & 3.8 Flash">Gemini 4 Argon & 3.8 Flash (Google Flagship)</option>
                <option value="OpenAI o3 & GPT-4o">OpenAI o3 & GPT-4o (Reasoning & Speed)</option>
                <option value="DeepSeek R1 & V3">DeepSeek R1 & V3 (Deep Logical Reasoning)</option>
                <option value="Universal LLM">Universal LLM (Lintas Model / Standar Industri)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                Target Web Tech Stack
              </label>
              <select
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="TypeScript + React / Next.js + Tailwind CSS">Next.js + React + TS + Tailwind</option>
                <option value="Vite + React + Node.js (Express) + TypeScript">Vite + React + Node Express</option>
                <option value="Node.js (Express / Fastify) + PostgreSQL / SQLite REST API">Node.js REST API + Database</option>
                <option value="Vanilla Modern HTML5/CSS3 + TypeScript (Vite/Node)">Modern Vanilla JS/TS + Vite</option>
                <option value="Python (FastAPI / Flask) + Modern Web UI">Python (FastAPI) + Web UI</option>
                <option value="auto">Otomatis / AI Rekomendasi</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Arsitektur / Scope Web
              </label>
              <select
                value={devRole}
                onChange={(e) => setDevRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Fullstack Web App (Frontend + Backend + DB)">Fullstack Web App (Lengkap)</option>
                <option value="Frontend UI & Interactive Dashboard SPA">Frontend UI & Dashboard SPA</option>
                <option value="Backend REST API, Auth & Database Layer">Backend API, Auth & Database</option>
                <option value="System Refactoring, Clean Architecture & Optimization">Refactoring & Optimasi Sistem</option>
                <option value="Web App Security, RBAC & Protection">Keamanan, RBAC & Auth</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Gaya Bahasa / Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="teknis">Sangat Teknis & Mendalam (Code Ready)</option>
                <option value="profesional">Profesional & Strategis</option>
                <option value="ringkas">Ringkas & Berorientasi Aksi</option>
                <option value="kreatif">Kreatif & Persuasif</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Bahasa Output Prompt</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English (Direkomendasikan untuk AI Coding)</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{frameworkIndicatorText}</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setPromptInput('');
                  textareaRef.current?.focus();
                }}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs font-medium"
              >
                Bersihkan
              </button>
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || isRefining}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-2.5 px-7 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Membangun Arsitektur...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Bangun Master Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Output Workspace */}
        {currentMarkdown && (
          <section ref={outputRef} className="glass-panel rounded-2xl p-6 md:p-8">
            {/* Quality Audit Bar */}
            <div className="mb-5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-slate-200">Audit Kualitas Struktur:</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">
                  {audit.score}% Produksi
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {audit.checks.map((chk, i) => (
                  <span
                    key={i}
                    className="bg-slate-800/90 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-medium"
                  >
                    {chk}
                  </span>
                ))}
              </div>
            </div>

            {/* Header bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Hasil Master Prompt
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{metrics.words} kata</span> • <span>{metrics.chars} karakter</span> •{' '}
                  <span>~{metrics.tokens} token est.</span>
                </div>
              </div>

              {/* Tabs & Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Tab Buttons */}
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
                  <button
                    onClick={() => setActiveView('rendered')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      activeView === 'rendered' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dokumen
                  </button>
                  <button
                    onClick={() => setActiveView('anatomy')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      activeView === 'anatomy' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Kartu Anatomi ({anatomyCards.length})
                  </button>
                  <button
                    onClick={() => setActiveView('raw')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      activeView === 'raw' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Raw
                  </button>
                </div>

                {/* Copy All Button */}
                <button
                  onClick={() => copyToClipboard(currentMarkdown, 'Master Prompt disalin ke clipboard!')}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Prompt</span>
                </button>
                {/* Download Button */}
                <button
                  onClick={downloadPrompt}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium py-2 px-3 rounded-xl transition flex items-center gap-1.5 text-xs"
                  title="Unduh berkas .md"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* View 1: Rendered Markdown */}
            {activeView === 'rendered' && (
              <div
                className="markdown-body bg-slate-900/60 p-6 md:p-8 rounded-xl border border-slate-800/80 shadow-inner min-h-[220px]"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            )}

            {/* View 2: Anatomy Cards */}
            {activeView === 'anatomy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anatomyCards.map((card, idx) => {
                  const cardHtml = marked.parse(card.content, { breaks: true, gfm: true }) as string;
                  return (
                    <div
                      key={idx}
                      className="glass-panel-light p-5 rounded-xl border border-slate-700/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60">
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                            {card.icon === 'user-tie' && <Wand2 className="w-4 h-4 text-amber-400" />}
                            {card.icon === 'target' && <Target className="w-4 h-4 text-orange-400" />}
                            {card.icon === 'layers' && <Layers className="w-4 h-4 text-sky-400" />}
                            {card.icon === 'shield' && <ShieldCheck className="w-4 h-4 text-rose-400" />}
                            {card.icon === 'brain' && <Brain className="w-4 h-4 text-purple-400" />}
                            {card.icon === 'sparkles' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                            {card.icon === 'check-circle' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                            {card.icon === 'file-code' && <FileCode2 className="w-4 h-4 text-indigo-400" />}
                            {card.title}
                          </span>
                          <button
                            onClick={() => copyToClipboard(card.content, `Bagian ${card.title} berhasil disalin!`)}
                            className="text-[11px] text-slate-400 hover:text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700 hover:bg-slate-700 transition flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Salin
                          </button>
                        </div>
                        <div
                          className="markdown-body text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto pr-1"
                          dangerouslySetInnerHTML={{ __html: cardHtml }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View 3: Raw Monospace Textarea */}
            {activeView === 'raw' && (
              <textarea
                readOnly
                rows={16}
                value={currentMarkdown}
                className="w-full font-mono text-xs bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-emerald-400 leading-relaxed focus:outline-none resize-y"
              />
            )}

            {/* Refinement Bar */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-900/40 -mx-6 -mb-6 md:-mx-8 md:-mb-8 p-6 md:p-8 rounded-b-2xl">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-orange-400" />
                Sempurnakan atau Modifikasi Prompt Ini:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRefine();
                    }
                  }}
                  placeholder="Contoh: Tambahkan 3 kriteria keamanan cloud di Stop conditions, atau ubah tone menjadi lebih ringkas..."
                  className="flex-grow bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={handleRefine}
                  disabled={isRefining || isGenerating}
                  className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 px-5 py-2.5 rounded-xl font-medium text-xs transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                  <span>{isRefining ? 'Menyempurnakan...' : 'Terapkan Modifikasi'}</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white">Riwayat Prompt Tersimpan</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition"
                >
                  Hapus Semua
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto py-4 space-y-3 pr-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Belum ada prompt tersimpan dalam riwayat.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 hover:border-orange-500/40 transition"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-mono">{item.date}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-orange-400">{item.model}</span>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 font-medium mb-3 line-clamp-2">"{item.idea}"</p>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => restoreHistoryItem(item)}
                        className="text-xs bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Buka Prompt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-800 border-slate-700 text-slate-100';
          let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-950/90 border-rose-500/40 text-rose-100';
            icon = <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`${bgClass} border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 toast-enter max-w-sm backdrop-blur-md`}
            >
              {icon}
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
