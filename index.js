const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = "mongodb+srv://plateShare:xFqFsFt4S6bdCqAb@cluster0.0ijmspx.mongodb.net/?appName=Cluster0";

// Create client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("plateshareDB");
    const foodCollection = db.collection("foods");

    // POST: Add a new food
    app.post("/foods", async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.send(result);
    });

    // GET: All foods
    app.get("/foods", async (req, res) => {
      const foods = await foodCollection.find().toArray();
      res.send(foods);
    });

    // GET: Single food by ID
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const food = await foodCollection.findOne({ _id: new ObjectId(id) });
      res.send(food);
    });

    // DELETE: Remove a food
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log("MongoDB Connected & API routes ready!");
  } catch (err) {
    console.error(err);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server working fine.');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
