const socket = io();
//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const geolocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const lcoationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room  } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    // Hegiht of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', message => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html)

    if(message.text === 'Welcome!'){
        notifyMe('Connected')
    }
    if(document.hidden){
            notifyMe('New message')
    }
    autoscroll()
})
socket.on('locationMessage', message => {
    console.log(message)
    const html = Mustache.render(lcoationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('H:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled','disabled');

    if(!$messageFormInput.value) return $messageFormButton.removeAttribute('disabled');

    socket.emit('sendMessage', $messageFormInput.value, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.log(error)
        }
        console.log('message delivered');
        // alertify.success('Message was sent');
    })
})

geolocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.');
    }
        geolocationButton.setAttribute('disabled', 'disabled')
        navigator.geolocation.getCurrentPosition( position => {
            const data = {   
                latitude:position.coords.latitude ,
                longitude:position.coords.longitude,
            }
            socket.emit('sendLocation',data, () => {
                geolocationButton.removeAttribute('disabled')
                console.log('Location shared');

            })
        })
})

socket.emit('join', {username, room}, error => {
    if (error) {
        alert(error);
        location.href = '/';
    }
})


function notifyMe(text) {
    if (!("Notification" in window)) return
  
    if (Notification.permission === "granted") {
      var notification = new Notification(text);
    }
  
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          var notification = new Notification(text);
        }
      });
    }
  
  }