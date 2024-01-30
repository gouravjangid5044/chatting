const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const { emit } = require("process");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.resolve("./public")));

let room_no=1;
let rooms={}
let rooms_credential={}
function getIndianTime() {
  const indianTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', timeStyle: 'short' });
  return indianTime;
}
io.on("connection", (socket) => {
    let user_id=socket.id
    socket.on('create_room',(password,description,name)=>{
      try{
        socket.join(`room${room_no}`)
        rooms_credential[`room${room_no}`]={
          admin:user_id,
          password:password
        }
  
        rooms[`room${room_no}`]={
          description:description,
          users: {}
        }
        rooms[`room${room_no}`].users[user_id]=name
        socket.emit("res_create_room",rooms[`room${room_no}`],`room${room_no}`)
        io.emit('all_rooms_list',rooms)
        // window.location.href="localhost:9000/rooms"
        // console.log(rooms)
        room_no++;
      }
      catch(error)
      {
        socket.emit("res_create_room",false)
      }
    
    })


    socket.on('get_room_list',()=>{
      socket.emit('all_rooms_list',rooms)
    })

    // socket.join(`room${roomno}`)
    // io.to(`room${roomno}`).emit('msg',"Joined room")
    socket.on("disconnect",()=>{
      let flag=true
      let temp_users_details
      loop1: for(let obj in rooms_credential)
      {
         if(rooms_credential[obj]?.admin==user_id)
         {
            flag=false
            temp_users_details={...rooms[obj].users}
            delete rooms_credential[obj]
            delete rooms[obj]
            io.to(obj).emit("remove_all")
            delete temp_users_details[user_id]
            for(let val in temp_users_details)
            {
              let temp_socket=io.sockets.sockets.get(val)
              temp_socket.leave(obj)
            }
            break loop1;
         }
      }
      
      if(flag)
      {
        loop2 : for(let obj in rooms)
        {
          let temp=rooms[obj].users
          for(let obj2 in temp)
          {
             if(obj2==user_id)
             {
                io.to(obj).emit('user_left',rooms[obj].users[obj2])
                delete rooms[obj].users[obj2]
                io.to(obj).emit("res_join_user",rooms[obj])
                socket.leave(obj)
                break loop2
             }
          }
        }
      }
      io.emit('all_rooms_list',rooms)
      // if(!flag)
      // io.to(temp_room).disconnectSockets(true)
      // io.to(room).emit("res_join_user",rooms[room])
   })

   socket.on("join_room",(room,user,pass)=>{
      if(rooms.hasOwnProperty(room))
      {
        socket.join(room)
        if(rooms_credential[room].password==pass)
        {
          rooms[room].users[user_id]=user
          io.to(room).emit("res_join_user",rooms[room])
          socket.to(room).emit("new_joined_user",user)
        }
        else 
        // io.to(room).emit("res_join_user",false)
        socket.emit("res_join_user",false)
      }
      else
      socket.emit("no_room","No room")
   })

   socket.on("check_pass_field",(room)=>{
      let pass_value=rooms_credential[room]?.password
      // console.log("->",pass_value)
      if(pass_value)
      socket.emit('res_pass_field',true)
      else
      socket.emit('res_pass_field',false)
   })


   socket.on("chat_send",(chat,room)=>{
     socket.to(room).emit('chat_receive',chat,rooms[room].users[user_id],getIndianTime())
   })

   socket.on("typing_effect",(room)=>{
      socket.to(room).emit("res_typing_effect",rooms[room].users[user_id])
   })

   socket.on("remove_user_room",(user,room)=>{
    let temp_socket=io.sockets.sockets.get(user)
    temp_socket.leave(room)
    temp_socket.emit("removed_user","You")
    io.to(room).emit("removed_user",rooms[room].users[user])
    delete rooms[room].users[user]
    io.to(room).emit("res_join_user",rooms[room])
   })
});
app.get("/rooms", (req, res) => {
    const roomsPath = path.join(__dirname, "public", "rooms.html");
    return res.sendFile(roomsPath);
});
app.get("*", (req, res) => {
  res.redirect("/");
});
app.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "public", "index.html");
    return res.sendFile(indexPath);
});


server.listen(9000, () => console.log(`Server Started at PORT:9000`));