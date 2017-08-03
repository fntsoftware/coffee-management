document.addEventListener('DOMContentLoaded', function() {
  
	var closeBtn = document.getElementById('closeBtn');
	var saveBtn = document.getElementById('save');
	var loadBtn = document.getElementById('load');

	 // Button to pass to the website
	 closeBtn.addEventListener('click', function() 
	 {
			console.log("Anwendung geschlossen!");
			window.close(); 
	 }, false);
	 
	  // Button to pass to the website
	 saveBtn.addEventListener('click', function() 
	 {
			save_options();
	 }, false);
	 
	 // Button to load settings
	 loadBtn.addEventListener('click', function() 
	 {
			restore_options();
	 }, false);
	 
	 // Saves options to chrome.storage
	function save_options() 
	{
		console.log("New options are saved!");
		
		var notification = document.getElementById('notifications').value;
		var notification_track = document.getElementById('trackNotification').value;
		var time = document.getElementById('time').value;
		 
		chrome.storage.sync.set(
		{
			notificationEnabled: notification,
			notificationTrackEnabled: notification_track,
			timeDisplayed: time
		}, function() {
			// No default handle here
		});
	} 
	
	// Restores select box and checkbox state using the preferences
	// stored in chrome.storage.
	function restore_options() 
	{
		console.log("Optionen geladen!");

		// Use default value notificationEnabled = 'Ja' and  notificationTrackEnabled = 'Ja'
		chrome.storage.sync.get(
		{
			notificationEnabled: 'JA',
			notificationTrackEnabled: 'JA',
			timeDisplayed: 0
		}, function(items) 
		{
			document.getElementById('notifications').value = items.notificationEnabled;
			document.getElementById('trackNotification').value = items.notificationTrackEnabled;
			document.getElementById('time').value = items.timeDisplayed;
		});
		
		console.log(a);
	}	
	
	
}, false); // Main-ActionListener

// When the user clicks on div, open the popup
function myFunction() {
	var popup = document.getElementById("myPopup");
	popup.classList.toggle("show");

	setTimeout(function() 
	{
		popup.classList.toggle("show")
	}, 2500);
}
        


