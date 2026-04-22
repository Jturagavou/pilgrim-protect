import type { ISchool } from "../models/School";

export type SchoolDataSource =
  | "seed"
  | "manual"
  | "manual-csv"
  | "master-csv"
  | "pilgrim-data"
  | "unknown";

export type SchoolCompleteness = "ready" | "needs-enrichment" | "manual-review";

export interface SchoolDataQuality {
  source: SchoolDataSource;
  imported: boolean;
  completeness: SchoolCompleteness;
  missingFields: string[];
  summary: string;
}

function sourceFromSchool(school: Pick<ISchool, "source" | "notes">): SchoolDataSource {
  if (school.source) return school.source;
  if (/uganda_schools_master_database\.csv/i.test(school.notes ?? "")) {
    return "master-csv";
  }
  return "unknown";
}

export function getSchoolDataQuality(
  school: Pick<
    ISchool,
    | "district"
    | "subCounty"
    | "lat"
    | "lng"
    | "studentCount"
    | "totalRooms"
    | "fundingProgress"
    | "source"
    | "notes"
  >
): SchoolDataQuality {
  const source = sourceFromSchool(school);
  const imported =
    source === "master-csv" ||
    source === "manual-csv" ||
    source === "pilgrim-data";
  const missingFields: string[] = [];

  if (!school.district || school.district === "Unspecified District") {
    missingFields.push("district");
  }
  if (!school.subCounty?.trim()) {
    missingFields.push("sub-county");
  }
  if (!Number.isFinite(school.lat) || !Number.isFinite(school.lng)) {
    missingFields.push("coordinates");
  }
  if (!school.studentCount) {
    missingFields.push("student count");
  }
  if (!school.totalRooms) {
    missingFields.push("room count");
  }
  if (!(school.fundingProgress?.goal > 0)) {
    missingFields.push("funding goal");
  }

  const completeness: SchoolCompleteness =
    missingFields.length === 0
      ? "ready"
      : imported
        ? "needs-enrichment"
        : "manual-review";

  const summary =
    completeness === "ready"
      ? "Ready for public and admin use."
      : completeness === "needs-enrichment"
        ? `Needs enrichment: ${missingFields.join(", ")}.`
        : `Needs manual review: ${missingFields.join(", ")}.`;

  return {
    source,
    imported,
    completeness,
    missingFields,
    summary,
  };
}

export function withSchoolDataQuality<T extends Pick<
  ISchool,
  | "district"
  | "subCounty"
  | "lat"
  | "lng"
  | "studentCount"
  | "totalRooms"
  | "fundingProgress"
  | "source"
  | "notes"
>>(school: T): T & { dataQuality: SchoolDataQuality } {
  return {
    ...school,
    dataQuality: getSchoolDataQuality(school),
  };
}
