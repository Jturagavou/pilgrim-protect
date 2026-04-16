import { Schema, model, Types, type Document } from "mongoose";

export interface ISprayReport extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  worker: Types.ObjectId;
  date: Date;
  roomsSprayed: number;
  photos: string[];
  notes: string;
  gpsCoords: { lat?: number; lng?: number };
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
    photos: { type: [String], default: [] },
    notes: { type: String, default: "" },
    gpsCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SprayReport = model<ISprayReport>("SprayReport", sprayReportSchema);
export default SprayReport;
