const socket = io();

//Elements 
// For sending message
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

//For sending location
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoscroll = function () {

    // get the last message from screen as it will be shown at bottom
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset  = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

// With the use of template prints MESSAGES in html file
socket.on('message', function (message) {

    console.log(message);

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

// With the use of template prints link of LOCATION in html file
socket.on('locationMessage', function(message) {

    console.log(message);

    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', function( {room, users}) {

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html;
})

// Send message to server from client
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // disable
    $messageFormButton.setAttribute('disabled','disabled');
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, function (error) {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus()

        // enable
        if (error) {
            return console.log(error);
        }
        console.log('Message Delivered!');
    })
})

// Sending location to server or another client
$sendLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    // disabling the send location button
    $sendLocation.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position) => {

        // enabling the send locatio button
        $sendLocation.removeAttribute('disabled');

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        socket.emit('sendLocation', { latitude, longitude }, function () {
            console.log('Location shared!');
        })
    })
})

socket.emit('join', { username, room }, function (error) {
    if(error) {
        alert(error)
        location.href = '/'
    }
})