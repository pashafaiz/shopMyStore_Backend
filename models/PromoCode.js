const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true, min: 0, max: 100 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

promoCodeSchema.index({ code: 1 });

module.exports = mongoose.model('PromoCode', promoCodeSchema);