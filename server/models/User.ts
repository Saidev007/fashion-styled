import { Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  preferences: Record<string, unknown>;
}
const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254, index: true },
  passwordHash: { type: String, required: true, select: false },
  preferences: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true, toJSON: { transform: (_doc, ret) => { const result = ret as Record<string, unknown>; delete result.passwordHash; return result; } } });
export const User = model<IUser>('User', userSchema);
