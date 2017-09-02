import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule }    from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { routing } from './app.routing';

import { AppComponent }  from './app.component';
import { MainContainerComponent } from './main-container.component'
import { SearchControlsComponent } from './search-controls.component';
import { SampleListComponent } from './sample-list.component'
import { ResultStudyComponent } from './result-study.component'
import { ResultSampleGroupComponent } from './result-sample-group.component'

import { SampleQueryService } from './sample-query.service'

@NgModule({
  imports:      [ BrowserModule,
                  HttpModule,
                  NgbModule.forRoot(),
                  routing ],

  declarations: [ AppComponent,
                  MainContainerComponent,
                  SearchControlsComponent,
                  SampleListComponent,
                  ResultStudyComponent,
                  ResultSampleGroupComponent ],

  bootstrap:    [ AppComponent ],

  providers:    [ SampleQueryService ]
})
export class AppModule { }
