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
      this.htmlConsumB1S1 = "inaktiv"
      this.htmlAverB1S1 = "inaktiv";
      this.htmlConsumB1S2 = "inaktiv";
      this.htmlAverB1S2 = "inaktiv";
      this.htmlConsumB1S3 = "inaktiv";
      this.htmlAverB1S3 = "inaktiv";
      this.htmlConsumB2S1 = "inaktiv";
      this.htmlAverB2S1 = "inaktiv";
      this.htmlConsumB2S2 = "inaktiv";
      this.htmlAverB2S2 = "inaktiv";
      this.htmlConsumB2S3 = "inaktiv";
      this.htmlAverB2S3 = "inaktiv";
      this.htmlConsumB2S4 = "inaktiv";
      this.htmlAverB2S4 = "inaktiv";
      this.htmlConsumB2S5 = "inaktiv";
      this.htmlAverB2S5 = "inaktiv";
      ////////////// Aktives Gebäude ///////////////
      this.htmlConsumB3S1 = obj.consumption.consumptionb3f1 + " Liter";
      this.htmlAverB3S1 = obj.consumption.averageb3f1 + " Liter";
      this.htmlConsumB3S2 = obj.consumption.consumptionb3f2 + " Liter";
      this.htmlAverB3S2  = obj.consumption.averageb3f2 + " Liter";
      this.htmlConsumB3S3 = obj.consumption.consumptionb3f3 + " Liter";
      this.htmlAverB3S3 = obj.consumption.averageb3f3 + " Liter";
   }

}
