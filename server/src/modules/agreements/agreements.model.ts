import mongoose, { Schema, Document } from 'mongoose';

export interface IAgreement extends Document {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amountINR: number;
  paymentMethodNote: string;
  businessConfirmed: boolean;
  businessConfirmedAt?: Date;
  studentConfirmed: boolean;
  studentConfirmedAt?: Date;
  paymentReceived: boolean;
  paymentReceivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgreementSchema = new Schema<IAgreement>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amountINR: { type: Number, required: true, min: 1 },
    paymentMethodNote: {
      type: String,
      default: 'Direct peer-to-peer settlement (UPI / IMPS / Cash) upon approval',
    },
    businessConfirmed: { type: Boolean, default: false },
    businessConfirmedAt: { type: Date },
    studentConfirmed: { type: Boolean, default: false },
    studentConfirmedAt: { type: Date },
    paymentReceived: { type: Boolean, default: false },
    paymentReceivedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Agreement = mongoose.model<IAgreement>('Agreement', AgreementSchema);
