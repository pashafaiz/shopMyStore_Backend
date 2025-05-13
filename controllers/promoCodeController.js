const PromoCode = require('../models/PromoCode');

exports.createPromoCode = async (req, res) => {
  const userId = req.user.userId;
  const userType = req.user.userType;
  const { code, discount, expiresAt } = req.body;
  const errors = {};

  if (userType !== 'seller') {
    return res.status(403).json({ msg: 'Only sellers can create promo codes' });
  }

  if (!code) errors.code = 'Promo code is required';
  if (!discount || discount < 0 || discount > 100) {
    errors.discount = 'Discount must be between 0 and 100';
  }
  if (expiresAt && isNaN(new Date(expiresAt).getTime())) {
    errors.expiresAt = 'Invalid expiration date';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const existingPromoCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingPromoCode) {
      return res.status(400).json({ msg: 'Promo code already exists' });
    }

    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      discount,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: userId,
    });

    res.status(201).json({
      msg: 'Promo code created successfully',
      promoCode: {
        code: promoCode.code,
        discount: promoCode.discount,
        expiresAt: promoCode.expiresAt,
        isActive: promoCode.isActive,
      },
    });
  } catch (err) {
    console.error('Create promo code error:', err);
    res.status(500).json({ msg: 'Failed to create promo code', error: err.message });
  }
};