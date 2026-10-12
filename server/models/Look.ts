import { Schema, model } from 'mongoose';

const lookSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  aesthetic: { type: String, trim: true, maxlength: 80, default: '' },
  occasion: { type: String, trim: true, maxlength: 80, default: '' },
  items: { type: [Schema.Types.Mixed], default: [] },
  palette: { type: [String], default: [] },
}, { timestamps: true });
lookSchema.index({ owner: 1, createdAt: -1 });
export const Look = model('Look', lookSchema);
