import { Schema, model, Types, type Document } from "mongoose";

export interface ISprayReport extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  worker: Types.ObjectId;
  date: Date;
  roomsSprayed: number;
  roomsEligible?: number;
  roomsNotSprayed?: number;
  notSprayedReasons?: {
    locked?: number;
    refused?: number;
    unsafe?: number;
    other?: number;
  };
  studentsProtected?: number;
  peopleProtected?: number;
  serviceTypes?: string[];
  insecticide?: {
    product?: string;
    batchNumber?: string;
    quantityUsed?: number;
    unit?: string;
  };
  educationSession?: {
    conducted?: boolean;
    studentsReached?: number;
    topic?: string;
  };
  chemoprevention?: {
    provided?: boolean;
    studentsReached?: number;
    dosesAdministered?: number;
  };
  larvalSourceManagement?: {
    conducted?: boolean;
    sitesChecked?: number;
    sitesTreated?: number;
    notes?: string;
  };
  safetyChecklist?: {
    ppeWorn?: boolean;
    occupantsCleared?: boolean;
    roomsVentilated?: boolean;
    headTeacherBriefed?: boolean;
  };
  headTeacherName?: string;
  supervisorName?: string;
  photos: string[];
  notes: string;
  gpsCoords: { lat?: number; lng?: number };
  gpsDistanceKm?: number;
  gpsWithinRange?: boolean;
  verified: boolean;
  createdAt: Date;
}

const sprayReportSchema = new Schema<ISprayReport>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: [true, "School is required"],
    },
    worker: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "Worker is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    roomsSprayed: {
      type: Number,
      required: [true, "Rooms sprayed count is required"],
    },
    roomsEligible: { type: Number },
    roomsNotSprayed: { type: Number, default: 0 },
    notSprayedReasons: {
      locked: { type: Number, default: 0 },
      refused: { type: Number, default: 0 },
      unsafe: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    studentsProtected: { type: Number, default: 0 },
    peopleProtected: { type: Number, default: 0 },
    serviceTypes: { type: [String], default: ["irs"] },
    insecticide: {
      product: { type: String, default: "" },
      batchNumber: { type: String, default: "" },
      quantityUsed: { type: Number, default: 0 },
      unit: { type: String, default: "sachets" },
    },
    educationSession: {
      conducted: { type: Boolean, default: false },
      studentsReached: { type: Number, default: 0 },
      topic: { type: String, default: "" },
    },
    chemoprevention: {
      provided: { type: Boolean, default: false },
      studentsReached: { type: Number, default: 0 },
      dosesAdministered: { type: Number, default: 0 },
    },
    larvalSourceManagement: {
      conducted: { type: Boolean, default: false },
      sitesChecked: { type: Number, default: 0 },
      sitesTreated: { type: Number, default: 0 },
      notes: { type: String, default: "" },
    },
    safetyChecklist: {
      ppeWorn: { type: Boolean, default: false },
      occupantsCleared: { type: Boolean, default: false },
      roomsVentilated: { type: Boolean, default: false },
      headTeacherBriefed: { type: Boolean, default: false },
    },
    headTeacherName: { type: String, default: "" },
    supervisorName: { type: String, default: "" },
    photos: { type: [String], default: [] },
    notes: { type: String, default: "" },
    gpsCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    gpsDistanceKm: { type: Number },
    gpsWithinRange: { type: Boolean },
    verified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SprayReport = model<ISprayReport>("SprayReport", sprayReportSchema);
export default SprayReport;
