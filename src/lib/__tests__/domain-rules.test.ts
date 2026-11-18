import { describe, expect, it } from "vitest";
import {
  calculateSla24h,
  detectDemoDataLeak,
  escapeHtml,
  escapeSpreadsheetText,
  evaluateMeasurement,
  evaluateSampleDates,
  issueImmutableRecordNumber,
  validateMaterialTestLink,
  validateScheduleItems,
} from "@/lib/domain-rules";
import { createCleanRealTenant, createDemoSeedState } from "@/data/demo-seed";
import { THIRTY_OUTPUT_FORMS } from "@/data/forms-catalog";
import { MINDMAP_NODES } from "@/data/mindmap-flow";
import { buildContractWorkbook } from "@/lib/excel-service";
import * as XLSX from "xlsx";

describe("QLCL Kaizen V3 — Domain & Legal Rules (NĐ 207/2026 & TT 32/2026)", () => {
  it("K22: Kiểm soát SLA 24h theo Điều 22(3) NĐ 207 (ranh giới đúng 24h & quá 24h)", () => {
    const ok24 = calculateSla24h("2026-08-10 08:00", "2026-08-11 08:00");
    expect(ok24.status).toBe("due_soon");
    expect(ok24.elapsedHours).toBe(24);

    const overdue = calculateSla24h("2026-08-10 08:00", "2026-08-11 08:01");
    expect(overdue.status).toBe("overdue");
    expect(overdue.elapsedHours).toBeGreaterThan(24);

    const invalid = calculateSla24h("2026-08-10 10:00", "2026-08-10 09:00");
    expect(invalid.status).toBe("invalid_order");
  });

  it("K08-K09 & Z03: Không tự kết luận Đạt khi thiếu dung sai hoặc quy tắc chưa duyệt", () => {
    const missingTol = evaluateMeasurement(
      { design_value: 1200, actual_value: 1198, unit: "mm", tolerance: null },
      true
    );
    expect(missingTol.status).toBe("Chưa đánh giá");

    const unapprovedRule = evaluateMeasurement(
      { design_value: 1200, actual_value: 1200, unit: "mm", tolerance: 5 },
      false
    );
    expect(unapprovedRule.status).toBe("Chưa đánh giá");

    const exceeded = evaluateMeasurement(
      { design_value: 300, actual_value: 307, unit: "mm", tolerance: 5 },
      true
    );
    expect(exceeded.status).toBe("Vượt dung sai");
    expect(exceeded.deviation).toBe(7);
  });

  it("K19 & Z07: Cảnh báo ngày trả kết quả trước ngày lấy mẫu hoặc chưa đủ tuổi R28", () => {
    const beforeSample = evaluateSampleDates("2026-08-10", 28, "2026-08-05");
    expect(beforeSample.valid).toBe(false);

    const tooEarly = evaluateSampleDates("2026-08-30", 28, "2026-09-12");
    expect(tooEarly.valid).toBe(false);
    expect(tooEarly.warning).toContain("tuổi mẫu");

    const validR28 = evaluateSampleDates("2026-08-10", 28, "2026-09-07");
    expect(validR28.valid).toBe(true);
  });

  it("K20 & Z10: Phát hiện xung đột loại vật liệu và phép thử (lô đá gắn mẫu cát)", () => {
    expect(validateMaterialTestLink("Đá dăm 1x2cm", "Mẫu cát vàng")).toContain("Xung đột");
    expect(validateMaterialTestLink("Bê tông thương phẩm", "Mẫu bê tông M250")).toBeNull();
  });

  it("K27: Cấp số bất biến 20 lần liên tiếp không trùng & idempotent khi retry", () => {
    const demo = createDemoSeedState();
    let seqs = [...demo.numberSequences];
    const issuedNos = new Set<string>();

    for (let i = 1; i <= 20; i++) {
      const rec = { ...demo.acceptances[0], record_id: `TEST-BB-${i}`, status: "draft" as const };
      const res = issueImmutableRecordNumber(seqs, rec, 2026, `2026-08-15T10:${String(i).padStart(2, "0")}:00+07:00`);
      seqs = res.updatedSequences;
      expect(res.updatedRecord.issued_no).toBeTruthy();
      issuedNos.add(res.updatedRecord.issued_no!);

      // Retry idempotent must return exact same number
      const retry = issueImmutableRecordNumber(seqs, res.updatedRecord, 2026, "2026-08-15T12:00:00+07:00");
      expect(retry.updatedRecord.issued_no).toBe(res.updatedRecord.issued_no);
    }
    expect(issuedNos.size).toBe(20);
  });

  it("K11 & §16.6: Bảo vệ XSS và Spreadsheet Formula Injection", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(escapeSpreadsheetText("=CMD()")).toBe("'=CMD()");
    expect(escapeSpreadsheetText("+1+1")).toBe("'+1+1");
    expect(escapeSpreadsheetText(-1850)).toBe("-1850");
  });

  it("K01-K07: Cách ly Tenant Thật sạch không rò rỉ DEMO-* và đủ 42 mục PL VII + X", () => {
    const demo = createDemoSeedState();
    expect(demo.checklist.length).toBe(42);
    expect(demo.checklist.filter((c) => c.annex === "VII").length).toBe(31);
    expect(demo.checklist.filter((c) => c.annex === "X").length).toBe(11);

    const real = createCleanRealTenant({
      contractorName: "Công ty Xây dựng Mẫu Thật",
      projectCode: "CT-REAL-001",
      projectName: "Dự án Thử nghiệm Sạch",
      location: "Khu A",
    });
    expect(real.tenantMode).toBe("real");
    expect(detectDemoDataLeak(real)).toEqual([]);
    expect(real.schedule.length).toBe(0);
    expect(real.checklist.length).toBe(42);
  });

  it("Đủ 30 biểu mẫu đầu ra, 10 bước Mindmap và chuẩn header ToWord (Ngay_NB vs Ngay_Noibo)", () => {
    expect(THIRTY_OUTPUT_FORMS.length).toBe(30);
    expect(MINDMAP_NODES.length).toBe(10);

    const demo = createDemoSeedState();
    expect(validateScheduleItems(demo.schedule)).toEqual([]);

    const wb = buildContractWorkbook("du_lieu_ghep_word", demo, false);
    const cvHeaders = XLSX.utils.sheet_to_json<string[]>(wb.Sheets["ListCVXD(ToWord)"], { header: 1 })[0];
    const htHeaders = XLSX.utils.sheet_to_json<string[]>(wb.Sheets["ListHTHM(ToWord)"], { header: 1 })[0];
    expect(cvHeaders).toContain("Ngay_NB");
    expect(htHeaders).toContain("Ngay_Noibo");
  });

  it("Bảo mật danh tính: Toàn bộ đơn vị, công trình và nhân sự Demo dùng danh tính giả định", () => {
    const demo = createDemoSeedState();
    expect(demo.project.project_code).toBe("DEMO-CT-001");
    expect(demo.project.location).toContain("Giả Định");
    expect(demo.partners.every((p) => p.name.includes("DEMO") && p.address.includes("Giả Định"))).toBe(true);
    expect(demo.partners.every((p) => p.representative.includes("(Demo)"))).toBe(true);
  });
});
