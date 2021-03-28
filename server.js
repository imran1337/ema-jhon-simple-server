require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const { response } = require("express");

const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

client.connect((err) => {
  const collection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COLLECTION);
  const ordersCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_ORDER_COLLECTION);

  app.post("/addProduct", (req, res) => {
    const products = req.body;
    // console.log(product);
    collection.insertMany(products).then((result) => {
      res.send(result.insertedCount);
    });
  });

  app.get("/products", (req, res) => {
    collection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/product/:key", (req, res) => {
    console.log(req.params);
    collection.find(req.params).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  app.post("/productsByKeys", (req, res) => {
    const pdKeys = req.body;
    collection.find({ key: { $in: pdKeys } }).toArray((err, documents) => {
      res.send(documents);
      console.log(documents);
    });
  });

  app.post('/submitOrder',(req,res) => {
      const shipmentDetails =  req.body;
      ordersCollection.insertOne(shipmentDetails).then(response => {
          const {insertedCount} = response
          if (insertedCount < 1) {
            return  res.status(500).send({success:false,msg: 'Internal Server Error'})
          }
        return  res.status(200).send({success:true,msg:'Order placed Successfully'})
      })
  })

  console.log("database connected");
});

app.get("/", (req, res) => {
 return res.send("Working");
});

app.listen(5000, () => console.log("server running"));
