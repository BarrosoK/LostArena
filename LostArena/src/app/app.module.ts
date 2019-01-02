import {BrowserModule} from '@angular/platform-browser';
import {MDBBootstrapModule, NavbarModule, WavesModule} from 'angular-bootstrap-md';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import { JwtModule } from '@auth0/angular-jwt';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatGridListModule,
  MatProgressSpinnerModule, MatInputModule, MatSelectModule, MatRadioModule, MatCardModule, MatSnackBarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NavbarComponent} from './navbar/navbar.component';
import {RegisterComponent} from './register/register.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {LogoutComponent} from './logout/logout.component';

import {NgModule} from '@angular/core';
import {NgxsModule, Store} from '@ngxs/store';
import {UserState, UserStateModel} from './stores/states/user.state';
import {NgxsLoggerPluginModule} from '@ngxs/logger-plugin';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import {JWTInterceptor} from '../interceptors/jwtInterceptor';

import {MatBadgeModule} from '@angular/material/badge';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CharactersComponent} from './characters/characters.component';
import {CreationComponent} from './characters/creation/creation.component';
import {MatDialogModule} from '@angular/material/dialog';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import {SocketState} from './stores/states/socket.state';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { CombatComponent } from './combat/combat.component';

import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { ChatroomComponent } from './chatroom/chatroom.component';
import { CharacterComponent } from './character/character.component';
import { ShopComponent } from './shop/shop.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AdminComponent } from './admin/admin.component';
import {FileDropModule} from 'ngx-file-drop';
import {MatExpansionModule} from '@angular/material/expansion';
import { FightComponent } from './fight/fight.component';
import {Duel} from '../classes/duel';
import { ItemDialogComponent } from './shop/item-dialog/item-dialog.component';
import { ItemDirective } from './character/item.directive';
import { PveComponent } from './pve/pve.component';
import {SocketService} from '../services/socket.service';
import {AddMessageCombat, AddMessageSystem} from './stores/actions/socket.actions';
import { ProfileComponent } from './character/profile/profile.component';
import { ItemComponent } from './character/item/item.component';
export function tokenGetter() {
  return localStorage.getItem('token');
}

const config: SocketIoConfig = { url: 'http://localhost:3002', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RegisterComponent,
    HomeComponent,
    LoginComponent,
    NotFoundComponent,
    LogoutComponent,
    CharactersComponent,
    CreationComponent,
    CombatComponent,
    ChatroomComponent,
    CharacterComponent,
    ShopComponent,
    AdminComponent,
    FightComponent,
    ItemDialogComponent,
    ItemDirective,
    PveComponent,
    ProfileComponent,
    ItemComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatDialogModule,
    MatGridListModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatExpansionModule,
    NgxsModule.forRoot([
      UserState,
      SocketState
    ]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    DragDropModule,
    VirtualScrollerModule,
    SocketIoModule.forRoot(config),
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:4200', '92.92.192.178:3000', '92.92.192.178:3002', 'localhost:3000', 'localhost:3002'],
        blacklistedRoutes: ['localhost:3000/v1/users/login'],
        headerName: 'Authorization',
        authScheme: '',
        skipWhenExpired: true
      }
    }),
    FileDropModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled:  environment.production })
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: JWTInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private socket: SocketService, private store: Store) {
    this.socket.getAllMessage().subscribe((m) => {
      this.store.dispatch(new AddMessageSystem(m.toString()));
    });
  }
}
