const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true, min: 0, max: 100 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    maxUses: { type: Number, min: 0 },
    currentUses: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

promoCodeSchema.index({ code: 1 });

module.exports = mongoose.model('PromoCode', promoCodeSchema);