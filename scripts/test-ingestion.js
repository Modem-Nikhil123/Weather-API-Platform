const axios = require('axios');
const mongoose = require('mongoose');

// Simple weather ingestion test
async function testIngestion() {
  console.log('🧪 Testing weather data ingestion...');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Define schema
    const weatherSchema = new mongoose.Schema({
      city: String,
      lat: Number,
      lon: Number,
      temperature: Number,
      humidity: Number,
      pressure: Number,
      windSpeed: Number,
      timestamp: { type: Date, default: Date.now }
    });

    const Weather = mongoose.models.Weather || mongoose.model('Weather', weatherSchema);

    // Cities to fetch
    const cities = [
      { name: "Hyderabad", lat: 17.38, lon: 78.48 },
      { name: "Delhi", lat: 28.61, lon: 77.20 },
      { name: "Mumbai", lat: 19.07, lon: 72.87 },
    ];

    console.log('🌦️ Fetching weather data...');

    for (const city of cities) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m`;

        const response = await axios.get(url);
        const current = response.data.current;

        const weatherData = {
          city: city.name,
          lat: city.lat,
          lon: city.lon,
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          pressure: current.pressure_msl,
        };

        await Weather.create(weatherData);
        console.log(`✅ Stored weather for ${city.name}: ${weatherData.temperature}°C`);

      } catch (error) {
        console.error(`❌ Failed to fetch weather for ${city.name}:`, error.message);
        if (error.response) {
          console.error(`   Status: ${error.response.status}, Data:`, error.response.data);
        }
      }
    }

    // Check results
    const count = await Weather.countDocuments();
    console.log(`📊 Total weather records in database: ${count}`);

    // Show latest records
    const latest = await Weather.find().sort({ timestamp: -1 }).limit(3);
    console.log('📈 Latest weather records:');
    latest.forEach(record => {
      console.log(`  ${record.city}: ${record.temperature}°C, ${record.humidity}%, ${new Date(record.timestamp).toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Ingestion test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testIngestion();