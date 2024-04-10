import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({ status: "UP" });
});

//BROADCAST CHANNEL
app.get("/api/broadcast", async (req, res) => {
  await execute(async (mdbc) => {
    const db = mdbc.db("api");
    const messages = db.collection("messages");
    const channels = db.collection("channels");

    const broadcastChannel = await channels.findOne({ name: "broadcast" });

    const result = await messages
      .find({ channelId: broadcastChannel._id })
      .toArray();

    res.send({ result });
  });
});

app.post("/api/broadcast", async (req, res) => {
  const message = req.body;

  await execute(async (mdbc) => {
    const db = mdbc.db("api");
    const messages = db.collection("messages");
    const channels = db.collection("channels");

    const broadcastChannel = await channels.findOne({ name: "broadcast" });

    const inserted = await messages.insertOne({
      ...message,
      channelId: broadcastChannel._id,
    });

    if (!inserted.insertedId) {
      res.status(400).send({ msg: "Could not insert record" });
      return;
    }

    const result = await messages.findOne({ _id: inserted.insertedId });

    if (!result) {
      res.status(400).send({ msg: "Could not find inserted record" });
    }

    res.send({ result });
  });
});

//CHANNELS
app.get("/api/channels", async (req, res) => {
  await execute(async (mdbc) => {
    const db = mdbc.db("api");
    const channels = db.collection("channels");

    const result = await channels.find().toArray();

    res.send({ result });
  });
});

app.put("/api/channels", async (req, res) => {
  const channel = req.body;

  await execute(async (mdbc) => {
    const db = mdbc.db("api");
    const channels = db.collection("channels");

    const inserted = await channels.insertOne(channel);

    if (!inserted.insertedId) {
      res.status(400).send({ msg: "Could not insert record" });
      return;
    }

    const result = await channels.findOne({ _id: inserted.insertedId });

    if (!result) {
      res.status(400).send({ msg: "Could not find inserted record" });
    }

    res.send({ result });
  });
});

//CHANNELS, MESSAGES
app.get("/api/channels/:id", async (req, res) => {
  const id = req.params.id;

  await execute(async (mdbc) => {
    const db = mdbc.db("api");
    const messages = db.collection("messages");

    const result = await messages
      .find({ channelId: new ObjectId(id) })
      .toArray();

    if (!result) {
      res.status(400).send({ msg: "Could not find records" });
      return;
    }

    res.send({ result });
  });
});

//CREATE MESSAGE IN CHANNEL
app.post("/api/channels/:id", async (req, res) => {
  const channelId = req.params.id;
  const message = req.body;

  await execute(async (mdbc) => {
    const db = mdbc.db("api");
    const messages = db.collection("messages");

    const inserted = await messages.insertOne({
      ...message,
      channelId: new ObjectId(channelId),
    });

    if (!inserted.insertedId) {
      res.status(400).send({ msg: "Could not insert record" });
      return;
    }

    const result = await messages.findOne({ _id: inserted.insertedId });

    if (!result) {
      res.status(400).send({ msg: "Could not find inserted record" });
    }

    res.send({ result });
  });
});

//DELETE CHANNELS AND MESSAGES
app.delete("/api/channels/:id", async (req, res) => {
  const channelId = req.params.id;

  await execute(async (mdbc) => {
    const db = mdbc.db("api");
    const channels = db.collection("channels");
    const messages = db.collection("messages");

    const deletedMessages = await messages.deleteMany({
      channelId: new ObjectId(channelId),
    });
    const deletedChannel = await channels.deleteOne({
      _id: new ObjectId(channelId),
    });

    console.log("deletedMessages", deletedMessages);
    console.log("deletedChannel", deletedChannel);

    res.send({
      deletedMessages: deletedMessages.deletedCount,
      deletedChannel: deletedChannel.deletedCount,
    });
  });
});

app.listen(4321, () => {
  console.log("listening on port 4321");
});

//MONGODB CONNECTION
const uri =
  "mongodb+srv://thallenius:0DEV0HsRLQ8EervO@fe23-test-cluster.xfqma4s.mongodb.net/?retryWrites=true&w=majority&appName=fe23-test-cluster";

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

    const channels = client.db("api").collection("channels");

    const targetChannel = await channels.findOne({ name: "broadcast" });

    if (!targetChannel) {
      await channels.insertOne({ name: "broadcast" });
      console.log("Created channel `broadcast`");
    }

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

async function execute(cb) {
  await client.connect();
  await cb(client);
  await client.close();
}
