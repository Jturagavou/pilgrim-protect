import { Schema, model, Types, type Document } from "mongoose";

/**
 * @deprecated Use `sponsorshipStatus` instead. The `status` field is kept for
 * legacy `/dashboard` page compatibility and will be removed in prompt 07.
 */
export type SchoolStatus = "pending" | "active" | "completed";

export type SponsorshipStatus =
  | "needs-funding"
  | "funded"
  | "contracted"
  | "checked-in"
  | "data-gathered";

export const SPONSORSHIP_STATUSES = [
  "needs-funding",
  "funded",
  "contracted",
  "checked-in",
  "data-gathered",
] as const satisfies readonly SponsorshipStatus[];

export const HELPED_STATUSES: readonly SponsorshipStatus[] = [
  "funded",
  "contracted",
  "checked-in",
  "data-gathered",
];

export interface IFundingProgress {
  raised: number;
  goal: number;
}

export interface ISchool extends Document {
  _id: Types.ObjectId;
  name: string;
  district: string;
  subCounty?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  // Flat coordinates mirror location.coordinates; added for v2 clients that
  // prefer flat shapes. Kept in sync in pre-validate.
  lat: number;
  lng: number;
  totalRooms: number;
  studentCount: number;
  netsCount: number;
  hasMalariaClub: boolean;
  photos: string[];
  sponsor: Types.ObjectId | null;
  sponsorRef: Types.ObjectId | null;
  fundingProgress: IFundingProgress;
  sponsorshipStatus: SponsorshipStatus;
  /** @deprecated See SchoolStatus above. */
  status: SchoolStatus;
  lastSprayDate: Date | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const fundingProgressSchema = new Schema<IFundingProgress>(
  {
    raised: { type: Number, default: 0 },
    goal: { type: Number, default: 0 },
  },
  { _id: false }
);

const schoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      index: true,
    },
    subCounty: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    totalRooms: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
    netsCount: { type: Number, default: 0 },
    hasMalariaClub: { type: Boolean, default: false },
    photos: { type: [String], default: [] },
    sponsor: {
      type: Schema.Types.ObjectId,
      ref: "Donor",
      default: null,
    },
    sponsorRef: {
      type: Schema.Types.ObjectId,
      ref: "Donor",
      default: null,
    },
    fundingProgress: {
      type: fundingProgressSchema,
      default: () => ({ raised: 0, goal: 0 }),
    },
    sponsorshipStatus: {
      type: String,
      enum: SPONSORSHIP_STATUSES,
      default: "needs-funding",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    lastSprayDate: { type: Date, default: null },
    notes: { type: String },
  },
  { timestamps: true }
);

// Keep flat lat/lng in lockstep with GeoJSON location.coordinates so either
// shape is a valid source of truth at read time.
schoolSchema.pre("validate", function () {
  const coords = this.location?.coordinates;
  if (coords && (this.lat == null || this.lng == null)) {
    this.lng = coords[0];
    this.lat = coords[1];
  } else if (this.lat != null && this.lng != null && !coords) {
    this.location = {
      type: "Point",
      coordinates: [this.lng, this.lat],
    };
  }
});

// GeoJSON index for map queries
schoolSchema.index({ location: "2dsphere" });

export const School = model<ISchool>("School", schoolSchema);
export default School;
