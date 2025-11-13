const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = 3000;

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

async function run() {
  try {
    await client.connect();

    const db = client.db("plateshareDB");
    const foodCollection = db.collection("foods");
    const requestCollection = db.collection("requests");

    
    app.post("/foods", async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.send(result);
    });


    app.get("/foods", async (req, res) => {
      const foods = await foodCollection.find().toArray();
      res.send(foods);
    });


    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const food = await foodCollection.findOne({ _id: new ObjectId(id) });
      res.send(food);
    });

    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // PATCH: Update food (e.g., food_status)
    app.patch("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const updates = req.body;
      const result = await foodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
      res.send(result);
    });

    // -------------------- REQUEST ROUTES --------------------

    // POST: Add a new request
    app.post("/requests", async (req, res) => {
      const request = req.body;

      // Get food to attach owner email
      const food = await foodCollection.findOne({ _id: new ObjectId(request.foodId) });
      if (!food) return res.status(404).send({ message: "Food not found" });

      request.foodOwnerEmail = food.donorEmail; // donorEmail must exist in food
      request.status = "pending"; // default status
      const result = await requestCollection.insertOne(request);
      res.send(result);
    });

    // GET: All requests
    app.get("/requests", async (req, res) => {
      const requests = await requestCollection.find().toArray();
      res.send(requests);
    });

    // PATCH: Update request status
    app.patch("/requests/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const result = await requestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
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
