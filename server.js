const express = require('express');
const mongoose = require('mongoose');
const app = express();

const mongoUri = 'mongodb://hrTest:hTy785JbnQ5@mongo0.maximum.expert:27423/hrTest?authSource=hrTest&replicaSet=ReplicaSet&readPreference=primary';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

const stockSchema = new mongoose.Schema({
    mark: String,
    model: String,
    engine: {
        power: Number,
        volume: Number,
        transmission: String,
        fuel: String,
    },
    drive: String,
    equipmentName: String,
    price: Number,
    createdAt: Date,
});

const Stock = mongoose.model('Stock', stockSchema, 'stock');

app.get('/api/marks', async (req, res) => {
  try {
    const marks = await Stock.aggregate([
      { $group: { _id: "$mark", count: { $sum: 1 } } },
      { $project: { mark: "$_id", count: 1, _id: 0 } }
    ]);

    console.log('Fetched car marks with count:', marks);
    res.json(marks);
  } catch (error) {
    console.error('Error fetching car marks with count:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const { mark } = req.query;
    const filter = mark ? { mark } : {};
    const models = await Stock.distinct('model', filter);
    console.log('Fetched car models:', models);
    res.json(models);
  } catch (error) {
    console.error('Error fetching car models:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/stock', async (req, res) => {
  try {
    const { mark, models, page = 1 } = req.query;
    const pageSize = 20;
    const filter = {};

    if (mark) filter.mark = mark;
    if (models) filter.model = { $in: models.split(',') };

    const stock = await Stock.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize);

    const total = await Stock.countDocuments(filter);

    console.log('Fetched stock:', stock);
    res.json({
        total,
        stock,
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
