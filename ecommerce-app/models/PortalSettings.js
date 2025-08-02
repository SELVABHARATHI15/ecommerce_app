const mongoose = require('mongoose');

const portalSettingsSchema = new mongoose.Schema({
  // Branding settings
  logo: {
    type: String, // URL or filename
    default: null
  },
  primaryColor: {
    type: String,
    default: '#667eea'
  },
  secondaryColor: {
    type: String,
    default: '#764ba2'
  },
  fontFamily: {
    type: String,
    default: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  
  // Dashboard customization
  customHtmlBlock: {
    type: String,
    default: ''
  },
  
  // Portal configuration
  portalName: {
    type: String,
    default: 'E-Commerce Portal'
  },
  
  // Contact information
  contactEmail: {
    type: String,
    default: 'support@example.com'
  },
  
  // Features toggle
  features: {
    customerRegistration: {
      type: Boolean,
      default: true
    },
    productReviews: {
      type: Boolean,
      default: false
    },
    wishlist: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PortalSettings', portalSettingsSchema); 