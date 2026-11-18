import { QlclWorkspaceState } from "@/types/qlcl";
import { evaluateMeasurement, formatDateVnText } from "@/lib/domain-rules";

export interface OutputFormMeta {
  no: number;
  code: string;
  title: string;
  category: "Nghiệm thu (NĐ 207)" | "Kiểm tra & KTHH" | "Lấy mẫu & Thí nghiệm" | "Nhật ký & Hoàn công" | "Hồ sơ & Pháp lý";
  legalRef: string;
  description: string;
}

export const THIRTY_OUTPUT_FORMS: OutputFormMeta[] = [
  { no: 1, code: "PYC-NTCV", title: "Phiếu yêu cầu nghiệm thu công việc", category: "Nghiệm thu (NĐ 207)", legalRef: "NĐ 207 Điều 22(3)", description: "Ghi nhận thời điểm nhận đề nghị để kiểm soát hạn 24 giờ." },
  { no: 2, code: "BB-NTCV", title: "Biên bản nghiệm thu công việc xây dựng", category: "Nghiệm thu (NĐ 207)", legalRef: "NĐ 207 Điều 22(1),(4)-(8)", description: "Nghiệm thu 1 hoặc nhiều công việc cùng hạng mục, kèm thành phần ký & kết luận." },
  { no: 3, code: "BB-NTVL", title: "Biên bản nghiệm thu vật liệu đầu vào", category: "Nghiệm thu (NĐ 207)", legalRef: "NĐ 207 Điều 14(5)-(8)", description: "Nghiệm thu lô vật liệu, CO/CQ, chứng nhận hợp quy trước khi đưa vào sử dụng." },
  { no: 4, code: "BB-NTGD", title: "Biên bản nghiệm thu giai đoạn hoặc bộ phận", category: "Nghiệm thu (NĐ 207)", legalRef: "NĐ 207 Điều 23", description: "Nghiệm thu giai đoạn thi công hoặc bộ phận công trình theo thỏa thuận." },
  { no: 5, code: "BB-NTHT", title: "Biên bản nghiệm thu hoàn thành hạng mục / công trình", category: "Nghiệm thu (NĐ 207)", legalRef: "NĐ 207 Điều 24(1)-(6)", description: "Gồm điều kiện nghiệm thu, PCCC, tồn tại (nếu có điều kiện) và bảo hành." },
  { no: 6, code: "BBKT-HM", title: "Biên bản kiểm tra hố móng", category: "Kiểm tra & KTHH", legalRef: "TCVN 4447:2012", description: "Kiểm tra kích thước, cao độ đáy móng, địa chất nền hố móng." },
  { no: 7, code: "BBKT-DAP", title: "Biên bản kiểm tra đắp đất / nền đường", category: "Kiểm tra & KTHH", legalRef: "TCVN 4447:2012", description: "Kiểm tra lớp đắp, cao độ trái/tim/phải, độ chặt." },
  { no: 8, code: "BBKT-VK", title: "Biên bản kiểm tra lắp đặt ván khuôn", category: "Kiểm tra & KTHH", legalRef: "TCVN 4453:1995", description: "Kiểm tra kích thước hình học, độ ổn định, hệ giằng chống ván khuôn." },
  { no: 9, code: "BBKT-CT", title: "Biên bản kiểm tra gia công lắp dựng cốt thép", category: "Kiểm tra & KTHH", legalRef: "TCVN 4453:1995", description: "Kiểm tra chủng loại, đường kính, bước thép, lớp bê tông bảo vệ." },
  { no: 10, code: "BBKT-DKDBT", title: "Biên bản kiểm tra điều kiện trước đổ bê tông", category: "Kiểm tra & KTHH", legalRef: "TCVN 4453:1995", description: "Kiểm tra tổng hợp ván khuôn, cốt thép, vệ sinh, nhân lực, thiết bị trước đổ." },
  { no: 11, code: "PHIEU-BT", title: "Phiếu kiểm tra & theo dõi đổ bê tông", category: "Kiểm tra & KTHH", legalRef: "TCVN 4453:1995", description: "Theo dõi mác thiết kế, cấp phối, độ sụt, khối lượng và nhiệt độ đổ." },
  { no: 12, code: "BBKT-TVK", title: "Biên bản kiểm tra bề mặt bê tông sau tháo ván khuôn", category: "Kiểm tra & KTHH", legalRef: "TCVN 4453:1995", description: "Kiểm tra cường độ đạt tuổi tháo dỡ và khuyết tật bề mặt sau tháo khuôn." },
  { no: 13, code: "BBKT-KTHH", title: "Biên bản kiểm tra kích thước hình học bê tông", category: "Kiểm tra & KTHH", legalRef: "TCVN 4453:1995", description: "Đối chiếu kích thước thực đo với thiết kế và dung sai cho phép." },
  { no: 14, code: "BBLM-VL", title: "Biên bản lấy mẫu vật liệu", category: "Lấy mẫu & Thí nghiệm", legalRef: "NĐ 207 Điều 14 & TT 32", description: "Lấy mẫu vật liệu đầu vào (cát, đá, thép, gạch, xi măng) có TVGS chứng kiến." },
  { no: 15, code: "BBLM-BT", title: "Biên bản lấy mẫu bê tông / vữa tại hiện trường", category: "Lấy mẫu & Thí nghiệm", legalRef: "TCVN 3105 / TT 32", description: "Ghi nhận tổ mẫu, kích thước khuôn 150x150x150, độ sụt và giờ lấy mẫu." },
  { no: 16, code: "BBLM-KHAC", title: "Biên bản lấy mẫu thí nghiệm khác (độ chặt, PDA...)", category: "Lấy mẫu & Thí nghiệm", legalRef: "TT 32/2026/TT-BXD", description: "Lấy mẫu hiện trường các phép thử chuyên ngành khác." },
  { no: 17, code: "NK-TC", title: "Nhật ký thi công công trình", category: "Nhật ký & Hoàn công", legalRef: "NĐ 207 Điều 15(13) & PL IIa", description: "Ghi chép hàng ngày thời tiết, nhân lực, máy thi công, nội dung và sự cố." },
  { no: 18, code: "NK-GS", title: "Nhật ký giám sát thi công xây dựng", category: "Nhật ký & Hoàn công", legalRef: "NĐ 207 Phụ lục IIa", description: "Ý kiến giám sát, kiểm tra chất lượng và kiến nghị hàng ngày của TVGS." },
  { no: 19, code: "SO-BVHC", title: "Sổ bản vẽ hoàn công", category: "Nhật ký & Hoàn công", legalRef: "NĐ 207 Phụ lục IIb", description: "Danh mục bản vẽ hoàn công, thông số thực tế trước che khuất, revision và chữ ký." },
  { no: 20, code: "BC-PLVI", title: "Báo cáo hoàn thành thi công (Phụ lục VI)", category: "Hồ sơ & Pháp lý", legalRef: "NĐ 207 Điều 27(4) & PL VI", description: "Báo cáo gửi cơ quan chuyên môn về xây dựng khi thuộc diện kiểm tra." },
  { no: 21, code: "DM-PLVII", title: "Danh mục hồ sơ hoàn thành công trình (Phụ lục VII)", category: "Hồ sơ & Pháp lý", legalRef: "NĐ 207 Điều 28 & PL VII", description: "Tổng hợp 31 đầu mục I.1–III.16 kèm loại bản gốc/điện tử." },
  { no: 22, code: "DM-PLX", title: "Danh mục hồ sơ phục vụ quản lý, sử dụng (Phụ lục X)", category: "Hồ sơ & Pháp lý", legalRef: "NĐ 207 Điều 30 & PL X", description: "Tổng hợp 11 đầu mục X.1–X.11 bàn giao vận hành, bảo trì." },
  { no: 23, code: "BB-BGHS", title: "Biên bản bàn giao hồ sơ hoàn thành / tài liệu vận hành", category: "Hồ sơ & Pháp lý", legalRef: "NĐ 207 Điều 30", description: "Xác nhận bàn giao hồ sơ giữa Nhà thầu, Chủ đầu tư và Đơn vị vận hành." },
  { no: 24, code: "BC-SUCO", title: "Báo cáo sự cố / tồn tại kỹ thuật công trình", category: "Nhật ký & Hoàn công", legalRef: "NĐ 207 Điều 45–48", description: "Ghi nhận diễn biến, hiện trường, biện pháp xử lý sự cố (nếu phát sinh)." },
  { no: 25, code: "BB-XLKT", title: "Biên bản xử lý kỹ thuật hiện trường", category: "Nhật ký & Hoàn công", legalRef: "NĐ 207 Điều 15 & 48", description: "Thống nhất giải pháp xử lý sai lệch kỹ thuật giữa CĐT, Thiết kế, TVGS, Nhà thầu." },
  { no: 26, code: "BB-MOC", title: "Biên bản giao nhận tim, mốc và mặt bằng xây dựng", category: "Hồ sơ & Pháp lý", legalRef: "NĐ 207 Điều 13–15", description: "Bàn giao hệ tọa độ, cao độ chuẩn và ranh giới mặt bằng thi công." },
  { no: 27, code: "BB-DKTC", title: "Biên bản kiểm tra điều kiện khởi công xây dựng", category: "Hồ sơ & Pháp lý", legalRef: "NĐ 207 Điều 13", description: "Kiểm tra mặt bằng, GPXD, bản vẽ, nhân lực, thiết bị, an toàn trước khởi công." },
  { no: 28, code: "BB-PTN", title: "Biên bản kiểm tra năng lực phòng thí nghiệm & nhân lực", category: "Lấy mẫu & Thí nghiệm", legalRef: "NĐ 207 Điều 6", description: "Xác minh giấy chứng nhận LAS-XD, phạm vi phép thử và hiệu chuẩn thiết bị." },
  { no: 29, code: "LENH-KC", title: "Lệnh khởi công xây dựng công trình", category: "Hồ sơ & Pháp lý", legalRef: "Luật XD 135/2025 & NĐ 207", description: "Thông báo/Lệnh khởi công chính thức theo hợp đồng xây dựng." },
  { no: 30, code: "BIA-HOSO", title: "Bìa hồ sơ hoàn công / Bìa nhật ký thi công", category: "Hồ sơ & Pháp lý", legalRef: "Quy chuẩn lưu trữ hồ sơ", description: "Trang bìa tập hồ sơ theo hạng mục, gói thầu và năm phát hành." },
];

export interface RenderedFormContent {
  docCode: string;
  title: string;
  subtitle: string;
  dateLine: string;
  rows: Array<{ label: string; value: string }>;
  tableHeaders?: string[];
  tableRows?: string[][];
  conclusion: string;
  signers: Array<{ role: string; name: string; position: string }>;
}

export function buildLiveFormContent(formNo: number, state: QlclWorkspaceState): RenderedFormContent {
  const contractor = state.partners.find((p) => p.role === "Nhà thầu thi công");
  const investor = state.partners.find((p) => p.role === "Chủ đầu tư");
  const tvgs = state.partners.find((p) => p.role === "Tư vấn giám sát");
  const lab = state.partners.find((p) => p.role === "Đơn vị thí nghiệm");
  const design = state.partners.find((p) => p.role === "Đơn vị thiết kế");

  const firstAcc = state.acceptances.find((a) => a.kind === "Công việc") ?? state.acceptances[0];
  const matAcc = state.acceptances.find((a) => a.kind === "Vật liệu");
  const stageAcc = state.acceptances.find((a) => a.kind === "Giai đoạn");
  const finalAcc = state.acceptances.find((a) => a.kind.includes("Hoàn thành"));
  const firstWork = state.schedule.find((s) => s.row_type === "work");
  const firstLot = state.materialLots[0];
  const firstMat = state.materials.find((m) => m.material_code === firstLot?.material_code);
  const firstMix = state.concreteMixes[0];
  const firstSample = state.testSamples[0];
  const firstDiary = state.diaryEntries[0];
  const firstDrawing = state.asBuiltDrawings[0];
  const firstHandover = state.handovers[0];
  const firstIncident = state.incidents[0];

  const commonSigners = [
    { role: "ĐẠI DIỆN CHỦ ĐẦU TƯ", name: investor?.representative || "(Chưa nhập)", position: investor?.position || "" },
    { role: "TƯ VẤN GIÁM SÁT", name: tvgs?.representative || "(Chưa nhập)", position: tvgs?.position || "" },
    { role: "NHÀ THẦU THI CÔNG", name: contractor?.representative || "(Chưa nhập)", position: contractor?.position || "" },
  ];

  const place = state.project.place_name || ".....";

  switch (formNo) {
    case 1:
      return {
        docCode: firstAcc ? `PYC-${firstAcc.record_id}` : "PYC-CHUA-TAO",
        title: "PHIẾU YÊU CẦU NGHIỆM THU CÔNG VIỆC XÂY DỰNG",
        subtitle: "Căn cứ Điều 22 khoản 3 Nghị định 207/2026/NĐ-CP (Thời hạn phản hồi <= 24 giờ)",
        dateLine: `${place}, ${formatDateVnText(firstAcc?.request_received_at || state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name || "(Chưa nhập)" },
          { label: "Gói thầu / Hạng mục", value: `${state.project.package} — ${state.project.category_name}` },
          { label: "Công việc đề nghị nghiệm thu", value: firstWork ? `${firstWork.record_key}: ${firstWork.description}` : "(Chưa có công việc)" },
          { label: "Vị trí / Khối lượng", value: firstAcc?.location || firstWork?.location || "(Chưa nhập)" },
          { label: "Thời điểm nhận đề nghị (SLA 24h)", value: firstAcc?.request_received_at || "(Chưa ghi nhận giờ nhận)" },
          { label: "Thời gian dự kiến nghiệm thu", value: firstAcc?.inspection_at || "(Chưa nhập)" },
        ],
        conclusion: "Kính đề nghị Tư vấn giám sát tổ chức kiểm tra, nghiệm thu công việc nêu trên trong thời hạn quy định (<= 24 giờ kể từ khi nhận phiếu).",
        signers: [
          { role: "NGƯỜI LẬP ĐỀ NGHỊ (NHÀ THẦU)", name: contractor?.representative || "(Chưa nhập)", position: contractor?.position || "" },
          { role: "NGƯỜI NHẬN ĐỀ NGHỊ (TVGS)", name: tvgs?.representative || "(Chưa nhập)", position: tvgs?.position || "" },
        ],
      };

    case 2:
      return {
        docCode: firstAcc?.issued_no || firstAcc?.record_id || "NTCV-NHAP",
        title: "BIÊN BẢN NGHIỆM THU CÔNG VIỆC XÂY DỰNG",
        subtitle: `Số biên bản: ${firstAcc?.issued_no || "Chưa cấp số (Bản nháp)"} · ${firstAcc?.legal_profile || "NĐ 207/2026/NĐ-CP"}`,
        dateLine: `${place}, ${formatDateVnText(firstAcc?.inspection_at || state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name || "(Chưa nhập)" },
          { label: "Đối tượng nghiệm thu", value: `${firstAcc?.work_ids || ""} — ${firstWork?.description || "(Chưa chọn công việc)"}` },
          { label: "Địa điểm / Vị trí", value: firstAcc?.location || "(Chưa nhập)" },
          { label: "Thời gian bắt đầu / nhận PYC", value: `${firstAcc?.request_received_at || "..."} → Kiểm tra: ${firstAcc?.inspection_at || "..."}` },
          { label: "Tài liệu căn cứ & minh chứng", value: firstAcc?.evidence_refs || "(Chưa đính kèm)" },
          { label: "Tiêu chuẩn áp dụng", value: firstWork?.standard_codes || "(Chưa gán tiêu chuẩn)" },
        ],
        conclusion: firstAcc?.conclusion || "Chưa có kết luận nghiệm thu.",
        signers: commonSigners.slice(1),
      };

    case 3:
      return {
        docCode: matAcc?.issued_no || matAcc?.record_id || "NTVL-NHAP",
        title: "BIÊN BẢN NGHIỆM THU VẬT LIỆU ĐẦU VÀO TRƯỚC KHI SỬ DỤNG",
        subtitle: "Căn cứ Điều 14 khoản 5–8 Nghị định 207/2026/NĐ-CP",
        dateLine: `${place}, ${formatDateVnText(firstLot?.received_date || state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name || "(Chưa nhập)" },
          { label: "Tên / Chủng loại vật liệu", value: firstMat ? `${firstMat.material_code} — ${firstMat.name}` : "(Chưa có vật liệu)" },
          { label: "Mã lô & Số lượng", value: firstLot ? `${firstLot.lot_code} (${firstLot.quantity} ${firstLot.unit})` : "(Chưa có lô)" },
          { label: "Nguồn gốc / Nhà cung cấp", value: firstMat ? `${firstMat.source} — ${firstMat.supplier}` : "(Chưa nhập)" },
          { label: "Hồ sơ CO / CQ / Hợp quy", value: firstLot ? `${firstLot.document_ref} (CO/CQ: ${firstLot.has_co_cq ? "Có" : "Chưa có"})` : "(Chưa nhập)" },
          { label: "Trạng thái kiểm tra", value: firstLot?.acceptance_status || "Chưa kiểm tra" },
        ],
        conclusion: matAcc?.conclusion || firstLot?.inspector_note || "Chờ người giám sát của Chủ đầu tư nghiệm thu trước khi đưa vào sử dụng.",
        signers: commonSigners.slice(1),
      };

    case 4:
      return {
        docCode: stageAcc?.issued_no || stageAcc?.record_id || "NTGD-NHAP",
        title: "BIÊN BẢN NGHIỆM THU GIAI ĐOẠN / BỘ PHẬN CÔNG TRÌNH",
        subtitle: "Căn cứ Điều 23 Nghị định 207/2026/NĐ-CP",
        dateLine: `${place}, ${formatDateVnText(stageAcc?.inspection_at || state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name || "(Chưa nhập)" },
          { label: "Giai đoạn / Bộ phận", value: stageAcc?.location || "(Chưa xác định)" },
          { label: "Danh sách công việc thành phần", value: stageAcc?.work_ids || "(Chưa liên kết)" },
          { label: "Hồ sơ căn cứ", value: stageAcc?.evidence_refs || "(Chưa liên kết)" },
        ],
        conclusion: stageAcc?.conclusion || "Chờ hoàn tất đầy đủ biên bản nghiệm thu công việc thành phần.",
        signers: commonSigners,
      };

    case 5:
      return {
        docCode: finalAcc?.issued_no || finalAcc?.record_id || "NTHT-NHAP",
        title: "BIÊN BẢN NGHIỆM THU HOÀN THÀNH HẠNG MỤC / CÔNG TRÌNH",
        subtitle: "Căn cứ Điều 24 khoản 1–6 Nghị định 207/2026/NĐ-CP",
        dateLine: `${place}, ${formatDateVnText(finalAcc?.inspection_at || state.project.end_date)}`,
        rows: [
          { label: "Công trình / Hạng mục", value: `${state.project.project_name} — ${state.project.category_name}` },
          { label: "Chủ đầu tư", value: investor?.name || "(Chưa nhập)" },
          { label: "Tư vấn thiết kế", value: design?.name || "(Chưa nhập)" },
          { label: "Đánh giá PCCC & chuyên ngành", value: finalAcc?.fire_safety_note || "Cần xác minh theo quy định" },
          { label: "Tồn tại cần khắc phục (nếu có điều kiện)", value: finalAcc?.defects || "Không có / Chưa xác minh" },
          { label: "Thời hạn bảo hành công trình", value: finalAcc?.warranty_months ? `${finalAcc.warranty_months} tháng` : "Chưa nhập" },
        ],
        conclusion: finalAcc?.conclusion || "Chưa đủ điều kiện kết luận nghiệm thu hoàn thành.",
        signers: [
          ...commonSigners,
          { role: "TƯ VẤN THIẾT KẾ", name: design?.representative || "(Chưa nhập)", position: design?.position || "" },
        ],
      };

    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 12:
    case 13: {
      const groupFilterMap: Record<number, string> = { 6: "HM", 7: "DAP", 8: "CP", 9: "CT", 10: "BT", 12: "BT", 13: "BT" };
      const targetGroup = groupFilterMap[formNo];
      const insp = state.inspections.find((i) => i.kthh_group === targetGroup) ?? state.inspections[0];
      const meas = state.measurements.filter((m) => m.inspection_key === insp?.inspection_key);
      const formMeta = THIRTY_OUTPUT_FORMS.find((f) => f.no === formNo)!;
      return {
        docCode: insp?.inspection_key || formMeta.code,
        title: formMeta.title.toUpperCase(),
        subtitle: `Loại kiểm tra: ${insp?.inspection_type || formMeta.code} · Căn cứ: ${formMeta.legalRef}`,
        dateLine: `${place}, ${formatDateVnText(insp?.date || state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name || "(Chưa nhập)" },
          { label: "Hạng mục / Vị trí kiểm tra", value: insp?.location || "(Chưa nhập)" },
          { label: "Công việc liên kết", value: insp?.work_record_key || "(Chưa liên kết)" },
          { label: "Trạng thái quy tắc dung sai", value: insp?.rule_approved ? "Quy tắc/TCVN đã phê duyệt" : "Chưa phê duyệt quy tắc — Không tự đánh giá Đạt" },
        ],
        tableHeaders: ["STT", "Chỉ tiêu đo kiểm", "Thiết kế", "Thực đo", "Đơn vị", "Sai lệch", "Dung sai", "Đánh giá"],
        tableRows:
          meas.length > 0
            ? meas.map((m) => {
                const ev = evaluateMeasurement(m, Boolean(insp?.rule_approved));
                return [
                  String(m.line_no),
                  m.measurement_name,
                  String(m.design_value),
                  String(m.actual_value),
                  m.unit,
                  ev.deviation >= 0 ? `+${ev.deviation}` : String(ev.deviation),
                  m.tolerance !== null ? `±${m.tolerance}` : "Chưa nhập",
                  ev.status,
                ];
              })
            : [["1", "Chưa có dòng dữ liệu đo cho nhóm này", "-", "-", "-", "-", "-", "Chờ nhập"]],
        conclusion: insp?.result || "Chờ người có thẩm quyền kiểm tra và xác nhận.",
        signers: commonSigners.slice(1),
      };
    }

    case 11:
      return {
        docCode: firstMix?.mix_code || "PHIEU-BT",
        title: "PHIẾU KIỂM TRA & THEO DÕI CÔNG TÁC ĐỔ BÊ TÔNG",
        subtitle: "Căn cứ TCVN 4453:1995 & Hồ sơ cấp phối thiết kế",
        dateLine: `${place}, ${formatDateVnText(firstSample?.sample_date || state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name },
          { label: "Mác bê tông & Cấp phối", value: firstMix ? `${firstMix.mix_code} (${firstMix.grade} — ${firstMix.aggregate})` : "(Chưa nhập)" },
          { label: "Thành phần 1 m3 (XM / Cát / Đá / Nước)", value: firstMix ? `${firstMix.cement} kg / ${firstMix.sand} kg / ${firstMix.stone} kg / ${firstMix.water} lít` : "-" },
          { label: "Độ sụt thiết kế / đo thực tế", value: firstMix ? `${firstMix.slump} cm (Độ sụt khi đổ: ${firstSample?.slump ?? "..."} cm)` : "-" },
          { label: "Số phiếu cấp phối", value: firstMix?.design_slip || "(Chưa nhập)" },
        ],
        conclusion: "Độ sụt và thành phần cấp phối đối chiếu đúng phiếu thiết kế được duyệt tại hiện trường.",
        signers: commonSigners.slice(1),
      };

    case 14:
    case 15:
    case 16: {
      const grp = formNo === 14 ? "VL" : formNo === 15 ? "BT" : "HT";
      const smp = state.testSamples.find((s) => s.sample_group === grp) ?? state.testSamples[0];
      const resList = state.testResults.filter((r) => r.sample_key === smp?.sample_key);
      const formMeta = THIRTY_OUTPUT_FORMS.find((f) => f.no === formNo)!;
      return {
        docCode: smp?.sample_key || formMeta.code,
        title: formMeta.title.toUpperCase(),
        subtitle: `Phòng thí nghiệm: ${lab?.name || "(Chưa nhập)"} · ${formMeta.legalRef}`,
        dateLine: `${place}, ${formatDateVnText(smp?.sample_date)}`,
        rows: [
          { label: "Mã mẫu / Công việc", value: smp ? `${smp.sample_key} (CV: ${smp.work_record_key})` : "(Chưa có mẫu)" },
          { label: "Loại mẫu / Phép thử", value: smp ? `${smp.sample_type} (${smp.test_code})` : "-" },
          { label: "Thời điểm lấy mẫu", value: smp ? `${smp.sample_date} lúc ${smp.sample_time}` : "-" },
          { label: "Kích thước khuôn / Số lượng", value: smp?.mould || "(Chưa nhập)" },
          { label: "Cán bộ giám sát lấy mẫu", value: smp?.supervisor_name || "(Chưa nhập)" },
        ],
        tableHeaders: ["Chỉ tiêu thí nghiệm", "Giá trị", "Đơn vị", "Số phiếu PTN", "Ngày trả KQ", "Kết luận"],
        tableRows:
          resList.length > 0
            ? resList.map((r) => [r.criterion, String(r.value), r.unit, r.lab_ref, r.result_date, r.conclusion])
            : [["Chưa có kết quả trả về từ Phòng thí nghiệm", "-", "-", "-", "-", "Chờ KQ"]],
        conclusion: "Mẫu đã được niêm phong và bàn giao về Phòng thí nghiệm có năng lực hợp lệ để thử nghiệm.",
        signers: [
          { role: "ĐƠN VỊ THÍ NGHIỆM", name: lab?.representative || "(Chưa nhập)", position: lab?.position || "" },
          ...commonSigners.slice(1),
        ],
      };
    }

    case 17:
    case 18: {
      const isGs = formNo === 18;
      return {
        docCode: isGs ? "NKGS-2026" : "NKTC-2026",
        title: isGs ? "NHẬT KÝ GIÁM SÁT THI CÔNG XÂY DỰNG" : "NHẬT KÝ THI CÔNG XÂY DỰNG CÔNG TRÌNH",
        subtitle: "Theo Phụ lục IIa Nghị định 207/2026/NĐ-CP",
        dateLine: `${place}, ${formatDateVnText(firstDiary?.date || state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name },
          { label: "Gói thầu / Hợp đồng", value: `${state.project.package} · HĐ: ${state.project.contract_no}` },
          { label: "Số ngày đã ghi nhận", value: `${state.diaryEntries.length} ngày thi công / ${state.weatherDays.length} ngày thời tiết` },
        ],
        tableHeaders: ["Ngày", "Công việc & Diễn biến", "Thiết bị / Nhân lực", "Thời tiết (Mưa)", "Sự cố / An toàn", "Trạng thái"],
        tableRows: state.diaryEntries.map((d) => {
          const w = state.weatherDays.find((wd) => wd.date === d.date);
          return [
            d.date,
            `${d.work_record_key}: ${d.description}`,
            `${d.equipment} | ${d.personnel}`,
            w ? `${w.high}°/${w.low}°C (${w.rain_mm}mm)` : "Chưa ghi",
            d.incidents_or_notes,
            d.status,
          ];
        }),
        conclusion: "Nhật ký phản ánh trung thực diễn biến hiện trường và có xác nhận hàng ngày giữa Nhà thầu & TVGS.",
        signers: commonSigners.slice(1),
      };
    }

    case 19:
      return {
        docCode: firstDrawing?.drawing_id || "BVHC-001",
        title: "SỔ DANH MỤC & BẢN VẼ HOÀN CÔNG CÔNG TRÌNH",
        subtitle: "Theo Phụ lục IIb Nghị định 207/2026/NĐ-CP",
        dateLine: `${place}, ${formatDateVnText(state.project.end_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name },
          { label: "Tổng số bản vẽ hoàn công", value: `${state.asBuiltDrawings.length} bản vẽ` },
        ],
        tableHeaders: ["Mã BV", "Tên bản vẽ hoàn công", "Công việc", "Rev", "KTHH tham chiếu", "Che khuất", "Người ký", "Trạng thái"],
        tableRows: state.asBuiltDrawings.map((d) => [
          d.drawing_id,
          d.name,
          d.work_record_key,
          `R${d.revision}`,
          d.actual_measurement_ref,
          d.is_concealed_work ? "Có (Trước che khuất)" : "Không",
          d.signer || "Chờ ký",
          d.status,
        ]),
        conclusion: "Các bộ phận bị che khuất đã được đo đạc thông số thực tế và lập bản vẽ hoàn công trước khi triển khai công việc tiếp theo.",
        signers: commonSigners.slice(1),
      };

    case 20:
      return {
        docCode: "BC-PLVI-207",
        title: "BÁO CÁO HOÀN THÀNH THI CÔNG XÂY DỰNG (PHỤ LỤC VI)",
        subtitle: "Gửi cơ quan chuyên môn về xây dựng theo Điều 27(4) NĐ 207/2026/NĐ-CP",
        dateLine: `${place}, ${formatDateVnText(state.project.end_date)}`,
        rows: [
          { label: "Tên công trình / Gói thầu", value: `${state.project.project_name} (${state.project.project_code})` },
          { label: "Cơ quan kiểm tra dự kiến", value: state.legalProfile.authority || "(Chưa xác định)" },
          { label: "Diện kiểm tra nhà nước", value: state.legalProfile.requires_state_inspection },
          { label: "Chủ đầu tư / Nhà thầu / TVGS", value: `${investor?.name || ""} | ${contractor?.name || ""} | ${tvgs?.name || ""}` },
          { label: "Đánh giá chất lượng & PCCC", value: finalAcc?.fire_safety_note || "Chờ hoàn tất kiểm tra chuyên ngành" },
        ],
        conclusion: "Đính kèm danh mục hồ sơ theo Phụ lục VII phục vụ kiểm tra công tác nghiệm thu hoàn thành.",
        signers: [commonSigners[0]],
      };

    case 21:
    case 22: {
      const isX = formNo === 22;
      const items = state.checklist.filter((c) => c.annex === (isX ? "X" : "VII"));
      return {
        docCode: isX ? "DM-PLX" : "DM-PLVII",
        title: isX
          ? "DANH MỤC HỒ SƠ PHỤC VỤ QUẢN LÝ, SỬ DỤNG & BẢO TRÌ (PHỤ LỤC X)"
          : "DANH MỤC HỒ SƠ HOÀN THÀNH CÔNG TRÌNH (PHỤ LỤC VII)",
        subtitle: `Tổng số: ${items.length} đầu mục theo Nghị định 207/2026/NĐ-CP`,
        dateLine: `${place}, ${formatDateVnText(state.project.end_date)}`,
        rows: [{ label: "Công trình", value: `${state.project.project_code} — ${state.project.project_name}` }],
        tableHeaders: ["Mã", "Tên đầu mục hồ sơ", "Áp dụng", "Tài liệu dẫn chiếu", "Loại bản (Điều 28.4)", "Trạng thái"],
        tableRows: items.map((c) => [
          c.checklist_id,
          c.checklist_name,
          c.applicability === "applicable" ? "Áp dụng" : c.applicability === "not_applicable" ? "Không áp dụng" : "Chưa xác định",
          c.document_ref || "(Trống)",
          c.original_type,
          c.status === "accepted" ? "Đã duyệt" : c.status === "in_review" ? "Đang rà soát" : "Thiếu chứng cứ",
        ]),
        conclusion: "Các mục đánh dấu 'Không áp dụng' phải có căn cứ và xác nhận của người có thẩm quyền.",
        signers: commonSigners,
      };
    }

    case 23:
      return {
        docCode: firstHandover?.handover_id || "BB-BGHS",
        title: "BIÊN BẢN BÀN GIAO HỒ SƠ HOÀN THÀNH & TÀI LIỆU VẬN HÀNH",
        subtitle: "Căn cứ Điều 30 Nghị định 207/2026/NĐ-CP & Phụ lục X",
        dateLine: `${place}, ${formatDateVnText(firstHandover?.handover_date || state.project.end_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name },
          { label: "Phạm vi bàn giao", value: firstHandover?.scope_id || state.project.category_name },
          { label: "Bên giao / Bên nhận", value: `${contractor?.name || "..."} → ${firstHandover?.receiver || "(Chưa nhập người nhận)"}` },
          { label: "Tài liệu bàn giao", value: firstHandover?.file_refs || "Bộ Phụ lục X (11 đầu mục)" },
        ],
        conclusion: firstHandover?.status || "Chờ xác nhận ký bàn giao đầy đủ.",
        signers: commonSigners,
      };

    case 24:
    case 25:
      return {
        docCode: firstIncident?.incident_id || "XLKT-001",
        title: formNo === 24 ? "BÁO CÁO SỰ CỐ / TỒN TẠI KỸ THUẬT CÔNG TRÌNH" : "BIÊN BẢN XỬ LÝ KỸ THUẬT HIỆN TRƯỜNG",
        subtitle: "Căn cứ Điều 45–48 Nghị định 207/2026/NĐ-CP",
        dateLine: `${place}, ${formatDateVnText(firstIncident?.time || state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: state.project.project_name },
          { label: "Công việc liên quan", value: firstIncident?.work_record_key || "(Không phát sinh)" },
          { label: "Thời điểm ghi nhận", value: firstIncident?.time || "-" },
          { label: "Mô tả diễn biến & giải pháp", value: firstIncident?.description || "Chưa ghi nhận sự cố phát sinh." },
          { label: "Minh chứng kèm theo", value: firstIncident?.evidence_refs || "-" },
        ],
        conclusion: firstIncident?.status || "Bảo toàn hồ sơ hiện trường và thực hiện khắc phục theo quy định.",
        signers: [
          ...commonSigners,
          { role: "TƯ VẤN THIẾT KẾ", name: design?.representative || "(Chưa nhập)", position: design?.position || "" },
        ],
      };

    default: {
      const meta = THIRTY_OUTPUT_FORMS.find((f) => f.no === formNo)!;
      return {
        docCode: `${meta.code}-001`,
        title: meta.title.toUpperCase(),
        subtitle: `Căn cứ: ${meta.legalRef}`,
        dateLine: `${place}, ${formatDateVnText(state.project.start_date)}`,
        rows: [
          { label: "Công trình", value: `${state.project.project_code} — ${state.project.project_name}` },
          { label: "Gói thầu / Hạng mục", value: `${state.project.package} / ${state.project.category_name}` },
          { label: "Địa điểm xây dựng", value: state.project.location },
          { label: "Hợp đồng xây dựng", value: state.project.contract_no },
          { label: "Ngày bàn giao mặt bằng / Khởi công", value: `${state.project.handover_date || "..."} / ${state.project.start_date || "..."}` },
          { label: "Đơn vị thí nghiệm (LAS-XD)", value: `${lab?.name || "(Chưa nhập)"} (${lab?.license_no || "Chờ GCN"})` },
          { label: "Nội dung chi tiết mẫu", value: meta.description },
        ],
        conclusion: "Hồ sơ được lập đúng trình tự quy định của Nghị định 207/2026/NĐ-CP và Thông tư 32/2026/TT-BXD.",
        signers: commonSigners,
      };
    }
  }
}
