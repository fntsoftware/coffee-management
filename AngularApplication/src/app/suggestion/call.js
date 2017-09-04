function callBash() {
  if (validate()) { // Preliminary data check to preven unecessary request
    $.ajax(
    './test.js', { // the URL where the php script is hosted
        'action': 'update', // variables passed to the server
        'id': '123',
        'value': 'New Value'
    }, function (response) { // server response
    if (typeof(response.success) == 'number' && response.success) {
        }
    }, 'json' // data format
    );
    }
}