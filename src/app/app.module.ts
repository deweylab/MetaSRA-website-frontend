/*
Root module - specifies imports, services, directives, etc. used in the app.
*/

import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule }    from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule }   from '@angular/forms';

import { routing } from './app.routing';

import { AppComponent }  from './app.component';
import { MainContainerComponent } from './main-container.component'
import { SearchControlsComponent } from './search-controls.component';
import { ResultContainerComponent } from './result-container.component'
import { ResultStudyComponent } from './result-study.component'
import { ResultSampleGroupComponent } from './result-sample-group.component'
import { TermInputComponent } from './term-input.component'
import { TermTagComponent } from './term-tag.component'

import { SampleQueryService } from './sample-query.service'
import { TermLookupService } from './term-lookup.service'
import { ClosePopoverService } from './close-popover.service'

@NgModule({
  imports:      [ BrowserModule,
                  HttpModule,
                  NgbModule.forRoot(),
                  routing,
                  FormsModule ],

  declarations: [ AppComponent,
                  MainContainerComponent,
                  SearchControlsComponent,
                  ResultContainerComponent,
                  ResultStudyComponent,
                  ResultSampleGroupComponent,
                  TermInputComponent,
                  TermTagComponent ],

  bootstrap:    [ AppComponent ],

  providers:    [ SampleQueryService,
                  TermLookupService,
                  ClosePopoverService ]
})
export class AppModule { }
