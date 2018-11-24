import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RegisterComponent} from './register/register.component';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from '../guards/auth.guard';
import {NotFoundComponent} from './not-found/not-found.component';
import {DcFirstGuard} from '../guards/dc-first.guard';
import {LogoutComponent} from './logout/logout.component';
import {CharactersComponent} from './characters/characters.component';
import {CreationComponent} from './characters/creation/creation.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', redirectTo: ''},
  {path: 'characters', component: CharactersComponent, canActivate: [AuthGuard]},
  {path: 'characters/creation', component: CreationComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent, canActivate: [DcFirstGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [DcFirstGuard]},
  {path: 'logout', component: LogoutComponent, canActivate: [AuthGuard]},
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
