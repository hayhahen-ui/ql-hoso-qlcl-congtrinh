import * as XLSX from "xlsx";
import { escapeSpreadsheetText } from "@/lib/domain-rules";
import { QlclWorkspaceState, ScheduleWorkItem } from "@/types/qlcl";

export type ContractFileKey =
  | "cong_trinh"
  | "danh_muc"
  | "vat_lieu"
  | "cap_phoi"
  | "nhat_trinh"
  | "kiem_tra"
  | "ke_hoach_thi_nghiem"
  | "thi_nghiem"
  | "thoi_tiet_nhat_ky"
  | "phap_ly_chuyen_tiep"
  | "nghiem_thu_207"
  | "danh_muc_ho_so"
  | "ho_so_bo_sung"
  | "du_lieu_ghep_word";

export interface ContractFileMeta {
  key: ContractFileKey;
  filename: string;
  label: string;
  sheets: string[];
}

export const CONTRACT_FILES_META: ContractFileMeta[] = [
  { key: "cong_trinh", filename: "cong_trinh.xlsx", label: "01. Công trình & Đối tác", sheets: ["cong_trinh", "doi_tac"] },
  { key: "danh_muc", filename: "danh_muc.xlsx", label: "02. Danh mục chuẩn (6 sheet)", sheets: ["cong_viec", "tieu_chuan", "loai_kiem_tra", "loai_thi_nghiem", "ket_qua", "may"] },
  { key: "vat_lieu", filename: "vat_lieu.xlsx", label: "03. Vật liệu & Lô VL", sheets: ["vat_lieu", "lo_vat_lieu"] },
  { key: "cap_phoi", filename: "cap_phoi.xlsx", label: "04. Cấp phối Bê tông", sheets: ["cap_phoi"] },
  { key: "nhat_trinh", filename: "nhat_trinh.xlsx", label: "05. Nhật trình thi công", sheets: ["nhat_trinh"] },
  { key: "kiem_tra", filename: "kiem_tra.xlsx", label: "06. Kiểm tra KTHH & Đo", sheets: ["kiem_tra", "chi_tiet_do"] },
  { key: "ke_hoach_thi_nghiem", filename: "ke_hoach_thi_nghiem.xlsx", label: "07. Kế hoạch thí nghiệm", sheets: ["ke_hoach_thi_nghiem"] },
  { key: "thi_nghiem", filename: "thi_nghiem.xlsx", label: "08. Lấy mẫu & Kết quả TN", sheets: ["lay_mau", "ket_qua"] },
  { key: "thoi_tiet_nhat_ky", filename: "thoi_tiet_nhat_ky.xlsx", label: "09. Thời tiết & Nhật ký", sheets: ["thoi_tiet", "nhat_ky"] },
  { key: "phap_ly_chuyen_tiep", filename: "phap_ly_chuyen_tiep.xlsx", label: "10. Pháp lý chuyển tiếp NĐ207", sheets: ["phap_ly_chuyen_tiep"] },
  { key: "nghiem_thu_207", filename: "nghiem_thu_207.xlsx", label: "11. Nghiệm thu 207", sheets: ["nghiem_thu_207"] },
  { key: "danh_muc_ho_so", filename: "danh_muc_ho_so.xlsx", label: "12. Danh mục Hồ sơ PL VII & X", sheets: ["danh_muc_ho_so"] },
  { key: "ho_so_bo_sung", filename: "ho_so_bo_sung.xlsx", label: "13. Hoàn công, Bàn giao, Sự cố, QT", sheets: ["ban_ve_hoan_cong", "ban_giao", "su_co", "quan_trac"] },
  { key: "du_lieu_ghep_word", filename: "du_lieu_ghep_word.xlsx", label: "14. Dữ liệu ghép Word (Mail Merge)", sheets: ["ListCVXD(ToWord)", "ListHTHM(ToWord)"] },
];

function appendSafeSheet(wb: XLSX.WorkBook, sheetName: string, headers: string[], rows: Array<Array<unknown>>) {
  const safeRows = rows.map((row) =>
    row.map((cell) => (typeof cell === "number" ? cell : escapeSpreadsheetText(cell)))
  );
  const ws = XLSX.utils.aoa_to_sheet([headers, ...safeRows]);
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
}

export function buildContractWorkbook(
  key: ContractFileKey,
  state: QlclWorkspaceState,
  blankOnly: boolean
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const emptyIfBlank = <T,>(arr: T[]): T[] => (blankOnly ? [] : arr);

  switch (key) {
    case "cong_trinh":
      appendSafeSheet(
        wb,
        "cong_trinh",
        ["project_code", "project_name", "package", "location", "handover_date", "start_date", "end_date"],
        blankOnly
          ? []
          : [[state.project.project_code, state.project.project_name, state.project.package, state.project.location, state.project.handover_date, state.project.start_date, state.project.end_date]]
      );
      appendSafeSheet(
        wb,
        "doi_tac",
        ["partner_code", "name", "role", "representative", "position", "address"],
        emptyIfBlank(state.partners).map((p) => [p.partner_code, p.name, p.role, p.representative, p.position, p.address])
      );
      break;

    case "danh_muc":
      appendSafeSheet(wb, "cong_viec", ["code", "name", "standard_codes", "test_codes"], emptyIfBlank(state.workCatalog).map((w) => [w.code, w.name, w.standard_codes, w.test_codes]));
      appendSafeSheet(wb, "tieu_chuan", ["code", "name", "version", "effective_from", "source"], emptyIfBlank(state.standards).map((s) => [s.code, s.name, s.version, s.effective_from, s.source]));
      appendSafeSheet(wb, "loai_kiem_tra", ["code", "name", "group"], emptyIfBlank(state.inspectionTypes).map((i) => [i.code, i.name, i.group]));
      appendSafeSheet(wb, "loai_thi_nghiem", ["code", "name", "group"], emptyIfBlank(state.testTypes).map((t) => [t.code, t.name, t.group]));
      appendSafeSheet(wb, "ket_qua", ["code", "name", "group"], emptyIfBlank(state.testResultCatalog).map((r) => [r.code, r.name, r.group]));
      appendSafeSheet(wb, "may", ["code", "name", "group"], emptyIfBlank(state.machines).map((m) => [m.code, m.name, m.group]));
      break;

    case "vat_lieu":
      appendSafeSheet(wb, "vat_lieu", ["material_code", "name", "source", "supplier", "sample_quantity", "unit", "notes"], emptyIfBlank(state.materials).map((m) => [m.material_code, m.name, m.source, m.supplier, m.sample_quantity, m.unit, m.notes]));
      appendSafeSheet(wb, "lo_vat_lieu", ["lot_code", "material_code", "received_date", "document_ref"], emptyIfBlank(state.materialLots).map((l) => [l.lot_code, l.material_code, l.received_date, l.document_ref]));
      break;

    case "cap_phoi":
      appendSafeSheet(wb, "cap_phoi", ["mix_code", "grade", "aggregate", "design_slip", "design_date", "cement", "sand", "stone", "water", "admixture_1", "admixture_2", "slump", "unit_notes"], emptyIfBlank(state.concreteMixes).map((c) => [c.mix_code, c.grade, c.aggregate, c.design_slip, c.design_date, c.cement, c.sand, c.stone, c.water, c.admixture_1, c.admixture_2, c.slump, c.unit_notes]));
      break;

    case "nhat_trinh":
      appendSafeSheet(wb, "nhat_trinh", ["source_row", "record_key", "parent_key", "relation_key", "work_code", "description", "location", "start_date", "end_date", "internal_date", "request_date", "acceptance_date", "attachment_raw", "standard_codes", "test_codes", "row_type"], emptyIfBlank(state.schedule).map((s) => [s.source_row, s.record_key, s.parent_key, s.relation_key, s.work_code, s.description, s.location, s.start_date, s.end_date, s.internal_date, s.request_date, s.acceptance_date, s.attachment_raw, s.standard_codes, s.test_codes, s.row_type]));
      break;

    case "kiem_tra":
      appendSafeSheet(wb, "kiem_tra", ["inspection_key", "work_record_key", "inspection_type", "date", "location", "result", "image_refs"], emptyIfBlank(state.inspections).map((i) => [i.inspection_key, i.work_record_key, i.inspection_type, i.date, i.location, i.result, i.image_refs]));
      appendSafeSheet(wb, "chi_tiet_do", ["inspection_key", "line_no", "measurement_name", "design_value", "actual_value", "unit", "tolerance"], emptyIfBlank(state.measurements).map((m) => [m.inspection_key, m.line_no, m.measurement_name, m.design_value, m.actual_value, m.unit, m.tolerance ?? ""]));
      break;

    case "ke_hoach_thi_nghiem":
      appendSafeSheet(wb, "ke_hoach_thi_nghiem", ["plan_id", "project_code", "object", "test", "planned_at", "laboratory", "design_ref", "approval_ref", "approval_date", "version"], emptyIfBlank(state.testPlans).map((p) => [p.plan_id, p.project_code, p.object, p.test, p.planned_at, p.laboratory, p.design_ref, p.approval_ref, p.approval_date, p.version]));
      break;

    case "thi_nghiem":
      appendSafeSheet(wb, "lay_mau", ["sample_key", "work_record_key", "test_code", "sample_date", "sample_time", "sample_type", "mix_code", "grade", "aggregate", "slump", "r3", "r7", "r28", "mould", "original_attachment"], emptyIfBlank(state.testSamples).map((s) => [s.sample_key, s.work_record_key, s.test_code, s.sample_date, s.sample_time, s.sample_type, s.mix_code, s.grade, s.aggregate, s.slump ?? "", s.r3 ?? "", s.r7 ?? "", s.r28 ?? "", s.mould, s.original_attachment]));
      appendSafeSheet(wb, "ket_qua", ["sample_key", "criterion", "value", "unit", "lab_ref", "result_date"], emptyIfBlank(state.testResults).map((r) => [r.sample_key, r.criterion, r.value, r.unit, r.lab_ref, r.result_date]));
      break;

    case "thoi_tiet_nhat_ky":
      appendSafeSheet(wb, "thoi_tiet", ["date", "high", "low", "rain_mm", "source", "observed_or_forecast", "note", "personnel"], emptyIfBlank(state.weatherDays).map((w) => [w.date, w.high, w.low, w.rain_mm, w.source, w.observed_or_forecast, w.note, w.personnel]));
      appendSafeSheet(wb, "nhat_ky", ["date", "work_record_key", "description", "equipment", "personnel", "status"], emptyIfBlank(state.diaryEntries).map((d) => [d.date, d.work_record_key, d.description, d.equipment, d.personnel, d.status]));
      break;

    case "phap_ly_chuyen_tiep":
      appendSafeSheet(wb, "phap_ly_chuyen_tiep", ["project_code", "decision_date", "decision_ref", "start_date", "project_type", "project_grade", "old_check_scope", "new_check_scope", "authority", "receipt_date", "inspection_before_effective", "decision_reason", "legal_profile"], blankOnly ? [] : [[state.legalProfile.project_code, state.legalProfile.decision_date, state.legalProfile.decision_ref, state.legalProfile.start_date, state.legalProfile.project_type, state.legalProfile.project_grade, state.legalProfile.old_check_scope, state.legalProfile.new_check_scope, state.legalProfile.authority, state.legalProfile.receipt_date, state.legalProfile.inspection_before_effective, state.legalProfile.decision_reason, state.legalProfile.legal_profile]]);
      break;

    case "nghiem_thu_207":
      appendSafeSheet(wb, "nghiem_thu_207", ["record_id", "project_code", "kind", "work_ids", "request_received_at", "inspection_at", "location", "signer_role", "signer_identity", "conclusion", "defects", "legal_profile", "evidence_refs"], emptyIfBlank(state.acceptances).map((a) => [a.record_id, a.project_code, a.kind, a.work_ids, a.request_received_at, a.inspection_at, a.location, a.signer_role, a.signer_identity, a.conclusion, a.defects, a.legal_profile, a.evidence_refs]));
      break;

    case "danh_muc_ho_so":
      appendSafeSheet(wb, "danh_muc_ho_so", ["project_code", "scope_id", "checklist_id", "checklist_name", "applicability", "applicability_reason", "document_ref", "version", "original_type", "physical_location", "electronic_copy_ref", "reviewer"], emptyIfBlank(state.checklist).map((c) => [c.project_code, c.scope_id, c.checklist_id, c.checklist_name, c.applicability, c.applicability_reason, c.document_ref, c.version, c.original_type, c.physical_location, c.electronic_copy_ref, c.reviewer]));
      break;

    case "ho_so_bo_sung":
      appendSafeSheet(wb, "ban_ve_hoan_cong", ["drawing_id", "project_code", "work_record_key", "name", "revision", "actual_measurement_ref", "file_ref", "signer", "status"], emptyIfBlank(state.asBuiltDrawings).map((d) => [d.drawing_id, d.project_code, d.work_record_key, d.name, d.revision, d.actual_measurement_ref, d.file_ref, d.signer, d.status]));
      appendSafeSheet(wb, "ban_giao", ["handover_id", "project_code", "scope_id", "receiver", "handover_date", "file_refs", "status"], emptyIfBlank(state.handovers).map((h) => [h.handover_id, h.project_code, h.scope_id, h.receiver, h.handover_date, h.file_refs, h.status]));
      appendSafeSheet(wb, "su_co", ["incident_id", "project_code", "work_record_key", "time", "description", "evidence_refs", "status"], emptyIfBlank(state.incidents).map((i) => [i.incident_id, i.project_code, i.work_record_key, i.time, i.description, i.evidence_refs, i.status]));
      appendSafeSheet(wb, "quan_trac", ["monitor_id", "project_code", "object", "method", "limit", "value", "unit", "date", "approval_ref"], emptyIfBlank(state.observations).map((o) => [o.monitor_id, o.project_code, o.object, o.method, o.limit ?? "", o.value, o.unit, o.date, o.approval_ref]));
      break;

    case "du_lieu_ghep_word": {
      // Giữ đúng khác biệt header giữa ListCVXD(ToWord) (Ngay_NB) và ListHTHM(ToWord) (Ngay_Noibo) theo Kaizen K06
      const works = emptyIfBlank(state.schedule.filter((s) => s.row_type === "work"));
      const cvHeaders = ["STT", "Noi_dung_CV", "Vi_tri_XD", "GioNB_Batdau", "GioNB_Ketthuc", "Ngay_NB", "Ngay_PYCNT", "GioCV_Batdau", "GioCV_Ketthuc", "Ngay_CV", "Tieuchuan_NT", "Ketqua_Thi_nghiem", "SoBB"];
      const htHeaders = ["STT", "Noi_dung_CV", "Vi_tri_XD", "GioNB_Batdau", "GioNB_Ketthuc", "Ngay_Noibo", "Ngay_PYCNT", "GioCV_Batdau", "GioCV_Ketthuc", "Ngay_CV", "Tieuchuan_NT", "Ketqua_Thi_nghiem", "SoBB"];

      const cvRows = works.map((w, idx) => {
        const rec = state.acceptances.find((a) => a.work_ids.includes(w.record_key));
        return [idx + 1, w.description, w.location, "08:00", "08:40", w.internal_date, w.request_date, "09:00", "09:40", w.acceptance_date, w.standard_codes, w.test_codes || "Không", rec?.issued_no || rec?.record_id || "Nháp"];
      });
      const htRows = works.slice(-1).map((w, idx) => {
        const rec = state.acceptances.find((a) => a.kind === "Giai đoạn" || a.kind.includes("Hoàn thành"));
        return [idx + 1, w.description, w.location, "14:00", "14:40", w.internal_date, w.request_date, "15:00", "15:40", w.acceptance_date, w.standard_codes, "Tổng hợp hồ sơ", rec?.issued_no || rec?.record_id || "Nháp"];
      });
      appendSafeSheet(wb, "ListCVXD(ToWord)", cvHeaders, cvRows);
      appendSafeSheet(wb, "ListHTHM(ToWord)", htHeaders, htRows);
      break;
    }
  }

  return wb;
}

export function downloadContractWorkbook(key: ContractFileKey, state: QlclWorkspaceState, blankOnly: boolean) {
  const wb = buildContractWorkbook(key, state, blankOnly);
  const meta = CONTRACT_FILES_META.find((m) => m.key === key);
  const prefix = blankOnly ? "MAU_TRANG_" : `${state.project.project_code}_`;
  const filename = `${prefix}${meta?.filename ?? `${key}.xlsx`}`;
  XLSX.writeFile(wb, filename);
}

export interface ImportDryRunResult {
  detectedSheet: string;
  totalRows: number;
  validItems: ScheduleWorkItem[];
  errors: Array<{ row: number; message: string }>;
}

/**
 * Kaizen §16.6: Import 2 pha (Dry-Run Preview -> Commit) cho sheet nhat_trinh.xlsx
 * Không thực thi macro, bảo vệ giới hạn dòng.
 */
export async function parseScheduleExcelDryRun(file: File): Promise<ImportDryRunResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellFormula: false });
  const targetSheetName = wb.SheetNames.includes("nhat_trinh") ? "nhat_trinh" : wb.SheetNames[0];
  if (!targetSheetName) {
    return { detectedSheet: "(Không có)", totalRows: 0, validItems: [], errors: [{ row: 0, message: "File Excel không có sheet nào." }] };
  }

  const sheet = wb.Sheets[targetSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const errors: Array<{ row: number; message: string }> = [];
  const validItems: ScheduleWorkItem[] = [];
  const seenKeys = new Set<string>();

  if (rawRows.length > 5000) {
    errors.push({ row: 0, message: "Vượt giới hạn 5.000 dòng mỗi lần nhập." });
    return { detectedSheet: targetSheetName, totalRows: rawRows.length, validItems: [], errors };
  }

  rawRows.forEach((r, idx) => {
    const rowNo = idx + 2;
    const recordKey = String(r.record_key ?? "").trim();
    const description = String(r.description ?? "").trim();
    const rowType = String(r.row_type ?? "work").trim() === "section" ? "section" : "work";
    const startDate = String(r.start_date ?? "").slice(0, 10);
    const endDate = String(r.end_date ?? "").slice(0, 10);

    if (!recordKey) {
      errors.push({ row: rowNo, message: "Thiếu record_key (Khóa công việc bắt buộc)." });
      return;
    }
    if (seenKeys.has(recordKey)) {
      errors.push({ row: rowNo, message: `Trùng mã record_key "${recordKey}".` });
      return;
    }
    seenKeys.add(recordKey);

    if (!description) {
      errors.push({ row: rowNo, message: `${recordKey}: Thiếu nội dung công việc (description).` });
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      errors.push({ row: rowNo, message: `${recordKey}: Ngày kết thúc (${endDate}) < ngày bắt đầu (${startDate}).` });
      return;
    }

    validItems.push({
      source_row: Number(r.source_row) || rowNo,
      record_key: recordKey,
      parent_key: String(r.parent_key ?? "").trim(),
      relation_key: String(r.relation_key ?? "").trim(),
      work_code: String(r.work_code ?? "").trim(),
      description,
      location: String(r.location ?? "").trim(),
      start_date: startDate,
      end_date: endDate,
      internal_date: String(r.internal_date ?? "").slice(0, 10),
      request_date: String(r.request_date ?? "").slice(0, 10),
      acceptance_date: String(r.acceptance_date ?? "").slice(0, 10),
      attachment_raw: String(r.attachment_raw ?? "").trim(),
      standard_codes: String(r.standard_codes ?? "").trim(),
      test_codes: String(r.test_codes ?? "").trim(),
      row_type: rowType,
    });
  });

  return {
    detectedSheet: targetSheetName,
    totalRows: rawRows.length,
    validItems,
    errors,
  };
}
