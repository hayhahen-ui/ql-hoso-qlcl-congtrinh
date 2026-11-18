import { AppTabId, QlclWorkspaceState } from "@/types/qlcl";

export interface MindmapNodeDef {
  id: string;
  step: number;
  phase: "Khởi tạo" | "Chuẩn bị" | "Thi công" | "Nghiệm thu" | "Hoàn công & Xuất";
  title: string;
  shortDesc: string;
  tabId: AppTabId;
  excelFiles: string[];
  legalBasis: string;
  inputsRequired: string[];
  outputsGenerated: string[];
  dependsOn: string[];
  x: number;
  y: number;
  accentColor: string;
}

export const MINDMAP_NODES: MindmapNodeDef[] = [
  {
    id: "step-1",
    step: 1,
    phase: "Khởi tạo",
    title: "1. Thông tin Công trình & Pháp lý NĐ 207",
    shortDesc: "Khai báo dự án, 5 bên ký, hợp đồng, khung giờ & phân loại chuyển tiếp Điều 52-53.",
    tabId: "project",
    excelFiles: ["cong_trinh.xlsx", "phap_ly_chuyen_tiep.xlsx"],
    legalBasis: "NĐ 207/2026 Điều 25–26, 52–53",
    inputsRequired: [
      "Mã & Tên công trình, gói thầu, địa điểm, ngày bàn giao/khởi công",
      "Danh sách 5 bên (CĐT, Thiết kế, TVGS, Nhà thầu, Phòng TN) & người ký",
      "Hình thức hợp đồng (Thường / EPC / Liên danh / Thầu phụ)",
      "Hồ sơ chuyển tiếp & diện kiểm tra cơ quan nhà nước",
    ],
    outputsGenerated: [
      "Header dùng chung cho 30 biểu mẫu",
      "Lệnh khởi công (Biểu 29) & Kiểm tra ĐK khởi công (Biểu 27)",
    ],
    dependsOn: [],
    x: 80,
    y: 90,
    accentColor: "#2563eb",
  },
  {
    id: "step-2",
    step: 2,
    phase: "Khởi tạo",
    title: "2. Danh mục Chuẩn & Định mức",
    shortDesc: "Kiểm tra/bổ sung mã công việc (MaCV), tiêu chuẩn (TCNT), phép thử (MaTN) & máy.",
    tabId: "catalogs",
    excelFiles: ["danh_muc.xlsx"],
    legalBasis: "TCVN hiện hành & Danh mục nội bộ",
    inputsRequired: [
      "Mã hiệu công việc & Tiêu chuẩn nghiệm thu mặc định (cần duyệt áp dụng)",
      "Danh mục loại kiểm tra (KT.00001..12) & Phép thử (VL/BT/HT)",
      "Danh mục thiết bị, máy móc thi công",
    ],
    outputsGenerated: [
      "Dropdown chuẩn hóa cho Nhật trình thi công",
      "Gợi ý tự động tiêu chuẩn & máy thi công cho Nhật ký",
    ],
    dependsOn: ["step-1"],
    x: 80,
    y: 290,
    accentColor: "#4f46e5",
  },
  {
    id: "step-3",
    step: 3,
    phase: "Chuẩn bị",
    title: "3. Vật liệu Đầu vào & Cấp phối BT",
    shortDesc: "Nhập lô vật liệu, CO/CQ/Hợp quy, thiết kế cấp phối & nghiệm thu trước sử dụng.",
    tabId: "materials",
    excelFiles: ["vat_lieu.xlsx", "cap_phoi.xlsx"],
    legalBasis: "NĐ 207/2026 Điều 14(5)–(8)",
    inputsRequired: [
      "Danh mục vật liệu & các Lô vật liệu nhập kho (mã lô, khối lượng, ngày nhận)",
      "Chứng chỉ chất lượng (CQ), xuất xứ (CO), chứng nhận hợp quy",
      "Thành phần cấp phối bê tông/vữa (XM, cát, đá, nước, phụ gia, độ sụt)",
    ],
    outputsGenerated: [
      "Biên bản nghiệm thu vật liệu đầu vào (Biểu 03)",
      "Chứng từ mục III.4 Phụ lục VII",
    ],
    dependsOn: ["step-1", "step-2"],
    x: 410,
    y: 90,
    accentColor: "#0891b2",
  },
  {
    id: "step-4",
    step: 4,
    phase: "Chuẩn bị",
    title: "4. Kế hoạch Thí nghiệm & Lấy mẫu",
    shortDesc: "Lập KHTN trình CĐT chấp thuận, ghi lấy mẫu hiện trường & cập nhật KQ R3/R7/R28.",
    tabId: "testing",
    excelFiles: ["ke_hoach_thi_nghiem.xlsx", "thi_nghiem.xlsx"],
    legalBasis: "NĐ 207 Điều 6, 15(3) & TT 32 Điều 2",
    inputsRequired: [
      "Kế hoạch thí nghiệm & số văn bản CĐT chấp thuận",
      "Phiếu lấy mẫu (ngày/giờ, khuôn, tổ mẫu, người giám sát)",
      "Phiếu kết quả thí nghiệm (R7/R28, số phiếu LAS-XD, kết luận)",
    ],
    outputsGenerated: [
      "Biên bản lấy mẫu VL / BT / Khác (Biểu 14, 15, 16)",
      "Chứng cứ mục III.5 & III.7 Phụ lục VII",
    ],
    dependsOn: ["step-2", "step-3"],
    x: 410,
    y: 290,
    accentColor: "#0d9488",
  },
  {
    id: "step-5",
    step: 5,
    phase: "Thi công",
    title: "5. Nhật trình Thi công Trung tâm",
    shortDesc: "Xương sống điều phối toàn dự án: cây hạng mục, ngày bắt đầu/kết thúc, nội bộ/YCNT.",
    tabId: "schedule",
    excelFiles: ["nhat_trinh.xlsx"],
    legalBasis: "Quản lý tiến độ & trình tự nghiệm thu",
    inputsRequired: [
      "Cây nhóm Hạng mục (section) & các Công việc (work)",
      "Mã công việc, vị trí, quan hệ tuần tự, ngày thực tế",
      "Gắn mã tiêu chuẩn, phép thử, cấp phối/hình ảnh đính kèm",
    ],
    outputsGenerated: [
      "Tiến độ thi công & căn cứ lập Phiếu yêu cầu nghiệm thu",
      "Nguồn tự động bung chi tiết công việc sang Nhật ký & Biên bản",
    ],
    dependsOn: ["step-2", "step-3", "step-4"],
    x: 740,
    y: 190,
    accentColor: "#ea580c",
  },
  {
    id: "step-6",
    step: 6,
    phase: "Thi công",
    title: "6. Kiểm tra KTHH & Hoàn công",
    shortDesc: "Đo kiểm kích thước hình học 5 nhóm (HM/Đắp/VK/CT/BT) có dung sai + Bản vẽ hoàn công.",
    tabId: "kthh",
    excelFiles: ["kiem_tra.xlsx", "ho_so_bo_sung.xlsx"],
    legalBasis: "NĐ 207 Phụ lục IIb (Việc bị che khuất)",
    inputsRequired: [
      "Phiếu kiểm tra KTHH theo 5 nhóm & ảnh hiện trường",
      "Thông số Thiết kế — Thực đo — Đơn vị — Dung sai được duyệt",
      "Sổ bản vẽ hoàn công (Revision, xác nhận trước khi che khuất)",
    ],
    outputsGenerated: [
      "8 Biên bản kiểm tra KTHH & Phiếu đổ BT (Biểu 06–13)",
      "Sổ bản vẽ hoàn công (Biểu 19) & mục III.2, X.4",
    ],
    dependsOn: ["step-5"],
    x: 1070,
    y: 90,
    accentColor: "#d97706",
  },
  {
    id: "step-7",
    step: 7,
    phase: "Thi công",
    title: "7. Thời tiết & Nhật ký Thi công",
    shortDesc: "Ghi thời tiết quan sát, nhân lực, máy móc, sự cố & kiến nghị từng ngày.",
    tabId: "diary",
    excelFiles: ["thoi_tiet_nhat_ky.xlsx"],
    legalBasis: "NĐ 207 Điều 15(13) & Phụ lục IIa",
    inputsRequired: [
      "Nhiệt độ, lượng mưa, xác nhận nghỉ/thi công theo ngày",
      "Nhân lực, thiết bị thực tế, diễn biến công việc & an toàn/vệ sinh",
      "Phát sinh, sự cố, kiến nghị của TVGS/CĐT (nếu có)",
    ],
    outputsGenerated: [
      "Nhật ký thi công (Biểu 17) & Nhật ký giám sát (Biểu 18)",
      "Hồ sơ mục III.16 Phụ lục VII",
    ],
    dependsOn: ["step-5"],
    x: 1070,
    y: 290,
    accentColor: "#65a30d",
  },
  {
    id: "step-8",
    step: 8,
    phase: "Nghiệm thu",
    title: "8. Nghiệm thu 24h & Sổ Cấp số",
    shortDesc: "Lập PYC, kiểm soát hạn 24h (Điều 22), cấp số bất biến & khóa Snapshot phát hành.",
    tabId: "acceptance",
    excelFiles: ["nghiem_thu_207.xlsx"],
    legalBasis: "NĐ 207 Điều 22, 23, 24",
    inputsRequired: [
      "Chọn công việc từ Nhật trình + Bằng chứng (KTHH, Mẫu TN, Lô VL)",
      "Giờ nhận PYC (SLA 24h), giờ kiểm tra, thành phần ký theo HĐ",
      "Phát hành qua Sổ cấp số bất biến (không nhảy số khi sửa ngày)",
    ],
    outputsGenerated: [
      "Phiếu YCNT, BB NTCV, BB Giai đoạn, BB Hoàn thành (Biểu 01–05)",
      "Sổ cấp số & Snapshot JSONB bất biến",
    ],
    dependsOn: ["step-6", "step-4", "step-3"],
    x: 1400,
    y: 140,
    accentColor: "#dc2626",
  },
  {
    id: "step-9",
    step: 9,
    phase: "Hoàn công & Xuất",
    title: "9. Danh mục PL VII (31) & PL X (11)",
    shortDesc: "Kiểm đếm 42 đầu mục hồ sơ hoàn thành & bàn giao bảo trì, gắn bản gốc/điện tử.",
    tabId: "dossier",
    excelFiles: ["danh_muc_ho_so.xlsx", "ho_so_bo_sung.xlsx"],
    legalBasis: "NĐ 207 Điều 28, 30 & Phụ lục VII, X",
    inputsRequired: [
      "Đánh giá 31 mục PL VII & 11 mục PL X (Áp dụng / Không áp dụng / Chờ)",
      "Liên kết mã tài liệu, loại bản (Gốc / Chính / Sao hợp pháp), nơi lưu",
      "Bàn giao hồ sơ, báo cáo sự cố (Điều 48), quan trắc (Điều 7)",
    ],
    outputsGenerated: [
      "Danh mục PL VII & PL X (Biểu 21, 22), BB Bàn giao (Biểu 23)",
      "Báo cáo hoàn thành PL VI (Biểu 20)",
    ],
    dependsOn: ["step-8", "step-7"],
    x: 1400,
    y: 340,
    accentColor: "#9333ea",
  },
  {
    id: "step-10",
    step: 10,
    phase: "Hoàn công & Xuất",
    title: "10. Xuất 30 Biểu mẫu A4 & 13 Excel",
    shortDesc: "In ấn/lưu PDF A4 toàn bộ 30 mẫu, xuất 13 file XLSX chuẩn & File ghép Word.",
    tabId: "forms",
    excelFiles: ["du_lieu_ghep_word_DEMO.xlsx", "13 file XLSX chuẩn"],
    legalBasis: "Điều 28(4) Lưu trữ & Trích xuất",
    inputsRequired: [
      "Chọn mẫu biểu trong 30 biểu mẫu tự động điền từ dữ liệu đã nhập",
      "Kiểm tra Watermark (Demo vs Dự án thật) trước khi in PDF",
      "Xuất gói 13 file XLSX hoặc File ghép Word (ListCVXD / ListHTHM)",
    ],
    outputsGenerated: [
      "30 Biểu mẫu A4 sẵn sàng in / xuất PDF",
      "13 file Excel hợp đồng dữ liệu & File trộn thư Word",
    ],
    dependsOn: ["step-9"],
    x: 1730,
    y: 230,
    accentColor: "#0f172a",
  },
];

export function computeMindmapNodeStatus(
  nodeId: string,
  state: QlclWorkspaceState
): { countLabel: string; percent: number; health: "ready" | "partial" | "empty" | "warning"; hint: string } {
  switch (nodeId) {
    case "step-1": {
      const hasProj = Boolean(state.project.project_code && state.project.project_name);
      const partnerCount = state.partners.length;
      const pct = hasProj ? Math.min(100, Math.round((partnerCount / 5) * 80 + 20)) : 0;
      return {
        countLabel: `${partnerCount} bên tham gia`,
        percent: pct,
        health: pct >= 80 ? "ready" : pct > 0 ? "partial" : "empty",
        hint: hasProj ? `Dự án ${state.project.project_code} (${state.legalProfile.requires_state_inspection})` : "Chưa nhập thông tin công trình",
      };
    }
    case "step-2": {
      const total = state.workCatalog.length + state.standards.length;
      return {
        countLabel: `${state.workCatalog.length} mã CV · ${state.standards.length} TCVN`,
        percent: total > 0 ? 100 : 0,
        health: total > 0 ? "ready" : "empty",
        hint: `${state.inspectionTypes.length} loại KT, ${state.testTypes.length} phép thử`,
      };
    }
    case "step-3": {
      const lots = state.materialLots.length;
      const accepted = state.materialLots.filter((l) => l.acceptance_status === "Đã nghiệm thu").length;
      const mixes = state.concreteMixes.length;
      const pct = lots === 0 && mixes === 0 ? 0 : Math.min(100, Math.round(((accepted / Math.max(1, lots)) * 70) + (mixes > 0 ? 30 : 0)));
      return {
        countLabel: `${lots} lô VL (${accepted} đã NT) · ${mixes} cấp phối`,
        percent: pct,
        health: lots === 0 ? "empty" : accepted < lots ? "partial" : "ready",
        hint: accepted < lots ? `Còn ${lots - accepted} lô chưa nghiệm thu đầu vào` : "Vật liệu & cấp phối sẵn sàng",
      };
    }
    case "step-4": {
      const plans = state.testPlans.length;
      const samples = state.testSamples.length;
      const results = state.testResults.length;
      const pct = samples === 0 ? (plans > 0 ? 30 : 0) : Math.min(100, Math.round((results / Math.max(1, samples)) * 100));
      return {
        countLabel: `${plans} KHTN · ${samples} mẫu · ${results} KQ`,
        percent: pct,
        health: samples === 0 ? "empty" : results < samples ? "partial" : "ready",
        hint: plans === 0 ? "Chưa lập kế hoạch thí nghiệm" : `${samples} mẫu đã lấy tại hiện trường`,
      };
    }
    case "step-5": {
      const works = state.schedule.filter((s) => s.row_type === "work").length;
      const sections = state.schedule.filter((s) => s.row_type === "section").length;
      return {
        countLabel: `${works} công việc · ${sections} nhóm`,
        percent: works > 0 ? 100 : 0,
        health: works > 0 ? "ready" : "empty",
        hint: works > 0 ? "Nhật trình đã có dòng công việc liên kết" : "Chưa nhập công việc vào Nhật trình",
      };
    }
    case "step-6": {
      const insp = state.inspections.length;
      const meas = state.measurements.length;
      const missingTol = state.measurements.filter((m) => m.tolerance === null).length;
      return {
        countLabel: `${insp} phiếu KT · ${meas} dòng đo · ${state.asBuiltDrawings.length} BVHC`,
        percent: insp === 0 ? 0 : missingTol > 0 ? 70 : 100,
        health: insp === 0 ? "empty" : missingTol > 0 ? "warning" : "ready",
        hint: missingTol > 0 ? `${missingTol} dòng đo chưa nhập dung sai (Chưa đánh giá)` : "Đủ bảng đo & bản vẽ hoàn công",
      };
    }
    case "step-7": {
      const days = state.weatherDays.length;
      const diaries = state.diaryEntries.length;
      return {
        countLabel: `${days} ngày thời tiết · ${diaries} nhật ký`,
        percent: diaries > 0 ? Math.min(100, Math.round((diaries / Math.max(1, days)) * 100)) : 0,
        health: diaries > 0 ? "ready" : "empty",
        hint: `${state.diaryEntries.filter((d) => d.status === "Đã xác nhận").length} ngày đã xác nhận`,
      };
    }
    case "step-8": {
      const total = state.acceptances.length;
      const issued = state.acceptances.filter((a) => a.status === "issued" || a.status === "signed").length;
      return {
        countLabel: `${total} biên bản (${issued} đã cấp số)`,
        percent: total > 0 ? Math.max(25, Math.round((issued / total) * 100)) : 0,
        health: total === 0 ? "empty" : issued === 0 ? "partial" : "ready",
        hint: `Sổ cấp số: ${state.numberSequences.reduce((acc, s) => acc + s.issued_records.length, 0)} số đã khóa`,
      };
    }
    case "step-9": {
      const total = state.checklist.length;
      const done = state.checklist.filter((c) => c.applicability !== "unknown").length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        countLabel: `${done}/${total} mục PL VII & X đã đánh giá`,
        percent: pct,
        health: done === 0 ? "empty" : done < total ? "partial" : "ready",
        hint: `Còn ${total - done} mục đang ở trạng thái Chờ đánh giá`,
      };
    }
    case "step-10": {
      const hasData = state.schedule.length > 0 || state.acceptances.length > 0;
      return {
        countLabel: "30 Biểu mẫu A4 · 13 XLSX",
        percent: hasData ? 100 : 20,
        health: hasData ? "ready" : "partial",
        hint: "Sẵn sàng xem trước, in PDF A4 & xuất Excel",
      };
    }
    default:
      return { countLabel: "0", percent: 0, health: "empty", hint: "" };
  }
}
