const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
// var server = app.listen(3001, function () {
//     console.log('Server is running')
// });
const server = require('http').createServer(app);
// const io = require('socket.io')(server);

const io = require("socket.io")(server, {
    allowEIO3: true, 
    // cors: {
    //     origin: "http://localhost:3001",
    //     methods: ["GET", "POST"]
    //   }
    // transports: ['websocket', 'polling'],

});
app.use(cors());

app.use(express.static(path.join(__dirname, "")));
var userConnections = [];
io.on("connection", (socket) => {
    console.log("socket id is ", socket.id);
    socket.on("userconnect", (data) => {
        console.log("userconnect", data.displayName, data.meetingid);
         var other_users = userConnections.filter((p) => p.meeting_id == data.meetingid);
        userConnections.push({
            connectionId: socket.id,
            user_id: data.displayName,
            meeting_id: data.meetingid,
        });
       
        other_users.forEach((v) => {
         socket.to(v.connectionId).emit("inform_others_about_me", {
                other_user_id: data.displayName,
                connId: socket.id,
            });
        });

        socket.emit("inform_me_about_other_users",other_users);
    });
    socket.on("SDPProcess", (data) => {
         socket.to(data.to_connid).emit("SDPProcess",{
            message: data.message,
            from_connid: socket.id,
         })

    });
});
server.listen(3001, () => {
    console.log('Server listening on port 3001');
  });