import {
  AcceptanceRecord207,
  MeasurementLine,
  NumberSequenceEntry,
  QlclWorkspaceState,
  ScheduleWorkItem,
} from "@/types/qlcl";

export interface Sla24hResult {
  status: "pending" | "ok" | "due_soon" | "overdue" | "invalid_order";
  elapsedHours: number | null;
  label: string;
}

/**
 * Tính thời hạn 24 giờ theo NĐ 207/2026/NĐ-CP Điều 22(3)
 * tính từ thời điểm NHẬN đề nghị nghiệm thu đến thời điểm kiểm tra/nghiệm thu.
 */
export function calculateSla24h(
  requestReceivedAt?: string,
  inspectionAt?: string
): Sla24hResult {
  if (!requestReceivedAt || !inspectionAt) {
    return {
      status: "pending",
      elapsedHours: null,
      label: "Chưa đủ mốc giờ nhận/kiểm tra",
    };
  }

  const parseIsoLocal = (val: string): number => {
    const normalized = val.trim().replace(" ", "T");
    // Gắn múi giờ +07:00 nếu chưa có offset để tính nhất quán theo Asia/Ho_Chi_Minh
    const withTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized)
      ? normalized
      : `${normalized}+07:00`;
    return Date.parse(withTz);
  };

  const tReq = parseIsoLocal(requestReceivedAt);
  const tInsp = parseIsoLocal(inspectionAt);

  if (Number.isNaN(tReq) || Number.isNaN(tInsp)) {
    return {
      status: "pending",
      elapsedHours: null,
      label: "Định dạng thời gian không hợp lệ",
    };
  }

  const diffHours = (tInsp - tReq) / (1000 * 60 * 60);
  if (diffHours < 0) {
    return {
      status: "invalid_order",
      elapsedHours: Number(diffHours.toFixed(2)),
      label: `Lỗi trình tự: kiểm tra trước giờ nhận (${Math.abs(diffHours).toFixed(1)}h)`,
    };
  }

  const rounded = Number(diffHours.toFixed(2));
  if (diffHours > 24) {
    return {
      status: "overdue",
      elapsedHours: rounded,
      label: `Quá hạn 24h (${rounded}h) — Cần giải trình văn bản`,
    };
  }

  if (diffHours >= 18) {
    return {
      status: "due_soon",
      elapsedHours: rounded,
      label: `Sát hạn 24h (${rounded}h / 24h)`,
    };
  }

  return {
    status: "ok",
    elapsedHours: rounded,
    label: `Đạt hạn 24h (${rounded}h)`,
  };
}

export interface MeasurementEvaluation {
  deviation: number;
  status: "Chưa đánh giá" | "Đạt dung sai" | "Vượt dung sai";
  reason: string;
}

/**
 * Kaizen Z03 & K08-K10:
 * Không bao giờ tự kết luận "Đạt" khi thiếu dung sai cho phép hoặc quy tắc chưa được duyệt.
 */
export function evaluateMeasurement(
  line: Pick<MeasurementLine, "design_value" | "actual_value" | "unit" | "tolerance">,
  ruleApproved: boolean
): MeasurementEvaluation {
  const deviation = Number((line.actual_value - line.design_value).toFixed(3));

  if (!line.unit || line.unit.trim() === "") {
    return {
      deviation,
      status: "Chưa đánh giá",
      reason: "Thiếu đơn vị đo",
    };
  }

  if (line.tolerance === null || line.tolerance === undefined || Number.isNaN(line.tolerance)) {
    return {
      deviation,
      status: "Chưa đánh giá",
      reason: "Chưa có dung sai được phê duyệt",
    };
  }

  if (!ruleApproved) {
    return {
      deviation,
      status: "Chưa đánh giá",
      reason: "Quy tắc/tiêu chuẩn kiểm tra chưa được phê duyệt",
    };
  }

  if (Math.abs(deviation) <= Math.abs(line.tolerance)) {
    return {
      deviation,
      status: "Đạt dung sai",
      reason: `|${deviation}| <= ±${Math.abs(line.tolerance)} ${line.unit}`,
    };
  }

  return {
    deviation,
    status: "Vượt dung sai",
    reason: `|${deviation}| > ±${Math.abs(line.tolerance)} ${line.unit}`,
  };
}

/**
 * Kaizen Z07 & K19: Kiểm tra tính hợp lý ngày lấy mẫu và ngày trả kết quả theo tuổi mẫu R3/R7/R28
 */
export function evaluateSampleDates(
  sampleDate: string,
  ageDays: number,
  resultDate?: string
): { valid: boolean; expectedDate: string; warning?: string } {
  const base = new Date(`${sampleDate.slice(0, 10)}T00:00:00+07:00`);
  if (Number.isNaN(base.getTime())) {
    return { valid: false, expectedDate: "", warning: "Ngày lấy mẫu không hợp lệ" };
  }

  const expected = new Date(base.getTime() + ageDays * 24 * 60 * 60 * 1000);
  const expectedIso = expected.toISOString().slice(0, 10);

  if (!resultDate) {
    return { valid: true, expectedDate: expectedIso };
  }

  const res = new Date(`${resultDate.slice(0, 10)}T00:00:00+07:00`);
  if (Number.isNaN(res.getTime())) {
    return { valid: false, expectedDate: expectedIso, warning: "Ngày trả KQ không hợp lệ" };
  }

  if (res.getTime() < base.getTime()) {
    return {
      valid: false,
      expectedDate: expectedIso,
      warning: `Lỗi mốc thời gian: Ngày trả KQ (${resultDate}) trước ngày lấy mẫu (${sampleDate})`,
    };
  }

  if (res.getTime() < expected.getTime()) {
    return {
      valid: false,
      expectedDate: expectedIso,
      warning: `Cảnh báo tuổi mẫu: Yêu cầu ${ageDays} ngày (dự kiến ${expectedIso}), nhưng trả KQ ngày ${resultDate}`,
    };
  }

  return { valid: true, expectedDate: expectedIso };
}

/**
 * Kaizen Z10 & K20: Kiểm tra chéo loại vật liệu và phép thử (chặn lô đá gắn mẫu cát...)
 */
export function validateMaterialTestLink(materialName: string, sampleType: string): string | null {
  const mat = materialName.toLowerCase();
  const smp = sampleType.toLowerCase();
  if (mat.includes("đá") && smp.includes("cát")) {
    return `Xung đột loại vật liệu: Lô "${materialName}" không khớp mẫu "${sampleType}"`;
  }
  if (mat.includes("cát") && smp.includes("đá")) {
    return `Xung đột loại vật liệu: Lô "${materialName}" không khớp mẫu "${sampleType}"`;
  }
  if (mat.includes("thép") && (smp.includes("bê tông") || smp.includes("vữa"))) {
    return `Xung đột loại vật liệu: Lô "${materialName}" không khớp mẫu "${sampleType}"`;
  }
  return null;
}

/**
 * Kaizen K03 & K27: Cấp số biên bản bất biến trong Sổ cấp số (không trùng, không tái sử dụng số đã void)
 */
export function issueImmutableRecordNumber(
  sequences: NumberSequenceEntry[],
  record: AcceptanceRecord207,
  year: number,
  nowIso: string
): { updatedSequences: NumberSequenceEntry[]; updatedRecord: AcceptanceRecord207 } {
  if (record.status === "issued" && record.issued_no) {
    // Idempotent: nếu đã cấp số thì trả nguyên bản đã cấp
    return { updatedSequences: sequences, updatedRecord: record };
  }

  const prefixMap: Record<AcceptanceRecord207["kind"], string> = {
    "Công việc": "NTCV",
    "Vật liệu": "NTVL",
    "Giai đoạn": "NTGD",
    "Hoàn thành": "NTHT",
    "Hoàn thành có điều kiện": "NTHT-DK",
  };
  const prefix = prefixMap[record.kind] ?? "BB";
  const seqKey = `${record.project_code}-${prefix}-${year}`;

  const existingSeq = sequences.find((s) => s.seq_key === seqKey);
  const seqNo = existingSeq ? existingSeq.next_no : 1;
  const formattedNo = `${String(seqNo).padStart(3, "0")}/${year}/${prefix}`;

  const newEntry = {
    no: seqNo,
    label: formattedNo,
    record_id: record.record_id,
    issued_at: nowIso,
    status: "active" as const,
  };

  const updatedSequences: NumberSequenceEntry[] = existingSeq
    ? sequences.map((s) =>
        s.seq_key === seqKey
          ? {
              ...s,
              next_no: s.next_no + 1,
              issued_records: [...s.issued_records, newEntry],
            }
          : s
      )
    : [
        ...sequences,
        {
          seq_key: seqKey,
          doc_type: record.kind,
          year,
          prefix,
          next_no: 2,
          issued_records: [newEntry],
        },
      ];

  const snapshotPayload = JSON.stringify({
    record_id: record.record_id,
    work_ids: record.work_ids,
    issued_no: formattedNo,
    issued_at: nowIso,
    conclusion: record.conclusion,
  });

  // Deterministic lightweight hash for snapshot integrity display
  let hash = 2166136261;
  for (let i = 0; i < snapshotPayload.length; i++) {
    hash ^= snapshotPayload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const snapshotHash = `SHA256-SIM-${(hash >>> 0).toString(16).padStart(8, "0").toUpperCase()}`;

  const updatedRecord: AcceptanceRecord207 = {
    ...record,
    status: "issued",
    issued_no: formattedNo,
    issued_seq: seqNo,
    issued_at: nowIso,
    snapshot_hash: snapshotHash,
  };

  return { updatedSequences, updatedRecord };
}

/**
 * Kaizen Z06 & §16.6: Chống Spreadsheet Formula Injection khi xuất CSV/XLSX
 */
export function escapeSpreadsheetText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const str = String(value);
  const trimmedStart = str.replace(/^\s+/, "");
  if (/^[=+\-@]/.test(trimmedStart)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Kaizen Z06 & K11: Escape HTML an toàn chống XSS
 */
export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Kaizen K01, K02, K07 & §16.8: Kiểm tra rò rỉ dữ liệu DEMO-* trong Tenant Thật
 */
export function detectDemoDataLeak(state: QlclWorkspaceState): string[] {
  if (state.tenantMode === "demo") return [];
  const leaks: string[] = [];

  if (state.project.project_code.toUpperCase().startsWith("DEMO-")) {
    leaks.push(`Mã công trình đang chứa tiền tố DEMO: ${state.project.project_code}`);
  }
  state.schedule.forEach((item) => {
    if (item.record_key.toUpperCase().startsWith("DEMO-")) {
      leaks.push(`Nhật trình chứa mã DEMO: ${item.record_key}`);
    }
  });
  state.acceptances.forEach((rec) => {
    if (rec.record_id.toUpperCase().startsWith("DEMO-")) {
      leaks.push(`Biên bản chứa mã DEMO: ${rec.record_id}`);
    }
  });
  state.materialLots.forEach((lot) => {
    if (lot.lot_code.toUpperCase().startsWith("DEMO-")) {
      leaks.push(`Lô vật liệu chứa mã DEMO: ${lot.lot_code}`);
    }
  });

  return leaks;
}

/**
 * Kiểm tra cấu trúc DAG của Nhật trình (chặn vòng lặp quan hệ cha-con và ngày kết thúc < ngày bắt đầu)
 */
export function validateScheduleItems(items: ScheduleWorkItem[]): string[] {
  const errors: string[] = [];
  const keys = new Set(items.map((i) => i.record_key));

  for (const item of items) {
    if (item.start_date && item.end_date && item.end_date < item.start_date) {
      errors.push(`${item.record_key}: Ngày kết thúc (${item.end_date}) nhỏ hơn ngày bắt đầu (${item.start_date})`);
    }
    if (item.relation_key && item.relation_key === item.record_key) {
      errors.push(`${item.record_key}: Tự tham chiếu vòng tới chính mình`);
    }
    if (item.parent_key && !keys.has(item.parent_key)) {
      errors.push(`${item.record_key}: parent_key "${item.parent_key}" không tồn tại`);
    }
  }

  // Cycle detection on relation_key
  const adj = new Map<string, string>();
  items.forEach((i) => {
    if (i.relation_key) adj.set(i.record_key, i.relation_key);
  });

  for (const item of items) {
    const visited = new Set<string>();
    let curr: string | undefined = item.record_key;
    while (curr && adj.has(curr)) {
      if (visited.has(curr)) {
        errors.push(`Phát hiện quan hệ vòng (cycle) liên quan tới công việc ${item.record_key}`);
        break;
      }
      visited.add(curr);
      curr = adj.get(curr);
    }
  }

  return errors;
}

export function formatDateVnText(isoDate?: string): string {
  if (!isoDate) return "..... ngày ..... tháng ..... năm 20....";
  const parts = isoDate.slice(0, 10).split("-");
  if (parts.length !== 3) return isoDate;
  return `ngày ${Number(parts[2])} tháng ${Number(parts[1])} năm ${parts[0]}`;
}
