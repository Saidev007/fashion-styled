import { Schema, model } from 'mongoose';

const wardrobeItemSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  color: { type: String, required: true, trim: true, maxlength: 60 },
  image: { type: String, trim: true, maxlength: 2048 },
}, { timestamps: true });
wardrobeItemSchema.index({ owner: 1, createdAt: -1 });
export const WardrobeItem = model('WardrobeItem', wardrobeItemSchema);
