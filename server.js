require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const Database = require('./database');
const MAX_PINS = 30;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/config', (req, res) => {
    res.json({
      apiKey: process.env.HERE_API_KEY // Or other configuration
    });
  });

// Endpoint to retrieve all pins from the database
app.get('/api/pins', async (req, res) => {
    try {
        const pins = await Database.find('pins');
        res.json(pins);
    } catch (error) {
        console.error("Error fetching pins:", error);
        res.status(500).json({ error: "Failed to fetch pins" });
    }
});

// Endpoint to add a new pin to the database
app.post('/api/pins', async (req, res) => {
    const { lat, lng } = req.body;
    const timestamp = new Date();
    try {
        const db = await Database.connect();
        const pinCount = await db.collection('pins').countDocuments();
        if (pinCount >= MAX_PINS) {
            // If we have more than or equal to MAX_PINS, delete the oldest pin
            const oldestPin = await db.collection('pins').find().sort({ timestamp: 1 }).limit(1).toArray();
            
            if (oldestPin.length > 0) {
              await db.collection('pins').deleteOne({ _id: oldestPin[0]._id });
              console.log("Oldest pin removed:", oldestPin[0]._id);
            }
          }
        const newPin = await db.collection('pins').insertOne({ lat, lng, timestamp, logo});
        res.json(newPin);
    } catch (error) {
        console.error("Error adding pin:", error);
        res.status(500).json({ error: "Failed to add pin" });
    }
});



async function main() {
    try {
        // Retrieve all documents from the 'pins' collection
        const pins = await Database.find('pins');
        console.log("Pins from database:", pins);
    } catch (error) {
        console.error("Error in main function:", error);
    } finally {
        await Database.close();
    }
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
main();
// Serve static files from the 'public' directory


