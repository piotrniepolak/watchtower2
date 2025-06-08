#!/usr/bin/env node

// Script to generate usernames for existing users who don't have them
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users } from '../shared/schema.js';
import { eq, isNull, or } from 'drizzle-orm';
import ws from "ws";

// Configure neon for serverless
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { users } });

async function generateUsername(user) {
  let username = null;
  
  // First try to use email prefix
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    // Clean up the email prefix to make it a valid username
    username = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  }
  
  // If no email or email prefix is too short, use first name + random number
  if (!username || username.length < 3) {
    const firstName = user.firstName || "user";
    const randomNum = Math.floor(Math.random() * 1000);
    username = `${firstName.toLowerCase()}${randomNum}`;
  }
  
  // Ensure username is unique
  let finalUsername = username;
  let counter = 1;
  while (true) {
    const existingUser = await db.select().from(users).where(eq(users.username, finalUsername));
    if (existingUser.length === 0) {
      break;
    }
    finalUsername = `${username}${counter}`;
    counter++;
  }
  
  return finalUsername;
}

async function fixUsernames() {
  console.log("Starting username fix process...");
  
  // Find all users without usernames
  const usersWithoutUsernames = await db
    .select()
    .from(users)
    .where(or(isNull(users.username), eq(users.username, '')));
  
  console.log(`Found ${usersWithoutUsernames.length} users without usernames`);
  
  for (const user of usersWithoutUsernames) {
    console.log(`Processing user ID: ${user.id}, email: ${user.email}`);
    
    const newUsername = await generateUsername(user);
    console.log(`Generated username: ${newUsername}`);
    
    await db
      .update(users)
      .set({ 
        username: newUsername,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    console.log(`Updated user ${user.id} with username: ${newUsername}`);
  }
  
  console.log("Username fix process completed!");
  process.exit(0);
}

fixUsernames().catch(error => {
  console.error("Error fixing usernames:", error);
  process.exit(1);
});