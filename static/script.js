// setTimeour, and clearTimeout enumeration hack
window.originalSetTimeout = window.setTimeout;
window.originalClearTimeout = window.clearTimeout;
window.activeTimers = 0;

window.setTimeout = function(func, delay) {
    window.activeTimers++;
    return window.originalSetTimeout(func, delay);
};

window.clearTimeout = function(timerID) {
    window.activeTimers--;
    window.originalClearTimeout(timerID);
};

//--------------------------------------- to accept code and run in the output section ---------------------------------//

var timerStarted = false;

function run(){
  let htmlCode= document.getElementById("html-code").value;
  let cssCode= document.getElementById("css-code").value;
  let jsCode= document.getElementById("js-code").value;
  let output= document.getElementById("output");
  // let myText=document.querySelector("#html-code").value;
  // console.log(myText);

  output.contentDocument.body.innerHTML = htmlCode +"<style>" + cssCode + "</style>";
  output.contentWindow.eval(jsCode); }


// -------------------------------------------------------------timer---------------------------------------------//
let initialTime = 45 * 60; // Convert 45 minutes to seconds (45 * 60)

function updateTime() {
  timerStarted = true;
  let timerElement = document.getElementById("timer");
  let minutes = Math.floor(initialTime / 60);
  let seconds = initialTime % 60;
  minutes = minutes.toString().padStart(2, "0"); // Add leading zero for single-digit minutes
  seconds = seconds.toString().padStart(2, "0"); // Add leading zero for single-digit seconds
  timerElement.textContent = `${minutes}:${seconds}`;

  if (initialTime > 0) {
    initialTime--;
    
  } else {
    // Handle timer completion (e.g., disable editing, display alert)
       
    document.querySelector("#timer").style.background = "#F00"

    alert("Time's Up!"); // Use sweetAlert here..

    function updateTime() {}
  }

  setTimeout(updateTime, 1e3); // Update timer every second
}

function updateTimeOnce() {
  if ( !timerStarted ) {
    updateTime();
  }
}

// updateTime(); // Start the timer on page load
// Start timer on clicking it.
// document.querySelector('#timer').onclick = e => { e.preventDefault(); updateTime(); }





if ( Boolean(localStorage.getItem("token")) ) {
  const decoded = JSON.parse(atob(localStorage.token.split('.')[1]))
  document.querySelector("a").remove()
  document.querySelector("span").innerText = `Welcome! @${decoded.sub}`;
  document.querySelector('#app').innerHTML = `
<center>
      <div id="timer">45:00</div>
</center>
  <div class="container">
    <div class="left">
      <label><i class="fa-brands fa-html5"></i>HTML</label>
      <textarea id="html-code" spellcheck="false" onkeyup="run()"></textarea>
      <label><i class="fa-brands fa-css3-alt"></i>CSS</label>
      <textarea id="css-code" spellcheck="false" onkeyup="run()"></textarea>
      <label><i class="fa-solid fa-square-js"></i>JS</label>
      <textarea id="js-code" spellcheck="false" onkeyup="run()"></textarea>
    </div>
    <div class="right">
      <label ><i class="fa-solid fa-play"></i>Output</label>
      <iframe id="output"></iframe>
    </div>
  </div>

    <div class="submit-container">
<button id="submit-btn" type="submit"> Submit</button>
    </div>
`;
}

let codeForm = document.getElementById("code-form"); // Reference the code form

function submitCode() {
// Get code from textareas
let htmlCode = document.getElementById("html-code").value;
let cssCode = document.getElementById("css-code").value;
let jsCode = document.getElementById("js-code").value;

/*
console.log("HTML:", htmlCode);
console.log("CSS:", cssCode);
console.log("JS:", jsCode);
*/
let data = {
    'html': btoa(htmlCode),
    'css': btoa(cssCode),
    'js': btoa(jsCode),
    'time_taken': Number(document.getElementById('timer').innerText.split(':')[0]*60) + Number(document.getElementById('timer').innerText.split(':')[1])
}

// console.log(data);

// Fetch API request(PUT HTTP Request), submitting all these 3 codes in JSON+b64Encoded Code.
fetch('http://127.0.0.1:2580/code', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 
              'X-TOKEN': localStorage.token
          },
  body: JSON.stringify(data)
 }).then( async ( resp ) => {
    let json = await resp.json();
    console.log(json);  // TODO: Show in UI using, sweetAlert.
    function updateTime() {};
    document.querySelector("#timer").style.color = "#000";
    document.querySelector("#timer").style.background = "#F00";
  })
}

// Auto-Start timer on code edit.
document.querySelectorAll('textarea').forEach( elem => {
  elem.onkeydown = () => { updateTimeOnce(); }
})

// codeForm.addEventListener("submit", submitCode); // Add submit event listener
if ( document.querySelector('button') ) {
    document.querySelector("button").onclick = e => {   e.preventDefault(); submitCode() };
}
