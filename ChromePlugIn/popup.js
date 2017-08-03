document.addEventListener('DOMContentLoaded', function() {
    // Get Buttons from HTML
    var connectBtn = document.getElementById('connectBtn');
    var websiteBtn = document.getElementById('websiteBtn');
    var refillBtn = document.getElementById('refillBtn');
    // Get selected elements from HTML
    var buildSelect = document.getElementById('selectedBuilding');
    var potSelect = document.getElementById('selectedPot');
    var ipAddressInput = document.getElementById('ipAddress');
    var portInput = document.getElementById('port');
    var nameInput = document.getElementById('usrName');

    var newURL = "http://172.27.10.180/"; // Angular Website Adress
    var htmlStyle = localStorage.getItem("settingsHtmlStyle"); // Controlls the style of the html application
    htmlStyle = (htmlStyle == 'true')

    //Get items from the local storage
    var buildNr = localStorage.getItem("buildNr");
    var potNr = localStorage.getItem("potNr");
    var ipAddr = localStorage.getItem("ipAddress");
    var port = localStorage.getItem("port");
    var usrName = localStorage.getItem("usrName");

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

    // Set selected building --> checks the local storage attributes
    if(buildNr && buildNr > 0)
    {
        buildSelect.value = buildNr.toString();
    }
    else {
        // In case that the building is not in the local storage -> that means it isn´t set so set to default
        var buildId = "";
        localStorage.setItem("buildNr", buildId);
    }
  
    // Set select por --> checks the local storage attributes
    if(potNr && potNr > 0) 
    {
        potSelect.value = potNr.toString();
    }
    else {
        // In case that the pot is not in the local storage --> that means it isnt set, so set to default
        var potId = "";
        localStorage.setItem("potNr", potId);
    }
  
    // Set selected username --> checks the local storage attributes
    if(usrName && usrName != 0)
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
        localStorage.setItem("potNr", potId);
        potNr = potId;
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
            chrome.runtime.sendMessage({tryConnect: true}, function(response) { });
        }		
    }, false);

    /* Erweiterungsmöglichkeit
    // Button to refill the coffee pot
    refillBtn.addEventListener('click', function() 
    {
        chrome.runtime.sendMessage({refill: true}, function(response) { });
    }, false);
    */
    //////////////////////////////// Change appereance if user is connected ////////////////////////////////////////////
    function changeStyleConnected() {
        // White appereance
        for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
            p[i].style.background = '#fff';
            p[i].style.transition = '3s';
        }
        localStorage.setItem("settingsHtmlStyle", true);
    }
    function changeStyleDisconnected() {
        // Red appereance
        for (var i = 0, p = document.getElementsByTagName('fieldset'); i < p.length; i++) {
            p[i].style.background = '#AA4040';
            p[i].style.transition = '3s';
        }
        localStorage.setItem("settingsHtmlStyle", false);
    }
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
    //////////////////////////// Two-way relationship between popup.js and background.js ////////////////////////////////////
    chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
        if (msg.Connected) {
            changeStyleConnected();
        }
        if(msg.Disconnected) {
            changeStyleDisconnected();
        }
    });
}, false); // Main-ActionListener