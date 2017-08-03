import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";

// Imports the components
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FlotterComponent } from './flotter/flotter.component';
import { NavComponent } from './nav/nav.component';
import { StartpageComponent } from './startpage/startpage.component';
import { SuggestionComponent } from './suggestion/suggestion.component';
import { StatisticComponent } from './statistic/statistic.component';
import { HistoryComponent } from './history/history.component';
import { ConsumptionComponent } from './consumption/consumption.component';
import { AboutComponent } from './about/about.component';
import { StatusComponent } from './status/status.component';
import { PersonStatisticComponent } from './person-statistic/person-statistic.component';
import { PeopleService } from './person-statistic/person.service';
import { StatisticService } from './statistic/statistic.service';
import { StatusService } from './status/status.service';
import { ConsumptionService } from './consumption/consumption.service';
import { HistoryService } from './history/history.service';
import { SuggestionService } from './suggestion/suggestion.service';
import { HttpModule }      from '@angular/http';
import { CoffeeSupplierComponent } from './coffee-supplier/coffee-supplier.component';
import { CoffeeSuplierService } from './coffee-supplier/coffee-supplier.service';

// Declares the components and creates the links to the single html pages through the path
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FlotterComponent,
    NavComponent,
    StartpageComponent,
    SuggestionComponent,
    StatisticComponent,
    HistoryComponent,
    ConsumptionComponent,
    AboutComponent,
    StatusComponent,
    PersonStatisticComponent,
    CoffeeSupplierComponent
  ],
  imports: [
    BrowserModule,
	ChartsModule,
	BrowserAnimationsModule,
	HttpModule,
	FormsModule,
	RouterModule.forRoot ([
	{
		path: 'suggestion',
		component: SuggestionComponent
	},
	{
		path: 'status',
		component: StatusComponent
	},
	{
		path: '',
		component: StartpageComponent
	},
	{
		path: 'statistic',
		component: StatisticComponent,
	},
	{
		path: 'person-status',
		component: PersonStatisticComponent
	},
	{
		path: 'history',
		component: HistoryComponent
	},
	{
		path: 'consumption',
		component: ConsumptionComponent
	},
	{
		path: 'about',
		component: AboutComponent
	},
	{
		path: 'coffee-supplier',
		component: CoffeeSupplierComponent
	}
	])
  ],
  providers: [
					PeopleService, 
					StatisticService, 
					StatusService,
					ConsumptionService,
					HistoryService,
					SuggestionService
				  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
