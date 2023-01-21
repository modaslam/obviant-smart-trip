import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { 
        path: 'dashboard', 
        children: [
          { path: '', loadChildren: '../dashboard/dashboard.module#DashboardPageModule' },
          { path: ':waypoints', loadChildren: '../trip-details/trip-details.module#TripDetailsPageModule' },
        ]
      },
      {
        path: 'trip',
        children: [
          { path: '', loadChildren: '../trip/trip.module#TripPageModule' },
        ]
      },
      {
        path: 'notification',
        children: [
          { path: '', loadChildren: '../notification/notification.module#NotificationPageModule' },
        ]
      },
      {
        path: 'explore',
        children: [
          { path: '', loadChildren: '../explore/explore.module#ExplorePageModule' },
        ]
      },
      {
        path: 'trend',
        children: [
          { path: '', loadChildren: '../trend/trend.module#TrendPageModule' },
        ]
      },
      {
        path: 'people',
        children: [
          { path: '', loadChildren: '../people/people.module#PeoplePageModule' },
        ]
      },
      {
        path: 'leaderboard',
        children: [
          { path: '', loadChildren: '../leaderboard/leaderboard.module#LeaderboardPageModule' },
        ]
      }, {
        path: 'profile',
        children: [
          { path: '', loadChildren: '../profile/profile.module#ProfilePageModule' },
          { path: ':update', loadChildren: '../profile/profile.module#ProfilePageModule' },
        ]
      },
    ]
  },
  { path: '', redirectTo: '/tabs/dashboard', pathMatch: 'full'},
  { path: 'edit-profile', loadChildren: '../edit-profile/edit-profile.module#EditProfilePageModule' },
  { path: 'fuel-planner', loadChildren: '../fuel-planner/fuel-planner.module#FuelPlannerPageModule' },
  { path: 'view-route', loadChildren: '../view-route/view-route.module#ViewRoutePageModule' },
  { path: 'lobby', loadChildren: '../lobby/lobby.module#LobbyPageModule' },
  { path: 'enroute', loadChildren: '../enroute/enroute.module#EnroutePageModule' },
  { path: 'trip-complete', loadChildren: '../trip-complete/trip-complete.module#TripCompletePageModule' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRouterModule { }
