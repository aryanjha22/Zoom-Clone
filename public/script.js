const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

//peer initialised
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'    //specified port
}) 

//for intitialisng video and audio
let myVideoStream 
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {                   //stream audio and video
    
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    peer.on('call', call => {                      //for answering the p2p connection after calling
        call.answer(stream)
        const video = document.createElement('video')         //creating a new video element for the receiver
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {               //passing the userid of the connected user
        connectToNewUser(userId, stream)
    })

    //Jquery
    let text = $('input')              //for messages

    $('html').keydown((e) => {
        //enter key is 13
        if(e.which == 13 && text.val().length !== 0){ 
            console.log(text.val());  
            socket.emit('message', text.val())
            text.val('')
        }
    })

    //creating the message in bar
    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom()
    })
})

//opening the peer
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

//function for a user joining and crating a video element
const connectToNewUser = (userId, stream) =>{
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

//add the video in the stream
const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.appendChild(video)
}

//function for scrolling the message
const scrollToBottom = () => {
    let d = $('.main_chat_window')
    d.scrollTop(d.prop("scrollHeight"))
}

//Mute Audio
const muteUnmute = () =>{
    const enabled = myVideoStream.getAudioTracks()[0].enabled
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false
        setUnmuteButton()
    } else{
        setMuteButton()
        myVideoStream.getAudioTracks()[0].enabled = true
    }
}

//changing state of the icon
const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    ` 
    document.querySelector('.main_mute_button').innerHTML = html
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    ` 
    document.querySelector('.main_mute_button').innerHTML = html
}

//Stop Video
const playStop = () =>{
    let enabled = myVideoStream.getVideoTracks()[0].enabled
    if(enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false
        setPlayVideo()
    } else{
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true
    }
}

//changing the state of the icon
const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    ` 
    document.querySelector('.main_video_button').innerHTML = html
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Start Video</span>
    ` 
    document.querySelector('.main_video_button').innerHTML = html
}

//leave meeting
const leave = () => {
    if (confirm("Are You Sure to leave this meeting ?")) {
        close();
  }
}