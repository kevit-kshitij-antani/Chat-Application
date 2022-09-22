const generateMessage = function(username,text) {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = function(username, url) {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}