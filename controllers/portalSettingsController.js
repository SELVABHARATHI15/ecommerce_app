const PortalSettings = require('../models/PortalSettings');

// ✅ Get portal settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await PortalSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await PortalSettings.create({});
    }
    
    res.json(settings);
  } catch (err) {
    console.error('Error fetching portal settings:', err);
    res.status(500).json({ error: 'Failed to fetch portal settings' });
  }
};

// ✅ Update portal settings (Admin only)
exports.updateSettings = async (req, res) => {
  try {
    const {
      logo,
      primaryColor,
      secondaryColor,
      fontFamily,
      customHtmlBlock,
      portalName,
      contactEmail,
      features
    } = req.body;

    let settings = await PortalSettings.findOne();
    
    if (!settings) {
      settings = new PortalSettings();
    }

    // Update fields if provided
    if (logo !== undefined) settings.logo = logo;
    if (primaryColor !== undefined) settings.primaryColor = primaryColor;
    if (secondaryColor !== undefined) settings.secondaryColor = secondaryColor;
    if (fontFamily !== undefined) settings.fontFamily = fontFamily;
    if (customHtmlBlock !== undefined) settings.customHtmlBlock = customHtmlBlock;
    if (portalName !== undefined) settings.portalName = portalName;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (features !== undefined) settings.features = { ...settings.features, ...features };

    await settings.save();
    
    res.json({
      message: 'Portal settings updated successfully',
      settings
    });
  } catch (err) {
    console.error('Error updating portal settings:', err);
    res.status(500).json({ error: 'Failed to update portal settings' });
  }
};

// ✅ Upload logo
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let settings = await PortalSettings.findOne();
    if (!settings) {
      settings = new PortalSettings();
    }

    // Save the filename
    settings.logo = req.file.filename;
    await settings.save();

    res.json({
      message: 'Logo uploaded successfully',
      logo: req.file.filename
    });
  } catch (err) {
    console.error('Error uploading logo:', err);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
};

// ✅ Reset settings to default
exports.resetSettings = async (req, res) => {
  try {
    await PortalSettings.deleteMany({});
    const settings = await PortalSettings.create({});
    
    res.json({
      message: 'Portal settings reset to default',
      settings
    });
  } catch (err) {
    console.error('Error resetting portal settings:', err);
    res.status(500).json({ error: 'Failed to reset portal settings' });
  }
}; 