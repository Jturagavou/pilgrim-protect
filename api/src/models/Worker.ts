import { Schema, model, Types, type Document } from "mongoose";
import bcrypt from "bcryptjs";

export type WorkerRole = "worker" | "supervisor" | "admin";

export interface IWorker extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  assignedSchools: Types.ObjectId[];
  role: WorkerRole;
  active: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const workerSchema = new Schema<IWorker>(
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
    phone: { type: String, default: "" },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    assignedSchools: [
      {
        type: Schema.Types.ObjectId,
        ref: "School",
      },
    ],
    role: {
      type: String,
      enum: ["worker", "supervisor", "admin"],
      default: "worker",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Hash password before save
workerSchema.pre("save", async function (this: IWorker) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
workerSchema.methods.comparePassword = async function (
  this: IWorker,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Worker = model<IWorker>("Worker", workerSchema);
export default Worker;
