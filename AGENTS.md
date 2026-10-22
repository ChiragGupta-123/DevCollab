# DevCollab — Workspace Rules for Antigravity Agent
1. Write 100% complete, runnable TypeScript/React code. NEVER use `// TODO` or placeholders.
2. DO NOT run `npm install` or `npm run dev` in the agent terminal. I will run them manually in PowerShell.
3. Only read or edit the exact files mentioned in the current prompt. Do not scan unrelated directories.

## Locked File Contracts
- Backend (Port 4000): `backend/src/types.ts`, `backend/src/security/securityMiddleware.ts`, `backend/src/db.ts`, `backend/src/routes/projects.ts`, `backend/src/routes/files.ts`, `backend/src/routes/execute.ts`, `backend/src/socket/crdtServer.ts`, `backend/src/server.ts`
- Frontend (Port 5173): `frontend/src/types/index.ts`, `frontend/src/services/api.ts`, `frontend/src/components/Dashboard.tsx`, `frontend/src/components/SidebarFileTree.tsx`, `frontend/src/components/CollaborativeEditor.tsx`, `frontend/src/components/ExecutionConsole.tsx`, `frontend/src/components/VersionHistoryModal.tsx`, `frontend/src/components/CollabDrawer.tsx`, `frontend/src/components/TelemetryBar.tsx`, `frontend/src/App.tsx`
