const users = [];


const addUser = function ( { id, username, room } ) {
        
    // Trim data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room ){
        return {
            error: 'Username and room are required.'
        }
    }

    const existingUser = users.find( function (user) {
        return user.room === room && user.username === username
    })

    //Validate usrename 
    if(existingUser){
        return {
            error: 'Username is already exist'
        }
    }

    // Store user
    const user = { id, username, room };
    users.push(user)
    return { user }
}

const removeUser = function(id) {
    const index = users.findIndex(user => user.id === id)

    if( index !== -1){
        return users.splice(index, 1)[0]
    }
} 

const getUser = function(id) {
    return users.find(user => user.id === id)
}

const getUserInRoom = function (room) {
    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}