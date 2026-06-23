const bcrypt = require('bcrypt');
const connectDB = require('../src/config/db'); // adjust if your db.js exports differently
const User = require('../src/models/User');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

// Edit this list with the family members you want to add
const usersToCreate = [
  { username: 'omjidubey', name: 'Omji Dubey', password: 'dubey.om.123' },

];

async function seed() {
  await connectDB();

  for (const u of usersToCreate) {
    const existing = await User.findOne({ username: u.username });
    if (existing) {
      console.log(`Skipped (already exists): ${u.username}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await User.create({
      username: u.username,
      name: u.name,
      passwordHash,
    });
    console.log(`Created: ${u.username}`);
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});