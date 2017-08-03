// Inside here the seperate components get combined
// For that some imports are necessary
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { NavComponent } from './nav/nav.component';
import { StartpageComponent } from './startpage/startpage.component';
import { FlotterComponent } from './flotter/flotter.component';
import { SuggestionComponent } from './suggestion/suggestion.component';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
}
