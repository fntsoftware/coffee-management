import { Component, OnInit, trigger, state, style, transition, animate, keyframes, ViewChild, ElementRef } from '@angular/core';
import { HistoryService } from './history.service';

let consumptionAll : number;

@Component({
  // selector: 'app-history',						// necessary that the links of the navigation bar works
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  animations: [
      // Animation 1
      trigger('focusPanel', [
        state('interactive', style ({
          transform: 'scale(1)'
        })),
        state('active', style({
          transform: 'scale(1.4)'
        })),
        transition('inactive => active', animate('500ms ease-in')),
        transition('acitve => inactive', animate('500ms ease-out'))]),
      
      // Animation 2
      trigger('focusPanel2', [
        state('interactive', style ({
          transform: 'scale(1)'
        })),
        state('active', style({
          transform: 'scale(1.4)'
        })),
        transition('inactive => active', animate('500ms ease-in')),
        transition('acitve => inactive', animate('500ms ease-out'))]),

      // Animation 1
      trigger('focusPanel3', [
        state('interactive', style ({
          transform: 'scale(1)'
        })),
        state('active', style({
          transform: 'scale(1.4)'
        })),
        transition('inactive => active', animate('500ms ease-in')),
        transition('acitve => inactive', animate('500ms ease-out'))]),

  ]
})
export class HistoryComponent {

  ////////////////////////////////////// Animation ///////////////////////////////////////
  state  : string = "interactive";
  state2 : string = "interactive";
  state3 : string = "interactive";

  animateHistory1() {
    console.log("Information box 1 is pressed and enlarged!");
    this.state = (this.state == 'inactive' ? 'active' : 'inactive');
  }

  animateHistory2() {
    console.log("Information box 2 is pressed and enlarged!");
    this.state2 = (this.state2 == 'inactive' ? 'active' : 'inactive');
  }

  animateHistory3() {
    console.log("Informationbox 3 is pressed and enlarged!");
    this.state3 = (this.state3 == 'inactive' ? 'active' : 'inactive');
  }

  //////////////////////////////// Reading the Json Data //////////////////////////////////
  data : any;

  notification1 : string;
  notification2 : string;
  notification3 : string;

  notification1Header : string;
  notification2Header : string;
  notification3Header : string;

  time : string;
  building : number;
  floor : number;

  constructor(private historyService: HistoryService) { 
    this.notification1 = "Es konnte keine Benachrichtigung geladen werden!";
    this.notification1Header = "Fehler beim laden";
    this.notification2 = "Es konnte keine Benachrichtigung geladen werden!";
    this.notification2Header = "Fehler beim laden";
    this.notification3 = "Es konnte keine Benachrichtigung geladen werden!";
    this.notification3Header = "Fehler beim laden";
  }
	
	ngOnInit() 
	{
		this.historyService
			.getAll()
			.subscribe(p => {
				this.data = p
				this.handlePeople(this.data);
			})
	}

  private handlePeople(obj: any) : void {
    // Setting the data
    this.building = obj.history.notification1Building;
    this.floor = obj.history.notification1Floor;
    this.time = obj.history.notification1Time;
    this.notification1 = "Die Kaffeekannee aus Geb&auml;ude " + this.building + " Stockwerk " + this.floor + " wurde frisch zubereitet und abgeholt.\n || " + this.time + " ||  ";
    this.notification1Header = "Kaffeekanne zubereitet - " + "Geb&auml;ude " + this.building + " Stockwerk " + this.floor;

    this.building = obj.history.notification2Building;
    this.floor = obj.history.notification2Floor;
    this.time = obj.history.notification2Time;
    this.notification2 = "Die Kaffeekannee aus Geb&auml;ude " + this.building + " Stockwerk " + this.floor + " wurde frisch zubereitet und abgeholt\n. || " + this.time + " ||  ";
    this.notification2Header = "Kaffeekanne zubereitet - " + "Geb&auml;ude " + this.building + " Stockwerk " + this.floor;

    this.building = obj.history.notification3Building;
    this.floor = obj.history.notification3Floor;
    this.time = obj.history.notification3Time;
    this.notification3 = "Die Kaffeekannee aus Geb&auml;ude " + this.building + " Stockwerk " + this.floor + " wurde frisch zubereitet und abgeholt.\n || " + this.time + " ||  ";
    this.notification3Header = "Kaffeekanne zubereitet - " + "Geb&auml;ude " + this.building + " Stockwerk " + this.floor;
  }
}
