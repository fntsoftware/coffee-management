import { Component } from '@angular/core';
import { SuggestionModule } from './suggestion.module';
import { SuggestionService } from './suggestion.service';

declare var test: any;

@Component({
  // selector: 'suggestion',						// necessary because of the navigation bar
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.css']
})
export class SuggestionComponent {

	suggestionViewModel: SuggestionModule
	
	name : String;
	email : String;
	suggestion : String;
	prio : String;
	
	constructor(private user: SuggestionService) { 
		this.suggestionViewModel = new SuggestionModule();
	}

	public send() {
		new callBash();
	}

	
	
}
