import { Schema, model, Types, type Document } from "mongoose";

export type DonationStatus = "pending" | "completed" | "failed";

export interface IDonation extends Document {
  _id: Types.ObjectId;
  donor: Types.ObjectId;
  school: Types.ObjectId | null;
  amount: number; // in cents
  currency: string;
  stripePaymentId: string;
  recurring: boolean;
  status: DonationStatus;
  createdAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: "Donor",
      required: [true, "Donor is required"],
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: "School",
      default: null, // null = general fund
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"], // in cents
    },
    currency: { type: String, default: "usd" },
    stripePaymentId: { type: String, default: "" },
    recurring: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Donation = model<IDonation>("Donation", donationSchema);
export default Donation;
