const Customer = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/* ---------------------- CUSTOMER SELF-SERVICE ROUTES ---------------------- */

// ✅ Get own profile
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('❌ getProfile Error:', error);
    res.status(500).json({ message: 'Failed to load profile' });
  }
};

// ✅ Update own profile (name & email)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and Email are required' });
    }

    const updated = await Customer.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('❌ updateProfile Error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// ✅ Change own password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ changePassword Error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};


/* ---------------------- ADMIN ROUTES ---------------------- */

// ✅ List customers (with search, pagination, filter)
exports.getCustomers = async (req, res) => {
  try {
    const { query = '', status = '', page = 1, limit = 5, sort = 'createdAt' } = req.query;

    const filter = {
      $and: [
        { role: 'customer' }, // Only get customers, not admins
        {
          $or: [
            { first_name: { $regex: query, $options: 'i' } },
            { last_name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    };

    if (status) filter.$and.push({ isBlocked: status === 'blocked' });

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const customers = await Customer.find(filter)
      .select('-password')
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(filter);

    res.status(200).json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('❌ getCustomers Error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// ✅ Get single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('❌ getCustomerById Error:', error);
    res.status(500).json({ error: 'Error fetching customer details' });
  }
};

// ✅ Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      isBlocked: false,
      hasPortalAccess: true
    });

    res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
  } catch (error) {
    console.error('❌ createCustomer Error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// ✅ Update customer details (admin)
exports.updateCustomer = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', customer: updated });
  } catch (error) {
    console.error('❌ updateCustomer Error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// ✅ Reset Password (admin)
exports.resetPassword = async (req, res) => {
  try {
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, 10);

    const customer = await Customer.findByIdAndUpdate(req.params.id, { password: hashed });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Password reset successfully', temporaryPassword: tempPassword });
  } catch (error) {
    console.error('❌ resetPassword Error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ✅ Enable Portal Access (admin)
exports.enablePortal = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { hasPortalAccess: true });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Portal access enabled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable portal access' });
  }
};

// ✅ Disable Portal Access (admin)
exports.disablePortal = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { hasPortalAccess: false });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Portal access disabled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable portal access' });
  }
};

// ✅ Block customer (admin)
exports.blockCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.json({ message: 'Customer blocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block customer' });
  }
};

// ✅ Unblock customer (admin)
exports.unblockCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.json({ message: 'Customer unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock customer' });
  }
};

// ✅ Delete customer (admin)
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// ✅ Impersonate Customer (admin)
exports.impersonateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Generate JWT token for the customer
    const jwt = require('jsonwebtoken');
    const customerToken = jwt.sign(
      { id: customer._id, role: customer.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Short expiration for impersonation
    );

    res.json({ 
      message: `Now impersonating ${customer.first_name} ${customer.last_name}`, 
      customerToken: customerToken,
      customer: {
        id: customer._id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        role: customer.role
      }
    });
  } catch (error) {
    console.error('❌ Impersonation Error:', error);
    res.status(500).json({ error: 'Failed to impersonate customer' });
  }
};
