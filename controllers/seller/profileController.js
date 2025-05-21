const SellerProfile = require('../../models/SellerProfile');
const User = require('../../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../../config/cloudinary');

// =================== CREATE/UPDATE SELLER PROFILE ===================
exports.updateSellerProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    businessName,
    businessType,
    gstNumber,
    panNumber,
    businessAddress,
    bankDetails,
    businessDescription
  } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can update seller profile' });
    }

    let sellerProfile = await SellerProfile.findOne({ user: req.user.userId });

    // Handle file uploads
    let businessLogoUrl = '';
    if (req.files && req.files.businessLogo) {
      const result = await cloudinary.uploader.upload(req.files.businessLogo[0].path, {
        folder: 'seller_profiles'
      });
      businessLogoUrl = result.secure_url;
    }

    // Handle document uploads
    const documents = [];
    if (req.files && req.files.documents) {
      for (const file of req.files.documents) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'seller_documents'
        });
        documents.push({
          documentType: file.fieldname,
          documentUrl: result.secure_url,
          verified: false
        });
      }
    }

    if (!sellerProfile) {
      // Create new profile
      sellerProfile = new SellerProfile({
        user: req.user.userId,
        businessName,
        businessType,
        gstNumber,
        panNumber,
        businessAddress: JSON.parse(businessAddress),
        bankDetails: JSON.parse(bankDetails),
        businessDescription,
        businessLogo: businessLogoUrl,
        businessDocuments: documents
      });
    } else {
      // Update existing profile
      sellerProfile.businessName = businessName || sellerProfile.businessName;
      sellerProfile.businessType = businessType || sellerProfile.businessType;
      sellerProfile.gstNumber = gstNumber || sellerProfile.gstNumber;
      sellerProfile.panNumber = panNumber || sellerProfile.panNumber;
      sellerProfile.businessAddress = businessAddress ? 
        JSON.parse(businessAddress) : sellerProfile.businessAddress;
      sellerProfile.bankDetails = bankDetails ? 
        JSON.parse(bankDetails) : sellerProfile.bankDetails;
      sellerProfile.businessDescription = businessDescription || sellerProfile.businessDescription;
      sellerProfile.businessLogo = businessLogoUrl || sellerProfile.businessLogo;
      
      if (documents.length > 0) {
        sellerProfile.businessDocuments = [...sellerProfile.businessDocuments, ...documents];
      }
    }

    await sellerProfile.save();

    res.status(200).json({
      msg: 'Seller profile updated successfully',
      profile: sellerProfile
    });
  } catch (err) {
    console.error('Seller profile update error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET SELLER PROFILE ===================
exports.getSellerProfile = async (req, res) => {
  try {
    const sellerProfile = await SellerProfile.findOne({ user: req.user.userId })
      .populate('user', 'userName email phoneNumber profilePicture');

    if (!sellerProfile) {
      return res.status(404).json({ msg: 'Seller profile not found' });
    }

    res.status(200).json({
      profile: sellerProfile
    });
  } catch (err) {
    console.error('Get seller profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET SELLER PUBLIC PROFILE ===================
exports.getSellerPublicProfile = async (req, res) => {
  try {
    const sellerProfile = await SellerProfile.findOne({ user: req.params.sellerId })
      .populate('user', 'userName profilePicture')
      .select('-bankDetails -businessDocuments -gstNumber -panNumber');

    if (!sellerProfile) {
      return res.status(404).json({ msg: 'Seller profile not found' });
    }

    res.status(200).json({
      profile: sellerProfile
    });
  } catch (err) {
    console.error('Get seller public profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};