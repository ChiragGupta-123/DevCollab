import React, { useState, useEffect } from 'react';
import {
  Code2,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  Folder,
  Users,
  PlusCircle,
  Shield,
  ShieldCheck,
  Settings,
  ArrowRight,
  MoreVertical,
  Plus,
  Copy,
  Check,
  Tv,
  Smartphone,
  Cpu,
  Layers,
  LogOut,
  AlertTriangle,
  FileCode,
  Menu,
  X
} from 'lucide-react';
import { Project, User } from '../types';
import { createProject, fetchProjects, joinProject, cn } from '../services/api';

interface DashboardProps {
  onSelectProject: (project: Project) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectProject,
  currentUser,
  onLogout
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite code copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Navigation & View state
  const [activeNav, setActiveNav] = useState<'home' | 'projects' | 'security' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Create Project Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join Project Modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinFeedback, setJoinFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Load private workspace projects for authenticated user
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentUser.id]);

  // Copy invite code with feedback
  const handleCopyInvite = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setActiveDropdownId(null);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Create project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError('Project name is required');
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);
      const res = await createProject(createName.trim(), createDesc.trim());
      setShowCreateModal(false);
      setCreateName('');
      setCreateDesc('');
      await loadProjects();
      if (res.project) {
        onSelectProject(res.project);
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.error || err.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  // Join project
  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setJoining(true);
      setJoinFeedback(null);
      const res = await joinProject(joinCode.trim());
      setJoinFeedback({ type: 'success', msg: `Joined "${res.project.name}" as ${res.role}!` });
      setJoinCode('');
      await loadProjects();
      if (res.project) {
        setTimeout(() => {
          setShowJoinModal(false);
          onSelectProject(res.project);
        }, 800);
      }
    } catch (err: any) {
      setJoinFeedback({
        type: 'error',
        msg: err.response?.data?.error || 'Invalid or non-existent invite code'
      });
    } finally {
      setJoining(false);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to pick project icon matching reference design
  const getProjectIcon = (name: string, idx: number) => {
    const lower = name.toLowerCase();
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('quantum')) {
      return (
        <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Cpu className="h-5 w-5" />
        </div>
      );
    }
    if (lower.includes('mobile') || lower.includes('app') || lower.includes('ios')) {
      return (
        <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Smartphone className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
        <Code2 className="h-5 w-5" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col font-sans select-none antialiased">
      {/* ════════════════════════════════════════════════════════════════════════
          TOP NAVIGATION HEADER
          ════════════════════════════════════════════════════════════════════════ */}
      <header className="h-16 border-b border-[#182032] bg-[#0b0f19] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#131b2e] transition"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveNav('home')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Code2 className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-white tracking-tight">DevCollab</span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Build Together. Code Better.</p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar with Ctrl K Shortcut */}
        <div className="hidden md:flex items-center relative w-full max-w-md mx-6">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, rooms, or users..."
            className="w-full bg-[#111726] border border-[#1e293b] rounded-xl pl-10 pr-14 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <span className="absolute right-3 text-[10px] font-mono text-slate-400 bg-[#1a233a] px-1.5 py-0.5 rounded border border-[#273552]">
            Ctrl K
          </span>
        </div>

        {/* Right: Notifications & User Profile Menu */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            title="Notifications"
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#131b2e] transition"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0b0f19]" />
          </button>

          {/* User Profile Pill with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-[#131b2e] transition"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm ring-1 ring-white/10"
                style={{ backgroundColor: currentUser.avatar_color || '#4f46e5' }}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-white hidden sm:inline">
                {currentUser.username}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#131927] border border-[#1e293b] shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-[#1e293b] mb-1">
                  <div className="text-xs font-bold text-white">{currentUser.username}</div>
                  {currentUser.email && (
                    <div className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</div>
                  )}
                  <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    AUTHENTICATED
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/30 rounded-xl transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          MAIN 3-COLUMN LAYOUT
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── 1. LEFT NAVIGATION SIDEBAR ─── */}
        <aside
          className={cn(
            "fixed inset-y-16 left-0 z-30 w-60 border-r border-[#182032] bg-[#0b0f19] p-4 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="space-y-6">
            <nav className="space-y-1.5">
              <button
                onClick={() => {
                  setActiveNav('home');
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  activeNav === 'home'
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-[#131b2e]"
                )}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('projects');
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all",
                  activeNav === 'projects'
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-[#131b2e]"
                )}
              >
                <Folder className="h-4 w-4" />
                <span>My Projects</span>
              </button>

              <button
                onClick={() => {
                  setShowJoinModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#131b2e] transition-all"
              >
                <Users className="h-4 w-4" />
                <span>Join Room</span>
              </button>

              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#131b2e] transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Room</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('security');
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all",
                  activeNav === 'security'
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-[#131b2e]"
                )}
              >
                <Shield className="h-4 w-4" />
                <span>Security & Monitor</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('settings');
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all",
                  activeNav === 'settings'
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-[#131b2e]"
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Bottom Area: Secure Coding Environment Card & System Online Status */}
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-2xl bg-[#111726] border border-[#1a2438]">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <Shield className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Secure Coding Environment</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Your code is protected with real-time threat detection and sandboxed execution.
              </p>
              <button
                onClick={() => setActiveNav('security')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#182236] hover:bg-[#202d47] text-[11px] font-medium text-slate-300 hover:text-white transition"
              >
                <span>Learn More</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* System Online Indicator */}
            <div className="flex items-center space-x-2.5 px-1 py-1">
              <div className="relative flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div className="absolute h-4 w-4 rounded-full bg-emerald-400/30 animate-ping" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">System Online</div>
                <div className="text-[10px] text-slate-400 leading-tight">All services operational</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── 2. CENTER COLUMN: MAIN CONTENT ─── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Welcome Banner with Purple/Indigo Mesh Gradient */}
          <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-gradient-to-r from-[#1c1b48]/90 via-[#151a30]/90 to-[#0e1322] border border-[#24264d] shadow-xl">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white flex items-center space-x-2.5 tracking-tight">
                <span>👋</span>
                <span>Welcome back, {currentUser.username}!</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal">
                Collaborate, code and build amazing things together.
              </p>
            </div>
          </div>

          {/* 4 Summary Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] flex flex-col justify-between hover:border-indigo-500/30 transition">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center">
                  <Folder className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Projects</div>
                  <div className="text-xl font-bold text-white">{projects.length}</div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                <span>↑</span>
                <span>2 this week</span>
              </div>
            </div>

            {/* Active Rooms */}
            <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] flex flex-col justify-between hover:border-blue-500/30 transition">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center">
                  <Tv className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Active Rooms</div>
                  <div className="text-xl font-bold text-white">{Math.max(1, projects.length > 1 ? 2 : 1)}</div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                <span>↑</span>
                <span>1 this week</span>
              </div>
            </div>

            {/* Online Collaborators */}
            <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] flex flex-col justify-between hover:border-indigo-500/30 transition">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Online Collaborators</div>
                  <div className="text-xl font-bold text-white">3</div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                <span>↑</span>
                <span>1 this week</span>
              </div>
            </div>

            {/* Security Status */}
            <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] flex flex-col justify-between hover:border-emerald-500/30 transition">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Security Status</div>
                  <div className="text-base font-bold text-white">Secure</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                No threats detected
              </div>
            </div>
          </div>

          {/* Feedback banner if joined project */}
          {joinFeedback && (
            <div className={cn(
              "p-3 rounded-xl text-xs font-mono flex items-center justify-between",
              joinFeedback.type === 'success'
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
            )}>
              <span>{joinFeedback.msg}</span>
              <button onClick={() => setJoinFeedback(null)} className="underline text-[10px]">Dismiss</button>
            </div>
          )}

          {/* My Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">My Projects</h2>
                <p className="text-xs text-slate-400">Your recent projects and collaboration rooms</p>
              </div>
              <button
                onClick={() => setActiveNav('projects')}
                className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin h-7 w-7 border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
                <p className="text-xs font-mono text-slate-400">Loading collaborative workspaces...</p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-[#121826] border border-rose-500/30 text-center">
                <AlertTriangle className="h-6 w-6 text-rose-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">Failed to load projects</h3>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-10 rounded-2xl bg-[#121826] border border-[#1e293b] text-center">
                <FileCode className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">No projects found</h3>
                <p className="text-xs text-slate-400 mt-1">Get started by creating a new collaborative workspace.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs inline-flex items-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProjects.map((proj, idx) => {
                  const isFirst = idx === 0;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => onSelectProject(proj)}
                      className="p-4 rounded-2xl bg-[#131927] border border-[#1e293b] hover:border-blue-500/40 hover:bg-[#151c2e] transition-all cursor-pointer flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Top: Icon + 3-dots Menu */}
                        <div className="flex items-start justify-between mb-3">
                          {getProjectIcon(proj.name, idx)}
                          
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveDropdownId(activeDropdownId === proj.id ? null : proj.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {activeDropdownId === proj.id && (
                              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#182133] border border-[#25324d] shadow-xl p-1 z-30 animate-fade-in">
                                <button
                                  onClick={(e) => handleCopyInvite(proj.invite_code, e)}
                                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#202d47] rounded-lg transition"
                                >
                                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Copy Invite Code</span>
                                </button>
                                <button
                                  onClick={() => onSelectProject(proj)}
                                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-blue-400 hover:bg-[#202d47] rounded-lg transition"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                  <span>Open Editor</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title & Timestamp */}
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Last edited {isFirst ? '2 hours ago' : idx === 1 ? '5 hours ago' : '1 day ago'}
                        </p>
                      </div>

                      {/* Bottom: Collaborator Avatars & Status Tag */}
                      <div className="pt-4 mt-3 border-t border-[#1a2336] flex items-center justify-between">
                        {/* Avatar stack */}
                        <div className="flex items-center -space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-500 ring-2 ring-[#131927] flex items-center justify-center text-[10px] font-bold text-white">
                            A
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-500 ring-2 ring-[#131927] flex items-center justify-center text-[10px] font-bold text-white">
                            B
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#1e293b] ring-2 ring-[#131927] flex items-center justify-center text-[9px] font-bold text-slate-300">
                            +2
                          </div>
                        </div>

                        {/* Status Pill (Active / Idle) */}
                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              idx < 2
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                : "bg-slate-500/15 text-slate-400 border border-slate-500/25"
                            )}
                          >
                            {idx < 2 ? 'Active' : 'Idle'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Activity</h2>
              <p className="text-xs text-slate-400">Latest updates from your projects and rooms</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] space-y-3.5">
              {/* Activity 1 */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      You joined the room <span className="font-bold">&apos;WebDev Project&apos;</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Collaborate with your team</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">2 hours ago</div>
              </div>

              {/* Activity 2 */}
              <div className="flex items-center justify-between py-1 border-t border-[#1a2336] pt-3">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Code changes detected in <span className="font-mono text-slate-300">&apos;main.py&apos;</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Real-time sync • WebDev Project</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">3 hours ago</div>
              </div>

              {/* Activity 3 */}
              <div className="flex items-center justify-between py-1 border-t border-[#1a2336] pt-3">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <Folder className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      You created a new project <span className="font-bold">&apos;AI-ML Project&apos;</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Get started with your team</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">5 hours ago</div>
              </div>

              {/* Activity 4 */}
              <div className="flex items-center justify-between py-1 border-t border-[#1a2336] pt-3">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Rohan joined the room <span className="font-bold">&apos;Mobile App&apos;</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Start collaborating</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">1 day ago</div>
              </div>

              {/* Activity 5 */}
              <div className="flex items-center justify-between py-1 border-t border-[#1a2336] pt-3">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Security scan completed</div>
                    <div className="text-[11px] text-slate-400">No threats found • AI-ML Project</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">1 day ago</div>
              </div>
            </div>
          </div>
        </main>

        {/* ─── 3. RIGHT SIDEBAR PANELS ─── */}
        <aside className="w-80 flex-shrink-0 border-l border-[#182032] bg-[#0b0f19] p-4 space-y-4 overflow-y-auto hidden xl:block">
          {/* Quick Actions Card */}
          <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] space-y-3">
            <h3 className="text-xs font-bold text-white tracking-wide">Quick Actions</h3>

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Room</span>
            </button>

            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full bg-[#182133] hover:bg-[#1f2b42] border border-[#25324d] text-slate-200 font-medium text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition"
            >
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Join Room</span>
            </button>
          </div>

          {/* Recent Rooms Card */}
          <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide">Recent Rooms</h3>
              <button
                onClick={() => setActiveNav('projects')}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Room 1 */}
              <div
                onClick={() => projects[0] && onSelectProject(projects[0])}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#182133] transition cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-xs">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {projects[0]?.name || 'WebDev Project'}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>3 online • 2m ago</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>

              {/* Room 2 */}
              <div
                onClick={() => (projects[1] ? onSelectProject(projects[1]) : projects[0] && onSelectProject(projects[0]))}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#182133] transition cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold text-xs">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {projects[1]?.name || 'Frontend Team'}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>2 online • 12m ago</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>

              {/* Room 3 */}
              <div
                onClick={() => (projects[2] ? onSelectProject(projects[2]) : projects[0] && onSelectProject(projects[0]))}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#182133] transition cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {projects[2]?.name || 'AI-ML Project'}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>1 online • 1h ago</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>
          </div>

          {/* Security Overview Card */}
          <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] space-y-3">
            <div className="flex items-start space-x-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Security Overview</h3>
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">All systems secure</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Your code and data are protected.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveNav('security')}
              className="w-full bg-[#182133] hover:bg-[#1f2b42] border border-[#25324d] text-slate-200 font-medium text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5 transition"
            >
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

          {/* Live Collaborators Card */}
          <div className="p-4 rounded-2xl bg-[#121826] border border-[#1e293b] space-y-3">
            <h3 className="text-xs font-bold text-white tracking-wide">Live Collaborators</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center -space-x-1.5">
                <div className="w-7 h-7 rounded-full bg-indigo-500 ring-2 ring-[#121826] flex items-center justify-center text-[10px] font-bold text-white">
                  A
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-500 ring-2 ring-[#121826] flex items-center justify-center text-[10px] font-bold text-white">
                  B
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 ring-2 ring-[#121826] flex items-center justify-center text-[10px] font-bold text-white">
                  S
                </div>
                <div className="w-7 h-7 rounded-full bg-[#1e293b] ring-2 ring-[#121826] flex items-center justify-center text-[10px] font-bold text-slate-300">
                  +2
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>3 online • 1 in this room</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL: CREATE NEW ROOM / WORKSPACE
          ════════════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#0b0f19]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#121826] rounded-2xl w-full max-w-md p-6 border border-[#1e293b] shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                <span>Create New Room</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2336] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Initialize a collaborative real-time room with full binary Yjs CRDT synchronization.
            </p>

            {createError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono mb-3">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Room Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. WebDev Project"
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Brief summary of repository or collaboration goal..."
                  rows={3}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
                >
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL: JOIN ROOM VIA INVITE CODE
          ════════════════════════════════════════════════════════════════════════ */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-[#0b0f19]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#121826] rounded-2xl w-full max-w-md p-6 border border-[#1e293b] shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="h-5 w-5 text-blue-400" />
                <span>Join Collaboration Room</span>
              </h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2336] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter the 8-character invite code shared by your project administrator.
            </p>

            <form onSubmit={handleJoinProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Invite Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. QUANTUM2"
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining || !joinCode.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
                >
                  {joining ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
