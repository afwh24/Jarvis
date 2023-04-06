import bot from "./assets/bot.svg";
import user from "./assets/user.svg";


const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

//Create the loading indicator ("...")
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.'; 

    if(element.textContent === '....'){
      
      element.textContent= '';
    }

  }, 300);
}


//Allow the output from the bot to be typed out
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);

      index++;
    } else{

      clearInterval(interval);

    }
  }, 20)
}

//Generate unique ID for each bot message
function generateUID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);


  return `id-${timestamp}-${hexadecimalString}`;
}

//Create a different text stripe for the bot message & display icons
function chatStripe (isAI, message, uid) {
  return(
    `
      <div class="wrapper ${isAI && 'ai'}">

        <div class="chat">
          <div class="profile">
          <img src="${isAI ? bot:user}" alt="${isAI? 'bot': 'user'}"/>
          </div>

          <div class="message" id=${uid}>${message}</div>
        </div>
      </div>

    `
  )
}

//Process the user's input
const handleSubmit = async (e) => {

  //Prevent default behaviour of browser
  e.preventDefault(); 

  //Retrieve user input data
  const data = new FormData(form);

  //user input (chatstripe)
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  //clear textarea
  form.reset();


  //AI bot output (chatstripe)
  const uid = generateUID();
  chatContainer.innerHTML += chatStripe(true, " ", uid);


  //set scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uid);

  loader(messageDiv);

  //Fetch data from server API (bot response)
  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });


  clearInterval(loadInterval);
  messageDiv.innerHTML = '';


  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);

  }else{
    const err = await response.text();

    messageDiv.innerHTML = `Something went wrong`;

    alert(err);
  }
}

//Add event listener for the submit button
form.addEventListener('submit', handleSubmit);

//Add event listener for pressing "enter" button (keycode = 13)
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})
