import { Component, OnInit } from '@angular/core';
import { StatusService } from './status.service';

@Component({
  // selector: 'status',							// necessary that the links of the navigation bar works
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  // Variables for the status // not really needed
  htmlB1F1 : string;
  htmlB1F2 : string;
  htmlB1F3 : string;
  htmlB2F1 : string;
  htmlB2F2 : string;
  htmlB2F3 : string;
  htmlB2F4 : string;
  htmlB2F5 : string;
  htmlB3F1 : string;
  htmlB3F2 : string;
  htmlB3F3 : string;

  // Variables for the last filling // nedded
  htmlFill1 : string;
  htmlFill2 : string;
  htmlFill3 : string;
  htmlFill4 : string;
  htmlFill5 : string;
  htmlFill6 : string;
  htmlFill7 : string;
  htmlFill8 : string;
  htmlFill9 : string;
  htmlFill10 : string;
  htmlFill11 : string;

  /////////////////////////////////////////////// Setting the data into the Charts /////////////////////////////////////////////
	people: any;
  check : string;

	constructor(private statusService: StatusService) { }
	
	ngOnInit() 
	{
      // Set to default
      this.htmlB1F1 = "inaktiv";
      this.htmlB1F2 = "inaktiv";
      this.htmlB1F3 = "inaktiv";
      this.htmlB2F1 = "inaktiv";
      this.htmlB2F2 = "inaktiv";
      this.htmlB2F3 = "inaktiv";
      this.htmlB2F4 = "im Aufbau";
      this.htmlB2F5 = "inaktiv";
      this.htmlB3F1 = "inaktiv";
      this.htmlB3F2 = "inaktiv";
      this.htmlB3F3 = "inaktiv";

      this.htmlFill1 = "unbekannt";
      this.htmlFill2 = "unbekannt";
      this.htmlFill3 = "unbekannt";
      this.htmlFill4 = "unbekannt";
      this.htmlFill5 = "unbekannt";
      this.htmlFill6 = "unbekannt";
      this.htmlFill7 = "unbekannt";
      this.htmlFill8 = "unbekannt";
      this.htmlFill9 = "unbekannt";
      this.htmlFill10 = "unbekannt";
      this.htmlFill11 = "unbekannt";

      this.statusService
		  	.getAll()
		  	.subscribe(p => {
			  	this.people = p
			  	this.handlePeople(this.people);
			  })
	}

  private handlePeople(obj: any) : void {
    // Set the json data
    this.htmlB1F1 = obj.status.building1floor1;
    this.htmlB1F2 = obj.status.building1floor2;
    this.htmlB1F3 = obj.status.building1floor3;
    this.htmlB2F1 = obj.status.building2floor1;
    this.htmlB2F2 = obj.status.building2floor2;
    this.htmlB2F3 = obj.status.building2floor3;
    this.htmlB2F4 = obj.status.building2floor4;
    this.htmlB2F5 = obj.status.building2floor5;
    this.htmlB3F1 = obj.status.building3floor1;
    this.htmlB3F2 = obj.status.building3floor2;
    this.htmlB3F3 = obj.status.building3floor3;

    this.htmlFill1 = obj.status.building1floor1Time;
    this.htmlFill2 = obj.status.building1floor2Time;
    this.htmlFill3 = obj.status.building1floor3Time;
    this.htmlFill4 = obj.status.building2floor1Time;
    this.htmlFill5 = obj.status.building2floor2Time;
    this.htmlFill6 = obj.status.building2floor3Time;
    this.htmlFill7 = obj.status.building2floor4Time;
    this.htmlFill8 = obj.status.building2floor5Time;
    this.htmlFill9 = obj.status.building3floor1Time;
    this.htmlFill10 = obj.status.building3floor2Time;
    this.htmlFill11 = obj.status.building3floor3Time;
  }

}
