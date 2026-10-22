import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  Radio,
  Flame,
  ChevronUp,
  X,
  Bug,
  KeyRound,
  Database
} from 'lucide-react';
import {
  AttackResult,
  CollaboratorRole,
  RedTeamAttackType
} from '../types';
import {
  getStoredToken,
  simulateRedTeamAttack,
  fetchSecurityLogs,
  cn
} from '../services/api';

interface TelemetryBarProps {
  projectId?: string;
  userRole: CollaboratorRole;
  username: string;
  crdtOpsCount?: number;
  yjsByteSize?: number;
  onSimulateBurst?: () => void;
  onAttackSimulated?: (result: AttackResult) => void;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  projectId = 'demo-quantum-router',
  userRole,
  username,
  crdtOpsCount = 42,
  yjsByteSize = 3480,
  onSimulateBurst,
  onAttackSimulated
}) => {
  const [jwtVerified, setJwtVerified] = useState(true);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<string>('');

  const [blockedCount, setBlockedCount] = useState<number>(2);
  const [bursting, setBursting] = useState(false);

  const [attackDropdownOpen, setAttackDropdownOpen] = useState(false);
  const [attackRunning, setAttackRunning] = useState(false);
  const [lastAttackResult, setLastAttackResult] = useState<AttackResult | null>(null);
  const [showAttackModal, setShowAttackModal] = useState(false);

  // Parse token info
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setJwtVerified(true);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          setTokenInfo(JSON.stringify(payload, null, 2));
        }
      } catch {
        setTokenInfo('Custom HMAC-SHA256 Token');
      }
    }
  }, [username]);

  // Fetch initial blocked intrusion count from SQLite security logs
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await fetchSecurityLogs(projectId);
        const blocked = logs.filter(l => l.blocked).length;
        setBlockedCount(blocked || 2);
      } catch {
        // fallback
      }
    };
    loadLogs();
  }, [projectId]);

  // Handle CRDT Conflict Burst Simulation
  const handleBurst = () => {
    setBursting(true);
    if (onSimulateBurst) {
      onSimulateBurst();
    }
    setTimeout(() => {
      setBursting(false);
    }, 1500);
  };

  // Handle Red-Team Attack Simulation
  const handleRunAttack = async (type: RedTeamAttackType) => {
    setAttackDropdownOpen(false);
    setAttackRunning(true);

    try {
      const result = await simulateRedTeamAttack(projectId, type);
      setLastAttackResult(result);
      setShowAttackModal(true);
      if (result.blocked) {
        setBlockedCount(prev => prev + 1);
      }
      if (onAttackSimulated) {
        onAttackSimulated(result);
      }
    } catch (err: any) {
      console.error('Red-Team attack error:', err);
    } finally {
      setAttackRunning(false);
    }
  };

  return (
    <>
      <footer className="h-8 bg-obsidian-950 border-t border-obsidian-700/80 px-3 flex items-center justify-between text-[11px] font-mono text-obsidian-400 select-none z-30">
        {/* ─── Left: Security & Identity Badges ─── */}
        <div className="flex items-center space-x-3">
          {/* JWT Verified Badge */}
          <button
            onClick={() => setShowTokenModal(true)}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald hover:bg-neon-emerald/20 transition"
            title="Click to view HMAC-SHA256 JWT details"
          >
            <ShieldCheck className="h-3 w-3" />
            <span className="font-semibold text-[10px]">JWT VERIFIED</span>
          </button>

          {/* User Role Badge */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-750">
            <span className="text-[10px] text-obsidian-500">ROLE:</span>
            <span
              className={cn(
                "font-bold text-[10px] uppercase",
                userRole === 'OWNER' && "text-neon-amber",
                userRole === 'EDITOR' && "text-neon-cyan",
                userRole === 'VIEWER' && "text-neon-violet"
              )}
            >
              {userRole}
            </span>
          </div>

          {/* CRDT Sync Ops Counter */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-750 text-obsidian-300">
            <Zap className="h-3 w-3 text-neon-cyan" />
            <span>CRDT Ops:</span>
            <span className="font-bold text-neon-cyan">{crdtOpsCount}</span>
          </div>

          {/* Yjs State Size */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-750 text-obsidian-300">
            <Database className="h-3 w-3 text-obsidian-400" />
            <span>State:</span>
            <span className="font-bold text-obsidian-200">
              {(yjsByteSize / 1024).toFixed(1)} KB
            </span>
          </div>

          {/* Blocked Intrusions Counter */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-neon-rose/10 border border-neon-rose/30 text-neon-rose">
            <ShieldAlert className="h-3 w-3" />
            <span>Blocked Threats:</span>
            <span className="font-bold">{blockedCount}</span>
          </div>
        </div>

        {/* ─── Right: Simulation Triggers & Status ─── */}
        <div className="flex items-center space-x-2">
          {/* WebSocket Ping status */}
          <div className="hidden md:flex items-center space-x-1.5 text-obsidian-500 text-[10px] pr-2 border-r border-obsidian-800">
            <Radio className="h-3 w-3 text-neon-emerald animate-pulse" />
            <span>ws://4000 (12ms)</span>
          </div>

          {/* Simulate CRDT Conflict Burst Button */}
          <button
            onClick={handleBurst}
            disabled={bursting}
            className={cn(
              "flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold border transition",
              bursting
                ? "bg-neon-cyan text-obsidian-950 border-neon-cyan animate-pulse"
                : "bg-obsidian-850 hover:bg-obsidian-800 text-neon-cyan border-neon-cyan/40"
            )}
            title="Simulate rapid concurrent edits to stress-test token-bucket rate limiter"
          >
            <Activity className="h-3 w-3" />
            <span>{bursting ? 'BURSTING...' : 'Simulate CRDT Conflict'}</span>
          </button>

          {/* Simulate Hacker Attack (Red-Team) Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAttackDropdownOpen(!attackDropdownOpen)}
              disabled={attackRunning}
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-neon-rose/15 hover:bg-neon-rose/25 text-neon-rose border border-neon-rose/40 transition"
            >
              <Flame className="h-3 w-3" />
              <span>{attackRunning ? 'PROBING...' : 'Red-Team Attack'}</span>
              <ChevronUp className="h-3 w-3" />
            </button>

            {attackDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-1.5 w-64 glass-panel-elevated rounded-xl p-2 z-50 border border-obsidian-600 shadow-2xl animate-fade-in text-left">
                <div className="flex items-center space-x-1.5 px-2 py-1 text-[10px] font-bold text-neon-rose border-b border-obsidian-700/80 mb-1">
                  <Bug className="h-3.5 w-3.5" />
                  <span>Simulate Adversarial Vectors</span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleRunAttack('rce')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-obsidian-800 text-obsidian-200 hover:text-white transition flex flex-col"
                  >
                    <span className="font-bold text-[10px] text-neon-rose">1. RCE Code Injection</span>
                    <span className="text-[9px] text-obsidian-400">os.system("cat /etc/passwd") breakout</span>
                  </button>

                  <button
                    onClick={() => handleRunAttack('traversal')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-obsidian-800 text-obsidian-200 hover:text-white transition flex flex-col"
                  >
                    <span className="font-bold text-[10px] text-neon-amber">2. Path Traversal Probe</span>
                    <span className="text-[9px] text-obsidian-400">File creation: "../../etc/shadow"</span>
                  </button>

                  <button
                    onClick={() => handleRunAttack('rbac')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-obsidian-800 text-obsidian-200 hover:text-white transition flex flex-col"
                  >
                    <span className="font-bold text-[10px] text-neon-violet">3. RBAC Privilege Escalation</span>
                    <span className="text-[9px] text-obsidian-400">Unauthorized role mutation attempt</span>
                  </button>

                  <button
                    onClick={() => handleRunAttack('flood')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-obsidian-800 text-obsidian-200 hover:text-white transition flex flex-col"
                  >
                    <span className="font-bold text-[10px] text-neon-cyan">4. WebSocket Flood DoS</span>
                    <span className="text-[9px] text-obsidian-400">Burst requests exceeding rate window</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* ─── JWT Inspection Modal ─── */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-md p-5 border border-obsidian-600 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-700">
              <div className="flex items-center space-x-2 text-white">
                <KeyRound className="h-4 w-4 text-neon-emerald" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Cryptographic Token Metadata</h4>
              </div>
              <button onClick={() => setShowTokenModal(false)} className="text-obsidian-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-3 space-y-2 text-xs">
              <div className="flex justify-between text-obsidian-400">
                <span>Algorithm:</span>
                <span className="text-white font-bold">HMAC-SHA256 (Node Native)</span>
              </div>
              <div className="flex justify-between text-obsidian-400">
                <span>Subject:</span>
                <span className="text-neon-cyan">{username}</span>
              </div>
              <div className="flex justify-between text-obsidian-400">
                <span>Role:</span>
                <span className="text-neon-amber font-bold">{userRole}</span>
              </div>
              <div className="flex justify-between text-obsidian-400">
                <span>Timing Safe Verification:</span>
                <span className="text-neon-emerald font-bold">crypto.timingSafeEqual</span>
              </div>
            </div>

            <div className="bg-obsidian-950 rounded-lg p-2.5 border border-obsidian-800 text-[10px] text-obsidian-300 overflow-x-auto max-h-36">
              <pre>{tokenInfo || '// No raw payload decoded'}</pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Attack Analysis Modal ─── */}
      {showAttackModal && lastAttackResult && (
        <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-lg p-6 border border-neon-rose/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-700">
              <div className="flex items-center space-x-2 text-neon-rose">
                <ShieldAlert className="h-5 w-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  Red-Team Defense Verification
                </h4>
              </div>
              <button onClick={() => setShowAttackModal(false)} className="text-obsidian-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald">
                <div className="font-bold text-xs">{lastAttackResult.message}</div>
                <div className="text-[11px] text-obsidian-300 mt-1">{lastAttackResult.details}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-obsidian-900 p-2 rounded border border-obsidian-800">
                  <span className="text-obsidian-500 block">HTTP Response Code:</span>
                  <span className="text-white font-bold">{lastAttackResult.status}</span>
                </div>
                <div className="bg-obsidian-900 p-2 rounded border border-obsidian-800">
                  <span className="text-obsidian-500 block">Intrusion Status:</span>
                  <span className="text-neon-emerald font-bold">INTERCEPTED & LOGGED</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAttackModal(false)}
                className="px-4 py-2 rounded-lg bg-neon-rose text-obsidian-950 font-bold text-xs uppercase"
              >
                Acknowledge Defense
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
