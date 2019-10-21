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
socket.on('message', message => {
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html)
})
socket.on('locationMessage', message => {
    const html = Mustache.render(lcoationTemplate,{
        url:message.url,
        createdAt:moment(message.createdAt).format('H:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled','disabled');

    if(!$messageFormInput.value) return $messageFormButton.removeAttribute('disabled');

    socket.emit('messageSend', $messageFormInput.value, (error) => {
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
c 
    
      
})
