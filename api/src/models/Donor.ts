import { Schema, model, Types, type Document } from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../types/shared";

export interface IDonor extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "donor";
  stripeCustomerId: string;
  sponsoredSchools: Types.ObjectId[];
  totalDonated: number;
  receiveUpdates: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const donorSchema = new Schema<IDonor>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "donor",
    },
    stripeCustomerId: { type: String, default: "" },
    sponsoredSchools: [
      {
        type: Schema.Types.ObjectId,
        ref: "School",
      },
    ],
    totalDonated: { type: Number, default: 0 },
    receiveUpdates: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

donorSchema.pre("save", async function (this: IDonor) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

donorSchema.methods.comparePassword = async function (
  this: IDonor,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Donor = model<IDonor>("Donor", donorSchema);
export default Donor;
