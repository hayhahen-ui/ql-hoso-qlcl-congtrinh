export type TenantMode = "demo" | "real";

export type AppTabId =
  | "overview"
  | "mindmap"
  | "project"
  | "catalogs"
  | "materials"
  | "schedule"
  | "kthh"
  | "testing"
  | "acceptance"
  | "diary"
  | "dossier"
  | "forms"
  | "audit";

export type ApplicabilityState = "applicable" | "not_applicable" | "unknown";
export type ChecklistStatus = "missing" | "in_review" | "accepted" | "rejected";
export type OriginalDocType = "Bản gốc" | "Bản chính" | "Bản sao hợp pháp" | "Chưa xác định";

export type RecordWorkflowStatus =
  | "draft"
  | "review"
  | "approved"
  | "issued"
  | "signed_simulated"
  | "signed"
  | "void";

export type ContractBranchType =
  | "Thường (CĐT - TVGS - Nhà thầu)"
  | "Tổng thầu EPC"
  | "Chìa khóa trao tay"
  | "Liên danh nhà thầu"
  | "Nhà thầu phụ";

export interface ProjectInfo {
  project_code: string;
  project_name: string;
  package: string;
  category_name: string;
  location: string;
  place_name: string;
  contract_no: string;
  lab_contract_no: string;
  handover_date: string;
  start_date: string;
  end_date: string;
  contract_branch: ContractBranchType;
  timezone: string;
}

export interface PartnerOrg {
  partner_code: string;
  name: string;
  role:
    | "Chủ đầu tư"
    | "Đơn vị thiết kế"
    | "Tư vấn giám sát"
    | "Nhà thầu thi công"
    | "Đơn vị thí nghiệm";
  representative: string;
  position: string;
  phone: string;
  address: string;
  is_signer: boolean;
  license_no?: string;
}

export interface TimeSlot {
  slot_no: number;
  base_start: string;
  base_end: string;
  internal_label: string;
  acceptance_label: string;
  locked: boolean;
}

export interface TransitionLegalProfile {
  project_code: string;
  decision_date: string;
  decision_ref: string;
  start_date: string;
  project_type: string;
  project_grade: string;
  old_check_scope: "Thuộc diện" | "Không thuộc diện" | "Chưa xác minh";
  new_check_scope: "Thuộc diện" | "Không thuộc diện" | "Chưa xác minh";
  requires_state_inspection: "Có" | "Không" | "Chưa xác định";
  authority: string;
  receipt_date: string;
  inspection_before_effective: "Đã kiểm tra" | "Chưa kiểm tra" | "Chưa xác minh";
  decision_reason: string;
  legal_profile: string;
  reviewer: string;
}

export interface WorkCatalogItem {
  code: string;
  name: string;
  standard_codes: string;
  test_codes: string;
  unit?: string;
}

export interface StandardCatalogItem {
  code: string;
  name: string;
  version: string;
  effective_from: string;
  source: string;
  approved: boolean;
}

export interface SimpleCatalogItem {
  code: string;
  name: string;
  group: string;
}

export interface MaterialItem {
  material_code: string;
  name: string;
  source: string;
  supplier: string;
  sample_quantity: number;
  unit: string;
  notes: string;
}

export interface MaterialLot {
  lot_code: string;
  material_code: string;
  quantity: number;
  unit: string;
  received_date: string;
  document_ref: string;
  has_co_cq: boolean;
  acceptance_status: "Chưa kiểm tra" | "Đề nghị nghiệm thu" | "Đã nghiệm thu" | "Không đạt";
  inspector_note: string;
}

export interface ConcreteMix {
  mix_code: string;
  grade: string;
  aggregate: string;
  design_slip: string;
  design_date: string;
  cement: number;
  sand: number;
  stone: number;
  water: number;
  admixture_1: number;
  admixture_2: number;
  slump: number;
  unit_notes: string;
}

export interface ScheduleWorkItem {
  source_row: number;
  record_key: string;
  parent_key: string;
  relation_key: string;
  work_code: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  internal_date: string;
  request_date: string;
  acceptance_date: string;
  attachment_raw: string;
  standard_codes: string;
  test_codes: string;
  row_type: "section" | "work";
}

export type KthhGroup = "HM" | "DAP" | "CP" | "CT" | "BT";

export interface InspectionHeader {
  inspection_key: string;
  work_record_key: string;
  inspection_type: string;
  kthh_group: KthhGroup;
  date: string;
  location: string;
  result: string;
  image_refs: string;
  rule_approved: boolean;
}

export interface MeasurementLine {
  inspection_key: string;
  line_no: number;
  measurement_name: string;
  design_value: number;
  actual_value: number;
  unit: string;
  tolerance: number | null;
}

export interface TestPlan {
  plan_id: string;
  project_code: string;
  object: string;
  test: string;
  planned_at: string;
  laboratory: string;
  design_ref: string;
  approval_ref: string;
  approval_date: string;
  version: number;
  status: "Nháp" | "Chờ CĐT chấp thuận" | "Đã chấp thuận";
}

export interface TestSample {
  sample_key: string;
  work_record_key: string;
  test_code: string;
  sample_group: "VL" | "BT" | "HT";
  sample_date: string;
  sample_time: string;
  sample_type: string;
  mix_code: string;
  grade: string;
  aggregate: string;
  slump: number | null;
  r3: number | null;
  r7: number | null;
  r28: number | null;
  mould: string;
  supervisor_name: string;
  original_attachment: string;
}

export interface TestResult {
  sample_key: string;
  criterion: string;
  value: number;
  unit: string;
  lab_ref: string;
  result_date: string;
  target_age_days?: number;
  conclusion: "Chờ xác nhận" | "Đạt yêu cầu" | "Không đạt";
}

export interface AcceptanceRecord207 {
  record_id: string;
  project_code: string;
  kind: "Công việc" | "Vật liệu" | "Giai đoạn" | "Hoàn thành" | "Hoàn thành có điều kiện";
  work_ids: string;
  request_received_at: string;
  inspection_at: string;
  location: string;
  signer_role: string;
  signer_identity: string;
  conclusion: string;
  defects: string;
  warranty_months?: number;
  fire_safety_note?: string;
  rejection_reason?: string;
  legal_profile: string;
  evidence_refs: string;
  status: RecordWorkflowStatus;
  issued_no?: string;
  issued_seq?: number;
  issued_at?: string;
  snapshot_hash?: string;
}

export interface NumberSequenceEntry {
  seq_key: string;
  doc_type: string;
  year: number;
  prefix: string;
  next_no: number;
  issued_records: Array<{
    no: number;
    label: string;
    record_id: string;
    issued_at: string;
    status: "active" | "void";
    void_reason?: string;
  }>;
}

export interface WeatherDay {
  date: string;
  high: number;
  low: number;
  rain_mm: number;
  source: string;
  observed_or_forecast: "Quan trắc thực tế" | "Gợi ý hệ thống" | "Chưa xác nhận";
  note: string;
  personnel: string;
  is_stop_confirmed: boolean;
}

export interface DiaryEntry {
  date: string;
  work_record_key: string;
  description: string;
  equipment: string;
  personnel: string;
  incidents_or_notes: string;
  sanitation_safety: string;
  status: "Bản nháp" | "Đã xác nhận";
}

export interface DossierChecklistItem {
  project_code: string;
  scope_id: string;
  checklist_id: string;
  annex: "VII" | "X";
  group_name: string;
  checklist_name: string;
  applicability: ApplicabilityState;
  applicability_reason: string;
  status: ChecklistStatus;
  document_ref: string;
  version: number;
  original_type: OriginalDocType;
  physical_location: string;
  electronic_copy_ref: string;
  reviewer: string;
}

export interface AsBuiltDrawing {
  drawing_id: string;
  project_code: string;
  work_record_key: string;
  name: string;
  revision: number;
  actual_measurement_ref: string;
  is_concealed_work: boolean;
  file_ref: string;
  signer: string;
  status: string;
}

export interface HandoverRecord {
  handover_id: string;
  project_code: string;
  scope_id: string;
  receiver: string;
  handover_date: string;
  file_refs: string;
  status: string;
}

export interface IncidentRecord {
  incident_id: string;
  project_code: string;
  work_record_key: string;
  time: string;
  description: string;
  evidence_refs: string;
  status: string;
}

export interface ObservationRecord {
  monitor_id: string;
  project_code: string;
  object: string;
  method: string;
  limit: number | null;
  value: number;
  unit: string;
  date: string;
  approval_ref: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  entity_id: string;
  detail: string;
}

export interface QlclWorkspaceState {
  tenantId: string;
  tenantMode: TenantMode;
  tenantName: string;
  lastUpdated: string;
  project: ProjectInfo;
  partners: PartnerOrg[];
  timeSlots: TimeSlot[];
  legalProfile: TransitionLegalProfile;
  workCatalog: WorkCatalogItem[];
  standards: StandardCatalogItem[];
  inspectionTypes: SimpleCatalogItem[];
  testTypes: SimpleCatalogItem[];
  testResultCatalog: SimpleCatalogItem[];
  machines: SimpleCatalogItem[];
  materials: MaterialItem[];
  materialLots: MaterialLot[];
  concreteMixes: ConcreteMix[];
  schedule: ScheduleWorkItem[];
  inspections: InspectionHeader[];
  measurements: MeasurementLine[];
  testPlans: TestPlan[];
  testSamples: TestSample[];
  testResults: TestResult[];
  acceptances: AcceptanceRecord207[];
  numberSequences: NumberSequenceEntry[];
  weatherDays: WeatherDay[];
  diaryEntries: DiaryEntry[];
  checklist: DossierChecklistItem[];
  asBuiltDrawings: AsBuiltDrawing[];
  handovers: HandoverRecord[];
  incidents: IncidentRecord[];
  observations: ObservationRecord[];
  auditLogs: AuditLogEntry[];
}
