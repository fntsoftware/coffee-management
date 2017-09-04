import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class CoffeeSuplierService{

  ////////////////////////////// Getting Data from the JSON file and return it to the component ///////////////////////////////
  private baseUrl: string = './assets';
  constructor(private http : Http){ }

  getAll(): Observable<any>{
    let people$ = this.http
      .get(`${this.baseUrl}/coffeeDatabase.json`, {headers: this.getHeaders()})
        .map(this.mapBuildings)
        .map(this.toPerson)
      return people$;
  }

  private getHeaders(){
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    return headers;
  }
    
  private mapBuildings(response: Response): any[] {
    return response.json();
  }

  private toPerson(r:any): Observable<any>{
    console.log('Data has been successfully read in!');
    return r;
  }
 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
}