import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import { SearchControlsComponent } from './searchcontrols.component';
import { SampleListComponent } from './samplelist.component'

import { SampleQueryService } from './samplequery.service'

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent,
                  SearchControlsComponent,
                  SampleListComponent ],
  bootstrap:    [ AppComponent ],
  providers:    [ SampleQueryService ]
})
export class AppModule { }
