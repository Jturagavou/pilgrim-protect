import type { IDonor } from "../models/Donor";
import type { IWorker } from "../models/Worker";

declare global {
  namespace Express {
    interface Request {
      user?: (IDonor | IWorker) & { role: string };
    }
  }
}

export {};
