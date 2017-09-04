import { Component, OnInit, trigger, state, style, transition, animate, keyframes, ViewChild, ElementRef } from '@angular/core';
import { StatisticService } from './statistic.service';

let consumptionAll : number;

@Component({
  // selector: 'statistic',		// necessary that the links of the navigation bar works
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.css']
})
export class StatisticComponent 
{	
	/////////////////////////////////////////////// Setting the data into the Charts /////////////////////////////////////////////
	data: any;
	htmlString:string;
	////////// Initialize statistics ////////////
	// Building 1 // Donut chart
	public donutChartLabelsG1:string[] = [];
	public donutChartDataG1:number[] = [];
	public donutChartTypeG1:string = 'doughnut';
	// Building 2 // Donut chart
	public donutChartLabelsG2:string[] = [];
	public donutChartDataG2:number[] = [];
	public donutChartTypeG2:string = 'doughnut';
	// Building 3 // Donut chart
	public donutChartLabelsG3:string[] = [];
	public donutChartDataG3:number[] = [];
	public donutChartTypeG3:string = 'doughnut';
	// Overview // Bar chart
	public barChartOptions:any = {
    	scaleShowVerticalLines: false,
    	responsive: true
  	};
  	public barChartLabels:string[] = [];
  	public barChartType:string = 'bar';
  	public barChartLegend:boolean = true;
 
  	public barChartData:any[] = [];
	// Overview // Pie chart
	public pieChartTypeOverview:string = 'pie';
	public pieChartLabelsOverview:string[] = [];
	public pieChartDataOverview:number[] = [];
	
	constructor(private staticService: StatisticService) { }
	
	ngOnInit() 
	{
		this.staticService
			.getAll()
			.subscribe(p => {
				this.data = p
				this.handlePeople(this.data);
			})
	}

	savePersonDetails(){
      this.staticService
          .save(this.data)
          .subscribe(r => console.log(`saved!!! ${JSON.stringify(this.data)}`));
    }
 
	private handlePeople(obj: any) : void {
		/////// Declaring statistics /////////
		console.log("Ihre Daten: " + obj.building1.floor1, obj.building1.floor2, obj.building1.floor3);
		// Building 1
		this.donutChartLabelsG1 = [ 'Erdgescho\u00df', 'Stockwerk 1', 'Stockwerk 2'];
		this.donutChartDataG1 = [ obj.building1.floor1, obj.building1.floor2, obj.building1.floor3];
		this.donutChartTypeG1 = 'doughnut';
		// Building 2
		this.donutChartLabelsG2 = [ 'Stockwerk 1', 'Stockwerk 2', 'Stockwerk 3', 'Stockwerk 4', 'Stockwerk 5'];
		this.donutChartDataG2 = [ obj.building2.floor1, obj.building2.floor2, obj.building2.floor3, obj.building2.floor4, obj.building2.floor5];
		this.donutChartTypeG1 = 'doughnut';
		// Building 3
		this.donutChartLabelsG3 = [ 'Stockwerk 1', 'Stockwerk 2', 'Stockwerk 3'];
		this.donutChartDataG3 = [ obj.building3.floor1, obj.building3.floor2, obj.building3.floor3];
		this.donutChartTypeG1 = 'doughnut';
		// Overview bar chart
		this.barChartLabels = ['Stockwerk 1', 'Stockwerk 2', 'Stockwerk 3', 'Stockwerk 4', 'Stockwerk 5'];
		this.barChartType = 'bar';
	
		this.barChartData = [
			{data: [ obj.building1.floor1, obj.building1.floor2, obj.building1.floor3, 0, 0], label: 'Geb\u00e4ude 1'},
			{data: [ obj.building2.floor1, obj.building2.floor2, obj.building2.floor3, obj.building2.floor4, obj.building2.floor5], label: 'Geb\u00e4ude 2'},
			{data: [ obj.building3.floor1, obj.building3.floor2, obj.building3.floor3, 0, 0], label: 'Geb\u00e4ude 3'},
		];
		// Overview pie chart
		this.pieChartLabelsOverview = ['Geb\u00e4ude 1', 'Geb\u00e4ude 1', 'Geb\u00e4ude 1'];
		this.pieChartDataOverview = [ obj.summary.building1, obj.summary.building2, obj.summary.building3];
	}

	// Chart Events
	public chartClicked(e:any):void {
		console.log(e);
	}
 
	public chartHovered(e:any):void {
		console.log(e);
	}
	///////////////////////////////////////// Building Overview Charts  /////////////////////////////////////////
 
	public randomizeType():void {
		this.pieChartTypeOverview = this.pieChartTypeOverview === 'doughnut' ? 'pie' : 'doughnut';
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
}
