import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import path from 'path';
import user_router from './users/routes.js';
import patient_routes from './patient/routes.js';
import practitioner_router from './practisioner/routes.js';
import { getUserBySocketId, updateUserSocket,
          closeUserSocket
       } from './socket/models.js';

import connection from './connection.js';
const port = process.env.PORT || 5000;
// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8081",
  },
});
// add middleware for CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");  
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");  // allow access from localhost:3000
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");  // allow access from localhost:8081
  next();
});


io.on("connection", (socket) => {
  let token = socket.handshake.auth.token
  updateUserSocket(token, socket.id, true,connection)
  .then(data=>data)

   getUserBySocketId(socket.id,connection).then(data=>{
    if(!data){
      socket.emit('user_not_found')
    }
  }
  );
  
   socket.on('disconnection',(socket)=>{
    console.log(socket.handshake.auth.token)
    closeUserSocket(socket.id).then(data =>
      console.log(data,'disconnected')
    )
   })

});
 

// add allowed hosts
// app.use(cors());

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }))


// const port = 5000;
// app.use(express.json());


// setup static folder
app.use(express.static(path.join(__dirname, 'statics')));


// Basic route
app.get('/', (req, res) => {
    res.send('HealthWa server is running!');
});

app.use('/api/user', user_router);
app.use('/api/patient', patient_routes);
app.use('/api/practitioner', practitioner_router);


// Start server
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});