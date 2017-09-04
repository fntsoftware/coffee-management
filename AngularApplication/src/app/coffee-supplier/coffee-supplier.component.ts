import { Component, OnInit } from '@angular/core';

@Component({
  // selector: 'coffee-supplier',
  templateUrl: './coffee-supplier.component.html',
  styleUrls: ['./coffee-supplier.component.css']
})
export class CoffeeSupplierComponent implements OnInit {

  first : String;
  second : String;
  third: String;
  fourth : String;
  fifth : String;
  sixth : String;
  seventh : String;
  eighth : String;
  ninth : String; 
  tenth : String;

  firstValue : Number;
  secondValue : Number;
  thirdValue: Number;
  fourthValue : Number;
  fifthValue : Number;
  sixthValue : Number;
  seventhValue : Number;
  eighthValue : Number;
  ninthValue : Number; 
  tenthValue : Number;

  constructor() { }

  ngOnInit() {
    this.first = "unknown";
    this.second = "unknown";
    this.third = "unknown";
    this.fourth = "unknown";
    this.fifth = "unknown";
    this.sixth = "unknown";
    this.seventh = "unknown";
    this.eighth = "unknown";
    this.ninth = "unknown";
    this.tenth = "unknown";

    this.firstValue = 0;
    this.secondValue = 0;
    this.thirdValue = 0;
    this.fourthValue = 0;
    this.fifthValue = 0;
    this.sixthValue = 0;
    this.seventhValue = 0;
    this.eighthValue = 0;
    this.ninthValue = 0;
    this.tenthValue = 0;
  }

}
