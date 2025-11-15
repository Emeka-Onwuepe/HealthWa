import { getUserBySocketId, updateUserSocket,
          closeUserSocket, getSocketIdByUserId
       } from '../socket/models.js';


//  const socketsList = Array.from(io.sockets.sockets.values()).map(s => ({
//               id: s.id,
//               connected: !s.disconnected,
//               auth: s.handshake?.auth || null
//             }));
//  console.log('All sockets:', socketsList[0].id);


           

            // create emitter for the recipient socket
            // const emitter = io.to(targetSocketData.socket_id);
            



            // emitter.emit('video-offer', emitData, (ack) => {
            //   if (ack && ack.error) {
            //     console.error('emitter error ack:', ack.error);
            //   }
            //   });
    //         const result = emitter.emit('video-offer', emitData);
    //         console.log('Emitter:', emitter);
    //         console.log('Emit result:', result);
    //       })
    //       .catch(err => console.error('getSocketIdByUserId error', err));

    //   })
    //   .catch(err => console.error('getUserBySocketId error', err));

     export const getRecipient = async (data, socket, connection, io) => {
        const targetUserId = data?.data?.to.id || data?.to.id;
        const sender = await getUserBySocketId(socket.id, connection);
        if (!sender) {
          console.log('user not found')
          socket.emit('user_not_found');
          return null;
        }
        const recipientSocketData = await getSocketIdByUserId(targetUserId, connection);
        if (!recipientSocketData) {
          console.log('recipient not found id',targetUserId)
          socket.emit('recipient_not_found');
          
          return null;
        }

        // console.log('sender', sender);
        // console.log('recipientSocketData', recipientSocketData);

        const targetSocket = io.sockets.sockets.get(recipientSocketData.socket_id);
        if (!targetSocket || targetSocket.disconnected) {
          console.log('target socket not connected:', recipientSocketData.socket_id);
          socket.emit('recipient_not_connected', { to: targetUserId });
            return null;
        }
        return { sender, recipientSocketData };
        
      }

export const recipientEmitter = (io,recipientSocketData,emitData,type) => {
        const recipientSocket = io.sockets.sockets.get(recipientSocketData.socket_id);
        recipientSocket.emit(type, emitData);
}















    // const targetUserId = data?.data?.to || data?.to;

    // getUserBySocketId(socket.id, connection)
    //   .then(sender => {
    //     // console.log('sender', sender);
    //     if (!sender) {
    //       socket.emit('user_not_found');
    //       return;
    //     }

    //     getSocketIdByUserId(targetUserId, connection)
    //       .then(targetSocketData => {
    //         // console.log('targetSocketData', targetSocketData);
    //         if (!targetSocketData) {
    //           socket.emit('recipient_not_found');
    //           return;
    //         }
    //         const emitData = { ...data, from: sender.user_id,
    //           action: 'offer-received' };

    //         // create emitter for the recipient socket
    //         // const emitter = io.to(targetSocketData.socket_id);
    //         const targetSocket = io.sockets.sockets.get(targetSocketData.socket_id);
    //         if (!targetSocket || targetSocket.disconnected) {
    //           console.log('target socket not connected:', targetSocketData.socket_id);
    //           socket.emit('recipient_not_connected', { to: targetUserId });
    //           return;
    //         }



    //         // emitter.emit('video-offer', emitData, (ack) => {
    //         //   if (ack && ack.error) {
    //         //     console.error('emitter error ack:', ack.error);
    //         //   }
    //         //   });
    //         const result = emitter.emit('video-offer', emitData);
    //         console.log('Emitter:', emitter);
    //         console.log('Emit result:', result);
    //       })
    //       .catch(err => console.error('getSocketIdByUserId error', err));

    //   })
    //   .catch(err => console.error('getUserBySocketId error', err));