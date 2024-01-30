// Assuming you have an existing rooms object
function getIndianTime() {
  const indianTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', timeStyle: 'short' });
  return indianTime;
}

console.log(getIndianTime())

let rooms = {};
console.log(null==null)

// Your complex object
let room1 = {
  admin: "b78kjdh0894hhg99",
  users: ["gourav", "Amit"]
};

// Adding the room to the rooms object
rooms["room1"] = room1;

// Now, rooms object will look like:
// rooms = {
//   room1: {
//     admin: "b78kjdh0894hhg99",
//     users: ["gourav", "Amit"]
//   }
// };

console.log(rooms);
