import { Component, OnInit } from '@angular/core';
import { ConsumptionService } from './consumption.service';

@Component({
  // selector: 'consumption',							// necessary that the links of the navigation bar works
  templateUrl: './consumption.component.html',
  styleUrls: ['./consumption.component.css']
})
export class ConsumptionComponent {

  // Variable to load the json content
  data : any;

  // Variables to show to consumption -> html indicates that they are used inside the  inner HTML
  // At the beginning they are set to default values
  htmlConsumB1S1 : string = "inaktiv";
  htmlAverB1S1   : string = "inaktiv";
  htmlConsumB1S2 : string = "inaktiv";
  htmlAverB1S2   : string = "inaktiv";
  htmlConsumB1S3 : string = "inaktiv";
  htmlAverB1S3   : string = "inaktiv";
  htmlConsumB2S1 : string = "inaktiv";
  htmlAverB2S1   : string = "inaktiv";
  htmlConsumB2S2 : string = "inaktiv";
  htmlAverB2S2   : string = "inaktiv";
  htmlConsumB2S3 : string = "inaktiv";
  htmlAverB2S3   : string = "inaktiv";
  htmlConsumB2S4 : string = "inaktiv";
  htmlAverB2S4   : string = "inaktiv";
  htmlConsumB2S5 : string = "inaktiv";
  htmlAverB2S5   : string = "inaktiv";
  htmlConsumB3S1 : string = "inaktiv";
  htmlAverB3S1   : string = "inaktiv";
  htmlConsumB3S2 : string = "inaktiv";
  htmlAverB3S2   : string = "inaktiv";
  htmlConsumB3S3 : string = "inaktiv";
  htmlAverB3S3   : string = "inaktiv";

  constructor(private consumptionService:  ConsumptionService) { }

  ngOnInit() 
	{
      // Get the json content from the service
       this.consumptionService
		  	.getAll()
		  	.subscribe(p => {
			  	this.data = p
			  	this.handleData(this.data);
			  })
  }

   private handleData(obj: any) : void {
   }

}
