import { Schema, model, Types, type Document } from "mongoose";

export type SchoolStatus = "pending" | "active" | "completed";

export interface ISchool extends Document {
  _id: Types.ObjectId;
  name: string;
  district: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  totalRooms: number;
  studentCount: number;
  photos: string[];
  sponsor: Types.ObjectId | null;
  status: SchoolStatus;
  lastSprayDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

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
    },
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
    totalRooms: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
    photos: { type: [String], default: [] },
    sponsor: {
      type: Schema.Types.ObjectId,
      ref: "Donor",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    lastSprayDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// GeoJSON index for map queries
schoolSchema.index({ location: "2dsphere" });

export const School = model<ISchool>("School", schoolSchema);
export default School;
