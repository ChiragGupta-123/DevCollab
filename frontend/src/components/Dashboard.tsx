import React, { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Lock,
  FileCode,
  Plus,
  ArrowRight,
  Copy,
  Check,
  UserCheck,
  ChevronDown,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import {
  CollaboratorRole,
  Persona,
  Project
} from '../types';
import {
  DEFAULT_PERSONAS,
  createProject,
  fetchProjects,
  joinProject,
  switchPersona,
  cn
} from '../services/api';

interface DashboardProps {
  onSelectProject: (project: Project) => void;
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectProject,
  currentPersona,
  onPersonaChange
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite code copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Persona switcher popover state
  const [personaOpen, setPersonaOpen] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [customRole, setCustomRole] = useState<CollaboratorRole>('EDITOR');

  // Create Project Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join Project state
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinFeedback, setJoinFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Load projects on persona change or mount
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
  }, [currentPersona]);

  // Handle switching personas
  const handleSwitchPersona = async (persona: Persona) => {
    try {
      await switchPersona(persona);
      onPersonaChange(persona);
      setPersonaOpen(false);
    } catch (err: any) {
      console.error('Failed to switch persona:', err);
    }
  };

  const handleCreateCustomPersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) return;

    const newPersona: Persona = {
      id: `user-${Date.now()}`,
      username: customUsername.trim(),
      role: customRole,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customUsername.trim())}`,
      badgeColor: customRole === 'OWNER' ? '#FFB800' : customRole === 'EDITOR' ? '#00F0FF' : '#A855F7',
      description: `Custom ${customRole} session for multi-tab testing`
    };

    await handleSwitchPersona(newPersona);
    setCustomUsername('');
  };

  // Copy invite code with feedback
  const handleCopyInvite = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
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
    } catch (err: any) {
      setJoinFeedback({
        type: 'error',
        msg: err.response?.data?.error || 'Invalid or non-existent invite code'
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-200 flex flex-col font-sans select-none overflow-y-auto">
      {/* ─── Top Navigation Bar with Persona Switcher ─── */}
      <header className="h-16 border-b border-obsidian-700/80 bg-obsidian-900/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet p-0.5 shadow-neon-cyan flex items-center justify-center">
            <div className="h-full w-full bg-obsidian-950 rounded-[7px] flex items-center justify-center">
              <Terminal className="h-5 w-5 text-neon-cyan" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-wide">DevCollab</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-semibold">
                v2.0 SECURE
              </span>
            </div>
            <p className="text-xs text-obsidian-400 font-mono -mt-0.5">Real-Time CRDT Sandbox</p>
          </div>
        </div>

        {/* Persona Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setPersonaOpen(!personaOpen)}
            className="flex items-center space-x-3 px-3 py-1.5 rounded-lg border border-obsidian-700 bg-obsidian-850 hover:bg-obsidian-800 transition-all shadow-sm"
          >
            <img
              src={currentPersona.avatarUrl}
              alt={currentPersona.username}
              className="w-7 h-7 rounded-full border border-obsidian-600 bg-obsidian-900"
            />
            <div className="text-left">
              <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <span>{currentPersona.username}</span>
                <span
                  className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${currentPersona.badgeColor}20`,
                    color: currentPersona.badgeColor,
                    borderColor: `${currentPersona.badgeColor}40`,
                    borderWidth: '1px'
                  }}
                >
                  {currentPersona.role}
                </span>
              </div>
              <p className="text-[10px] text-obsidian-400 font-mono">Click to switch persona</p>
            </div>
            <ChevronDown className="h-4 w-4 text-obsidian-400" />
          </button>

          {/* Persona Dropdown Popover */}
          {personaOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-panel-elevated rounded-xl p-3 z-50 animate-fade-in border border-obsidian-600 shadow-2xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-obsidian-700 text-xs font-semibold text-obsidian-300">
                <span className="flex items-center space-x-1.5">
                  <UserCheck className="h-4 w-4 text-neon-cyan" />
                  <span>Instant Multi-Tab Persona Switcher</span>
                </span>
              </div>

              <div className="space-y-1.5">
                {DEFAULT_PERSONAS.map((p) => {
                  const isCurrent = p.username === currentPersona.username;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchPersona(p)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex items-start space-x-2.5",
                        isCurrent
                          ? "bg-obsidian-800 border-neon-cyan/50 shadow-sm"
                          : "bg-obsidian-900/60 border-obsidian-800 hover:bg-obsidian-850 hover:border-obsidian-700"
                      )}
                    >
                      <img
                        src={p.avatarUrl}
                        alt={p.username}
                        className="w-8 h-8 rounded-full border border-obsidian-600 bg-obsidian-950 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate">{p.username}</span>
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold"
                            style={{
                              backgroundColor: `${p.badgeColor}25`,
                              color: p.badgeColor
                            }}
                          >
                            {p.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-obsidian-400 line-clamp-1 mt-0.5">{p.description}</p>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-neon-cyan shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Quick Switch Form */}
              <form onSubmit={handleCreateCustomPersona} className="mt-3 pt-3 border-t border-obsidian-700/80">
                <p className="text-[11px] text-obsidian-400 font-mono mb-2">Create Custom Multi-Tab User:</p>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="E.g. Dave (PenTester)"
                    className="flex-1 bg-obsidian-950 border border-obsidian-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-neon-cyan"
                  />
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as CollaboratorRole)}
                    className="bg-obsidian-950 border border-obsidian-700 rounded px-2 py-1 text-xs text-obsidian-200 focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!customUsername.trim()}
                  className="w-full py-1 text-xs rounded bg-obsidian-800 hover:bg-obsidian-700 text-neon-cyan border border-neon-cyan/30 disabled:opacity-50 transition"
                >
                  Switch into Persona
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ─── Hero Section: Security & CRDT Architecture ─── */}
      <section className="px-8 pt-8 pb-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-obsidian-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Enterprise Collaborative Engineering Environment</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              DevCollab Architecture Kernel
            </h1>
            <p className="text-sm text-obsidian-400 mt-1 max-w-2xl">
              Conflict-Free Replicated Data Types (CRDT) coupled with deterministic zero-trust SQLite RBAC and automated code injection threat scanning.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-violet hover:opacity-95 text-obsidian-950 font-semibold text-xs tracking-wide shadow-neon-cyan transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* 4 Architecture Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-xl border border-obsidian-700 hover:border-neon-cyan/40 transition-all group">
            <div className="h-9 w-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan mb-3 group-hover:scale-105 transition-transform">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero-Trust SQLite RBAC</h3>
            <p className="text-xs text-obsidian-400 mt-1 leading-relaxed">
              Every REST endpoint and WebSocket frame validates caller role in SQLite. Violations log <span className="text-neon-rose font-mono">RBAC_VIOLATION_ATTEMPT</span>.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-obsidian-700 hover:border-neon-emerald/40 transition-all group">
            <div className="h-9 w-9 rounded-lg bg-neon-emerald/10 border border-neon-emerald/30 flex items-center justify-center text-neon-emerald mb-3 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Yjs CRDT Convergence</h3>
            <p className="text-xs text-obsidian-400 mt-1 leading-relaxed">
              Decentralized state vector synchronization. Token-bucket rate limiter throttles socket floods at 40 events/sec.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-obsidian-700 hover:border-neon-rose/40 transition-all group">
            <div className="h-9 w-9 rounded-lg bg-neon-rose/10 border border-neon-rose/30 flex items-center justify-center text-neon-rose mb-3 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">RCE Threat Shield</h3>
            <p className="text-xs text-obsidian-400 mt-1 leading-relaxed">
              Static AST inspection blocks <span className="font-mono text-neon-rose">child_process</span>, <span className="font-mono text-neon-rose">os.system</span>, and sandbox escapes before execution.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-obsidian-700 hover:border-neon-violet/40 transition-all group">
            <div className="h-9 w-9 rounded-lg bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-center text-neon-violet mb-3 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Immutable Security Audit</h3>
            <p className="text-xs text-obsidian-400 mt-1 leading-relaxed">
              Path traversal and intrusion probes trigger <span className="font-mono text-neon-violet">PATH_TRAVERSAL_BLOCKED</span> directly to security telemetry.
            </p>
          </div>
        </div>

        {/* ─── Join Project Bar ─── */}
        <div className="glass-panel p-4 rounded-xl border border-obsidian-700 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-neon-violet/15 text-neon-violet border border-neon-violet/30 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Join Existing Project via Invite Code</h4>
              <p className="text-[11px] text-obsidian-400">Collaborate instantly with team members using their unique 8-character invite code.</p>
            </div>
          </div>

          <form onSubmit={handleJoinProject} className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. QUANTUM2025"
              className="bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-obsidian-500 focus:outline-none focus:border-neon-cyan uppercase w-full md:w-56"
            />
            <button
              type="submit"
              disabled={joining || !joinCode.trim()}
              className="px-4 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 border border-neon-cyan/40 text-neon-cyan font-semibold text-xs tracking-wider uppercase transition disabled:opacity-50 shrink-0"
            >
              {joining ? 'Joining...' : 'Join Workspace'}
            </button>
          </form>
        </div>

        {joinFeedback && (
          <div className={cn(
            "p-3 rounded-lg text-xs font-mono mb-6 flex items-center justify-between",
            joinFeedback.type === 'success'
              ? "bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald"
              : "bg-neon-rose/10 border border-neon-rose/30 text-neon-rose"
          )}>
            <span>{joinFeedback.msg}</span>
            <button onClick={() => setJoinFeedback(null)} className="underline text-[10px]">Dismiss</button>
          </div>
        )}

        {/* ─── Projects Grid ─── */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-4 w-4 text-neon-cyan" />
            <h2 className="text-base font-bold text-white tracking-wide">Available Projects</h2>
            <span className="text-xs font-mono text-obsidian-400 bg-obsidian-850 px-2 py-0.5 rounded-full border border-obsidian-700">
              {projects.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-2 border-neon-cyan border-t-transparent rounded-full mb-3" />
            <p className="text-xs font-mono text-obsidian-400">Decrypting workspace records from SQLite...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-6 rounded-xl border border-neon-rose/40 text-center my-8">
            <AlertTriangle className="h-8 w-8 text-neon-rose mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">Database Query Failure</h3>
            <p className="text-xs text-obsidian-400 mt-1">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl border border-obsidian-800 text-center my-8">
            <FileCode className="h-10 w-10 text-obsidian-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No Accessible Projects Found</h3>
            <p className="text-xs text-obsidian-400 mt-1 max-w-sm mx-auto">
              Create a new collaborative project or join an existing workspace using an invite code.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-neon-cyan text-obsidian-950 font-semibold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
            {projects.map((proj) => {
              const role = proj.role || 'VIEWER';
              const isOwner = role === 'OWNER';
              const isEditor = role === 'EDITOR';

              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className="glass-panel rounded-xl p-5 border border-obsidian-700/80 hover:border-neon-cyan/50 hover:shadow-card-glow transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Name + Role Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors">
                        {proj.name}
                      </h3>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border",
                          isOwner && "bg-neon-amber/15 text-neon-amber border-neon-amber/30",
                          isEditor && "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30",
                          !isOwner && !isEditor && "bg-neon-violet/15 text-neon-violet border-neon-violet/30"
                        )}
                      >
                        {role}
                      </span>
                    </div>

                    <p className="text-xs text-obsidian-400 line-clamp-2 leading-relaxed mb-4">
                      {proj.description || 'Distributed real-time collaborative workspace.'}
                    </p>
                  </div>

                  {/* Footer details */}
                  <div className="pt-3 border-t border-obsidian-800 flex items-center justify-between text-xs font-mono">
                    {/* 1-Click Invite Code Copy */}
                    <button
                      onClick={(e) => handleCopyInvite(proj.invite_code, e)}
                      title="Click to copy invite code"
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700 text-obsidian-300 hover:text-white transition"
                    >
                      <span className="text-[10px] text-obsidian-500">CODE:</span>
                      <span className="font-semibold text-neon-cyan">{proj.invite_code}</span>
                      {copiedCode === proj.invite_code ? (
                        <Check className="h-3.5 w-3.5 text-neon-emerald" />
                      ) : (
                        <Copy className="h-3 w-3 text-obsidian-400" />
                      )}
                    </button>

                    <div className="flex items-center space-x-1 text-neon-cyan group-hover:translate-x-1 transition-transform font-semibold text-xs">
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Create Project Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-md p-6 border border-obsidian-600 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <Plus className="h-5 w-5 text-neon-cyan" />
              <span>Initialize New Collaborative Workspace</span>
            </h3>
            <p className="text-xs text-obsidian-400 mb-4">
              Creating a project sets your persona as the permanent OWNER with exclusive RBAC governance rights.
            </p>

            {createError && (
              <div className="p-2.5 rounded bg-neon-rose/10 border border-neon-rose/30 text-neon-rose text-xs font-mono mb-3">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-obsidian-300 mb-1">
                  Project Name <span className="text-neon-rose">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Distributed Neural Graph"
                  className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian-300 mb-1">
                  Description
                </label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Brief description of the repository and architecture..."
                  rows={3}
                  className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-obsidian-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-violet hover:opacity-95 text-obsidian-950 font-bold text-xs tracking-wider uppercase disabled:opacity-50 transition shadow-neon-cyan"
                >
                  {creating ? 'Initializing...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
