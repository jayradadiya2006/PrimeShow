const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function cleanMovies() {
  try {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    await client.connect();
    const db = client.db('show_db');
    
    const query = {
      $or: [
        { title: { $regex: 'Avatar', $options: 'i' } },
        { title: { $regex: 'Dune', $options: 'i' } },
        { title: { $regex: 'Kalki', $options: 'i' } }
      ]
    };

    const result = await db.collection('movies').deleteMany(query);
    console.log(`✅ Deleted ${result.deletedCount} movies from MongoDB show_db!`);
    await client.close();
  } catch (err) {
    console.warn('MongoDB cleanup note:', err.message);
  }

  try {
    const jsonPath = path.join(__dirname, 'data', 'movies.json');
    if (fs.existsSync(jsonPath)) {
      let items = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) || [];
      items = items.filter(m => {
        const t = (m.title || '').toLowerCase();
        return !t.includes('avatar') && !t.includes('dune') && !t.includes('kalki');
      });
      fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2));
      console.log('✅ Cleaned movies.json fallback storage');
    }
  } catch (e) {}
}

cleanMovies();
