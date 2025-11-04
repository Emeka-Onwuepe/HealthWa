import express from 'express';
import { createServer, get } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import path from 'path';
import user_router from './users/routes.js';
import patient_routes from './patient/routes.js';
import practitioner_router from './practisioner/routes.js';
import { getUserBySocketId, updateUserSocket,
          closeUserSocket, getSocketIdByUserId
       } from './socket/models.js';
import { getRecipient,recipientEmitter } from './socket/helpers.js';
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
  console.log('a user connected:', socket.id);
  const token = socket.handshake.auth.token;
  updateUserSocket(token, socket.id, true, connection)
    .then(data => data)
    .catch(err => console.error('updateUserSocket error', err));

  getUserBySocketId(socket.id, connection)
    .then(data => {
      // console.log('Connected user data:', data);
      if (!data) {
        socket.emit('user_not_found');
      }
    })
    .catch(err => console.error('getUserBySocketId error', err));

  socket.on('disconnect', () => {
    console.log('disconnect',socket.handshake.auth.token);
    closeUserSocket(socket.id, connection)
      .then(data => console.log(data, 'disconnected'))
      .catch(err => console.error('closeUserSocket error', err));
  });



  socket.on('video-offer', (data, callback) => {
    console.log('video-offer received from', socket.id);
    
    getRecipient(data, socket, connection, io)
      .then((data) => {
        if (!data) {
          callback({ status: 'error', error: 'Recipient not found or not connected' });
          return;
        }
        const { sender, recipientSocketData } = data;
         const emitData = { ...data, from: sender.user_id,
                      action: 'offer-received' };
      recipientEmitter(io,recipientSocketData,emitData,'video-offer')
        callback({ status: 'ok' });
      })
      .catch(err => {
        console.error('getRecipient error', err);
        callback({ status: 'error', error: 'Failed to get recipient' });
      });
  });

  socket.on('video-answer', (data, callback) => {
    console.log('video-answer received from', socket.id);
    getRecipient(data, socket, connection, io)
      .then((data) => {
        if (!data) {
          callback({ status: 'error', error: 'Recipient not found or not connected' });
          return;
        }
        const { sender, recipientSocketData } = data;
        const emitData = { ...data, from: sender.user_id, action: 'answer-received' };
        recipientEmitter(io,recipientSocketData,emitData,'video-answer')
        callback({ status: 'ok' });
      })
      .catch(err => {
        console.error('getRecipient error', err);
        callback({ status: 'error', error: 'Failed to get recipient' });
      });
  });

  socket.on('new-ice-candidate', (data, callback) => {
    console.log('new-ice-candidate received from', socket.id);
    getRecipient(data, socket, connection, io)
      .then((data) => {
        if (!data) {
          callback({ status: 'error', error: 'Recipient not found or not connected' });
          return;
        }
        const { sender, recipientSocketData } = data;
        const emitData = { ...data, from: sender.user_id, action: 'candidate-received' };

        // io.to(recipientSocketData.socket_id).emit('new-ice-candidate', emitData);
        recipientEmitter(io,recipientSocketData,emitData,'new-ice-candidate')
        
        callback({ status: 'ok' });

        // emitter.emit('new-ice-candidate', emitData, (ack) => {
        //   if (ack && ack.error) {
        //     console.error('emitter error ack:', ack.error);
        //   }
        //   callback({ status: 'ok' });
        // });
      })
      .catch(err => {
        console.error('getRecipient error', err);
        callback({ status: 'error', error: 'Failed to get recipient' });
      });
  });


  

  // socket.on('video-answer', (data) => {
  //   console.log('video-answer received from', socket.id);
  //   const targetUserId = data?.data?.to || data?.to;
  //   const answer = data?.data?.answerSDP || data?.sdp || null;
  //   getUserBySocketId(socket.id, connection)
  //     .then(sender => {
  //       console.log('sender', sender);
  //       if (!sender) {
  //         socket.emit('user_not_found');
  //         return;
  //       }
  //       getSocketIdByUserId(targetUserId, connection)
  //         .then(targetSocketData => {
  //           console.log('targetSocketData', targetSocketData);
  //           if (!targetSocketData) {
  //             socket.emit('recipient_not_found');
  //             return;
  //           }
  //           const emitData = { ...data, from: sender.user_id, action: 'answer-received' };
  //           const emitter = io.to(targetSocketData.socket_id);
  //           emitter.emit('video-answer', emitData, (ack) => {
  //             if (ack && ack.error) {
  //               console.error('emitter error ack:', ack.error);
  //             }
  //           });
  //         })
  //         .catch(err => console.error('getSocketIdByUserId error', err));
  //     })
  //     .catch(err => console.error('getUserBySocketId error', err));
  // });

  // socket.on('new-ice-candidate', (data) => {
  //   console.log('new-ice-candidate received from', socket.id);
  //   const targetUserId = data?.data?.to || data?.to;
  //   const candidate = data?.data?.candidate || data?.candidate || null;
  //   getUserBySocketId(socket.id, connection)
  //     .then(sender => {
  //       console.log('sender', sender);
  //       if (!sender) {
  //         socket.emit('user_not_found');
  //         return;
  //       }
  //       getSocketIdByUserId(targetUserId, connection)
  //         .then(targetSocketData => {
  //           console.log('targetSocketData', targetSocketData);
  //           if (!targetSocketData) {
  //             socket.emit('recipient_not_found');
  //             return;
  //           }
  //           const emitData = { ...data, from: sender.user_id, action: 'candidate-received' };
  //           const emitter = io.to(targetSocketData.socket_id);
  //           emitter.emit('new-ice-candidate', emitData, (ack) => {
  //             if (ack && ack.error) {
  //               console.error('emitter error ack:', ack.error);
  //             }
  //           });
  //         })
  //         .catch(err => console.error('getSocketIdByUserId error', err));
  //     })
  //     .catch(err => console.error('getUserBySocketId error', err));
  // });

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