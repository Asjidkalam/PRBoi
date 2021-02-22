const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 675,
    icon: 'app/prboi.ico',
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadFile('./app/index.html');
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setResizable(false);
}
app.whenReady().then(createWindow);

// Get local username
ipcMain.on("getLocalUsername", function (event, arg) {
  if (fs.existsSync('data.json')) {
    let userData = JSON.parse(fs.readFileSync('data.json'));
    event.reply("autoUsername", userData.username);
  }
});

ipcMain.on("btnclick", function (event, url, gitUser, bugType, language) {  

  // Save username locally
  let userJSON = {
    username: gitUser
  };
  fs.writeFileSync("data.json", JSON.stringify(userJSON));
  
  // Template selection
  let template = "";
  switch(bugType){
    case "xss":
      template = "xss.json";
      break;
    case "yaml":
      template = "yaml_rce.json";
      break;
    case "protopoll":
      template = "prototypePoll.json"
      break;
    case "cmdInj":
      template = "childprocess_rce.json"
      break;
    default:
      alert("Template not found!");
      break;
  }

  // Load Template
  let rawdata = fs.readFileSync(path.resolve(__dirname, 'templates/' + template));
  let parsedJSON = JSON.parse(rawdata);

  // Parse date
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  dateToday = yyyy + '-' + mm + '-' + dd;

  // Parse maintainer and repo name
  let repoInfo = url.split('.com/')[1].split('/');

  // Parsing data
  parsedJSON.Contributor.Discloser = gitUser;
  parsedJSON.DisclosureDate = dateToday;
  parsedJSON.Package.Name = repoInfo[1];
  parsedJSON.Package.URL = url;
  parsedJSON.Repository.URL = url;
  parsedJSON.Repository.Owner = repoInfo[0];
  parsedJSON.Repository.Name = repoInfo[1];
  parsedJSON.Repository.Codebase = [language];

  // Sent shit to rendererProcess
  event.reply("urlResp", JSON.stringify(parsedJSON, null, 4));
});