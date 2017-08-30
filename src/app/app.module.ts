import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { routing } from './app.routing';

import { AppComponent }  from './app.component';
import { MainContainerComponent } from './main-container.component'
import { SearchControlsComponent } from './searchcontrols.component';
import { SampleListComponent } from './samplelist.component'

import { SampleQueryService } from './samplequery.service'

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
