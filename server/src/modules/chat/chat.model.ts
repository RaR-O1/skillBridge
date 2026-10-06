import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  senderId: mongoose.Types.ObjectId;
  content: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '', maxlength: 5000 },
    fileUrl: { type: String, trim: true },
    fileName: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

MessageSchema.index({ roomId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
