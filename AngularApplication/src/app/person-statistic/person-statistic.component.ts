import { Component, OnInit, trigger, state, style, transition, animate, keyframes, ViewChild, ElementRef } from '@angular/core';
import { PeopleService } from './person.service';

let consumptionAll : number;


@Component({
  // selector: 'person-statistic',
  templateUrl: './person-statistic.component.html',
  styleUrls: ['./person-statistic.component.css'],
  animations: [

	  trigger('myAnimation', [
		  state('small', style({
			  transform: 'scale(0.8)',
		  })),
		  state('large', style({
			  transform: 'scale(2)',
		  })),
		  transition('small <=> large', animate('800ms ease-in', style({
			  transform: 'translateY(40px)'
		  }))),
	  ])
  ]
})
export class PersonStatisticComponent implements OnInit
{
	/////////////////////////////////////////////// Setting the data into the Charts /////////////////////////////////////////////
	people: any;
	public doughnutChartLabels:string[] = [];
	public doughnutChartData:number[] = [];
	public doughnutChartType:string = 'doughnut';
	htmlString:string;
	
	constructor(private peopleService: PeopleService) { }
	
	ngOnInit() 
	{
		this.peopleService
			.getAll()
			.subscribe(p => {
				this.people = p
				this.handlePeople(this.people);
			})
	}

	savePersonDetails(){
      this.peopleService
          .save(this.people)
          .subscribe(r => console.log(`saved!!! ${JSON.stringify(this.people)}`));
    }

  
 
  private handlePeople(obj: any) : void {
	// Setting the data
	consumptionAll = obj.coffeeChefKing.consumption1;
	this.doughnutChartLabels = [ obj.coffeeChefKing.name1, obj.coffeeChefKing.name2, obj.coffeeChefKing.name3];
	this.doughnutChartData = [ obj.coffeeChefKing.consumption1, obj.coffeeChefKing.consumption2 , obj.coffeeChefKing.consumption3];
	this.doughnutChartType = 'doughnut';
	this.htmlString= "<strong>" + obj.coffeeChefKing.name1 + "</strong>";
  }
 
	
	// Events --> Charts
	public chartClicked(e:any):void {
		console.log(e);
	}
	
	public chartHovered(e:any):void {
		console.log(e);
	}
  
	/////////////////////////////////////////// Animation ///////////////////////////////////////////////////
	state: string = 'small';
	king: string = 'Kaffeekochk&ouml;nig';

	animateMe() {
		this.state = (this.state === 'small' ? 'large' : 'small');
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////

}
