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
  LayoutDashboard,
  Star,
  Play,
  Sliders,
  Share2,
  FileText,
  Plus,
  Edit3,
  Save,
  Check,
  Search,
  Upload,
  RefreshCw,
  Terminal,
  Cpu,
  Bookmark
} from 'lucide-react';
import { FrameworkType, HistoryItem, AnatomyCard, PresetItem, ToastMessage, VariableItem } from './types';

const PRESETS: Record<string, PresetItem> = {
  fullstack_saas: {
    title: 'Fullstack B2B SaaS',
    category: 'web_saas',
    text: "Bangun aplikasi web SaaS B2B manajemen tim & proyek dengan autentikasi multi-tenant, workspace switcher, subscription billing Stripe, REST API Express/Next.js, database PostgreSQL/Drizzle ORM, dan antarmuka Tailwind CSS modern dengan Dark Mode.",
    model: "Claude 3.7 Sonnet (Hybrid Thinking)",
    framework: "elite",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "Fullstack Web App (Frontend + Backend + DB)"
  },
  ecommerce_modern: {
    title: 'E-Commerce Marketplace',
    category: 'web_saas',
    text: "Rancang platform toko online e-commerce modern dengan katalog produk dinamis, cart persistent, integrasi payment gateway Midtrans/Stripe, manajemen pesanan admin, inventory real-time, dan SEO SSR optimal.",
    model: "Gemini 4 Argon & 3.8 Flash",
    framework: "elite",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "Fullstack Web App (Frontend + Backend + DB)"
  },
  antigravity_agent: {
    title: 'Google Antigravity Agent',
    category: 'agentic',
    text: "Bertindaklah sebagai autonomous web dev agent untuk mengaudit, merefactor, dan memodernisasi web app ini: pasang strict TypeScript types, hapus dependensi yang tidak terpakai di package.json, perbaiki arsitektur komponen, buat build green 100%, dan jalankan verifikasi CLI tanpa regresi.",
    model: "Google Antigravity Agent",
    framework: "agentic",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "System Refactoring, Clean Architecture & Optimization"
  },
  cli_refactor_agent: {
    title: 'Autonomous Code Refactor',
    category: 'agentic',
    text: "Lakukan refactoring arsitektur end-to-end pada codebase monolith yang lambat: pisahkan domain logic ke service layer, eliminasi duplication (DRY), optimasi rendering memoization, dan pastikan zero regression dengan test suite.",
    model: "Google Antigravity Agent",
    framework: "agentic",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "System Refactoring, Clean Architecture & Optimization"
  },
  rest_api_prod: {
    title: 'Enterprise REST API',
    category: 'backend',
    text: "Rancang arsitektur backend REST API produksi untuk sistem transaksi: validasi request dengan Zod schema, otorisasi JWT bearer token, rate limiting sliding window, logging terstruktur Winston, error handling middleware global, dan database migration Drizzle/Prisma.",
    model: "Gemini 4 Argon & 3.8 Flash",
    framework: "elite",
    techStack: "Node.js (Express / Fastify) + PostgreSQL / SQLite REST API",
    devRole: "Backend REST API, Auth & Database Layer"
  },
  websocket_realtime: {
    title: 'Real-time WebSocket & Redis',
    category: 'backend',
    text: "Bangun server sinkronisasi kolaboratif real-time menggunakan WebSocket multiplexing, pub/sub Redis, session authority terpusat, event-driven architecture, dan pemulihan koneksi otomatis (reconnection backoff).",
    model: "Claude 3.7 Sonnet (Hybrid Thinking)",
    framework: "elite",
    techStack: "Node.js (Express / Fastify) + PostgreSQL / SQLite REST API",
    devRole: "Backend REST API, Auth & Database Layer"
  },
  devops_ci_cd: {
    title: 'Docker & CI/CD Pipeline',
    category: 'devops',
    text: "Buat konfigurasi kontainerisasi multi-stage Dockerfile yang aman dan minimalis untuk Node.js/Next.js, skrip docker-compose untuk database lokal, dan GitHub Actions workflow CI/CD untuk otomatisasi test, lint, serta deployment.",
    model: "OpenAI o3 & GPT-4o",
    framework: "elite",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "System Refactoring, Clean Architecture & Optimization"
  },
  auth_security: {
    title: 'High-Security RBAC & OWASP',
    category: 'security',
    text: "Implementasikan sistem autentikasi & keamanan web tingkat enterprise: Role-Based Access Control bertingkat (SuperAdmin, OrgAdmin, Member), proteksi CSRF double-submit cookie, Content Security Policy (CSP) ketat, sanitasi XSS, password hashing Argon2, dan audit log sesi pengguna.",
    model: "OpenAI o3 & GPT-4o",
    framework: "elite",
    techStack: "Node.js (Express / Fastify) + PostgreSQL / SQLite REST API",
    devRole: "Web App Security, RBAC & Protection"
  },
  mobile_pwa: {
    title: 'Offline-First Mobile PWA',
    category: 'mobile',
    text: "Rancang Progressive Web App (PWA) responsif mobile-first dengan Service Worker caching offline (Workbox), manifest instalasi layar utama, sinkronisasi background IndexedDB, dan navigasi gestur yang halus.",
    model: "Claude 3.7 Sonnet (Hybrid Thinking)",
    framework: "elite",
    techStack: "TypeScript + React / Next.js + Tailwind CSS",
    devRole: "Frontend UI & Interactive Dashboard SPA"
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
  const [activeView, setActiveView] = useState<'rendered' | 'anatomy' | 'raw' | 'simulator' | 'variables'>('rendered');
  const [presetCategory, setPresetCategory] = useState<'all' | 'web_saas' | 'backend' | 'agentic' | 'devops' | 'security' | 'mobile'>('all');
  const [activeEngine, setActiveEngine] = useState('Gemini 3.8 Flash (Flagship)');

  // Anatomy Cards & In-Place Editing
  const [editableCards, setEditableCards] = useState<AnatomyCard[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardText, setEditingCardText] = useState('');
  const [isBoostingSection, setIsBoostingSection] = useState<string | null>(null);

  // New Custom Section Modal
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');

  // AI Simulation / Test Run
  const [testInput, setTestInput] = useState('Buatkan fungsi autentikasi login dengan validasi data masukan.');
  const [simulationResult, setSimulationResult] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Dynamic Variables
  const [customVariables, setCustomVariables] = useState<VariableItem[]>([
    { name: 'PROJECT_NAME', value: 'NexusApp' },
    { name: 'PRIMARY_STACK', value: 'Next.js + TypeScript + Tailwind' },
    { name: 'DATABASE_ENGINE', value: 'PostgreSQL' }
  ]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarVal, setNewVarVal] = useState('');

  // History & Bookmarks
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
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
    }, 3400);
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
      framework,
      techStack,
      devRole,
      isFavorite: false
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((item) => item.id !== newItem.id)].slice(0, 30);
      try {
        localStorage.setItem('master_prompt_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      return updated;
    });
  };

  const toggleFavorite = (id: number) => {
    setHistory((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
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
      try {
        localStorage.setItem('master_prompt_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      return updated;
    });
    showToast('Item riwayat dihapus.', 'info');
  };

  const clearAllHistory = () => {
    if (window.confirm('Hapus seluruh riwayat prompt tersimpan?')) {
      localStorage.removeItem('master_prompt_history');
      setHistory([]);
      showToast('Seluruh riwayat berhasil dibersihkan.', 'info');
    }
  };

  const exportHistoryBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `master_prompt_history_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Cadangan riwayat berhasil diunduh (JSON)!', 'success');
  };

  const importHistoryBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          localStorage.setItem('master_prompt_history', JSON.stringify(parsed));
          showToast(`Berhasil memulihkan ${parsed.length} item riwayat!`, 'success');
        } else {
          showToast('Format berkas backup tidak valid.', 'error');
        }
      } catch (_) {
        showToast('Gagal membaca berkas JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    setPromptInput(item.fullIdea || item.idea);
    setCurrentMarkdown(item.markdown);
    if (item.model) setTargetModel(item.model);
    if (item.tone) setTone(item.tone);
    if (item.techStack) setTechStack(item.techStack);
    if (item.devRole) setDevRole(item.devRole);
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
    showToast(`Preset "${preset.title}" dimuat!`, 'info');
  };

  // Sync Markdown with Anatomy Cards
  useEffect(() => {
    if (!currentMarkdown) {
      setEditableCards([]);
      return;
    }
    const sectionRegex = /###\s+([^\n]+)\n([\s\S]*?)(?=(?:###\s+[^\n]+)|$)/g;
    let match;
    const parsed: AnatomyCard[] = [];
    let idx = 0;

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
          id: `card-${idx++}-${rawTitle.replace(/\s+/g, '-').toLowerCase()}`,
          title: rawTitle,
          content,
          icon,
          color
        });
      }
    }

    if (parsed.length === 0) {
      parsed.push({
        id: 'card-default',
        title: 'Master Prompt',
        content: currentMarkdown,
        icon: 'cube',
        color: 'orange'
      });
    }

    setEditableCards(parsed);
  }, [currentMarkdown]);

  // Reconstruct Markdown from Cards
  const updateMarkdownFromCards = (cards: AnatomyCard[]) => {
    const reconstructed = cards
      .map((c) => `### ${c.title}\n${c.content}`)
      .join('\n\n');
    setCurrentMarkdown(reconstructed);
  };

  const handleStartEditCard = (card: AnatomyCard) => {
    setEditingCardId(card.id);
    setEditingCardText(card.content);
  };

  const handleSaveCardEdit = (cardId: string) => {
    const updated = editableCards.map((c) =>
      c.id === cardId ? { ...c, content: editingCardText.trim() } : c
    );
    setEditableCards(updated);
    updateMarkdownFromCards(updated);
    setEditingCardId(null);
    showToast('Bagian berhasil diperbarui!', 'success');
  };

  const handleDeleteCard = (cardId: string) => {
    if (editableCards.length <= 1) {
      showToast('Tidak dapat menghapus bagian terakhir.', 'error');
      return;
    }
    const updated = editableCards.filter((c) => c.id !== cardId);
    setEditableCards(updated);
    updateMarkdownFromCards(updated);
    showToast('Bagian prompt dihapus.', 'info');
  };

  const handleAddCustomSection = () => {
    if (!newSectionTitle.trim() || !newSectionContent.trim()) {
      showToast('Judul dan isi bagian wajib diisi.', 'error');
      return;
    }
    const newCard: AnatomyCard = {
      id: `card-${Date.now()}-${newSectionTitle.replace(/\s+/g, '-').toLowerCase()}`,
      title: newSectionTitle.trim(),
      content: newSectionContent.trim(),
      icon: 'sparkles',
      color: 'emerald'
    };
    const updated = [...editableCards, newCard];
    setEditableCards(updated);
    updateMarkdownFromCards(updated);
    setNewSectionTitle('');
    setNewSectionContent('');
    setIsAddSectionOpen(false);
    showToast(`Bagian "${newCard.title}" berhasil ditambahkan!`, 'success');
  };

  const handleBoostSection = async (card: AnatomyCard) => {
    if (isBoostingSection) return;
    setIsBoostingSection(card.id);
    showToast(`Sedang memperkuat bagian "${card.title}" dengan AI...`, 'info');

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate-section',
          sectionTitle: card.title,
          currentContent: card.content,
          previousPrompt: currentMarkdown,
          language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperkuat bagian.');
      }

      if (data.content) {
        const updated = editableCards.map((c) =>
          c.id === card.id ? { ...c, content: data.content } : c
        );
        setEditableCards(updated);
        updateMarkdownFromCards(updated);
        showToast(`Bagian "${card.title}" telah diperkuat!`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memperkuat bagian.', 'error');
    } finally {
      setIsBoostingSection(null);
    }
  };

  // Main Generation Handler
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
          action: 'generate',
          prompt: trimmedInput,
          language,
          tone,
          targetModel,
          framework,
          techStack,
          devRole,
          refinement: refinementText,
          previousPrompt: isRefiningCall ? currentMarkdown : ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kegagalan saat memproses prompt.');
      }

      if (data.text) {
        if (data.modelUsed) {
          setActiveEngine(
            data.modelUsed.includes('3.8')
              ? 'Gemini 3.8 Flash (Flagship)'
              : 'Gemini 3.1 Flash Lite (Resilient)'
          );
        }
        setCurrentMarkdown(data.text);
        saveToHistory(trimmedInput, data.text, targetModel, tone);
        if (isRefiningCall) {
          setRefinementInput('');
          showToast('Master Prompt berhasil dimodifikasi & disempurnakan!', 'success');
        } else {
          showToast(`Master Prompt berhasil dibangun (${data.modelUsed || 'Gemini'})!`, 'success');
        }

        setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      } else {
        throw new Error('Hasil respon AI kosong.');
      }
    } catch (error: any) {
      console.error('Generation Error:', error);
      showToast(error.message || 'Gagal memproses prompt. Periksa koneksi atau API Key.', 'error');
    } finally {
      setIsGenerating(false);
      setIsRefining(false);
    }
  };

  const handleRefine = () => {
    if (!refinementInput.trim()) {
      showToast('Harap masukkan petunjuk penyempurnaan.', 'error');
      return;
    }
    handleGenerate(refinementInput);
  };

  // AI Simulation Test Run
  const handleRunSimulation = async () => {
    if (isSimulating || !currentMarkdown) return;
    if (!testInput.trim()) {
      showToast('Harap masukkan contoh input untuk simulasi.', 'error');
      return;
    }

    setIsSimulating(true);
    setSimulationResult('');
    showToast('Menjalankan simulasi instruksi dengan Gemini AI...', 'info');

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          systemPrompt: currentMarkdown,
          testInput: testInput.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menjalankan simulasi.');
      }

      setSimulationResult(data.result || 'Simulasi tidak menghasilkan output.');
      showToast('Simulasi pengujian selesai dijalankan!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menjalankan simulasi.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Dynamic Variable Processing
  const compiledWithVariables = useMemo(() => {
    if (!currentMarkdown) return '';
    let result = currentMarkdown;
    customVariables.forEach((v) => {
      if (v.name && v.value) {
        const regex = new RegExp(`{{\\s*${v.name}\\s*}}`, 'g');
        result = result.replace(regex, v.value);
      }
    });
    return result;
  }, [currentMarkdown, customVariables]);

  const detectedVariablesInPrompt = useMemo(() => {
    if (!currentMarkdown) return [];
    const matches = currentMarkdown.match(/{{\s*([A-Za-z0-9_-]+)\s*}}/g) || [];
    const names = matches.map((m) => m.replace(/[{}]/g, '').trim());
    return Array.from(new Set(names));
  }, [currentMarkdown]);

  const addCustomVariable = () => {
    if (!newVarName.trim()) return;
    const cleanName = newVarName.trim().toUpperCase().replace(/\s+/g, '_');
    setCustomVariables((prev) => [...prev.filter((v) => v.name !== cleanName), { name: cleanName, value: newVarVal.trim() }]);
    setNewVarName('');
    setNewVarVal('');
    showToast(`Variabel {{${cleanName}}} ditambahkan!`, 'success');
  };

  const removeVariable = (name: string) => {
    setCustomVariables((prev) => prev.filter((v) => v.name !== name));
  };

  // Copy Helpers
  const copyToClipboard = async (text: string, successMsg = 'Teks berhasil disalin!') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg, 'success');
    } catch (e) {
      showToast('Gagal menyalin ke clipboard.', 'error');
    }
  };

  const copyAsXml = () => {
    const xmlFormatted = `<system_instruction>
${currentMarkdown}
</system_instruction>`;
    copyToClipboard(xmlFormatted, 'Master Prompt disalin dalam format XML (Claude/Anthropic)!');
  };

  const copyAsCursorRules = () => {
    const rulesFormatted = `# Cursor / Windsurf Project Rules
# Generated via Master Prompt Studio

${currentMarkdown}
`;
    copyToClipboard(rulesFormatted, 'Master Prompt disalin dalam format .cursorrules!');
  };

  const copyAsJson = () => {
    const jsonObj = {
      name: 'Master Prompt',
      framework,
      model: targetModel,
      techStack,
      devRole,
      sections: editableCards.map((c) => ({
        section: c.title,
        content: c.content
      })),
      rawMarkdown: currentMarkdown
    };
    copyToClipboard(JSON.stringify(jsonObj, null, 2), 'Master Prompt disalin dalam format JSON!');
  };

  const downloadPrompt = (format: 'md' | 'json' | 'txt' = 'md') => {
    if (!currentMarkdown) return;
    let dataUri = '';
    let filename = `master_prompt_${Date.now()}.${format}`;

    if (format === 'json') {
      const jsonObj = {
        name: 'Master Prompt',
        framework,
        model: targetModel,
        techStack,
        devRole,
        sections: editableCards.map((c) => ({
          section: c.title,
          content: c.content
        })),
        markdown: currentMarkdown
      };
      dataUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonObj, null, 2));
    } else {
      dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(currentMarkdown);
    }

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUri);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Berkas ${filename} berhasil diunduh!`, 'success');
  };

  // Metrics & Stats
  const metrics = useMemo(() => {
    if (!currentMarkdown) return { words: 0, chars: 0, tokens: 0, lines: 0 };
    const words = currentMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const chars = currentMarkdown.length;
    const tokens = Math.round(words * 1.33);
    const lines = currentMarkdown.split('\n').length;
    return { words, chars, tokens, lines };
  }, [currentMarkdown]);

  // Structural Quality Audit
  const audit = useMemo(() => {
    if (!currentMarkdown) return { score: 70, checks: [] };
    let score = 70;
    const checks: string[] = [];

    const hasRole = editableCards.some((c) => c.title.toLowerCase().includes('role') || c.title.toLowerCase().includes('persona'));
    if (hasRole) {
      score += 5;
      checks.push('✓ Persona Ahli');
    }

    const hasTask = editableCards.some(
      (c) => c.title.toLowerCase().includes('task') || c.title.toLowerCase().includes('objective') || c.title.toLowerCase().includes('tugas')
    );
    if (hasTask) {
      score += 5;
      checks.push('✓ Tugas Objektif');
    }

    const hasGuardrails = editableCards.some(
      (c) =>
        c.title.toLowerCase().includes('constraint') ||
        c.title.toLowerCase().includes('guardrail') ||
        c.title.toLowerCase().includes('safety') ||
        c.title.toLowerCase().includes('batasan')
    );
    if (hasGuardrails) {
      score += 10;
      checks.push('✓ Guardrails Negatif');
    }

    const hasStop = editableCards.some(
      (c) => c.title.toLowerCase().includes('stop') || c.title.toLowerCase().includes('exit') || c.title.toLowerCase().includes('kriteria')
    );
    if (hasStop) {
      score += 5;
      checks.push('✓ Kriteria Berhenti');
    }

    const hasFewShot = editableCards.some(
      (c) => c.title.toLowerCase().includes('few-shot') || c.title.toLowerCase().includes('calibration') || c.title.toLowerCase().includes('contoh')
    );
    if (hasFewShot) {
      score += 5;
      checks.push('✓ Kalibrasi Few-Shot');
    }

    if (score > 100) score = 100;
    return { score, checks };
  }, [currentMarkdown, editableCards]);

  const renderedHtml = useMemo(() => {
    if (!currentMarkdown) return '';
    return marked.parse(currentMarkdown, { breaks: true, gfm: true }) as string;
  }, [currentMarkdown]);

  const filteredPresets = useMemo(() => {
    if (presetCategory === 'all') return Object.entries(PRESETS);
    return Object.entries(PRESETS).filter(([_, item]) => item.category === presetCategory);
  }, [presetCategory]);

  const filteredHistory = useMemo(() => {
    let result = history;
    if (showFavoritesOnly) {
      result = result.filter((item) => item.isFavorite);
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.idea.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          (item.techStack && item.techStack.toLowerCase().includes(q))
      );
    }
    return result;
  }, [history, showFavoritesOnly, historySearch]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Master Prompt Studio</h1>
                <span className="text-[10px] font-semibold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-wider">
                  Enterprise Suite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Architectural Prompt Generator: Role • Task • Context • Guardrails • Reasoning • Stop Conditions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-orange-400" />
              <span>Riwayat ({history.length})</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-slate-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemini AI Engine</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Input & Generator Configuration Panel */}
        <section className="glass-panel rounded-2xl p-5 md:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-orange-500" />
                Desain Ide & Spesifikasi Tugas
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Masukkan deskripsi aplikasi atau instruksi Anda. Sistem akan menstrukturkannya menjadi Master Prompt tahan regresi.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              Shortcut: <kbd className="font-mono text-slate-300">Ctrl</kbd> + <kbd className="font-mono text-slate-300">Enter</kbd>
            </span>
          </div>

          {/* Preset Categories Filter */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-orange-400" />
                Koleksi Template Presets Siap Pakai:
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setPresetCategory('all')}
                  className={`px-2 py-0.5 rounded transition ${presetCategory === 'all' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setPresetCategory('web_saas')}
                  className={`px-2 py-0.5 rounded transition ${presetCategory === 'web_saas' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Web SaaS
                </button>
                <button
                  onClick={() => setPresetCategory('backend')}
                  className={`px-2 py-0.5 rounded transition ${presetCategory === 'backend' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Backend
                </button>
                <button
                  onClick={() => setPresetCategory('agentic')}
                  className={`px-2 py-0.5 rounded transition ${presetCategory === 'agentic' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Agentik
                </button>
                <button
                  onClick={() => setPresetCategory('security')}
                  className={`px-2 py-0.5 rounded transition ${presetCategory === 'security' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Keamanan
                </button>
                <button
                  onClick={() => setPresetCategory('devops')}
                  className={`px-2 py-0.5 rounded transition ${presetCategory === 'devops' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  DevOps
                </button>
              </div>
            </div>

            {/* Preset Buttons Grid */}
            <div className="flex flex-wrap gap-2">
              {filteredPresets.map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => loadPreset(key)}
                  className="text-xs bg-slate-900/90 hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>{item.category === 'agentic' ? '🤖' : item.category === 'backend' ? '⚙️' : item.category === 'security' ? '🛡️' : item.category === 'devops' ? '🚀' : '🌐'}</span>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
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
              className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-y shadow-inner text-sm leading-relaxed"
              placeholder="Contoh: Rancang sistem manajemen antrian klinik pintar dengan WebSocket real-time, autentikasi dokter & staf, REST API Express, SQLite/Drizzle ORM, dan antarmuka responsif Tailwind..."
            />
            <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 font-mono pointer-events-none">
              {promptInput.length} karakter
            </div>
          </div>

          {/* Architecture & Engine Options */}
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
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
              <label className="block text-slate-400 font-medium mb-1">Target Model AI</label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Google Antigravity Agent">Google Antigravity Agent (Autonomous & Tools)</option>
                <option value="Claude 3.7 Sonnet (Hybrid Thinking)">Claude 3.7 Sonnet (Extended Reasoning)</option>
                <option value="Gemini 4 Argon & 3.8 Flash">Gemini 4 Argon & 3.8 Flash (Google Flagship)</option>
                <option value="OpenAI o3 & GPT-4o">OpenAI o3 & GPT-4o (Test-Time Reasoning)</option>
                <option value="DeepSeek R1 & V3">DeepSeek R1 & V3 (Deep Mathematical Logic)</option>
                <option value="Cursor & Windsurf IDE">Cursor / Windsurf IDE (.cursorrules format)</option>
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
                <option value="Modern HTML5/CSS3 + Vanilla TypeScript (Vite)">Modern Vanilla JS/TS + Vite</option>
                <option value="Python (FastAPI / Flask) + Modern Web UI">Python FastAPI + Modern Web UI</option>
                <option value="auto">Otomatis / AI Rekomendasi</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Arsitektur / Scope
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
                <option value="teknis">Sangat Teknis & Mendalam (Code-Ready)</option>
                <option value="profesional">Profesional & Terstruktur</option>
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

          {/* Action Footer */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Siap memproses dengan format {framework === 'elite' ? 'Elite 8-Bagian' : framework === 'agentic' ? 'Agentik Otonom' : 'Standar Klasik'}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setPromptInput('');
                  textareaRef.current?.focus();
                }}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs font-medium"
              >
                Bersihkan
              </button>
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || isRefining}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
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
          <section ref={outputRef} className="glass-panel rounded-2xl p-5 md:p-7 shadow-2xl">
            {/* Audit Quality & Token Intelligence */}
            <div className="mb-5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-slate-200">Audit Kualitas:</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">
                  {audit.score}% Enterprise
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

            {/* Header Workspace Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5 gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Hasil Master Prompt
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                  <span>{metrics.words} kata</span> • <span>{metrics.chars} char</span> •{' '}
                  <span>~{metrics.tokens} token</span> • <span>{metrics.lines} baris</span>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
                  <button
                    onClick={() => setActiveView('rendered')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      activeView === 'rendered' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dokumen
                  </button>
                  <button
                    onClick={() => setActiveView('anatomy')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      activeView === 'anatomy' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Kartu Anatomi ({editableCards.length})
                  </button>
                  <button
                    onClick={() => setActiveView('raw')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      activeView === 'raw' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => setActiveView('simulator')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                      activeView === 'simulator' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>Uji Coba AI</span>
                  </button>
                  <button
                    onClick={() => setActiveView('variables')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                      activeView === 'variables' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span>Variabel</span>
                  </button>
                </div>

                {/* Quick Copy Dropdown / Multi-format copy buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyToClipboard(currentMarkdown, 'Master Prompt Markdown disalin!')}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium py-1.5 px-3 rounded-lg transition flex items-center gap-1.5 text-xs"
                    title="Salin Markdown"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </button>
                  <button
                    onClick={copyAsXml}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium py-1.5 px-2.5 rounded-lg transition text-xs"
                    title="Salin format XML (Claude)"
                  >
                    XML
                  </button>
                  <button
                    onClick={copyAsCursorRules}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium py-1.5 px-2.5 rounded-lg transition text-xs"
                    title="Salin format .cursorrules"
                  >
                    Rules
                  </button>
                  <button
                    onClick={copyAsJson}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium py-1.5 px-2.5 rounded-lg transition text-xs"
                    title="Salin format JSON"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => downloadPrompt('md')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium py-1.5 px-2.5 rounded-lg transition text-xs"
                    title="Unduh berkas .md"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* VIEW 1: RENDERED MARKDOWN */}
            {activeView === 'rendered' && (
              <div
                className="markdown-body bg-slate-900/60 p-5 md:p-8 rounded-xl border border-slate-800/80 shadow-inner min-h-[220px]"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            )}

            {/* VIEW 2: ANATOMY CARDS WITH INLINE EDIT & AI BOOSTER */}
            {activeView === 'anatomy' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Setiap kartu dapat diedit langsung, dihapus, atau diperkuat secara otomatis menggunakan AI.
                  </p>
                  <button
                    onClick={() => setIsAddSectionOpen(true)}
                    className="text-xs bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Bagian Kustom</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editableCards.map((card) => {
                    const isEditing = editingCardId === card.id;
                    const isBoosting = isBoostingSection === card.id;
                    const cardHtml = marked.parse(card.content, { breaks: true, gfm: true }) as string;

                    return (
                      <div
                        key={card.id}
                        className="glass-panel-light p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60">
                            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                              {card.icon === 'user-tie' && <Wand2 className="w-3.5 h-3.5 text-amber-400" />}
                              {card.icon === 'target' && <Target className="w-3.5 h-3.5 text-orange-400" />}
                              {card.icon === 'layers' && <Layers className="w-3.5 h-3.5 text-sky-400" />}
                              {card.icon === 'shield' && <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />}
                              {card.icon === 'brain' && <Brain className="w-3.5 h-3.5 text-purple-400" />}
                              {card.icon === 'sparkles' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                              {card.icon === 'check-circle' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                              {card.icon === 'file-code' && <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />}
                              <span>{card.title}</span>
                            </span>

                            <div className="flex items-center gap-1">
                              {!isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleBoostSection(card)}
                                    disabled={Boolean(isBoostingSection)}
                                    className="text-[11px] text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-2 py-1 rounded border border-amber-500/40 transition flex items-center gap-1 disabled:opacity-50"
                                    title="Perkuat bagian ini dengan AI"
                                  >
                                    <Sparkles className={`w-3 h-3 ${isBoosting ? 'animate-spin' : ''}`} />
                                    <span>{isBoosting ? 'Memperkuat...' : 'Boost'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleStartEditCard(card)}
                                    className="text-[11px] text-slate-400 hover:text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700 hover:bg-slate-700 transition flex items-center gap-1"
                                    title="Edit Bagian Ini"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(card.content, `Bagian ${card.title} disalin!`)}
                                    className="text-[11px] text-slate-400 hover:text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700 hover:bg-slate-700 transition"
                                    title="Salin Bagian"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="text-[11px] text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-1.5 py-1 rounded border border-rose-500/30 transition"
                                    title="Hapus Bagian"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleSaveCardEdit(card.id)}
                                    className="text-[11px] text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-2.5 py-1 rounded border border-emerald-500/40 transition flex items-center gap-1 font-semibold"
                                  >
                                    <Check className="w-3 h-3" /> Simpan
                                  </button>
                                  <button
                                    onClick={() => setEditingCardId(null)}
                                    className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded transition"
                                  >
                                    Batal
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {isEditing ? (
                            <textarea
                              rows={8}
                              value={editingCardText}
                              onChange={(e) => setEditingCardText(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono leading-relaxed resize-y"
                            />
                          ) : (
                            <div
                              className="markdown-body text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto pr-1"
                              dangerouslySetInnerHTML={{ __html: cardHtml }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: RAW MONOSPACE TEXTAREA */}
            {activeView === 'raw' && (
              <div className="space-y-3">
                <textarea
                  rows={16}
                  value={currentMarkdown}
                  onChange={(e) => setCurrentMarkdown(e.target.value)}
                  className="w-full font-mono text-xs bg-slate-900/95 border border-slate-800 rounded-xl p-4 text-emerald-400 leading-relaxed focus:outline-none focus:ring-1 focus:ring-orange-500 resize-y"
                />
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Anda dapat mengedit teks markdown secara langsung di atas.</span>
                  <button
                    onClick={() => copyToClipboard(currentMarkdown, 'Teks mentah disalin!')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Salin Teks
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 4: LIVE AI TEST RUN SIMULATOR */}
            {activeView === 'simulator' && (
              <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Sandbox Uji Coba Master Prompt Langsung
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulasikan bagaimana AI model akan mengeksekusi instruksi Master Prompt Anda saat menerima input dari pengguna riil.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Contoh Input Pengguna untuk Diuji:</label>
                  <textarea
                    rows={2}
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Contoh: Buatkan fungsi autentikasi login dengan validasi data masukan..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleRunSimulation}
                      disabled={isSimulating}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-5 rounded-lg text-xs transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                      <span>{isSimulating ? 'Menjalankan Simulasi...' : 'Eksekusi Simulasi'}</span>
                    </button>
                  </div>
                </div>

                {simulationResult && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        Hasil Respon Simulasi AI:
                      </span>
                      <button
                        onClick={() => copyToClipboard(simulationResult, 'Hasil simulasi disalin!')}
                        className="text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Salin Respon
                      </button>
                    </div>
                    <div
                      className="markdown-body bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-200 max-h-96 overflow-y-auto leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(simulationResult, { breaks: true, gfm: true }) as string
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: DYNAMIC VARIABLES REPLACER */}
            {activeView === 'variables' && (
              <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Manajemen Variabel Template ({'{{NAMA_VARIABEL}}'})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Gunakan variabel placeholder dinamis untuk mengubah Master Prompt ini menjadi template yang dapat dipakai berulang kali.
                  </p>
                </div>

                {detectedVariablesInPrompt.length > 0 && (
                  <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80">
                    <span className="text-xs text-amber-300 font-semibold block mb-1.5">
                      Variabel Terdeteksi di Prompt:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {detectedVariablesInPrompt.map((v) => (
                        <span key={v} className="bg-slate-900 text-orange-400 font-mono text-[11px] px-2.5 py-1 rounded border border-slate-700">
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variable inputs table */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Daftar Variabel Aktif:</span>
                  <div className="space-y-2">
                    {customVariables.map((v) => (
                      <div key={v.name} className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="font-mono text-xs text-orange-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 min-w-32">
                          {`{{${v.name}}}`}
                        </span>
                        <input
                          type="text"
                          value={v.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomVariables((prev) =>
                              prev.map((item) => (item.name === v.name ? { ...item, value: val } : item))
                            );
                          }}
                          className="flex-grow bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        <button
                          onClick={() => removeVariable(v.name)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add variable form */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="NAMA_VARIABEL"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      className="w-1/3 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Nilai Pengganti"
                      value={newVarVal}
                      onChange={(e) => setNewVarVal(e.target.value)}
                      className="flex-grow bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                    />
                    <button
                      onClick={addCustomVariable}
                      className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded text-xs font-semibold"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Salin prompt dengan semua variabel yang sudah diisi:</span>
                  <button
                    onClick={() => copyToClipboard(compiledWithVariables, 'Prompt dengan variabel terkompilasi disalin!')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Versi Terkompilasi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Refinement Prompt Bar */}
            <div className="mt-6 pt-5 border-t border-slate-800 bg-slate-900/40 -mx-5 -mb-5 md:-mx-7 md:-mb-7 p-5 md:p-7 rounded-b-2xl">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-orange-400" />
                Sempurnakan atau Modifikasi Prompt Ini Secara Keseluruhan:
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
                  placeholder="Contoh: Tambahkan 3 kriteria audit keamanan OWASP di Constraints, atau buat output berformat tabel..."
                  className="flex-grow bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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

      {/* Add Custom Section Modal */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                Tambah Bagian Baru ke Master Prompt
              </h3>
              <button onClick={() => setIsAddSectionOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul Bagian (Section Title):</label>
                <input
                  type="text"
                  placeholder="Contoh: Edge Cases & Error Handling atau Environment Variables"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Isi Konten (Format Markdown):</label>
                <textarea
                  rows={6}
                  placeholder="Tuliskan isi instruksi atau batasan khusus untuk bagian ini..."
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono leading-relaxed resize-y"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAddSectionOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddCustomSection}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tambahkan Bagian</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                  onClick={exportHistoryBackup}
                  className="text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 px-2 py-1 rounded transition flex items-center gap-1"
                  title="Unduh backup JSON"
                >
                  <Download className="w-3 h-3" /> Backup
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-2 py-1 rounded transition flex items-center gap-1"
                  title="Pulihkan backup JSON"
                >
                  <Upload className="w-3 h-3" /> Restore
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={importHistoryBackup}
                />
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded transition"
                >
                  Hapus Semua
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="pt-3 pb-2 flex items-center gap-2">
              <div className="relative flex-grow">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari ide prompt atau model..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                  showFavoritesOnly
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>Favorit</span>
              </button>
            </div>

            {/* History List */}
            <div className="flex-grow overflow-y-auto py-2 space-y-2.5 pr-1">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  {historySearch ? 'Tidak ada prompt yang cocok dengan pencarian.' : 'Belum ada prompt tersimpan dalam riwayat.'}
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 hover:border-orange-500/40 transition"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-mono">{item.date}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="p-1 hover:text-amber-400 transition"
                          title={item.isFavorite ? 'Hapus dari favorit' : 'Tandai favorit'}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                        </button>
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-orange-400 font-medium">
                          {item.model}
                        </span>
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
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{item.techStack || 'Web Tech'}</span>
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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-800 border-slate-700 text-slate-100';
          let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-950/95 border-rose-500/40 text-rose-100';
            icon = <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`${bgClass} border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 toast-enter max-w-sm backdrop-blur-md pointer-events-auto`}
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
