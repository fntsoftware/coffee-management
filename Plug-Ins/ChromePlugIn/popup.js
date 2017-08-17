document.addEventListener('DOMContentLoaded', function() {
    //////////////////////////////////////// Attributes ///////////////////////////////////////////////////////////
    // Get buttons from HTML
    var connectBtn = document.getElementById('connectBtn');
    var websiteBtn = document.getElementById('websiteBtn');
    var refillBtn = document.getElementById('refillBtn');
    // Get selected elements from HTML
    var buildSelect = document.getElementById('selectedBuilding');
    var potSelect = document.getElementById('selectedPot');
    var ipAddressInput = document.getElementById('ipAddress');
    var portInput = document.getElementById('port');
    var nameInput = document.getElementById('usrName');
    // Get items from the local storage
    var buildNr = localStorage.getItem("buildNr");
    var floorNr = localStorage.getItem("floorNr");
    var ipAddr = localStorage.getItem("ipAddress");
    var port = localStorage.getItem("port");
    var usrName = localStorage.getItem("usrName");
    // Basic variables
    var newURL = "http://172.27.10.180/"; // Angular website adress
    var htmlStyle = localStorage.getItem("settingsHtmlStyle"); // Controlls the style of the html application
    htmlStyle = (htmlStyle == 'true');

    /////////////////////////////////////// FUNCTIONS AND QUERIES ///////////////////////////////////////////////////
    // Determine the html style
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

    /////////////////////////////////////// Read local storag properties ////////////////////////////////////////////////
    // Set selected building --> checks the local storage attributes
    if(buildNr && (buildNr > 0 && buildNr < 10))
    {
        buildSelect.value = buildNr.toString();
    }
    else {
        // In case that the building is not in the local storage set to default value
        var buildingId = "notSelected";
        localStorage.setItem("buildNr", buildingId);
    }
    // Set select pot --> checks the local storage attributes
    if(floorNr && (floorNr > 0 && floorNr < 10)) 
    {
        potSelect.value = floorNr.toString();
    }
    else {
        // In case that the pot is not in the local storage set to default value
        var floorId = "notSelected";
        localStorage.setItem("floorNr", floorId);
    }
    // Set selected username --> checks the local storage attributes
    if(usrName && (usrName != '' && typeof usrName === 'string'))
    {
        nameInput.value = usrName.toString();
    } 
    else {
        // In case that the username is not in the local storage --> that means it isnt set, so set to default
        nameId = "defaultUser";
        localStorage.setItem("usrName", nameId);
    }
    // Set ip address --> checks the local storage attributes
    if(ipAddr && ipAddr != '') 
        ipAddressInput.value = ipAddr.toString();
    // Set port --> checks the local storage attributes
    if(port && port != '') 
        portInput.value = port.toString();
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    
    ///////////////////////////////////////////////// Button event listener ////////////////////////////////////////////////////
    // Button to pass to the website
    websiteBtn.addEventListener('click', function() 
    {
        // Create a new tab and open the url address
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
    //////////////////////////// Two-way relationship between popup.js and background.js ////////////////////////////////////
    chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
        if (msg.Connected) 
            changeStyleConnected();
        if(msg.Disconnected) 
            changeStyleDisconnected();
    });

}, false); // Main-ActionListener