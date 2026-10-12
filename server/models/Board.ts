import { Schema, model } from 'mongoose';

const boardSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  looks: [{ type: Schema.Types.ObjectId, ref: 'Look' }],
}, { timestamps: true });
boardSchema.index({ owner: 1, createdAt: -1 });
export const Board = model('Board', boardSchema);
