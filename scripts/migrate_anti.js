import { db } from "../src/database/mysql.js";
import { env } from "../src/config/env.js";

async function run() {
  try {
    console.log("Starting migration...");
    
    // Check if columns exist
    const [columns] = await db.query("SHOW COLUMNS FROM settings");
    const existingCols = columns.map(c => c.Field);
    
    const newCols = [
      "anti_ch", "anti_wame", "anti_link", "anti_pl",
      "anti_toxic_1", "anti_toxic_2",
      "anti_link_tt", "anti_link_yt",
      "anti_link_gc_1", "anti_link_gc_2"
    ];

    const toAdd = newCols.filter(c => !existingCols.includes(c));

    if (toAdd.length === 0) {
      console.log("All columns already exist.");
    } else {
      for (const col of toAdd) {
        console.log(`Adding column ${col}...`);
        // Assuming boolean/tinyint default 0
        await db.query(`ALTER TABLE settings ADD COLUMN ${col} BOOLEAN DEFAULT 0`);
      }
      console.log("Columns added successfully.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
