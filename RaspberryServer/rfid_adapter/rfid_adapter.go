package main

import (
	"net/http"
	"bytes"
	"fmt"
	"io/ioutil"
    "github.com/tarm/goserial"
)

func sendMessage(value string) {
    fmt.Println("Send tag id: " + value)
    
	var jsonStr = []byte(`{
        "type":"incommingPot", 
        "tagId":"`+value+`"
    }`)
	r, _ := http.Post("http://localhost:8083", "application/json", bytes.NewBuffer(jsonStr))
    
	response, _ := ioutil.ReadAll(r.Body)
	fmt.Println(string(response))
}

func main() {
    c := &serial.Config{Name: "COM3", Baud: 9600}
    s, err := serial.OpenPort(c)
    if err != nil {
        fmt.Println(err)
    }
    
    var value string
    buf := make([]byte, 128)
    
    for {
        n, _ := s.Read(buf)
        
        for i := 0; i < len(buf[:n]); i++ {
            if buf[:n][i] == 2 {
                value = value[:0]
            }
            if buf[:n][i] > 13 {
                value += string(buf[:n][i]) 
            }       
        }
    
        if value != "" && len(value) == 12 {
            sendMessage(value)
            value = value[:0]
        }
    }
} 