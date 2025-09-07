const mongoose = require('mongoose');
const Organization = require('../MODELS/organizationModel');
const dotenv = require('dotenv');
const connectDB = require('../CONFIG/db');

dotenv.config();

// Sample organizations
const organizations = [
  { name: 'Acme Corporation' },
  { name: 'Globex Inc.' },
  { name: 'Wayne Enterprises' },
  { name: 'Stark Industries' },
  { name: 'Umbrella Corporation' }
];

// Connect to DB
connectDB();

const seedOrganizations = async () => {
  try {
    // Clear existing organizations
    await Organization.deleteMany({});
    console.log('Organizations cleared');

    // Add new organizations
    const createdOrganizations = await Organization.insertMany(organizations);
    console.log(`${createdOrganizations.length} organizations created`);

    // Log them
    console.log('Organizations:');
    createdOrganizations.forEach(org => {
      console.log(`- ${org.name} (ID: ${org._id})`);
    });

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedOrganizations();
