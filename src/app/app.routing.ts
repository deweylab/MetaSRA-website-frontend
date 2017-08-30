/*
This file defines routes for the application, each URL route is
mapped to a component.
*/

import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainContainerComponent } from './main-container.component';

// So far we only have one route.  The reason for having the router right now is
// so we can use it to access and modify the URL query string.
const appRoutes: Routes = [
  {
    path: '**',
    component: MainContainerComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
