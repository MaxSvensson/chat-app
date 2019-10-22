const users = [];


 const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if(!username || !room) {
        return {
            error:'Username and room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser) {
        return {
            error:'Username is in use!'
        }
    }
    //store user
    const user = {id, username, room};
    users.push(user);
    return { user }

 }

const removeUser = (id) => {
  const index = users.findIndex( user => {
     return user.id === id
    });
    console.log(index)
  if(index !== -1){
      return users.splice(index,1)[0]
  }
}

addUser({
    username:'Filip',
    room:'So',
    id:'32'
});
addUser({
    username:'Gustav',
    room:'Matte',
    id:'54'
});
addUser({
    username:'Max',
    room:'So',
    id:'22'
});


console.log(users);

const removedUser = removeUser()

console.log(removedUser);
console.log(users)