import json
import urllib2
import serial

serial = serial.Serial("/dev/ttyUSB1", baudrate=9600)

code = ''

def sendData(tagId):
  data = {
    'type': 'incommingPot',
    'tagId': tagId
  }
  print(data)
  req = urllib2.Request('http://localhost:8083')
  req.add_header('Content-Type', 'application/json')
  response = urllib2.urlopen(req, json.dumps(data))

while True:
  data = serial.read()

  if data == '\n':
    code = "".join(x for x in code if 31 < ord(x) <127)
    sendData(code)
    code = ''
  else:
    code = code + data
