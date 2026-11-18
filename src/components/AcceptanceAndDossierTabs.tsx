"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  BookOpen,
  CheckCircle2,
  Clock,
  FolderCheck,
  Hash,
  Lock,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { calculateSla24h, issueImmutableRecordNumber } from "@/lib/domain-rules";
import {
  AcceptanceRecord207,
  ApplicabilityState,
  ChecklistStatus,
  DiaryEntry,
  OriginalDocType,
  QlclWorkspaceState,
} from "@/types/qlcl";

interface TabProps {
  state: QlclWorkspaceState;
  onUpdate: (updater: (prev: QlclWorkspaceState) => QlclWorkspaceState, logDetail?: string) => void;
}

export function AcceptanceTab({ state, onUpdate }: TabProps) {
  const [newAcc, setNewAcc] = useState({
    kind: "Công việc" as AcceptanceRecord207["kind"],
    work_ids: state.schedule.find((s) => s.row_type === "work")?.record_key || "W-001",
    request_received_at: "2026-08-15 08:30",
    inspection_at: "2026-08-15 14:30",
    location: state.project.category_name || "Khu A",
    conclusion: "Chờ kiểm tra và ký nghiệm thu",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = state.tenantMode === "demo" ? "DEMO-BB" : "BB";
    const id = `${prefix}-${String(state.acceptances.length + 1).padStart(3, "0")}`;
    const record: AcceptanceRecord207 = {
      record_id: id,
      project_code: state.project.project_code,
      kind: newAcc.kind,
      work_ids: newAcc.work_ids,
      request_received_at: newAcc.request_received_at,
      inspection_at: newAcc.inspection_at,
      location: newAcc.location,
      signer_role: "Giám sát trưởng; Chỉ huy trưởng",
      signer_identity: "Chờ ký xác nhận",
      conclusion: newAcc.conclusion,
      defects: "",
      legal_profile: "NĐ 207/2026/NĐ-CP Điều 22–24",
      evidence_refs: "",
      status: "draft",
    };
    onUpdate((p) => ({ ...p, acceptances: [...p.acceptances, record] }), `Tạo nháp biên bản ${id}`);
  };

  const handleIssue = (record: AcceptanceRecord207) => {
    const nowIso = new Date().toISOString();
    const { updatedSequences, updatedRecord } = issueImmutableRecordNumber(
      state.numberSequences,
      record,
      2026,
      nowIso
    );
    onUpdate(
      (p) => ({
        ...p,
        numberSequences: updatedSequences,
        acceptances: p.acceptances.map((a) => (a.record_id === record.record_id ? updatedRecord : a)),
      }),
      `Cấp số bất biến ${updatedRecord.issued_no} & khóa Snapshot cho ${record.record_id}`
    );
  };

  const handleVoid = (record: AcceptanceRecord207) => {
    const reason = window.prompt("Nhập lý do thu hồi (Void) — Số đã cấp vẫn được giữ nguyên trong Sổ cấp số:", "Sai phạm vi nghiệm thu");
    if (!reason) return;
    onUpdate(
      (p) => ({
        ...p,
        acceptances: p.acceptances.map((a) =>
          a.record_id === record.record_id ? { ...a, status: "void", rejection_reason: reason } : a
        ),
        numberSequences: p.numberSequences.map((seq) => ({
          ...seq,
          issued_records: seq.issued_records.map((ir) =>
            ir.record_id === record.record_id ? { ...ir, status: "void", void_reason: reason } : ir
          ),
        })),
      }),
      `Thu hồi (Void) biên bản ${record.record_id} (${record.issued_no || "nháp"}): ${reason}`
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            7.1 Nghiệm thu Công việc / Giai đoạn / Hoàn thành (NĐ 207 Điều 22–24 & SLA 24h)
          </h3>
          <p className="text-xs text-slate-500">
            Tính thời hạn 24 giờ kể từ giờ nhận đề nghị. Khi bấm &quot;Cấp số &amp; Phát hành&quot;, số biên bản được khóa vĩnh viễn trong Sổ cấp số và không nhảy số khi sửa ngày.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã / Số BB</th>
                <th className="py-2 px-3">Loại</th>
                <th className="py-2 px-3">Công việc / Vị trí</th>
                <th className="py-2 px-3">Nhận PYC → Kiểm tra (SLA 24h)</th>
                <th className="py-2 px-3">Trạng thái</th>
                <th className="py-2 px-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.acceptances.map((acc) => {
                const sla = calculateSla24h(acc.request_received_at, acc.inspection_at);
                return (
                  <tr key={acc.record_id} className="hover:bg-slate-50 align-top">
                    <td className="py-2 px-3">
                      <div className="font-mono font-bold text-blue-700">{acc.record_id}</div>
                      {acc.issued_no ? (
                        <div className="mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          <Lock className="w-3 h-3" /> {acc.issued_no}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">Chưa cấp số</div>
                      )}
                    </td>
                    <td className="py-2 px-3 font-semibold">{acc.kind}</td>
                    <td className="py-2 px-3">
                      <div className="font-mono text-[11px] font-bold">{acc.work_ids}</div>
                      <div>{acc.location}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{acc.conclusion}</div>
                      {acc.snapshot_hash && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Snapshot: {acc.snapshot_hash}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-[11px] text-slate-600">
                        Nhận: {acc.request_received_at || "—"}
                        <br />
                        KT: {acc.inspection_at || "—"}
                      </div>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sla.status === "ok"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : sla.status === "due_soon"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : sla.status === "overdue" || sla.status === "invalid_order"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Clock className="w-3 h-3" /> {sla.label}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          acc.status === "issued"
                            ? "bg-emerald-100 text-emerald-800"
                            : acc.status === "void"
                            ? "bg-rose-100 text-rose-800"
                            : acc.status === "review"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {acc.status === "issued"
                          ? "Đã phát hành"
                          : acc.status === "void"
                          ? "Đã thu hồi (Void)"
                          : acc.status === "review"
                          ? "Đang rà soát"
                          : "Bản nháp"}
                      </span>
                    </td>
                    <td className="py-2 px-3 space-x-1 whitespace-nowrap">
                      {(acc.status === "draft" || acc.status === "review") && (
                        <button
                          onClick={() => handleIssue(acc)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                        >
                          Cấp số &amp; Phát hành
                        </button>
                      )}
                      {acc.status === "issued" && (
                        <button
                          onClick={() => handleVoid(acc)}
                          className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" /> Thu hồi
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Form tạo BB mới */}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-3 border-t border-slate-100 text-xs">
          <select
            value={newAcc.kind}
            onChange={(e) => setNewAcc((p) => ({ ...p, kind: e.target.value as AcceptanceRecord207["kind"] }))}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white"
          >
            <option value="Công việc">NT Công việc</option>
            <option value="Vật liệu">NT Vật liệu</option>
            <option value="Giai đoạn">NT Giai đoạn</option>
            <option value="Hoàn thành">NT Hoàn thành</option>
            <option value="Hoàn thành có điều kiện">NT Hoàn thành có ĐK</option>
          </select>
          <input
            placeholder="Mã công việc (VD: W-001)"
            value={newAcc.work_ids}
            onChange={(e) => setNewAcc((p) => ({ ...p, work_ids: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            placeholder="Giờ nhận (YYYY-MM-DD HH:MM)"
            value={newAcc.request_received_at}
            onChange={(e) => setNewAcc((p) => ({ ...p, request_received_at: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            placeholder="Giờ kiểm tra (YYYY-MM-DD HH:MM)"
            value={newAcc.inspection_at}
            onChange={(e) => setNewAcc((p) => ({ ...p, inspection_at: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            placeholder="Vị trí nghiệm thu"
            value={newAcc.location}
            onChange={(e) => setNewAcc((p) => ({ ...p, location: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tạo biên bản
          </button>
        </form>
      </div>

      {/* Sổ cấp số bất biến */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Hash className="w-4 h-4 text-emerald-600" />
          7.2 Sổ Cấp Số Bất Biến (`number_sequence` — Không tái sử dụng số đã thu hồi)
        </h3>
        {state.numberSequences.length === 0 ? (
          <div className="text-xs text-slate-500">Chưa có số biên bản nào được phát hành trong không gian này.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.numberSequences.map((seq) => (
              <div key={seq.seq_key} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>
                    {seq.doc_type} ({seq.prefix}/{seq.year})
                  </span>
                  <span className="text-blue-700">Số kế tiếp: #{seq.next_no}</span>
                </div>
                <div className="space-y-1">
                  {seq.issued_records.map((ir) => (
                    <div
                      key={ir.label}
                      className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200"
                    >
                      <span className="font-mono font-bold">{ir.label}</span>
                      <span className="text-slate-600">{ir.record_id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ir.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {ir.status === "active" ? "Hiệu lực" : `Void: ${ir.void_reason}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DiaryTab({ state, onUpdate }: TabProps) {
  const [diaryForm, setDiaryForm] = useState({
    date: "2026-08-15",
    work_record_key: state.schedule.find((s) => s.row_type === "work")?.record_key || "W-001",
    description: "",
    equipment: "DEMO-MAY-001",
    personnel: "18 công nhân, 2 kỹ sư",
  });

  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryForm.description.trim()) return;
    const entry: DiaryEntry = {
      date: diaryForm.date,
      work_record_key: diaryForm.work_record_key,
      description: diaryForm.description.trim(),
      equipment: diaryForm.equipment,
      personnel: diaryForm.personnel,
      incidents_or_notes: "Chưa ghi nhận phát sinh",
      sanitation_safety: "Đảm bảo an toàn lao động & vệ sinh môi trường",
      status: "Bản nháp",
    };
    onUpdate((p) => ({ ...p, diaryEntries: [...p.diaryEntries, entry] }), `Thêm nhật ký ngày ${entry.date}`);
    setDiaryForm((f) => ({ ...f, description: "" }));
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-lime-600" />
          8. Nhật ký Thi công & Thời tiết (Phụ lục IIa NĐ 207 — Chống tự động ghi nghỉ lễ/mưa)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weather */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700">Bảng Thời tiết theo ngày</div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2 px-2.5">Ngày</th>
                    <th className="py-2 px-2.5">Nhiệt độ</th>
                    <th className="py-2 px-2.5">Mưa (mm)</th>
                    <th className="py-2 px-2.5">Nguồn &amp; Cảnh báo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.weatherDays.map((w) => (
                    <tr key={w.date} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 font-mono font-semibold">{w.date}</td>
                      <td className="py-2 px-2.5">
                        {w.low}°–{w.high}°C
                      </td>
                      <td className="py-2 px-2.5 font-bold">{w.rain_mm} mm</td>
                      <td className="py-2 px-2.5">
                        <div className="text-[11px]">{w.note}</div>
                        {w.rain_mm >= 10 && !w.is_stop_confirmed && (
                          <button
                            onClick={() =>
                              onUpdate((p) => ({
                                ...p,
                                weatherDays: p.weatherDays.map((item) =>
                                  item.date === w.date
                                    ? {
                                        ...item,
                                        is_stop_confirmed: true,
                                        observed_or_forecast: "Quan trắc thực tế",
                                      }
                                    : item
                                ),
                              }))
                            }
                            className="mt-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold hover:bg-amber-200"
                          >
                            ⚠ Mưa ≥ 10mm: Bấm xác nhận nghỉ thực tế
                          </button>
                        )}
                        {w.is_stop_confirmed && (
                          <span className="text-[10px] font-bold text-emerald-700">✓ Đã xác nhận nghỉ mưa</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diary */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700">Nhật ký công trường hàng ngày</div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {state.diaryEntries.map((d, idx) => (
                <div key={`${d.date}-${idx}`} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">
                      {d.date} · {d.work_record_key}
                    </span>
                    <button
                      onClick={() =>
                        onUpdate((p) => ({
                          ...p,
                          diaryEntries: p.diaryEntries.map((item, i) =>
                            i === idx
                              ? { ...item, status: item.status === "Đã xác nhận" ? "Bản nháp" : "Đã xác nhận" }
                              : item
                          ),
                        }))
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === "Đã xác nhận" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {d.status}
                    </button>
                  </div>
                  <div className="font-medium text-slate-900">{d.description}</div>
                  <div className="text-[11px] text-slate-600">
                    Thiết bị: {d.equipment} · Nhân lực: {d.personnel}
                  </div>
                  <div className="text-[11px] text-slate-500">Ghi chú / Sự cố: {d.incidents_or_notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleAddDiary} className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-3 border-t border-slate-100 text-xs">
          <input
            type="date"
            value={diaryForm.date}
            onChange={(e) => setDiaryForm((p) => ({ ...p, date: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            placeholder="Mã công việc..."
            value={diaryForm.work_record_key}
            onChange={(e) => setDiaryForm((p) => ({ ...p, work_record_key: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            placeholder="Diễn biến công việc trong ngày..."
            value={diaryForm.description}
            onChange={(e) => setDiaryForm((p) => ({ ...p, description: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl md:col-span-2"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-lime-600 text-white font-bold hover:bg-lime-700"
          >
            + Ghi nhật ký ngày
          </button>
        </form>
      </div>
    </div>
  );
}

export function DossierTab({ state, onUpdate }: TabProps) {
  const [annexFilter, setAnnexFilter] = useState<"ALL" | "VII" | "X">("ALL");

  const filtered = useMemo(
    () => state.checklist.filter((c) => annexFilter === "ALL" || c.annex === annexFilter),
    [state.checklist, annexFilter]
  );

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderCheck className="w-4 h-4 text-purple-600" />
              9.1 Checklist 42 Đầu mục Hồ sơ NĐ 207 (31 mục Phụ lục VII &amp; 11 mục Phụ lục X)
            </h3>
            <p className="text-xs text-slate-500">
              Áp dụng đánh giá 3 chiều (Áp dụng / Không áp dụng có căn cứ / Chờ đánh giá) &amp; Quản lý Bản gốc / Bản sao điện tử (Điều 28.4).
            </p>
          </div>
          <div className="flex gap-1.5">
            {[
              { id: "ALL", label: "Tất cả (42)" },
              { id: "VII", label: "Phụ lục VII (31)" },
              { id: "X", label: "Phụ lục X (11)" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setAnnexFilter(b.id as "ALL" | "VII" | "X")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  annexFilter === b.id ? "bg-purple-700 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[520px] overflow-y-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr className="border-b border-slate-200 text-slate-700">
                <th className="py-2 px-3">Mã</th>
                <th className="py-2 px-3">Tên đầu mục hồ sơ</th>
                <th className="py-2 px-3">Áp dụng (3 chiều)</th>
                <th className="py-2 px-3">Mã tài liệu dẫn chiếu</th>
                <th className="py-2 px-3">Loại bản (Điều 28.4)</th>
                <th className="py-2 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.checklist_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">{item.checklist_id}</td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-slate-900">{item.checklist_name}</div>
                    <div className="text-[10px] text-slate-500">{item.group_name}</div>
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={item.applicability}
                      onChange={(e) =>
                        onUpdate((p) => ({
                          ...p,
                          checklist: p.checklist.map((c) =>
                            c.checklist_id === item.checklist_id
                              ? { ...c, applicability: e.target.value as ApplicabilityState }
                              : c
                          ),
                        }))
                      }
                      className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-[11px]"
                    >
                      <option value="unknown">Chưa xác định</option>
                      <option value="applicable">Áp dụng</option>
                      <option value="not_applicable">Không áp dụng</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      value={item.document_ref}
                      placeholder="Nhập mã tài liệu..."
                      onChange={(e) =>
                        onUpdate((p) => ({
                          ...p,
                          checklist: p.checklist.map((c) =>
                            c.checklist_id === item.checklist_id ? { ...c, document_ref: e.target.value } : c
                          ),
                        }))
                      }
                      className="w-36 px-2 py-1 border border-slate-200 rounded-lg text-[11px] font-mono"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={item.original_type}
                      onChange={(e) =>
                        onUpdate((p) => ({
                          ...p,
                          checklist: p.checklist.map((c) =>
                            c.checklist_id === item.checklist_id
                              ? { ...c, original_type: e.target.value as OriginalDocType }
                              : c
                          ),
                        }))
                      }
                      className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-[11px]"
                    >
                      <option value="Chưa xác định">Chưa xác định</option>
                      <option value="Bản gốc">Bản gốc</option>
                      <option value="Bản chính">Bản chính</option>
                      <option value="Bản sao hợp pháp">Bản sao hợp pháp</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        onUpdate((p) => ({
                          ...p,
                          checklist: p.checklist.map((c) =>
                            c.checklist_id === item.checklist_id
                              ? { ...c, status: e.target.value as ChecklistStatus }
                              : c
                          ),
                        }))
                      }
                      className={`px-2 py-1 border rounded-lg text-[11px] font-bold ${
                        item.status === "accepted"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : item.status === "in_review"
                          ? "bg-blue-50 border-blue-300 text-blue-800"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <option value="missing">Thiếu chứng cứ</option>
                      <option value="in_review">Đang rà soát</option>
                      <option value="accepted">Đã duyệt</option>
                      <option value="rejected">Từ chối</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover, Incidents, Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="font-bold text-slate-900">9.2 Bàn giao Hồ sơ (Điều 30)</div>
          {state.handovers.map((h) => (
            <div key={h.handover_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-mono font-bold text-blue-700">{h.handover_id}</div>
              <div>Nhận: {h.receiver}</div>
              <div className="text-slate-500">Tài liệu: {h.file_refs}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="font-bold text-slate-900">9.3 Hồ sơ Sự cố / Kỹ thuật (Điều 48)</div>
          {state.incidents.map((inc) => (
            <div key={inc.incident_id} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-mono font-bold text-amber-800">{inc.incident_id}</div>
              <div>{inc.description}</div>
              <div className="text-slate-600 mt-1">Trạng thái: {inc.status}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="font-bold text-slate-900">9.4 Quan trắc Công trình (Điều 7)</div>
          {state.observations.map((obs) => (
            <div key={obs.monitor_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-mono font-bold text-teal-700">{obs.monitor_id}</div>
              <div>{obs.object}</div>
              <div>
                Giá trị: <strong>{obs.value} {obs.unit}</strong> (Giới hạn: {obs.limit ?? "Chưa duyệt"})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AuditAndTenantTabProps {
  state: QlclWorkspaceState;
  onResetDemo: () => void;
  onCreateRealTenant: (params: {
    contractorName: string;
    projectCode: string;
    projectName: string;
    location: string;
  }) => void;
  onSwitchBackToDemo: () => void;
}

export function AuditAndTenantTab({
  state,
  onResetDemo,
  onCreateRealTenant,
  onSwitchBackToDemo,
}: AuditAndTenantTabProps) {
  const [confirmStep, setConfirmStep] = useState(false);
  const [realForm, setRealForm] = useState({
    contractorName: "",
    projectCode: "CT-2026-01",
    projectName: "",
    location: "",
  });

  const handleCreateReal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!realForm.contractorName.trim() || !realForm.projectName.trim()) return;
    onCreateRealTenant(realForm);
  };

  return (
    <div className="space-y-5">
      {/* Tenant Isolation & Reset Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Khởi tạo Không gian Dự án Thật Mới (Tách biệt 100% — Kaizen Z01/K07)
          </h3>
          <p className="text-xs text-slate-600">
            Tạo Tenant thật hoàn toàn sạch từ danh mục TCVN &amp; 42 đầu mục PL VII/X trống dữ liệu giao dịch. Tuyệt đối không mang theo bất kỳ mã <code className="font-mono">DEMO-*</code> hay đối tác giả lập nào.
          </p>

          <form onSubmit={handleCreateReal} className="space-y-2.5 text-xs">
            <input
              required
              placeholder="Tên Công ty Nhà thầu thật (VD: Công ty XD Alpha)..."
              value={realForm.contractorName}
              onChange={(e) => setRealForm((p) => ({ ...p, contractorName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                required
                placeholder="Mã CT (không dùng DEMO-)"
                value={realForm.projectCode}
                onChange={(e) => setRealForm((p) => ({ ...p, projectCode: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
              <input
                required
                placeholder="Tên Công trình thật..."
                value={realForm.projectName}
                onChange={(e) => setRealForm((p) => ({ ...p, projectName: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-xl col-span-2"
              />
            </div>
            <input
              placeholder="Địa điểm xây dựng..."
              value={realForm.location}
              onChange={(e) => setRealForm((p) => ({ ...p, location: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Khởi tạo Tenant Thật Sạch Ngay
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Quản lý Reset Dữ liệu Demo (Kiểm soát 2 bước — Kaizen Z01/Z02)
          </h3>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div>
              <strong>Tenant hiện tại:</strong> {state.tenantName}
            </div>
            <div>
              <strong>Chế độ:</strong>{" "}
              <span className={state.tenantMode === "demo" ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                {state.tenantMode === "demo" ? "DEMO (Có watermark)" : "DỰ ÁN THẬT"}
              </span>
            </div>
            <div>
              <strong>Kiểm đếm dữ liệu hiện có (Preview):</strong> {state.schedule.length} dòng nhật trình ·{" "}
              {state.acceptances.length} biên bản · {state.materialLots.length} lô VL · {state.testSamples.length} mẫu TN
            </div>
          </div>

          {state.tenantMode === "real" ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                ✓ Nút Reset Demo đang bị <strong>KHÓA AN TOÀN</strong> vì bạn đang ở Dự án Thật (Kaizen K02: chặn tuyệt đối xóa nhầm dữ liệu thật).
              </div>
              <button
                onClick={onSwitchBackToDemo}
                className="w-full py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Quay lại Không gian DEMO để tham khảo mẫu
              </button>
            </div>
          ) : !confirmStep ? (
            <button
              onClick={() => setConfirmStep(true)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Khôi phục lại Dữ liệu Demo chuẩn ban đầu
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
              <div className="font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Xác nhận bước 2: Khôi phục toàn bộ bảng của Tenant Demo?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetDemo();
                    setConfirmStep(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Xác nhận Reset Demo
                </button>
                <button
                  onClick={() => setConfirmStep(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Nhật ký Hệ thống Bất biến (`audit_events` — Append-only)
        </h3>
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Thời điểm</th>
                <th className="py-2 px-3">Người thực hiện</th>
                <th className="py-2 px-3">Hành động</th>
                <th className="py-2 px-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...state.auditLogs].reverse().map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{log.timestamp.slice(0, 19).replace("T", " ")}</td>
                  <td className="py-2 px-3 font-semibold">{log.actor}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-blue-700">{log.action}</td>
                  <td className="py-2 px-3">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
