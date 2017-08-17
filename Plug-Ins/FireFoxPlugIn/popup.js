document.addEventListener('DOMContentLoaded', function() {
    ///////////////////////////////////////////////////////// ATTRIBUTES ////////////////////////////////////////////
    // Get Buttons from HTML
    var connectBtn = document.getElementById('connectBtn');
    var websiteBtn = document.getElementById('websiteBtn');
    var accceptBtn = document.getElementById('acceptBtn');
    // Get selected elements from HTML
    var buildSelect = document.getElementById('selectedBuilding');
    var potSelect = document.getElementById('selectedPot');
    var ipAddressInput = document.getElementById('ipAddress');
    var portInput = document.getElementById('port');
    var nameInput = document.getElementById('usrName');
    //Get items from the local storage
    var buildNr = localStorage.getItem("buildNr");
    var floorNr = localStorage.getItem("floorNr");
    var ipAddr = localStorage.getItem("ipAddress");
    var port = localStorage.getItem("port");
    var usrName = localStorage.getItem("usrName");
    var potStatus = localStorage.getItem("potReceived");
    var message = localStorage.getItem("notificationMessage");
    var potTime = localStorage.getItem("progressTime");

    var newURL = "http://172.27.10.180/"; // Angular Website Adress
    var counter = 0, progress = 0.0, displayProgress = 0.0; // Variables for the html progress bar
    var htmlStyle = localStorage.getItem("settingsHtmlStyle"); // Controlls the style of the html application
    var refresh = true; // Controlls the refresh of the update
    htmlStyle = (htmlStyle == 'true');
    /////////////////////////////////////////////// FUNCTION AND QUERIES //////////////////////////////////////////////
    // Html styling
    if(htmlStyle == true)
    {
        for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
            p[i].style.background = '#fff';
            p[i].style.transition = '0s';
        }
    } else if(htmlStyle == false) {
        for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
            p[i].style.background = '#AA4040';
            p[i].style.transition = '0s';
        }
    }

    /////////////////////////////////////// Read local storag properties //////////////////////////////////////////////
    if(message == '' || message == null) {
        localStorage.setItem("notificationMessage", "Aktueller Status der Kaffeekanne unbekannt!");
    } else {
         document.getElementById("notifications").innerHTML = message;
    }

    // Set selected building --> checks the local storage attributes
    if(buildNr && (buildNr > 0 && buildNr < 10))
    {
        buildSelect.value = buildNr.toString();
    }
    else {
        // In case that the building is not in the local storage -> that means it isn´t set so set to default
        var buildId = "notSelected";
        localStorage.setItem("buildNr", buildId);
    }
  
    // Set select por --> checks the local storage attributes
    if(floorNr && (floorNr > 0 && floorNr < 10))
    {
        potSelect.value = floorNr.toString();
    }
    else {
        // In case that the pot is not in the local storage --> that means it isnt set, so set to default
        var floorId = "notSelected";
        localStorage.setItem("floorNr", floorId);
    }
  
    // Set selected username --> checks the local storage attributes
    if(usrName && (usrName !== '' && typeof usrName === 'string'))
    {
        nameInput.value = usrName.toString();
    } 
    else {
        // In case that the username is not in the local storage --> that means it isnt set, so set to default
        nameId = "defaultUser";
        localStorage.setItem("usrName", nameId);
    }
    
    // Set ip address --> checks the local storage attributes --> no default attribute here
    if(ipAddr && ipAddr != '') 
    {
        ipAddressInput.value = ipAddr.toString();
    }
        
    // Set port --> checks the local storage attributes --> no default attribute here
    if(port && port != '') 
    {
        portInput.value = port.toString();
    }

    // Change event of select pot element
    potSelect.addEventListener('change', function() 
    {
        // Get selected value from select field
        var potId = parseInt(potSelect.options[potSelect.selectedIndex].value);
        
        // Store selected value
        localStorage.setItem("floorNr", potId);
        floorNr = potId;
    }, false);
  
    // Change event of select building element
    buildSelect.addEventListener('change', function() 
    {
        // Get selected value from select field
        var buildId = parseInt(buildSelect.options[buildSelect.selectedIndex].value);
        // Store selected value
        localStorage.setItem("buildNr", buildId);
        buildNr = buildId;
    }, false);
    
    //////////////////////////////////////////////////// Button event listner //////////////////////////////////////////////////////////

    // Button to pass to the website
    websiteBtn.addEventListener('click', function() 
    {
        // Heres is the url address for the angular website on the raspberry pi
        chrome.tabs.create({ url: newURL });
    }, false);
    
    // Button to connect to the raspberry server
    connectBtn.addEventListener('click', function() 
    {
        // Attributes
        var ip = ipAddressInput.value;
        var portNr = portInput.value;
        var name = nameInput.value;
        var c = nameInput.value;
    
        // Set username (only if it is a strings)
        if(nameInput && nameInput.value !== "" && typeof nameInput.value === 'string' && isNaN(c) == true)
        {
            console.log("Benutzername: ", nameInput.value);
            localStorage.setItem("usrName", name); // Sets the local storage attribute
        }
        else
        {
            // In case that the username is not selected set to default user
            name = "defaultUser";
            localStorage.setItem("usrName", name);
        }
        nameInput.value = name;
    
        if(ip && portNr) 
        {
            console.log("Tries to connect to raspberry server!");
            console.log("Connect on: ", ip);
            localStorage.setItem("ipAddress", ip);
            localStorage.setItem("port", portNr);
        
            // Tries to connect to the raspberry server
            chrome.runtime.sendMessage({tryConnect: true}, function(response) { 
                if(response == "CONNECTED")
                {
                    for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
                        p[i].style.background = '#fff';
                        p[i].style.transition = '3s';
                    }
                } else {
                    for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
                        p[i].style.background = '#AA4040';
                        p[i].style.transition = '3s';
                    }
                }
            });
        }		
    }, false);

    accceptBtn.addEventListener('click', function() 
    {
      // Here the user accepts to get the pot
      chrome.runtime.sendMessage({ buttonClick: true }, function(response) { });
    }, false);

    //////////////////////////////////// Notification from background.js to update HTML interface ////////////////////////////////////////
    function INCOMMING_POT(buildingId, floorId) {
        console.log("Incomming pot!");
        var txtMessage = 'Die Kaffeekanne aus Geb\u00e4ude ' + buildingId + ' Stockwerk ' + floorId + ' wird momentan bef\u00fcllt!';
        localStorage.setItem("notificationMessage", txtMessage);

        // Get the html elements in order to change the html elements
        var prg = document.getElementById('progress');
        var percent = document.getElementById('percentCount');

        // Change the HTML settings
        prg.style.width = 0 + 'px'; 
        percent.innerHTML = 0 + '%';
    }
    function POT_READY(buildingId, floorId) {
        console.log("Pot ready!");
        var txtMessage = 'Die Kaffeekanne aus Geb\u00e4ude ' + buildingId + ' Stockwerk ' + floorId + ' ist fertig! Wollen Sie die Kaffeekanne abholen?';
        localStorage.setItem("notificationMessage", txtMessage);
        localStorage.setItem("delay", true);
        location.reload();
    }
    function POT_PREPARED(buildingId, floorId) {
        console.log("Pot prepared!");
        setTimeout(function(){ 
            var txtMessage = 'Die Kaffeekanne aus Geb\u00e4ude ' + buildNr + ' Stockwerk ' + floorId + ' wird zurzeit zubereitet!';
            localStorage.setItem("notificationMessage", txtMessage);
            location.reload();
        }, 1000);
    }
    function POT_GET() {
        console.log("Pot get!");
        var txtMessage = "<Benutzer> hat sich bereiterkl\u00e4ert, die Kaffeekanne in Geb&\u00e4ude <1> im <1>. Stockwerk abzuholen!";
        localStorage.setItem("notificationMessage", txtMessage); 
        localStorage.setItem("delaySpec", true);
        location.reload();
    }
    function POT_TAKEN() {
        console.log("Pot taken!");
        var txtMessage = "Die Kaffeekanne wird bereits abgeholt. Sie m&uuml;ssen die Kaffeekanne NICHT abholen!";
        localStorage.setItem("notificationMessage", txtMessage);
        localStorage.setItem("delaySpec", true);
        location.reload();
    }

    function updateProgressBar(time, status) {
        // Get the html elements in order to change the html elements
        var prg = document.getElementById('progress');
        var percent = document.getElementById('percentCount');
        var potTime = localStorage.getItem("progressTime");

        var prgWidth = potTime * 3.7; // Determine the width of the bar depending on the status
        prgWidth = prgWidth.toFixed(0);

        // Change the HTML settings
        prg.style.width = prgWidth + 'px'; 
        percent.innerHTML = potTime + '%';
    }

    //////////////////////////////// Change appereance if user is connected ////////////////////////////////////////////
    function changeStyleConnected() {
        // White appereance
        for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
            p[i].style.background = '#fff';
            p[i].style.transition = '2s';
        }
        localStorage.setItem("settingsHtmlStyle", true);
    }
    function changeStyleDisconnected() {
        // Red appereance
        for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
            p[i].style.background = '#AA4040';
            p[i].style.transition = '2s';
        }
        localStorage.setItem("settingsHtmlStyle", false);
    }

    // Get messages from the background.js and call corresponding function
    chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
        console.log("Empfangen: " + msg.POT_READY + " " + msg.building + " " + msg.floor);
        if (msg.INCOMMING_POT) // Incomming coffee pot
            INCOMMING_POT(msg.building, msg.building);
        if (msg.POT_READY) // Coffee pot is ready
            POT_READY(msg.building, msg.floor);
        if (msg.POT_GET) // Take the coffee pot
            POT_GET();
        if (msg.POT_TAKEN) // Inform that pot is taken
            POT_TAKEN();
        if (msg.POT_PREPARED) // Inform the user that coffee is brewed
            POT_PREPARED(msg.building, msg.floor);
        if (msg.UPDATE_BAR) // Update the HTML progress bar
            updateProgressBar(msg.time);
        if (msg.Connected) // Change plug-in style for connected
            changeStyleConnected();
        if(msg.Disconnected) // Change plug-in style for disconneted
            changeStyleDisconnected();
    });

    window.onload = function () 
    {
        console.log("Application opened/refreshed!");
        var delay = localStorage.getItem("delay");
        var delaySpec = localStorage.getItem("delaySpec");
        if(delay == true || delay.indexOf("true") >= 0)
        {
           document.getElementById("acceptBtn").disabled = false;  

            setTimeout(function(){ 
                localStorage.setItem("notificationMessage", "Die Kaffeekanne ist zurzeit voll bef\u00fcllt!");
                document.getElementById("acceptBtn").disabled = true; 
                localStorage.setItem("delay", false);
                location.reload();
            }, 10000); 
        } else if(delaySpec == true || delaySpec.indexOf("true") >= 0)
        {
            setTimeout(function(){ 
                localStorage.setItem("notificationMessage", "Die Kaffeekanne ist zurzeit voll bef\u00fcllt!");
                localStorage.setItem("delaySpec", false);
                location.reload();
            }, 10000);
        }
    
        /*
        console.log("Kontrolle: " + refresh);
        if (refresh == true)
        {
            // When application is open start progressbar animation
            console.log("Chrome Plug-In open!");
            setTimeout(function(){ 
                var animation = document.getElementById('animation');
                animation.style.transition = 3 + "s";
                animation.style.opacity = 1;
            }, 500);
        }*/
    }
    // Checks if general changes in the local storage are made
    window.addEventListener("storage", function () {
        htmlStyle = localStorage.getItem("settingsHtmlStyle");
        htmlStyle = (htmlStyle == 'true');
        if(htmlStyle == true)
        {
            for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
                p[i].style.background = '#fff';
                p[i].style.transition = '0s';
            }
        } else if(htmlStyle == false) {
            for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
                p[i].style.background = '#AA4040';
                p[i].style.transition = '0s';
            }
        }
    }, false);
}, false); // Main-ActionListener
