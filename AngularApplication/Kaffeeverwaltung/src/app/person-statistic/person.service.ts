import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class PeopleService {

  //////////////////////////////// Getting Data from the JSON file and return it to the component ///////////////////////////////
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
    // I included these headers because otherwise FireFox
    // will request text/html instead of application/json
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

  private mapBuilding(response:Response): any{
    return this.toPerson(response.json());
  }

  save(person: any) : Observable<Response>{
    return this
      .http
      .put(`${this.baseUrl}/people/${person.floor_1}`,
            JSON.stringify(person),
            {headers: this.getHeaders()});
  }
  
}
