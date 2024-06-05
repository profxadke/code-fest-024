//--------------------------------------- to accept code and run in the output section ---------------------------------//

function run(){
  let htmlCode= document.getElementById("html-code").value;
  let cssCode= document.getElementById("css-code").value;
  let jsCode= document.getElementById("js-code").value;
  let output= document.getElementById("output");
  let myText=document.querySelector("#html-code").value;
  // console.log(myText);

  output.contentDocument.body.innerHTML = htmlCode +"<style>" + cssCode + "</style>";
  output.contentWindow.eval(jsCode);
}


// -------------------------------------------------------------timer---------------------------------------------//
let initialTime = 45 * 60; // Convert 45 minutes to seconds (45 * 60)
let timerElement = document.getElementById("timer");

function updateTime() {
  let minutes = Math.floor(initialTime / 60);
  let seconds = initialTime % 60;
  minutes = minutes.toString().padStart(2, "0"); // Add leading zero for single-digit minutes
  seconds = seconds.toString().padStart(2, "0"); // Add leading zero for single-digit seconds
  timerElement.textContent = `${minutes}:${seconds}`;

  if (initialTime > 0) {
    initialTime--;
    
  } else {
    // Handle timer completion (e.g., disable editing, display alert)
       
    alert("Time's Up!"); // Example log message
  }

  setTimeout(updateTime, 1000); // Update timer every second
}

updateTime(); // Start the timer on page load


let codeForm = document.getElementById("code-form"); // Reference the code form

function submitCode(event) {
  event.preventDefault(); // Prevent default form submission behavior
// Get code from textareas
let htmlCode = document.getElementById("html-code").value;
let cssCode = document.getElementById("css-code").value;
let jsCode = document.getElementById("js-code").value;

// Implement your logic to submit the code (e.g., send to server, display output)
console.log("Submitting code:");
/*
console.log("HTML:", htmlCode);
console.log("CSS:", cssCode);
console.log("JS:", jsCode);
*/
let data = {
    'html': btoa(htmlCode),
    'css': btoa(cssCode),
    'js': btoa(jsCode),
    'time_taken': Number(document.getElementById('timer').innerText.split(':')[0]*60 + document.getElementById('timer').innerText.split(':')[1])
}

// console.log(data);

// Fetch API request(PUT HTTP Request), submitting all these 3 codes in JSON+b64Encoded Code.
fetch('http://127.0.0.1:2580/code', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
 });
// TODO: Above submission handiling n' stuff..
}

// codeForm.addEventListener("submit", submitCode); // Add submit event listener
document.querySelector("button").onclick = e => { submitCode(e) };
