// test-airtable.mjs
import dotenv from 'dotenv';

// Explicitly load .env.local
dotenv.config({ path: '.env.local' });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${apiKey}`,
};

async function fetchTable(tableName) {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName
  )}?pageSize=5`;

  const resp = await fetch(url, { headers });
  const text = await resp.text();
  console.log(`\n=== ${tableName} (${resp.status}) ===`);
  console.log(text);
}

(async () => {
  try {
    await fetchTable("Collections");
    await fetchTable("Modules");
    await fetchTable("Items");
  } catch (err) {
    console.error("Error talking to Airtable:", err);
  }
})();
