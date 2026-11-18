"use client";

import React, { useMemo, useState } from "react";
import {
  Printer,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { THIRTY_OUTPUT_FORMS, buildLiveFormContent } from "@/data/forms-catalog";
import {
  CONTRACT_FILES_META,
  ContractFileKey,
  ImportDryRunResult,
  downloadContractWorkbook,
  parseScheduleExcelDryRun,
} from "@/lib/excel-service";
import { QlclWorkspaceState, ScheduleWorkItem } from "@/types/qlcl";

interface FormPreviewTabProps {
  state: QlclWorkspaceState;
  onImportScheduleCommit: (items: ScheduleWorkItem[], filename: string) => void;
}

export default function FormPreviewTab({ state, onImportScheduleCommit }: FormPreviewTabProps) {
  const [selectedFormNo, setSelectedFormNo] = useState<number>(2);
  const [formSearch, setFormSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [subTab, setSubTab] = useState<"forms30" | "excel13" | "import">("forms30");

  const [dryRun, setDryRun] = useState<ImportDryRunResult | null>(null);
  const [uploadFilename, setUploadFilename] = useState<string>("");
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>("");

  const filteredForms = useMemo(() => {
    return THIRTY_OUTPUT_FORMS.filter((f) => {
      const matchCat = categoryFilter === "ALL" || f.category === categoryFilter;
      const q = formSearch.toLowerCase();
      const matchQ =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.legalRef.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [categoryFilter, formSearch]);

  const activeFormMeta = useMemo(
    () => THIRTY_OUTPUT_FORMS.find((f) => f.no === selectedFormNo) ?? THIRTY_OUTPUT_FORMS[0],
    [selectedFormNo]
  );

  const liveForm = useMemo(() => buildLiveFormContent(activeFormMeta.no, state), [activeFormMeta.no, state]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportSuccessMsg("");
    setUploadFilename(file.name);
    const result = await parseScheduleExcelDryRun(file);
    setDryRun(result);
  };

  const handleCommitImport = () => {
    if (!dryRun || dryRun.validItems.length === 0) return;
    onImportScheduleCommit(dryRun.validItems, uploadFilename);
    setImportSuccessMsg(
      `Đã nhập thành công ${dryRun.validItems.length} dòng công việc vào Nhật trình từ "${uploadFilename}".`
    );
    setDryRun(null);
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubTab("forms30")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              subTab === "forms30"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" /> 30 Biểu mẫu In A4 / PDF
          </button>
          <button
            onClick={() => setSubTab("excel13")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              subTab === "excel13"
                ? "bg-emerald-700 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Xuất 13 File Excel & Ghép Word
          </button>
          <button
            onClick={() => setSubTab("import")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              subTab === "import"
                ? "bg-blue-700 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" /> Nhập Excel (Dry-Run 2 Pha)
          </button>
        </div>

        {subTab === "forms30" && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> In / Xuất PDF Khổ A4
          </button>
        )}
      </div>

      {/* TAB 1: 30 FORMS LIVE A4 PREVIEW */}
      {subTab === "forms30" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Form List */}
          <div className="no-print lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={formSearch}
                onChange={(e) => setFormSearch(e.target.value)}
                placeholder="Tìm trong 30 biểu mẫu..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
            >
              <option value="ALL">Tất cả nhóm (30 biểu mẫu)</option>
              <option value="Nghiệm thu (NĐ 207)">Nghiệm thu (NĐ 207)</option>
              <option value="Kiểm tra & KTHH">Kiểm tra & KTHH</option>
              <option value="Lấy mẫu & Thí nghiệm">Lấy mẫu & Thí nghiệm</option>
              <option value="Nhật ký & Hoàn công">Nhật ký & Hoàn công</option>
              <option value="Hồ sơ & Pháp lý">Hồ sơ & Pháp lý</option>
            </select>

            <div className="max-h-[560px] overflow-y-auto space-y-1.5 pr-1">
              {filteredForms.map((f) => {
                const active = f.no === selectedFormNo;
                return (
                  <button
                    key={f.no}
                    onClick={() => setSelectedFormNo(f.no)}
                    className={`w-full text-left p-2.5 rounded-xl border transition ${
                      active
                        ? "bg-blue-50 border-blue-500 text-blue-950 shadow-xs"
                        : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={active ? "text-blue-700" : "text-slate-500"}>
                        #{String(f.no).padStart(2, "0")} · {f.code}
                      </span>
                      <span className="text-[10px] font-normal text-slate-400">{f.legalRef}</span>
                    </div>
                    <div className="text-xs font-semibold mt-0.5 leading-snug">{f.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Live A4 Sheet */}
          <div className="lg:col-span-8">
            <div className="print-only-area relative bg-white border border-slate-300 rounded-xl shadow-md p-8 md:p-12 mx-auto max-w-[820px] font-serif text-slate-900 overflow-hidden">
              {/* Kaizen Z04 & K15: Watermark cố định ở mọi trang khi ở chế độ Demo */}
              {state.tenantMode === "demo" && (
                <div className="demo-watermark-overlay pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.11]">
                  <div className="-rotate-35 text-center font-sans font-black text-3xl md:text-4xl tracking-widest text-rose-700 border-4 border-rose-700 px-6 py-4 rounded-xl">
                    DEMO — GIẢ LẬP
                    <div className="text-sm font-bold tracking-normal mt-1">
                      KHÔNG CÓ GIÁ TRỊ PHÁP LÝ — KHÔNG DÙNG KÝ THẬT
                    </div>
                  </div>
                </div>
              )}

              {/* Header Quốc hiệu */}
              <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-800 pb-4 mb-5 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold uppercase text-slate-900">
                    {state.partners.find((p) => p.role === "Nhà thầu thi công")?.name || "ĐƠN VỊ THI CÔNG"}
                  </div>
                  <div className="text-slate-700">Công trình: {state.project.project_name}</div>
                  <div className="text-slate-600">Mã hồ sơ: {liveForm.docCode}</div>
                </div>
                <div className="text-center shrink-0">
                  <div className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="font-bold underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</div>
                  <div className="italic mt-1.5">{liveForm.dateLine}</div>
                </div>
              </div>

              {/* Title */}
              <div className="relative z-10 text-center mb-6">
                <h1 className="text-lg font-bold uppercase tracking-wide">{liveForm.title}</h1>
                <p className="text-xs italic text-slate-600 mt-1">{liveForm.subtitle}</p>
              </div>

              {/* Metadata Key-Value */}
              <div className="relative z-10 space-y-2 mb-5 text-sm">
                {liveForm.rows.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 border-b border-dotted border-slate-300 pb-1">
                    <div className="col-span-4 font-semibold text-slate-700">{r.label}:</div>
                    <div className="col-span-8 text-slate-900">{r.value}</div>
                  </div>
                ))}
              </div>

              {/* Optional Dynamic Table */}
              {liveForm.tableHeaders && liveForm.tableRows && (
                <div className="relative z-10 mb-5 overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        {liveForm.tableHeaders.map((h, i) => (
                          <th key={i} className="border border-slate-700 px-2 py-1.5 text-left font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {liveForm.tableRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="border border-slate-700 px-2 py-1.5">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Conclusion */}
              <div className="relative z-10 mb-8 text-sm">
                <div className="font-bold uppercase text-xs mb-1">KẾT LUẬN / KIẾN NGHỊ:</div>
                <div className="p-3 border border-slate-400 rounded bg-slate-50/70">{liveForm.conclusion}</div>
              </div>

              {/* Signatures */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs pt-2">
                {liveForm.signers.map((s, idx) => (
                  <div key={idx} className="space-y-12">
                    <div>
                      <div className="font-bold uppercase">{s.role}</div>
                      <div className="italic text-[11px] text-slate-500">
                        {state.tenantMode === "demo"
                          ? "(Chữ ký mô phỏng — Không có giá trị pháp lý)"
                          : "(Ký, ghi rõ họ tên và đóng dấu nếu áp dụng)"}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{s.name}</div>
                      {s.position && <div className="text-[11px] text-slate-600">{s.position}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 13 CONTRACT XLSX + WORD MERGE */}
      {subTab === "excel13" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Trung tâm Xuất Dữ liệu Chuẩn Hợp đồng 13 File XLSX & Trộn thư Word
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tất cả ô text đều được bảo vệ chống Formula Injection (`=`, `+`, `-`, `@`). Giữ chính xác cấu trúc cột `Ngay_NB` (CVXD) và `Ngay_Noibo` (HTHM) cho file ghép Word.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {CONTRACT_FILES_META.map((meta) => (
              <div
                key={meta.key}
                className="border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-3 hover:border-emerald-400 transition bg-slate-50/40"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{meta.label}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{meta.filename}</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Sheets: <span className="font-medium">{meta.sheets.join(", ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadContractWorkbook(meta.key as ContractFileKey, state, false)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Xuất dữ liệu
                  </button>
                  {meta.key !== "du_lieu_ghep_word" && (
                    <button
                      onClick={() => downloadContractWorkbook(meta.key as ContractFileKey, state, true)}
                      className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                      title="Tải file mẫu trắng chỉ có header (03_MAU_TRANG)"
                    >
                      Mẫu trắng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 2-PHASE EXCEL IMPORT */}
      {subTab === "import" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Nguyên tắc Import an toàn 2 pha (Dry-Run → Commit):</strong> Hệ thống chỉ đọc dữ liệu thuần từ `.xlsx` (không chạy macro VBA), kiểm tra trùng khóa `record_key`, ngày kết thúc ≥ ngày bắt đầu và giới hạn 5.000 dòng trước khi cho phép nạp vào Nhật trình.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs">
              <Upload className="w-4 h-4" /> Chọn file nhat_trinh.xlsx để kiểm tra (Dry-Run)
              <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              onClick={() => downloadContractWorkbook("nhat_trinh", state, true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Tải file mẫu trắng nhat_trinh.xlsx
            </button>
          </div>

          {importSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {importSuccessMsg}
            </div>
          )}

          {dryRun && (
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-800">
                  Kết quả kiểm tra file: <span className="text-blue-700">{uploadFilename}</span> (Sheet:{" "}
                  {dryRun.detectedSheet})
                </div>
                <div className="flex gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    Hợp lệ: {dryRun.validItems.length} dòng
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800">
                    Lỗi: {dryRun.errors.length} dòng
                  </span>
                </div>
              </div>

              {dryRun.errors.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto bg-white p-3 rounded-lg border border-rose-200">
                  {dryRun.errors.map((err, i) => (
                    <div key={i} className="text-xs text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Dòng {err.row}: {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {dryRun.validItems.length > 0 && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDryRun(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-white"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleCommitImport}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Xác nhận Nạp {dryRun.validItems.length} công việc vào Nhật trình
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
