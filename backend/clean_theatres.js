const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function cleanDefaultTheatres() {
  try {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    await client.connect();
    const db = client.db('show_db');

    const query = {
      $or: [
        { name: { $regex: 'Palladium Mall', $options: 'i' } },
        { name: { $regex: 'Inorbit Mall', $options: 'i' } },
        { name: { $regex: "PVR Director's Cut, Palladium Mall", $options: 'i' } },
        { name: { $regex: 'INOX Megaplex, Inorbit Mall', $options: 'i' } }
      ]
    };

    const res = await db.collection('theatres').deleteMany(query);
    console.log(`✅ Deleted ${res.deletedCount} unwanted default theatres from MongoDB show_db!`);
    await client.close();
  } catch (err) {
    console.warn('MongoDB theatre cleanup note:', err.message);
  }

  try {
    const jsonPath = path.join(__dirname, 'data', 'theatres.json');
    if (fs.existsSync(jsonPath)) {
      let items = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) || [];
      items = items.filter(t => {
        const name = (t.name || '').toLowerCase();
        return !name.includes('palladium mall') && !name.includes('inorbit mall');
      });
      fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2));
      console.log('✅ Cleaned theatres.json fallback storage');
    }
  } catch (e) {}
}

cleanDefaultTheatres();
