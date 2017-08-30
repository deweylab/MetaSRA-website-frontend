/*
This file defines routes for the application, each URL route is
mapped to a component.
*/

import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainContainerComponent } from './main-container.component';

// So far we only have one route.  The reason for having the router is so we can
// pass query-string parameters
const appRoutes: Routes = [
  {
    path: 'search',
    component: MainContainerComponent
  },

  // For some reason Angular will not let an empty path have URL key=value parameters,
  // so let's redirect everthing to /search.
  {
    path: '**',
    redirectTo: 'search'
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
