"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  CircleDashed,
  FileSpreadsheet,
  GitFork,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Layers,
  Info,
} from "lucide-react";
import { MINDMAP_NODES, MindmapNodeDef, computeMindmapNodeStatus } from "@/data/mindmap-flow";
import { AppTabId, QlclWorkspaceState } from "@/types/qlcl";
import { CONTRACT_FILES_META, ContractFileKey, downloadContractWorkbook } from "@/lib/excel-service";

interface MindmapTabProps {
  state: QlclWorkspaceState;
  onNavigateTab: (tab: AppTabId) => void;
}

const NODE_WIDTH = 270;
const NODE_HEIGHT = 138;

const PHASE_COLORS: Record<MindmapNodeDef["phase"], string> = {
  "Khởi tạo": "bg-blue-50 text-blue-700 border-blue-200",
  "Chuẩn bị": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Thi công": "bg-orange-50 text-orange-700 border-orange-200",
  "Nghiệm thu": "bg-rose-50 text-rose-700 border-rose-200",
  "Hoàn công & Xuất": "bg-purple-50 text-purple-700 border-purple-200",
};

export default function MindmapTab({ state, onNavigateTab }: MindmapTabProps) {
  const [selectedId, setSelectedId] = useState<string>("step-1");
  const [zoom, setZoom] = useState<number>(0.85);
  const [viewMode, setViewMode] = useState<"canvas" | "linear">("canvas");
  const [phaseFilter, setPhaseFilter] = useState<string>("ALL");

  const nodeStatuses = useMemo(() => {
    const map: Record<string, ReturnType<typeof computeMindmapNodeStatus>> = {};
    MINDMAP_NODES.forEach((n) => {
      map[n.id] = computeMindmapNodeStatus(n.id, state);
    });
    return map;
  }, [state]);

  const selectedNode = useMemo(
    () => MINDMAP_NODES.find((n) => n.id === selectedId) ?? MINDMAP_NODES[0],
    [selectedId]
  );

  const selectedStatus = nodeStatuses[selectedNode.id];

  const edges = useMemo(() => {
    const list: Array<{ from: MindmapNodeDef; to: MindmapNodeDef; active: boolean }> = [];
    MINDMAP_NODES.forEach((target) => {
      target.dependsOn.forEach((srcId) => {
        const src = MINDMAP_NODES.find((n) => n.id === srcId);
        if (src) {
          list.push({
            from: src,
            to: target,
            active: src.id === selectedId || target.id === selectedId,
          });
        }
      });
    });
    return list;
  }, [selectedId]);

  const handleDownloadTemplate = (excelName: string) => {
    const clean = excelName.replace(".xlsx", "").replace("_DEMO", "");
    const match = CONTRACT_FILES_META.find(
      (m) => m.key === clean || m.filename === excelName || m.filename.includes(clean)
    );
    if (match) {
      downloadContractWorkbook(match.key as ContractFileKey, state, state.tenantMode === "real");
    }
  };

  const overallProgress = useMemo(() => {
    const sum = Object.values(nodeStatuses).reduce((acc, s) => acc + s.percent, 0);
    return Math.round(sum / MINDMAP_NODES.length);
  }, [nodeStatuses]);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-2">
              <GitFork className="w-3.5 h-3.5" />
              SƠ ĐỒ TƯ DUY LUỒNG NHẬP LIỆU & NGHIỆM THU (MINDMAP)
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Bản đồ Thao tác Nhập liệu Toàn hệ thống (Bước 1 → Bước 10)
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Nhìn vào sơ đồ để biết cần nhập từ đâu, phụ thuộc dữ liệu nào và kết xuất ra biểu mẫu gì theo{" "}
              <span className="text-amber-300 font-medium">NĐ 207/2026/NĐ-CP & TT 32/2026/TT-BXD</span>. Bấm vào từng nút để xem hướng dẫn hoặc nhảy thẳng tới màn hình nhập liệu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-300">Độ phủ dữ liệu</div>
              <div className="text-2xl font-bold text-emerald-400">{overallProgress}%</div>
            </div>
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/15">
              <button
                onClick={() => setViewMode("canvas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === "canvas" ? "bg-white text-slate-900 shadow" : "text-slate-200 hover:text-white"
                }`}
              >
                Sơ đồ Mindmap
              </button>
              <button
                onClick={() => setViewMode("linear")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === "linear" ? "bg-white text-slate-900 shadow" : "text-slate-200 hover:text-white"
                }`}
              >
                Danh sách 10 bước
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Filter & Zoom Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Giai đoạn:
          </span>
          {["ALL", "Khởi tạo", "Chuẩn bị", "Thi công", "Nghiệm thu", "Hoàn công & Xuất"].map((ph) => (
            <button
              key={ph}
              onClick={() => setPhaseFilter(ph)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                phaseFilter === ph
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {ph === "ALL" ? "Tất cả (10 bước)" : ph}
            </button>
          ))}
        </div>

        {viewMode === "canvas" && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold w-12 text-center text-slate-700">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.15, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(0.85)}
              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs text-slate-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Mặc định
            </button>
          </div>
        )}
      </div>

      {/* Main Split View: Canvas/Linear + Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left: Mindmap Canvas or Linear */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {viewMode === "canvas" ? (
            <div className="overflow-auto bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:18px_18px] p-4 min-h-[500px]">
              <div
                style={{
                  width: `${2060 * zoom}px`,
                  height: `${500 * zoom}px`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "2060px",
                    height: "500px",
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    position: "relative",
                  }}
                >
                  {/* Phase column labels */}
                  {[
                    { label: "GIAI ĐOẠN 1: KHỞI TẠO", x: 80, color: "text-blue-700 bg-blue-50 border-blue-200" },
                    { label: "GIAI ĐOẠN 2: VẬT TƯ & TN", x: 410, color: "text-cyan-700 bg-cyan-50 border-cyan-200" },
                    { label: "GIAI ĐOẠN 3: NHẬT TRÌNH TRUNG TÂM", x: 740, color: "text-orange-700 bg-orange-50 border-orange-200" },
                    { label: "GIAI ĐOẠN 4: HIỆN TRƯỜNG & NHẬT KÝ", x: 1070, color: "text-amber-700 bg-amber-50 border-amber-200" },
                    { label: "GIAI ĐOẠN 5: NGHIỆM THU & BÀN GIAO", x: 1400, color: "text-rose-700 bg-rose-50 border-rose-200" },
                    { label: "ĐẦU RA TỔNG HỢP", x: 1730, color: "text-slate-800 bg-slate-100 border-slate-300" },
                  ].map((col) => (
                    <div
                      key={col.label}
                      style={{ left: `${col.x}px`, top: "18px", width: `${NODE_WIDTH}px` }}
                      className={`absolute px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-wide text-center ${col.color}`}
                    >
                      {col.label}
                    </div>
                  ))}

                  {/* SVG Bezier Connections */}
                  <svg
                    width="2060"
                    height="500"
                    className="absolute inset-0 pointer-events-none"
                  >
                    <defs>
                      <marker
                        id="arrow-muted"
                        markerWidth="8"
                        markerHeight="8"
                        refX="7"
                        refY="4"
                        orient="auto"
                      >
                        <path d="M0,1 L7,4 L0,7 Z" fill="#94a3b8" />
                      </marker>
                      <marker
                        id="arrow-active"
                        markerWidth="8"
                        markerHeight="8"
                        refX="7"
                        refY="4"
                        orient="auto"
                      >
                        <path d="M0,1 L7,4 L0,7 Z" fill="#2563eb" />
                      </marker>
                    </defs>

                    {edges.map((edge, idx) => {
                      const startX = edge.from.x + NODE_WIDTH;
                      const startY = edge.from.y + NODE_HEIGHT / 2;
                      const endX = edge.to.x;
                      const endY = edge.to.y + NODE_HEIGHT / 2;
                      const c1X = startX + (endX - startX) * 0.5;
                      const c2X = endX - (endX - startX) * 0.5;
                      const d = `M ${startX} ${startY} C ${c1X} ${startY}, ${c2X} ${endY}, ${endX} ${endY}`;
                      return (
                        <path
                          key={`${edge.from.id}-${edge.to.id}-${idx}`}
                          d={d}
                          fill="none"
                          stroke={edge.active ? "#2563eb" : "#cbd5e1"}
                          strokeWidth={edge.active ? 3 : 2}
                          strokeDasharray={edge.active ? undefined : "5 4"}
                          markerEnd={edge.active ? "url(#arrow-active)" : "url(#arrow-muted)"}
                        />
                      );
                    })}
                  </svg>

                  {/* Mindmap Nodes */}
                  {MINDMAP_NODES.map((node) => {
                    const st = nodeStatuses[node.id];
                    const isSelected = node.id === selectedId;
                    const dimmed = phaseFilter !== "ALL" && node.phase !== phaseFilter;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedId(node.id)}
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                          width: `${NODE_WIDTH}px`,
                          height: `${NODE_HEIGHT}px`,
                          borderTopColor: node.accentColor,
                        }}
                        className={`absolute rounded-xl bg-white border-2 border-t-4 p-3 shadow-sm cursor-pointer transition-all select-none flex flex-col justify-between ${
                          isSelected
                            ? "border-blue-600 ring-4 ring-blue-500/20 shadow-lg scale-[1.02]"
                            : "border-slate-200 hover:border-slate-400 hover:shadow-md"
                        } ${dimmed ? "opacity-35" : "opacity-100"}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                PHASE_COLORS[node.phase]
                              }`}
                            >
                              {node.phase}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                              {st.health === "ready" && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              {st.health === "partial" && (
                                <CircleDashed className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              {st.health === "warning" && (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                              )}
                              <span className="text-slate-700">{st.percent}%</span>
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {node.title}
                          </h3>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[11px] font-medium text-slate-600 truncate">
                            {st.countLabel}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${st.percent}%`,
                                  backgroundColor: node.accentColor,
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateTab(node.tabId);
                              }}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 shrink-0"
                            >
                              Nhập liệu <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {MINDMAP_NODES.filter((n) => phaseFilter === "ALL" || n.phase === phaseFilter).map(
                (node) => {
                  const st = nodeStatuses[node.id];
                  const isSelected = node.id === selectedId;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedId(node.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              PHASE_COLORS[node.phase]
                            }`}
                          >
                            {node.phase}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{node.legalBasis}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900">{node.title}</h3>
                        <p className="text-xs text-slate-600">{node.shortDesc}</p>
                        <div className="text-xs font-medium text-slate-700 pt-1">
                          Hiện trạng: <span className="text-blue-700">{st.countLabel}</span> — {st.hint}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateTab(node.tabId);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-blue-700 transition inline-flex items-center gap-1.5 shrink-0"
                      >
                        Mở màn hình nhập <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Right: Detailed Inspector Panel for Selected Node */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-1.5 ${
                  PHASE_COLORS[selectedNode.phase]
                }`}
              >
                Bước {selectedNode.step} / 10 · {selectedNode.phase}
              </span>
              <h3 className="text-base font-bold text-slate-900">{selectedNode.title}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{selectedNode.shortDesc}</p>

          {/* Live Status Box */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Dữ liệu hiện có:</span>
              <span className="font-bold text-blue-700">{selectedStatus.countLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{selectedStatus.hint}</span>
            </div>
          </div>

          {/* Dependencies */}
          {selectedNode.dependsOn.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Cần hoàn thành trước:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.dependsOn.map((depId) => {
                  const dep = MINDMAP_NODES.find((n) => n.id === depId);
                  if (!dep) return null;
                  return (
                    <button
                      key={depId}
                      onClick={() => setSelectedId(depId)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                    >
                      ← Bước {dep.step}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* What to input */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              1. Thao tác cần nhập tại bước này:
            </div>
            <ul className="space-y-1.5">
              {selectedNode.inputsRequired.map((req, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outputs */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              2. Hồ sơ & Kết quả sinh ra:
            </div>
            <ul className="space-y-1">
              {selectedNode.outputsGenerated.map((out, idx) => (
                <li key={idx} className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                  ✓ {out}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Excel */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-xs text-slate-500">
              <strong className="text-slate-700">Căn cứ pháp lý:</strong> {selectedNode.legalBasis}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedNode.excelFiles.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleDownloadTemplate(f)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  title="Tải file Excel tương ứng"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> {f}
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => onNavigateTab(selectedNode.tabId)}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition"
          >
            Đi tới màn hình Bước {selectedNode.step} <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
