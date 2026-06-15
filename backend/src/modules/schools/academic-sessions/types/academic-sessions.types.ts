export interface AcademicSessionResponse {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "upcoming" | "completed";
  isCurrent: boolean;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}
