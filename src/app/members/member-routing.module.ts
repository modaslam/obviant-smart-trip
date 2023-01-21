// NOT BEING USED

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

// const routes: Routes = [
//   { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardPageModule' },
//   { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' },
//   { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
//   { path: 'people', loadChildren: './people/people.module#PeoplePageModule' },
//   { path: 'trip', loadChildren: './trip/trip.module#TripPageModule' },
//   { path: 'notification', loadChildren: './notification/notification.module#NotificationPageModule' },
//   { path: 'history', loadChildren: './history/history.module#HistoryPageModule' },
//   { path: 'explore', loadChildren: './explore/explore.module#ExplorePageModule' },
//   { path: 'trend', loadChildren: './trend/trend.module#TrendPageModule' },
// ];

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { 
        path: 'dashboard', 
        children: [
          { path: '', loadChildren: './dashboard/dashboard.module#DashboardPageModule' },
          { path: ':id', loadChildren: './trip-details/trip-details.module#TripDetailsPageModule' },
        ]
      },
      {
        path: 'trip',
        children: [
          {  path: '', loadChildren: './trip/trip.module#TripPageModule' },
        ]
      },
      {
        path: 'notification',
        children: [
          { path: '', loadChildren: './notification/notification.module#NotificationPageModule' },
        ]
      },
      {
        path: 'explore',
        children: [
          { path: '', loadChildren: './explore/explore.module#ExplorePageModule' },
        ]
      },
      {
        path: 'trend',
        children: [
          { path: 'trend', loadChildren: './trend/trend.module#TrendPageModule' },
        ]
      },
      {
        path: 'people',
        children: [
          { path: '', loadChildren: './people/people.module#PeoplePageModule' },
        ]
      },
      {
        path: 'history',
        children: [
          { path: '', loadChildren: './history/history.module#HistoryPageModule' },
        ]
      }, {
        path: 'profile',
        children: [
          { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' },
          { path: 'profile/:update', loadChildren: './profile/profile.module#ProfilePageModule' }
        ]
      },
    ]
  },
  { path: '', redirectTo: '/tabs/dashboard', pathMatch: 'full'}, 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
