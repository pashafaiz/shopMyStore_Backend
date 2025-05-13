const crypto = require('crypto');

const razorpayKeySecret = 'Ef9MEXYCSpetZD81XOVCdXJv'; // Replace with your Razorpay Key Secret
const razorpayOrderId = 'order_QULchgJmT4Eu5C'; // Updated to match the request
const razorpayPaymentId = 'pay_xxxxxxxxxxxxxxxx';

const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
const generatedSignature = crypto
  .createHmac('sha256', razorpayKeySecret)
  .update(payload)
  .digest('hex');

console.log('Generated Signature:', generatedSignature);