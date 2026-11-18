"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Plus, Ruler, Trash2 } from "lucide-react";
import {
  evaluateMeasurement,
  evaluateSampleDates,
  validateMaterialTestLink,
  validateScheduleItems,
} from "@/lib/domain-rules";
import { downloadContractWorkbook } from "@/lib/excel-service";
import { MeasurementLine, QlclWorkspaceState, ScheduleWorkItem, TestSample } from "@/types/qlcl";

interface TabProps {
  state: QlclWorkspaceState;
  onUpdate: (updater: (prev: QlclWorkspaceState) => QlclWorkspaceState, logDetail?: string) => void;
}

export function ScheduleTab({ state, onUpdate }: TabProps) {
  const [newItem, setNewItem] = useState({
    work_code: state.workCatalog[0]?.code || "TT",
    description: "",
    location: "",
    start_date: "2026-08-15",
    end_date: "2026-08-16",
    row_type: "work" as "work" | "section",
  });

  const errors = useMemo(() => validateScheduleItems(state.schedule), [state.schedule]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.description.trim()) return;
    const prefix = state.tenantMode === "demo" ? "DEMO-W" : "W";
    const workCount = state.schedule.filter((s) => s.row_type === "work").length + 1;
    const key =
      newItem.row_type === "section"
        ? `SEC-${String(state.schedule.length + 1).padStart(2, "0")}`
        : `${prefix}-${String(workCount).padStart(3, "0")}`;

    const cat = state.workCatalog.find((w) => w.code === newItem.work_code);
    const created: ScheduleWorkItem = {
      source_row: state.schedule.length + 7,
      record_key: key,
      parent_key: "",
      relation_key: "",
      work_code: newItem.row_type === "section" ? "" : newItem.work_code,
      description: newItem.description.trim(),
      location: newItem.location.trim() || state.project.category_name || "Hiện trường",
      start_date: newItem.start_date,
      end_date: newItem.end_date,
      internal_date: newItem.end_date,
      request_date: newItem.end_date,
      acceptance_date: newItem.end_date,
      attachment_raw: "",
      standard_codes: cat?.standard_codes || "",
      test_codes: cat?.test_codes || "",
      row_type: newItem.row_type,
    };

    onUpdate((p) => ({ ...p, schedule: [...p.schedule, created] }), `Thêm dòng Nhật trình ${key}`);
    setNewItem((prev) => ({ ...prev, description: "" }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            4. Nhật trình Thi công Trung tâm (`Nhattrinh`)
          </h3>
          <p className="text-xs text-slate-500">
            Quản lý cây Hạng mục (section) & Công việc (work) bằng ID bền vững, tự kiểm tra ngày và vòng lặp quan hệ.
          </p>
        </div>
        <button
          onClick={() => downloadContractWorkbook("nhat_trinh", state, false)}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" /> Xuất nhat_trinh.xlsx
        </button>
      </div>

      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {err}
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
              <th className="py-2 px-3">Khóa ID</th>
              <th className="py-2 px-3">Mã CV</th>
              <th className="py-2 px-3">Nội dung công việc / Hạng mục</th>
              <th className="py-2 px-3">Vị trí</th>
              <th className="py-2 px-3">Bắt đầu</th>
              <th className="py-2 px-3">Kết thúc</th>
              <th className="py-2 px-3">Nghiệm thu</th>
              <th className="py-2 px-3">Tiêu chuẩn</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.schedule.map((item) => (
              <tr
                key={item.record_key}
                className={
                  item.row_type === "section"
                    ? "bg-slate-100/80 font-bold text-slate-900"
                    : "hover:bg-slate-50 text-slate-700"
                }
              >
                <td className="py-2 px-3 font-mono text-[11px] font-bold text-blue-700">
                  {item.record_key}
                </td>
                <td className="py-2 px-3 font-mono text-[11px]">{item.work_code || "—"}</td>
                <td className="py-2 px-3">{item.description}</td>
                <td className="py-2 px-3">{item.location}</td>
                <td className="py-2 px-3">{item.start_date}</td>
                <td className="py-2 px-3">{item.end_date}</td>
                <td className="py-2 px-3">{item.acceptance_date || "—"}</td>
                <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                  {item.standard_codes || "—"}
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() =>
                      onUpdate(
                        (p) => ({
                          ...p,
                          schedule: p.schedule.filter((s) => s.record_key !== item.record_key),
                        }),
                        `Xóa dòng Nhật trình ${item.record_key}`
                      )
                    }
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Xóa dòng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-3 border-t border-slate-100 text-xs">
        <select
          value={newItem.row_type}
          onChange={(e) => setNewItem((prev) => ({ ...prev, row_type: e.target.value as "work" | "section" }))}
          className="px-3 py-2 border border-slate-200 rounded-xl bg-white"
        >
          <option value="work">Công việc (work)</option>
          <option value="section">Nhóm hạng mục (section)</option>
        </select>
        <select
          value={newItem.work_code}
          disabled={newItem.row_type === "section"}
          onChange={(e) => setNewItem((prev) => ({ ...prev, work_code: e.target.value }))}
          className="px-3 py-2 border border-slate-200 rounded-xl bg-white disabled:opacity-40"
        >
          {state.workCatalog.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code}
            </option>
          ))}
        </select>
        <input
          placeholder="Nội dung công việc..."
          value={newItem.description}
          onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
          className="px-3 py-2 border border-slate-200 rounded-xl md:col-span-2"
        />
        <input
          type="date"
          value={newItem.start_date}
          onChange={(e) => setNewItem((prev) => ({ ...prev, start_date: e.target.value }))}
          className="px-2 py-2 border border-slate-200 rounded-xl"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm dòng
        </button>
      </form>
    </div>
  );
}

export function KthhTab({ state, onUpdate }: TabProps) {
  const [selectedKey, setSelectedKey] = useState<string>(state.inspections[0]?.inspection_key || "");
  const [tolValue, setTolValue] = useState<string>("5");

  const activeInspection = useMemo(
    () => state.inspections.find((i) => i.inspection_key === selectedKey) ?? state.inspections[0],
    [state.inspections, selectedKey]
  );

  const lines = useMemo(
    () => state.measurements.filter((m) => m.inspection_key === activeInspection?.inspection_key),
    [state.measurements, activeInspection]
  );

  const [newLine, setNewLine] = useState({ name: "", design: 1000, actual: 1002, unit: "mm", tol: "5" });

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInspection || !newLine.name.trim()) return;
    const line: MeasurementLine = {
      inspection_key: activeInspection.inspection_key,
      line_no: lines.length + 1,
      measurement_name: newLine.name.trim(),
      design_value: Number(newLine.design),
      actual_value: Number(newLine.actual),
      unit: newLine.unit.trim(),
      tolerance: newLine.tol.trim() === "" ? null : Number(newLine.tol),
    };
    onUpdate(
      (p) => ({ ...p, measurements: [...p.measurements, line] }),
      `Thêm chỉ tiêu đo KTHH vào ${activeInspection.inspection_key}`
    );
    setNewLine((prev) => ({ ...prev, name: "" }));
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-600" />
              5.1 Kiểm tra Kích thước Hình học (KTHH) — Chống tự gán &quot;Đạt&quot; (Kaizen Z03)
            </h3>
            <p className="text-xs text-slate-500">
              Hệ thống bắt buộc có Đơn vị + Dung sai + Quy tắc được phê duyệt mới đánh giá Đạt/Vượt. Thiếu dung sai luôn hiển thị &quot;Chưa đánh giá&quot;.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {state.inspections.map((insp) => (
            <button
              key={insp.inspection_key}
              onClick={() => setSelectedKey(insp.inspection_key)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition ${
                activeInspection?.inspection_key === insp.inspection_key
                  ? "bg-amber-50 border-amber-500 text-amber-950"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="font-mono font-bold">
                {insp.inspection_key} ({insp.kthh_group})
              </div>
              <div className="text-[11px]">{insp.location}</div>
            </button>
          ))}
        </div>

        {activeInspection && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <strong>Phiếu:</strong> {activeInspection.inspection_key} ·{" "}
                <strong>Công việc:</strong> {activeInspection.work_record_key} ·{" "}
                <strong>Ngày:</strong> {activeInspection.date}
              </div>
              <button
                onClick={() =>
                  onUpdate((p) => ({
                    ...p,
                    inspections: p.inspections.map((i) =>
                      i.inspection_key === activeInspection.inspection_key
                        ? { ...i, rule_approved: !i.rule_approved }
                        : i
                    ),
                  }))
                }
                className={`px-3 py-1 rounded-full font-bold ${
                  activeInspection.rule_approved
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {activeInspection.rule_approved ? "✓ Quy tắc đo đã duyệt" : "⚠ Quy tắc chưa duyệt"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Chỉ tiêu đo</th>
                    <th className="py-2 px-3">Thiết kế</th>
                    <th className="py-2 px-3">Thực đo</th>
                    <th className="py-2 px-3">Đơn vị</th>
                    <th className="py-2 px-3">Sai lệch</th>
                    <th className="py-2 px-3">Dung sai cho phép</th>
                    <th className="py-2 px-3">Đánh giá (Rule Engine)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((m) => {
                    const ev = evaluateMeasurement(m, activeInspection.rule_approved);
                    return (
                      <tr key={m.line_no} className="hover:bg-slate-50">
                        <td className="py-2 px-3">{m.line_no}</td>
                        <td className="py-2 px-3 font-medium">{m.measurement_name}</td>
                        <td className="py-2 px-3">{m.design_value}</td>
                        <td className="py-2 px-3 font-bold">{m.actual_value}</td>
                        <td className="py-2 px-3">{m.unit}</td>
                        <td className="py-2 px-3 font-mono">
                          {ev.deviation >= 0 ? `+${ev.deviation}` : ev.deviation}
                        </td>
                        <td className="py-2 px-3">
                          {m.tolerance === null ? (
                            <div className="flex items-center gap-1">
                              <span className="text-amber-700 font-semibold">Trống</span>
                              <button
                                onClick={() =>
                                  onUpdate((p) => ({
                                    ...p,
                                    measurements: p.measurements.map((item) =>
                                      item.inspection_key === m.inspection_key && item.line_no === m.line_no
                                        ? { ...item, tolerance: Number(tolValue) || 5 }
                                        : item
                                    ),
                                  }))
                                }
                                className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold hover:bg-blue-200"
                              >
                                Áp dụng ±{tolValue}
                              </button>
                            </div>
                          ) : (
                            `±${m.tolerance} ${m.unit}`
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              ev.status === "Đạt dung sai"
                                ? "bg-emerald-100 text-emerald-800"
                                : ev.status === "Vượt dung sai"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                            title={ev.reason}
                          >
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleAddMeasurement} className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 text-xs">
              <input
                placeholder="Tên chỉ tiêu đo..."
                value={newLine.name}
                onChange={(e) => setNewLine((p) => ({ ...p, name: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-xl sm:col-span-2"
              />
              <input
                type="number"
                placeholder="Thiết kế"
                value={newLine.design}
                onChange={(e) => setNewLine((p) => ({ ...p, design: Number(e.target.value) }))}
                className="px-3 py-2 border border-slate-200 rounded-xl"
              />
              <input
                type="number"
                placeholder="Thực đo"
                value={newLine.actual}
                onChange={(e) => setNewLine((p) => ({ ...p, actual: Number(e.target.value) }))}
                className="px-3 py-2 border border-slate-200 rounded-xl"
              />
              <input
                placeholder="Dung sai (trống = chưa ĐG)"
                value={newLine.tol}
                onChange={(e) => setNewLine((p) => ({ ...p, tol: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-xl"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
              >
                + Thêm dòng đo
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Sổ bản vẽ hoàn công PL IIb */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          5.2 Sổ Bản vẽ Hoàn công (Phụ lục IIb NĐ 207 — Kiểm soát Bộ phận bị che khuất)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã BV</th>
                <th className="py-2 px-3">Tên bản vẽ hoàn công</th>
                <th className="py-2 px-3">Công việc</th>
                <th className="py-2 px-3">Đo KTHH gốc</th>
                <th className="py-2 px-3">Che khuất</th>
                <th className="py-2 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.asBuiltDrawings.map((d) => (
                <tr key={d.drawing_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{d.drawing_id}</td>
                  <td className="py-2 px-3 font-medium">{d.name} (Rev {d.revision})</td>
                  <td className="py-2 px-3 font-mono">{d.work_record_key}</td>
                  <td className="py-2 px-3 font-mono">{d.actual_measurement_ref}</td>
                  <td className="py-2 px-3">{d.is_concealed_work ? "✓ Có (Bắt buộc trước lấp)" : "Không"}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold">{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function TestingTab({ state, onUpdate }: TabProps) {
  const [sampleForm, setSampleForm] = useState({
    work_record_key: state.schedule.find((s) => s.row_type === "work")?.record_key || "",
    sample_type: "Bê tông thương phẩm M250",
    sample_date: "2026-08-15",
    mould: "150x150x150 mm",
  });

  const handleAddSample = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = state.tenantMode === "demo" ? "DEMO-M" : "M";
    const key = `${prefix}-${String(state.testSamples.length + 1).padStart(3, "0")}`;
    const newSample: TestSample = {
      sample_key: key,
      work_record_key: sampleForm.work_record_key || "W-001",
      test_code: "CP.010032",
      sample_group: "BT",
      sample_date: sampleForm.sample_date,
      sample_time: "09:00",
      sample_type: sampleForm.sample_type,
      mix_code: state.concreteMixes[0]?.mix_code || "",
      grade: "M250",
      aggregate: "Đá 1x2cm",
      slump: 12,
      r3: null,
      r7: null,
      r28: null,
      mould: sampleForm.mould,
      supervisor_name: "TVGS hiện trường",
      original_attachment: "",
    };
    onUpdate((p) => ({ ...p, testSamples: [...p.testSamples, newSample] }), `Tạo phiếu lấy mẫu ${key}`);
  };

  return (
    <div className="space-y-5">
      {/* Kế hoạch TN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          6.1 Kế hoạch Thí nghiệm (Điều 15.3 NĐ 207 & Điều 2 TT 32/2026/TT-BXD)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã KHTN</th>
                <th className="py-2 px-3">Đối tượng / Phép thử</th>
                <th className="py-2 px-3">Phòng TN</th>
                <th className="py-2 px-3">Ngày dự kiến</th>
                <th className="py-2 px-3">Văn bản CĐT chấp thuận</th>
                <th className="py-2 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.testPlans.map((tp) => (
                <tr key={tp.plan_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-teal-700">{tp.plan_id}</td>
                  <td className="py-2 px-3">
                    <div className="font-semibold">{tp.object}</div>
                    <div className="text-[11px] text-slate-500">Mã TN: {tp.test}</div>
                  </td>
                  <td className="py-2 px-3">{tp.laboratory}</td>
                  <td className="py-2 px-3">{tp.planned_at}</td>
                  <td className="py-2 px-3">{tp.approval_ref || "Chưa có văn bản duyệt"}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() =>
                        onUpdate((p) => ({
                          ...p,
                          testPlans: p.testPlans.map((item) =>
                            item.plan_id === tp.plan_id
                              ? {
                                  ...item,
                                  status:
                                    item.status === "Đã chấp thuận" ? "Chờ CĐT chấp thuận" : "Đã chấp thuận",
                                }
                              : item
                          ),
                        }))
                      }
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        tp.status === "Đã chấp thuận"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {tp.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lấy mẫu & Kết quả TN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          6.2 Phiếu Lấy mẫu & Kết quả Thí nghiệm (Kiểm tra chéo Tuổi mẫu R7/R28 — Kaizen Z07/Z10)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <th className="py-2 px-3">Mã mẫu</th>
                <th className="py-2 px-3">Công việc</th>
                <th className="py-2 px-3">Loại mẫu / Khuôn</th>
                <th className="py-2 px-3">Ngày/Giờ lấy</th>
                <th className="py-2 px-3">Mốc R28 dự kiến</th>
                <th className="py-2 px-3">Kết quả trả về & Kiểm chứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.testSamples.map((smp) => {
                const resList = state.testResults.filter((r) => r.sample_key === smp.sample_key);
                const r28DateCheck = evaluateSampleDates(smp.sample_date, 28, resList.find((r) => r.target_age_days === 28)?.result_date);
                const mismatch = validateMaterialTestLink(smp.sample_type, smp.sample_type);
                return (
                  <tr key={smp.sample_key} className="hover:bg-slate-50 align-top">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{smp.sample_key}</td>
                    <td className="py-2 px-3 font-mono">{smp.work_record_key}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold">{smp.sample_type}</div>
                      <div className="text-[11px] text-slate-500">{smp.mould}</div>
                    </td>
                    <td className="py-2 px-3">
                      {smp.sample_date} {smp.sample_time}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-700">{r28DateCheck.expectedDate}</td>
                    <td className="py-2 px-3 space-y-1">
                      {resList.length === 0 ? (
                        <span className="text-amber-700 font-semibold">Đang chờ kết quả PTN</span>
                      ) : (
                        resList.map((r, i) => {
                          const ageCheck = evaluateSampleDates(smp.sample_date, r.target_age_days || 1, r.result_date);
                          return (
                            <div key={i} className="text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                              <span className="font-bold">{r.criterion}:</span> {r.value} {r.unit} ({r.result_date}) —{" "}
                              <span className="text-emerald-700 font-bold">{r.conclusion}</span>
                              {ageCheck.warning && (
                                <div className="text-rose-600 font-semibold">⚠ {ageCheck.warning}</div>
                              )}
                            </div>
                          );
                        })
                      )}
                      {mismatch && <div className="text-rose-600 text-[11px]">⚠ {mismatch}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleAddSample} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
          <input
            placeholder="Mã công việc..."
            value={sampleForm.work_record_key}
            onChange={(e) => setSampleForm((f) => ({ ...f, work_record_key: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            placeholder="Loại mẫu..."
            value={sampleForm.sample_type}
            onChange={(e) => setSampleForm((f) => ({ ...f, sample_type: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <input
            type="date"
            value={sampleForm.sample_date}
            onChange={(e) => setSampleForm((f) => ({ ...f, sample_date: e.target.value }))}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm phiếu lấy mẫu
          </button>
        </form>
      </div>
    </div>
  );
}
