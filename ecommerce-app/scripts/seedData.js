const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const PortalSettings = require('../models/PortalSettings');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'ecommerce_db',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const admin = await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully');
    return admin;
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    throw error;
  }
};

const seedSampleCustomers = async () => {
  try {
    const customers = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'customer'
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'customer'
      },
      {
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
        password: 'password123',
        role: 'customer'
      }
    ];

    for (const customerData of customers) {
      const existingCustomer = await User.findOne({ email: customerData.email });
      if (!existingCustomer) {
        await User.create(customerData);
        console.log(`✅ Customer ${customerData.email} created`);
      } else {
        console.log(`ℹ️ Customer ${customerData.email} already exists`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating sample customers:', error.message);
  }
};

const seedSampleProducts = async () => {
  try {
    const products = [
      {
        name: 'Laptop',
        description: 'High-performance laptop for work and gaming',
        price: 999.99,
        stock_quantity: 50,
        image: 'laptop.jpg'
      },
      {
        name: 'Smartphone',
        description: 'Latest smartphone with advanced features',
        price: 699.99,
        stock_quantity: 100,
        image: 'smartphone.jpg'
      },
      {
        name: 'Headphones',
        description: 'Wireless noise-canceling headphones',
        price: 199.99,
        stock_quantity: 75,
        image: 'headphones.jpg'
      },
      {
        name: 'Tablet',
        description: '10-inch tablet perfect for entertainment',
        price: 399.99,
        stock_quantity: 30,
        image: 'tablet.jpg'
      },
      {
        name: 'Smartwatch',
        description: 'Fitness tracking smartwatch',
        price: 299.99,
        stock_quantity: 60,
        image: 'smartwatch.jpg'
      }
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        await Product.create(productData);
        console.log(`✅ Product ${productData.name} created`);
      } else {
        console.log(`ℹ️ Product ${productData.name} already exists`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating sample products:', error.message);
  }
};

const seedPortalSettings = async () => {
  try {
    const existingSettings = await PortalSettings.findOne();
    if (existingSettings) {
      console.log('✅ Portal settings already exist');
      return;
    }

    await PortalSettings.create({
      portalName: 'E-Commerce Portal',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      customHtmlBlock: '<h3>Welcome to our store!</h3><p>Find the best products at great prices.</p>',
      contactEmail: 'support@example.com',
      features: {
        customerRegistration: true,
        productReviews: false,
        wishlist: false
      }
    });

    console.log('✅ Portal settings created');
  } catch (error) {
    console.error('❌ Error creating portal settings:', error.message);
  }
};

const main = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...\n');
    
    await seedAdmin();
    await seedSampleCustomers();
    await seedSampleProducts();
    await seedPortalSettings();
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Customer: john@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

main(); 