import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { routing } from './app.routing';

import { AppComponent }  from './app.component';
import { MainContainerComponent } from './main-container.component'
import { SearchControlsComponent } from './search-controls.component';
import { SampleListComponent } from './sample-list.component'

import { SampleQueryService } from './sample-query.service'

@NgModule({
  imports:      [ BrowserModule,
                  routing ],

  declarations: [ AppComponent,
                  MainContainerComponent,
                  SearchControlsComponent,
                  SampleListComponent ],

  bootstrap:    [ AppComponent ],

  providers:    [ SampleQueryService ]
})
export class AppModule { }
