const responses = [
  [/(hi|hello|hey)/i, ["Hello!", "Hi there!", "Hey! How can I assist you?"]],
  [/(what is your name\?|who are you)/i, ["I am Namma Bot, your college assistant!"]],
  [/(how can you help me\?|what is the use of you)/i, ["I can answer your queries about college, courses, fee structures, and more."]],
  [/(what courses are available\?)/i, ["We offer BCA, BBA, B.Com, and more!"]],
  [/(how to apply for admission\?|admission process|how to take admission)/i, [`<b>How to apply for admission at St. Claret College:</b><br><br>
    1. <b>Online:</b> Visit <a href="https://www.claretcollege.edu.in" target="_blank">claretcollege.edu.in</a> and fill out the form.<br>
    2. <b>Offline:</b> Collect and submit the form at the college office.<br>
    3. <b>Required Documents:</b><br>- Marks cards<br>- Caste/Category certificate<br>
    4. <b>Process:</b> Submit form → Attend interview → Pay fees<br>
    Let me know if you'd like help with eligibility or fees!`
  ]],
  [/(who is the principal of the college\?)/i, ["The current principal is Rev. Dr. Thomas V. Thennadiyil."]],
  [/(what are the college timings|college timings\?)/i, ["The college operates from 9 AM to 5 PM on weekdays."]],
  [/(bye|goodbye)/i, ["Goodbye! Have a great day!"]],
  [/(who developed you|who made you\?)/i, ["A team of three members from St. Claret College developed me."]],
  [/(clear chat|reset|start over)/i, ["Chat cleared!"]],
  [/(Department of Computer Science|computer science department|info about bca)/i, ["The Department of Computer Science at St. Claret College Autonomous offers various undergraduate and postgraduate programs in computer science, including B.Sc. in Computer Science, B.C.A., and MCA. Add-on programs include Data Science and AI/ML."]],
  [/(fathers of claret college|who are the fathers)/i, ["Rev. Dr. Thomas V. Thennadiyil is the Principal and Rev. Father Joseph S. is the Vice Principal."]],
];

const sendSound = document.getElementById("sendSound");
const receiveSound = document.getElementById("receiveSound");
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

let selectedVoice = null;

function loadVoices() {
  const voices = window.speechSynthesis.getVoices();
  const preferredVoices = [
    "Google हिन्दी", "Google English (India)", "Google en-IN",
    "Microsoft Heera", "Google UK English Female", "Google US English"
  ];
  for (let name of preferredVoices) {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) {
      selectedVoice = voice;
      return;
    }
  }
  selectedVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
}
window.speechSynthesis.onvoiceschanged = loadVoices;

function getBotResponse(input) {
  input = input.toLowerCase().trim();
  if (!input) return "Please type or say something so I can help you!";
  for (let [pattern, replies] of responses) {
    if (pattern.test(input)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return `<b>I'm sorry, I didn't understand that.</b> Could you try asking differently?<br><br>
  Here are some things I can help with:<br>
  - Admission process<br>
  - College timings<br>
  - Available courses<br>
  - Fee structure`;
}

function speakResponse(message) {
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(message.replace(/<[^>]*>/g, " "));
  if (selectedVoice) speech.voice = selectedVoice;
  speech.lang = selectedVoice?.lang || "en-IN";
  speech.rate = 0.95;
  speech.pitch = 1.0;
  window.speechSynthesis.speak(speech);
}

function sendMessage() {
  const userText = userInput.value.trim();
  if (userText === "") return;

  sendSound.play();
  chatBox.innerHTML += `<div class="user-message">${userText}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  const typingIndicator = document.createElement("div");
  typingIndicator.className = "bot-message typing";
  typingIndicator.innerHTML = "Typing...";
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;

  const response = getBotResponse(userText);

  setTimeout(() => {
    chatBox.removeChild(typingIndicator);
    chatBox.innerHTML += `<div class="bot-message">${response}</div>`;
    receiveSound.play();
    chatBox.scrollTop = chatBox.scrollHeight;
    speakResponse(response);
  }, 1500);

  userInput.value = "";
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    chatBox.innerHTML += `<div class="bot-message">Voice input not supported in this browser.</div>`;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
  };

  recognition.onerror = () => {
    chatBox.innerHTML += `<div class="bot-message">Sorry, I couldn't hear you properly. Please try again or type your question.</div>`;
  };

  recognition.start();
}

function clearChat() {
  chatBox.innerHTML = "";
}

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("speakBtn").addEventListener("click", startListening);
document.getElementById("clearBtn").addEventListener("click", clearChat);

userInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});