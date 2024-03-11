const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// ///middleware\\\\\
app.use(cors())
app.use(express.json())

function verifyJWT  (req,res,next) {
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message:'unauthorizeed Access'})
  }
  const token = authHeader.split('')[1]
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decode) => {
    // if(err){
    //   return res.status(403).send({message:'Forbidden access'});
    // }
    console.log('decoded',decode)
    next();
  })
  // console.log('inside verifyJWT',authHeader);
  
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ok4i7vc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const serviceCollection = client.db('geniusCar').collection('service');
    // ///ordercolecion\\\\\\\
    const orderCollection = client.db('geniusCar').collection('order');
    // //////////jwt\\\\\\\\\\\\
    app.post('/login',async(req,res) => {
      const user = req.body;
      console.log(user)
      const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'1d'
      });
      res.send(accessToken);
    })
    
    // ////data mongo thaka load korae\\\\\\\\\
    app.get('/service',async(req,res) => {
        const query = {};
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services)
    });
//////////find id one\\\\\\\
    app.get('/service/:id',async(req,res) => {
        const id = req.params.id;
        const query = {_id:new ObjectId(id)}
        const service = await serviceCollection.findOne(query)
        res.send(service)
    })
    // //////post\\\\\\\\\\\
    app.post('/service',async(req,res) => {
        const newService = req.body;
        const result = await  serviceCollection.insertOne(newService);
        res.send(result)

    })

    ////Delete\\\\\\\\\\
    app.delete('/service/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:new ObjectId(id)} 
        const result = await serviceCollection.deleteOne(query)
        res.send(result)
    })

    // //////////order collection\\\\\\\\\\
    app.post('/order', async(req,res) =>{
      const order = req.body ;
      const result =await orderCollection.insertOne(order);
      res.send(result);
    })

    app.get('/orders',verifyJWT,async(req,res) => {

      const email = req.query.email;
      // console.log(email)
      const query = {email: email};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders)
  });


    
  }
   catch(error) {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello ')
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })