const bcrypt = require("bcrypt");
const connectDB = require("../config/db.js");
const User = require("../models/user.js");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

require("dotenv").config();

// Users to create
const usersToCreate = [
  {
    username: "omjidubey",
    name: "Omji Dubey",
    password: "dubey.123",
  },
];

async function seed() {
  await connectDB();

  for (const user of usersToCreate) {
    const existing = await User.findOne({ username: user.username });

    if (existing) {
      console.log(`Skipped (already exists): ${user.username}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

    await User.create({
      username: user.username,
      name: user.name,
      passwordHash,
    });

    console.log(`Created: ${user.username}`);
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});