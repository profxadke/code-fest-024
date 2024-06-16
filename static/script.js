// -------------------------------------------------------------timer---------------------------------------------//
var timerStarted = false;
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
    document.querySelector("#timer").style.background = "#F00"
    Swal.fire({
      title: "Oops!",
      text: "Time's Up!",
      icon: "error"
    }).then( e => {
      stopTimer();
      submitCode();
      function updateTime() {};
    })
  }
  pid = setTimeout(updateTime, 1e3); // Update timer every second
}

function updateTimeOnce() {
  if ( !timerStarted ) {
    updateTime();
  }
}

function stopTimer() {
  clearTimeout(pid);
  function updateTime() { /* NOTHING! */  };
}

//--------------------------------------- to accept code and run in the output section ---------------------------------//

function run(){
  updateTimeOnce();
  let htmlCode= document.getElementById("html-code").value;
  let cssCode= document.getElementById("css-code").value;
  let jsCode= document.getElementById("js-code").value;
  let output= document.getElementById("output");

  output.contentDocument.body.innerHTML = htmlCode +"<style>" + cssCode + "</style>";
  output.contentWindow.eval(jsCode); }

if ( Boolean(localStorage.getItem("token")) ) {
  fetch(`/jwt`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({token: localStorage.token})
  }).then( resp => {
      resp.json().then( resp_json => {
        if (resp_json.valid) {
          const decoded = JSON.parse(atob(localStorage.token.split('.')[1]))
          document.querySelector("a").remove()
          document.querySelector("h1").innerText = "CodeFest 2024"
          document.querySelector("span").innerText = `Welcome!  `;
          username_elem = document.createElement('span');
          username_elem.setAttribute('id', 'username'); username_elem.innerText = `  @${decoded.sub}!`; document.querySelector("span").appendChild(username_elem); img_elem = document.createElement('img');
          img_elem.setAttribute('id', 'avatar');
          img_elem.setAttribute('src', decoded.avatar);
          document.querySelector('center').appendChild(img_elem);
          document.querySelector('center').appendChild(document.createElement('br'));
          // document.querySelector('center').appendChild(document.createElement('br'));
          document.querySelector('#app').innerHTML = `
        <center>
              <div class="dropdown">
                <button class="dropbtn">OAUTH</button>
                <div class="dropdown-content">
                  <a href="#" onclick="logout()">Logout</a>
                </div>
              </div>
              <br /> <br />
              <div id="timer">45:00</div>
        </center>
          <div class="container">
            <div class="left">
              <label><i class="fa-brands fa-html5"></i>HTML</label>
              <textarea id="html-code" spellcheck="false" onkeyup="run()"></textarea>
              <label><i class="fa-brands fa-css3-alt"></i>CSS</label>
              <textarea id="css-code" spellcheck="false" onkeyup="run()"></textarea>
              <label><i class="fa-brands fa-js"></i>JS</label>
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
    })
  })
}

let codeForm = document.getElementById("code-form"); // Reference the code form

function str_pad_left(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

function submitCode() {
let htmlCode = document.getElementById("html-code").value;
let cssCode = document.getElementById("css-code").value;
let jsCode = document.getElementById("js-code").value;

let took = Number(document.getElementById('timer').innerText.split(':')[0]*60) + Number(document.getElementById('timer').innerText.split(':')[1]);
if (took===0) {
  took = 2700;
}
let data = {
    'css': btoa(cssCode),
    'html': btoa(htmlCode),
    'js': btoa(jsCode),
    'time_taken': took
}

fetch('http://127.0.0.1:2580/code', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 
              'X-TOKEN': localStorage.token
          },
  body: JSON.stringify(data)
 }).then( async ( resp ) => {
    let json = await resp.json();
    let msg = json.Good;
    x = msg.split('/')[0]
    y = Number(x.split(' ')[ x.split(' ').length - 1 ]);
    x = Math.floor(y / 60);
    z = y - x * 60;
    time_taken = str_pad_left(x, '0', 2) + ':' + str_pad_left(z, '0', 2);
    msg = msg.replace(String(y), time_taken);
    msg = msg.replace('2700', '45:00');
    Swal.fire({
      title: "Good!",
      text: `File ${msg}`,
      icon: "success"
    }).then(e => {
      stopTimer();
      function updateTime() {};
    })
    document.querySelector("#timer").style.color = "#000";
    document.querySelector("#timer").style.background = "#F00";
  })
}

function logout() {
  delete(localStorage.token);
  document.location.reload();
}

if ( document.querySelector('#auth') ) {
  document.querySelector('.container').style.paddingLeft = "42%";
}

if ( document.querySelector('#submit-btn') ) {
    document.querySelector("#submit-btn").onclick = e => {   e.preventDefault(); submitCode() };
}
