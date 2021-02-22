const { ipcRenderer, clipboard } = require('electron')

// DOM Elements
const btnclick = document.getElementById('submitURL');
const clipCopy = document.getElementById('copyClip');
const bugType = document.getElementById('bugType');
const language = document.getElementById('language');
const inputURL = document.getElementById('repoURL');
const username = document.getElementById('username');
const vulnJSON = document.getElementById('jsonHolder');

// Event listeners
clipCopy.addEventListener('click', function () {
    if(vulnJSON != ""){
        clipboard.writeText(vulnJSON.value, 'selection');
        alert("Copied!");
    }
});

btnclick.addEventListener('click', function () {
    if(inputURL.value && username.value != ""){
        if(!inputURL.value.includes("github.com/")){
            alert("Invalid URL!");
        } else {
            ipcRenderer.send("btnclick", inputURL.value, username.value, bugType.value, language.value); 
        }
    } else {
        alert("Fill in the details, you illiterate fuck.");
    }
});

// ipcMain <--> ipcRenderer
ipcRenderer.on("urlResp", (event, respJSON) => {
    document.getElementById('jsonHolder').value = respJSON;
});

// Gets the locally saved username
ipcRenderer.on("autoUsername", (event, username) => {
    document.getElementById('username').value = username;
});
ipcRenderer.send("getLocalUsername", null);