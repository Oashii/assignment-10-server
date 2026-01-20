const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.0ijmspx.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let foodCollection, requestCollection;

// Connect to MongoDB once
(async () => {
  try {
    await client.connect();
    const db = client.db("plateshareDB");
    foodCollection = db.collection("foods");
    requestCollection = db.collection("requests");
    console.log("MongoDB Connected!");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
})();

app.get('/', (req, res) => {
  res.send('Server working fine.');
});

app.post("/foods", async (req, res) => {
  try {
    const food = req.body;
    const result = await foodCollection.insertOne(food);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/foods", async (req, res) => {
  try {
    const foods = await foodCollection.find().toArray();
    res.send(foods);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/foods/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const food = await foodCollection.findOne({ _id: new ObjectId(id) });
    res.send(food);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.delete("/foods/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.patch("/foods/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const result = await foodCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.post("/requests", async (req, res) => {
  try {
    const request = req.body;
    const food = await foodCollection.findOne({ _id: new ObjectId(request.foodId) });
    if (!food) return res.status(404).send({ message: "Food not found" });

    request.foodOwnerEmail = food.donorEmail;
    request.status = "pending";
    const result = await requestCollection.insertOne(request);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/requests", async (req, res) => {
  try {
    const requests = await requestCollection.find().toArray();
    res.send(requests);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.patch("/requests/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const result = await requestCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = app;
