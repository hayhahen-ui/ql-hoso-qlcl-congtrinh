"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckSquare,
  FileCheck2,
  FileSpreadsheet,
  FlaskConical,
  FolderCheck,
  GitFork,
  HardHat,
  Layers,
  LayoutDashboard,
  Menu,
  Package,
  Ruler,
  ShieldCheck,
  X,
} from "lucide-react";
import { createCleanRealTenant, createDemoSeedState } from "@/data/demo-seed";
import { AppTabId, QlclWorkspaceState, ScheduleWorkItem } from "@/types/qlcl";
import MindmapTab from "@/components/MindmapTab";
import FormPreviewTab from "@/components/FormPreviewTab";
import { CatalogsTab, MaterialsTab, OverviewTab, ProjectTab } from "@/components/OverviewAndProjectTabs";
import { KthhTab, ScheduleTab, TestingTab } from "@/components/ExecutionAndTestingTabs";
import {
  AcceptanceTab,
  AuditAndTenantTab,
  DiaryTab,
  DossierTab,
} from "@/components/AcceptanceAndDossierTabs";

const STORAGE_KEY = "qlcl_kaizen_v3_workspace_v1";

interface NavItem {
  id: AppTabId;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Tổng quan & KPI", icon: LayoutDashboard },
  { id: "mindmap", label: "Sơ đồ Mindmap Luồng Nhập", badge: "Hướng dẫn", icon: GitFork },
  { id: "project", label: "1. Công trình & Pháp lý 207", icon: Building2 },
  { id: "catalogs", label: "2. Danh mục chuẩn & TCVN", icon: Layers },
  { id: "materials", label: "3. Vật liệu & Cấp phối BT", icon: Package },
  { id: "testing", label: "4. Kế hoạch & Kết quả TN", icon: FlaskConical },
  { id: "schedule", label: "5. Nhật trình thi công", icon: CalendarDays },
  { id: "kthh", label: "6. Kiểm tra KTHH & Hoàn công", icon: Ruler },
  { id: "diary", label: "7. Nhật ký & Thời tiết (IIa)", icon: BookOpen },
  { id: "acceptance", label: "8. Nghiệm thu 24h & Sổ số", icon: FileCheck2 },
  { id: "dossier", label: "9. Hồ sơ PL VII & PL X (42)", icon: FolderCheck },
  { id: "forms", label: "10. 30 Biểu mẫu & 13 Excel", icon: FileSpreadsheet },
  { id: "audit", label: "Quản trị Tenant & Audit", icon: ShieldCheck },
];

export default function QlclApp() {
  const [state, setState] = useState<QlclWorkspaceState>(() => createDemoSeedState());
  const [activeTab, setActiveTab] = useState<AppTabId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as QlclWorkspaceState;
        if (parsed && parsed.project && parsed.checklist) {
          setState(parsed);
        }
      }
    } catch {
      // ignore corrupted storage and stick with clean demo seed
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state, hydrated]);

  const handleUpdate = (
    updater: (prev: QlclWorkspaceState) => QlclWorkspaceState,
    logDetail?: string
  ) => {
    setState((prev) => {
      const next = updater(prev);
      const now = new Date().toISOString();
      if (!logDetail) {
        return { ...next, lastUpdated: now };
      }
      return {
        ...next,
        lastUpdated: now,
        auditLogs: [
          ...next.auditLogs,
          {
            id: `AUD-${Date.now()}`,
            timestamp: now,
            actor: next.tenantMode === "demo" ? "Kỹ sư Demo" : "Quản trị Dự án",
            action: "UPDATE_DATA",
            entity: activeTab,
            entity_id: next.project.project_code,
            detail: logDetail,
          },
        ],
      };
    });
  };

  const handleImportScheduleCommit = (items: ScheduleWorkItem[], filename: string) => {
    handleUpdate(
      (prev) => ({
        ...prev,
        schedule: items,
      }),
      `Import ${items.length} dòng vào Nhật trình từ file ${filename}`
    );
  };

  const handleResetDemo = () => {
    const fresh = createDemoSeedState();
    setState(fresh);
  };

  const handleCreateRealTenant = (params: {
    contractorName: string;
    projectCode: string;
    projectName: string;
    location: string;
  }) => {
    const realState = createCleanRealTenant(params);
    setState(realState);
    setActiveTab("mindmap");
  };

  const handleSwitchBackToDemo = () => {
    setState(createDemoSeedState());
    setActiveTab("overview");
  };

  const navigateTo = (tab: AppTabId) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white">QLCL Pro</div>
              <div className="text-[10px] text-slate-400">NĐ 207/2026 &amp; TT 32/2026</div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Mode Pill */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div
            className={`px-3 py-2 rounded-xl border text-xs ${
              state.tenantMode === "demo"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>{state.tenantMode === "demo" ? "TENANT DEMO" : "DỰ ÁN THẬT"}</span>
              <span className="font-mono text-[10px]">{state.project.project_code}</span>
            </div>
            <div className="text-[10px] opacity-80 truncate mt-0.5">{state.project.project_name}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : item.id === "mindmap"
                    ? "bg-indigo-950/70 text-indigo-200 hover:bg-indigo-900 border border-indigo-700/50"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckSquare className="w-3.5 h-3.5" /> Dữ liệu tự động lưu cục bộ
          </div>
          <div className="mt-0.5">Phiên bản thương mại Kaizen V3</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="no-print sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {NAV_ITEMS.find((i) => i.id === activeTab)?.label}
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                Hệ thống Quản lý Chất lượng Công trình — Chuẩn NĐ 207/2026/NĐ-CP &amp; TT 32/2026/TT-BXD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab !== "mindmap" && (
              <button
                onClick={() => navigateTo("mindmap")}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sơ đồ Mindmap</span>
              </button>
            )}
            <button
              onClick={() => navigateTo("audit")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                state.tenantMode === "demo"
                  ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
              }`}
            >
              {state.tenantMode === "demo" ? "Đang chạy Demo · Tạo Dự án Thật" : "Dự án Thật"}
            </button>
          </div>
        </header>

        {/* Active Tab View */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          {activeTab === "overview" && <OverviewTab state={state} onNavigateTab={navigateTo} />}
          {activeTab === "mindmap" && <MindmapTab state={state} onNavigateTab={navigateTo} />}
          {activeTab === "project" && <ProjectTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "catalogs" && <CatalogsTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "materials" && <MaterialsTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "testing" && <TestingTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "schedule" && <ScheduleTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "kthh" && <KthhTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "diary" && <DiaryTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "acceptance" && <AcceptanceTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "dossier" && <DossierTab state={state} onUpdate={handleUpdate} />}
          {activeTab === "forms" && (
            <FormPreviewTab state={state} onImportScheduleCommit={handleImportScheduleCommit} />
          )}
          {activeTab === "audit" && (
            <AuditAndTenantTab
              state={state}
              onResetDemo={handleResetDemo}
              onCreateRealTenant={handleCreateRealTenant}
              onSwitchBackToDemo={handleSwitchBackToDemo}
            />
          )}
        </main>
      </div>
    </div>
  );
}
