import mongoose, { Schema, models, model } from 'mongoose';

const QuerySchema = new Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Query = models.Query || model('Query', QuerySchema);

export default Query;
