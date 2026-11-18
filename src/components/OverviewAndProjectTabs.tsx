"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  FlaskConical,
  GitFork,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { calculateSla24h, detectDemoDataLeak, evaluateMeasurement } from "@/lib/domain-rules";
import {
  AppTabId,
  ContractBranchType,
  MaterialLot,
  PartnerOrg,
  QlclWorkspaceState,
} from "@/types/qlcl";

interface OverviewTabProps {
  state: QlclWorkspaceState;
  onNavigateTab: (tab: AppTabId) => void;
}

export function OverviewTab({ state, onNavigateTab }: OverviewTabProps) {
  const workCount = state.schedule.filter((s) => s.row_type === "work").length;
  const issuedCount = state.acceptances.filter((a) => a.status === "issued" || a.status === "signed").length;
  const overdueSla = state.acceptances.filter(
    (a) => calculateSla24h(a.request_received_at, a.inspection_at).status === "overdue"
  ).length;
  const missingTolCount = state.measurements.filter((m) => m.tolerance === null).length;
  const acceptedChecklist = state.checklist.filter((c) => c.applicability !== "unknown").length;
  const unapprovedLots = state.materialLots.filter((l) => l.acceptance_status !== "Đã nghiệm thu").length;
  const leaks = detectDemoDataLeak(state);

  return (
    <div className="space-y-5">
      {/* Top CTA Banner pointing to Mindmap */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">
            {state.tenantMode === "demo"
              ? "CHẾ ĐỘ DEMO THƯƠNG MẠI — ĐẦY ĐỦ DỮ LIỆU MẪU GIẢ ĐỊNH"
              : "DỰ ÁN THẬT — KHÔNG GIAN LÀM VIỆC ĐỘC LẬP"}
          </div>
          <h2 className="text-lg font-bold">{state.project.project_name}</h2>
          <p className="text-xs text-blue-100 mt-0.5">
            Mã công trình: <span className="font-mono font-bold">{state.project.project_code}</span> · Gói thầu:{" "}
            {state.project.package || "(Chưa nhập)"}
          </p>
        </div>
        <button
          onClick={() => onNavigateTab("mindmap")}
          className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow hover:bg-blue-50 transition flex items-center gap-2 shrink-0"
        >
          <GitFork className="w-4 h-4" /> Xem Sơ đồ Mindmap Luồng Nhập Liệu
        </button>
      </div>

      {leaks.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Cảnh báo lẫn dữ liệu DEMO-* trong Tenant thật:
          </div>
          {leaks.map((l, i) => (
            <div key={i}>• {l}</div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab("schedule")}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Công việc Nhật trình</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{workCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {state.schedule.filter((s) => s.row_type === "section").length} nhóm hạng mục liên kết
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("acceptance")}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Biên bản đã cấp số</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {issuedCount} <span className="text-sm font-semibold text-slate-400">/ {state.acceptances.length}</span>
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            {overdueSla > 0 ? `⚠ ${overdueSla} biên bản vượt SLA 24h` : "✓ Đạt hạn SLA 24h Điều 22(3)"}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("testing")}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-teal-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Thí nghiệm & KTHH</span>
            <FlaskConical className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {state.testSamples.length} <span className="text-sm font-semibold text-slate-400">mẫu</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            {missingTolCount > 0 ? `${missingTolCount} dòng đo KTHH chờ nhập dung sai` : "Đầy đủ dung sai đo đạc"}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("dossier")}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-purple-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Checklist NĐ 207 (42 mục)</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {acceptedChecklist} <span className="text-sm font-semibold text-slate-400">/ {state.checklist.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">31 mục PL VII + 11 mục PL X</div>
        </div>
      </div>

      {/* Actionable Checklist & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" /> Việc cần xử lý & Cảnh báo Kaizen NĐ 207
          </h3>
          <div className="space-y-2 text-xs">
            {unapprovedLots > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
                <span>
                  <strong>Điều 14(6):</strong> Còn {unapprovedLots} lô vật liệu chưa nghiệm thu trước khi sử dụng.
                </span>
                <button onClick={() => onNavigateTab("materials")} className="font-bold text-amber-800 underline">
                  Kiểm tra
                </button>
              </div>
            )}
            {overdueSla > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between">
                <span>
                  <strong>Điều 22(3):</strong> Phát hiện {overdueSla} biên bản có thời gian kiểm tra vượt 24h từ lúc nhận PYC.
                </span>
                <button onClick={() => onNavigateTab("acceptance")} className="font-bold text-rose-800 underline">
                  Xem chi tiết
                </button>
              </div>
            )}
            {missingTolCount > 0 && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between">
                <span>
                  <strong>Kaizen Z03:</strong> {missingTolCount} dòng đo KTHH chưa có dung sai → tự động khóa ở trạng thái &quot;Chưa đánh giá&quot;.
                </span>
                <button onClick={() => onNavigateTab("kthh")} className="font-bold text-blue-800 underline">
                  Nhập dung sai
                </button>
              </div>
            )}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between">
              <span>
                <strong>Điều 53:</strong> Diện kiểm tra nhà nước hiện tại:{" "}
                <span className="font-bold">{state.legalProfile.requires_state_inspection}</span>.
              </span>
              <button onClick={() => onNavigateTab("project")} className="font-bold text-blue-700 underline">
                Cập nhật
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" /> Truy cập nhanh Chuỗi Hồ sơ
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "1. Sơ đồ Mindmap tổng thể", tab: "mindmap" as AppTabId },
              { label: "2. Vật liệu & Cấp phối BT", tab: "materials" as AppTabId },
              { label: "3. Nhật trình thi công", tab: "schedule" as AppTabId },
              { label: "4. Đo kiểm KTHH & Hoàn công", tab: "kthh" as AppTabId },
              { label: "5. Kế hoạch & Kết quả TN", tab: "testing" as AppTabId },
              { label: "6. Nghiệm thu & Sổ cấp số", tab: "acceptance" as AppTabId },
              { label: "7. Nhật ký & Thời tiết", tab: "diary" as AppTabId },
              { label: "8. Xuất 30 Biểu mẫu A4", tab: "forms" as AppTabId },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => onNavigateTab(item.tab)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left font-semibold text-slate-700 transition"
              >
                {item.label} →
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectTabProps {
  state: QlclWorkspaceState;
  onUpdate: (updater: (prev: QlclWorkspaceState) => QlclWorkspaceState, logDetail?: string) => void;
}

export function ProjectTab({ state, onUpdate }: ProjectTabProps) {
  const [newPartner, setNewPartner] = useState<Partial<PartnerOrg>>({
    role: "Tư vấn giám sát",
    is_signer: true,
  });

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name) return;
    const code = `${state.tenantMode === "demo" ? "DEMO-" : ""}PT-${String(state.partners.length + 1).padStart(3, "0")}`;
    const org: PartnerOrg = {
      partner_code: code,
      name: newPartner.name,
      role: (newPartner.role as PartnerOrg["role"]) || "Nhà thầu thi công",
      representative: newPartner.representative || "Chưa nhập",
      position: newPartner.position || "Chưa nhập",
      phone: newPartner.phone || "",
      address: newPartner.address || "",
      is_signer: Boolean(newPartner.is_signer),
    };
    onUpdate(
      (prev) => ({ ...prev, partners: [...prev.partners, org] }),
      `Thêm đơn vị tham gia ${org.name} (${org.role})`
    );
    setNewPartner({ role: "Tư vấn giám sát", is_signer: true, name: "", representative: "", position: "" });
  };

  return (
    <div className="space-y-5">
      {/* Project Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          1.1 Thông tin Chung Công trình & Hợp đồng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Mã công trình *</label>
            <input
              value={state.project.project_code}
              onChange={(e) =>
                onUpdate((p) => ({ ...p, project: { ...p.project, project_code: e.target.value } }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-semibold text-slate-600 block mb-1">Tên công trình / Dự án *</label>
            <input
              value={state.project.project_name}
              onChange={(e) =>
                onUpdate((p) => ({ ...p, project: { ...p.project, project_name: e.target.value } }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Gói thầu</label>
            <input
              value={state.project.package}
              onChange={(e) =>
                onUpdate((p) => ({ ...p, project: { ...p.project, package: e.target.value } }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Hạng mục</label>
            <input
              value={state.project.category_name}
              onChange={(e) =>
                onUpdate((p) => ({ ...p, project: { ...p.project, category_name: e.target.value } }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Hình thức hợp đồng (Điều 22.5–8)</label>
            <select
              value={state.project.contract_branch}
              onChange={(e) =>
                onUpdate((p) => ({
                  ...p,
                  project: { ...p.project, contract_branch: e.target.value as ContractBranchType },
                }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
            >
              <option value="Thường (CĐT - TVGS - Nhà thầu)">Thường (CĐT - TVGS - Nhà thầu)</option>
              <option value="Tổng thầu EPC">Tổng thầu EPC</option>
              <option value="Chìa khóa trao tay">Chìa khóa trao tay</option>
              <option value="Liên danh nhà thầu">Liên danh nhà thầu</option>
              <option value="Nhà thầu phụ">Nhà thầu phụ</option>
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Địa điểm xây dựng</label>
            <input
              value={state.project.location}
              onChange={(e) =>
                onUpdate((p) => ({ ...p, project: { ...p.project, location: e.target.value } }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Hợp đồng xây dựng</label>
            <input
              value={state.project.contract_no}
              onChange={(e) =>
                onUpdate((p) => ({ ...p, project: { ...p.project, contract_no: e.target.value } }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Bàn giao MB</label>
              <input
                type="date"
                value={state.project.handover_date}
                onChange={(e) =>
                  onUpdate((p) => ({ ...p, project: { ...p.project, handover_date: e.target.value } }))
                }
                className="w-full px-2 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Khởi công</label>
              <input
                type="date"
                value={state.project.start_date}
                onChange={(e) =>
                  onUpdate((p) => ({ ...p, project: { ...p.project, start_date: e.target.value } }))
                }
                className="w-full px-2 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Hoàn thành</label>
              <input
                type="date"
                value={state.project.end_date}
                onChange={(e) =>
                  onUpdate((p) => ({ ...p, project: { ...p.project, end_date: e.target.value } }))
                }
                className="w-full px-2 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transition Legal Profile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          1.2 Hồ sơ Pháp lý & Chuyển tiếp (Điều 52–53 Nghị định 207/2026/NĐ-CP)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Số / Ngày Quyết định đầu tư</label>
            <input
              value={`${state.legalProfile.decision_ref} (${state.legalProfile.decision_date})`}
              onChange={(e) =>
                onUpdate((p) => ({
                  ...p,
                  legalProfile: { ...p.legalProfile, decision_ref: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Loại / Cấp công trình</label>
            <input
              value={`${state.legalProfile.project_type} — ${state.legalProfile.project_grade}`}
              onChange={(e) =>
                onUpdate((p) => ({
                  ...p,
                  legalProfile: { ...p.legalProfile, project_grade: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Diện kiểm tra nhà nước (Điều 25)</label>
            <select
              value={state.legalProfile.requires_state_inspection}
              onChange={(e) =>
                onUpdate(
                  (p) => ({
                    ...p,
                    legalProfile: {
                      ...p.legalProfile,
                      requires_state_inspection: e.target.value as "Có" | "Không" | "Chưa xác định",
                    },
                  }),
                  `Cập nhật diện kiểm tra nhà nước: ${e.target.value}`
                )
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="Chưa xác định">Chưa xác định (Mặc định an toàn)</option>
              <option value="Có">Có — Thuộc diện kiểm tra cơ quan chuyên môn</option>
              <option value="Không">Không thuộc diện kiểm tra nhà nước</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="font-semibold text-slate-600 block mb-1">Căn cứ xác định & Cơ quan thẩm quyền</label>
            <input
              value={state.legalProfile.decision_reason}
              onChange={(e) =>
                onUpdate((p) => ({
                  ...p,
                  legalProfile: { ...p.legalProfile, decision_reason: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">1.3 Các Bên Tham gia & Thành phần Ký biên bản</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã</th>
                <th className="py-2 px-3">Vai trò</th>
                <th className="py-2 px-3">Tên đơn vị</th>
                <th className="py-2 px-3">Người đại diện</th>
                <th className="py-2 px-3">Chức vụ</th>
                <th className="py-2 px-3 text-center">Ký BB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.partners.map((p) => (
                <tr key={p.partner_code} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-semibold">{p.partner_code}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">{p.role}</span>
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">{p.name}</td>
                  <td className="py-2 px-3">{p.representative}</td>
                  <td className="py-2 px-3">{p.position}</td>
                  <td className="py-2 px-3 text-center">{p.is_signer ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleAddPartner} className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          <select
            value={newPartner.role}
            onChange={(e) => setNewPartner((p) => ({ ...p, role: e.target.value as PartnerOrg["role"] }))}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white"
          >
            <option value="Chủ đầu tư">Chủ đầu tư</option>
            <option value="Đơn vị thiết kế">Đơn vị thiết kế</option>
            <option value="Tư vấn giám sát">Tư vấn giám sát</option>
            <option value="Nhà thầu thi công">Nhà thầu thi công</option>
            <option value="Đơn vị thí nghiệm">Đơn vị thí nghiệm</option>
          </select>
          <input
            placeholder="Tên đơn vị..."
            value={newPartner.name || ""}
            onChange={(e) => setNewPartner((p) => ({ ...p, name: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl md:col-span-2"
          />
          <input
            placeholder="Họ tên đại diện..."
            value={newPartner.representative || ""}
            onChange={(e) => setNewPartner((p) => ({ ...p, representative: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm bên
          </button>
        </form>
      </div>

      {/* Deterministic Time Slots */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            1.4 Khung Giờ Nghiệm thu Tất định (Loại bỏ RANDBETWEEN — Kaizen A05)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {state.timeSlots.map((slot) => (
            <div key={slot.slot_no} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="font-bold text-slate-800">Khung #{slot.slot_no}</div>
              <div className="text-slate-600">Nội bộ: {slot.internal_label}</div>
              <div className="text-blue-700 font-semibold">Nghiệm thu: {slot.acceptance_label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CatalogsTab({ state, onUpdate }: ProjectTabProps) {
  const [catGroup, setCatGroup] = useState<"work" | "std" | "insp" | "test" | "machine">("work");
  const [search, setSearch] = useState("");

  const filteredWork = useMemo(
    () =>
      state.workCatalog.filter(
        (w) => w.code.toLowerCase().includes(search.toLowerCase()) || w.name.toLowerCase().includes(search.toLowerCase())
      ),
    [state.workCatalog, search]
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "work", label: `Mã công việc (${state.workCatalog.length})` },
            { id: "std", label: `Tiêu chuẩn (${state.standards.length})` },
            { id: "insp", label: `Loại kiểm tra (${state.inspectionTypes.length})` },
            { id: "test", label: `Phép thử (${state.testTypes.length})` },
            { id: "machine", label: `Máy thi công (${state.machines.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setCatGroup(t.id as typeof catGroup)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                catGroup === t.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lọc mã hoặc tên..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {catGroup === "work" && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã CV</th>
                <th className="py-2 px-3">Nội dung công việc</th>
                <th className="py-2 px-3">TCNT mặc định</th>
                <th className="py-2 px-3">Mã TN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWork.map((w) => (
                <tr key={w.code} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{w.code}</td>
                  <td className="py-2 px-3">{w.name}</td>
                  <td className="py-2 px-3 font-mono text-slate-600">{w.standard_codes}</td>
                  <td className="py-2 px-3 font-mono text-slate-600">{w.test_codes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {catGroup === "std" && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã TCVN</th>
                <th className="py-2 px-3">Tên tiêu chuẩn</th>
                <th className="py-2 px-3">Phiên bản</th>
                <th className="py-2 px-3">Phê duyệt áp dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.standards.map((s) => (
                <tr key={s.code} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold">{s.code}</td>
                  <td className="py-2 px-3">{s.name}</td>
                  <td className="py-2 px-3">{s.version}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          standards: prev.standards.map((st) =>
                            st.code === s.code ? { ...st, approved: !st.approved } : st
                          ),
                        }))
                      }
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        s.approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {s.approved ? "Đã duyệt áp dụng" : "Chưa phê duyệt"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(catGroup === "insp" || catGroup === "test" || catGroup === "machine") && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã hiệu</th>
                <th className="py-2 px-3">Tên / Nội dung</th>
                <th className="py-2 px-3">Nhóm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(catGroup === "insp"
                ? state.inspectionTypes
                : catGroup === "test"
                ? state.testTypes
                : state.machines
              ).map((item) => (
                <tr key={item.code} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-indigo-700">{item.code}</td>
                  <td className="py-2 px-3">{item.name}</td>
                  <td className="py-2 px-3">{item.group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function MaterialsTab({ state, onUpdate }: ProjectTabProps) {
  const [lotForm, setLotForm] = useState({
    material_code: state.materials[0]?.material_code || "VL-001",
    quantity: 10,
    unit: "m3",
    document_ref: "",
    has_co_cq: true,
  });

  const handleAddLot = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = state.tenantMode === "demo" ? "DEMO-LO" : "LO";
    const lotCode = `${prefix}-${String(state.materialLots.length + 1).padStart(3, "0")}`;
    const newLot: MaterialLot = {
      lot_code: lotCode,
      material_code: lotForm.material_code,
      quantity: Number(lotForm.quantity) || 0,
      unit: lotForm.unit,
      received_date: new Date().toISOString().slice(0, 10),
      document_ref: lotForm.document_ref || `DOC-${lotCode}`,
      has_co_cq: lotForm.has_co_cq,
      acceptance_status: "Chưa kiểm tra",
      inspector_note: "Mới nhập kho — Chờ TVGS nghiệm thu trước sử dụng (Điều 14.6)",
    };
    onUpdate(
      (prev) => ({ ...prev, materialLots: [...prev.materialLots, newLot] }),
      `Nhập lô vật liệu mới ${lotCode}`
    );
    setLotForm((f) => ({ ...f, document_ref: "" }));
  };

  return (
    <div className="space-y-5">
      {/* Lô vật liệu */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              3.1 Quản lý Lô Vật liệu & Nghiệm thu Đầu vào (NĐ 207 Điều 14)
            </h3>
            <p className="text-xs text-slate-500">
              Vật liệu phải được người giám sát của Chủ đầu tư nghiệm thu trước khi đưa vào sử dụng.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã lô</th>
                <th className="py-2 px-3">Vật liệu</th>
                <th className="py-2 px-3">Khối lượng</th>
                <th className="py-2 px-3">Ngày nhận</th>
                <th className="py-2 px-3">CO/CQ/Hợp quy</th>
                <th className="py-2 px-3">Trạng thái Điều 14(6)</th>
                <th className="py-2 px-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.materialLots.map((lot) => {
                const mat = state.materials.find((m) => m.material_code === lot.material_code);
                return (
                  <tr key={lot.lot_code} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{lot.lot_code}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{mat?.name || lot.material_code}</div>
                      <div className="text-[11px] text-slate-500">{lot.inspector_note}</div>
                    </td>
                    <td className="py-2 px-3 font-semibold">
                      {lot.quantity} {lot.unit}
                    </td>
                    <td className="py-2 px-3">{lot.received_date}</td>
                    <td className="py-2 px-3">
                      <span className="font-mono">{lot.document_ref}</span>{" "}
                      {lot.has_co_cq ? (
                        <span className="text-emerald-700 font-bold">(Đủ CO/CQ)</span>
                      ) : (
                        <span className="text-rose-600 font-bold">(Thiếu CO/CQ)</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          lot.acceptance_status === "Đã nghiệm thu"
                            ? "bg-emerald-100 text-emerald-800"
                            : lot.acceptance_status === "Đề nghị nghiệm thu"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {lot.acceptance_status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {lot.acceptance_status !== "Đã nghiệm thu" && (
                        <button
                          disabled={!lot.has_co_cq}
                          onClick={() =>
                            onUpdate(
                              (prev) => ({
                                ...prev,
                                materialLots: prev.materialLots.map((l) =>
                                  l.lot_code === lot.lot_code
                                    ? {
                                        ...l,
                                        acceptance_status: "Đã nghiệm thu",
                                        inspector_note: "TVGS đã nghiệm thu đạt yêu cầu trước sử dụng",
                                      }
                                    : l
                                ),
                              }),
                              `Nghiệm thu lô vật liệu ${lot.lot_code}`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 disabled:bg-slate-300 text-white text-[11px] font-bold hover:bg-emerald-700"
                          title={!lot.has_co_cq ? "Cần có CO/CQ mới được nghiệm thu" : ""}
                        >
                          Duyệt NT
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleAddLot} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-100 text-xs">
          <input
            placeholder="Mã vật liệu (VD: DEMO-VL-001)"
            value={lotForm.material_code}
            onChange={(e) => setLotForm((f) => ({ ...f, material_code: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            type="number"
            placeholder="Khối lượng"
            value={lotForm.quantity}
            onChange={(e) => setLotForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            placeholder="Đơn vị (m3, tấn...)"
            value={lotForm.unit}
            onChange={(e) => setLotForm((f) => ({ ...f, unit: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
            <input
              type="checkbox"
              checked={lotForm.has_co_cq}
              onChange={(e) => setLotForm((f) => ({ ...f, has_co_cq: e.target.checked }))}
            />
            <span>Có CO/CQ</span>
          </label>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Nhập lô mới
          </button>
        </form>
      </div>

      {/* Cấp phối bê tông */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          3.2 Bảng Thành phần Cấp phối Bê tông & Vữa (`cap_phoi`)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã cấp phối</th>
                <th className="py-2 px-3">Mác</th>
                <th className="py-2 px-3">Cốt liệu</th>
                <th className="py-2 px-3">XM (kg)</th>
                <th className="py-2 px-3">Cát (kg)</th>
                <th className="py-2 px-3">Đá (kg)</th>
                <th className="py-2 px-3">Nước (lít)</th>
                <th className="py-2 px-3">Độ sụt (cm)</th>
                <th className="py-2 px-3">Phiếu TK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.concreteMixes.map((m) => (
                <tr key={m.mix_code} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-cyan-700">{m.mix_code}</td>
                  <td className="py-2 px-3 font-semibold">{m.grade}</td>
                  <td className="py-2 px-3">{m.aggregate}</td>
                  <td className="py-2 px-3">{m.cement}</td>
                  <td className="py-2 px-3">{m.sand}</td>
                  <td className="py-2 px-3">{m.stone}</td>
                  <td className="py-2 px-3">{m.water}</td>
                  <td className="py-2 px-3">{m.slump}</td>
                  <td className="py-2 px-3 text-slate-500">{m.design_slip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
