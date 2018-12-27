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
import {CombatComponent} from './combat/combat.component';
import {ChatroomComponent} from './chatroom/chatroom.component';
import {CharacterComponent} from "./character/character.component";
import {ShopComponent} from "./shop/shop.component";
import {AdminComponent} from "./admin/admin.component";
import {FightComponent} from "./fight/fight.component";

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', redirectTo: ''},
  {path: 'characters', component: CharactersComponent, canActivate: [AuthGuard]},
  {path: 'characters/creation', component: CreationComponent, canActivate: [AuthGuard]},

  {path: 'character', component: CharacterComponent, canActivate: [AuthGuard]},
  {path: 'shop', component: ShopComponent, canActivate: [AuthGuard]},
  {path: 'chatroom', component: ChatroomComponent, canActivate: [AuthGuard]},
  {path: 'combat', component: CombatComponent, canActivate: [AuthGuard]},
  {path: 'fight', component: FightComponent, canActivate: [AuthGuard]},

  {path: 'login', component: LoginComponent, canActivate: [DcFirstGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [DcFirstGuard]},
  {path: 'logout', component: LogoutComponent, canActivate: [AuthGuard]},

  {path: 'admin', component: AdminComponent},

  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
