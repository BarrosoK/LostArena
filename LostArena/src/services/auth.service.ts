import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {SetSession, SetToken, SetUser} from '../app/stores/actions/user.actions';
import {UserState} from '../app/stores/states/user.state';
import {environment} from '../environments/environment';
import {MatSnackBar} from '@angular/material';
import {JWTInterceptor} from "../interceptors/jwtInterceptor";
import {CharacterService} from "./character.service";
import {Character} from "../app/models/Character";
import {SelectCharacter, SetCharacters} from "../app/stores/actions/character.actions";
import {SocketService} from "./socket.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  @Select(UserState.token) token$: Observable<string>;

  openSnackBar(message: string, action: string = '', duration: number = 2000) {
    const snackRef = this.snackBar.open(message, action, {
      duration: duration,
    });
    snackRef.onAction().subscribe(() => {
      switch (snackRef.instance.data.action) {
        case 'Login':
          this.router.navigate(['']);
          return;
      }
    });

  }

  register(account) {
    account.password = account.passwords.password;
    this.http.post(environment.api.register, account).subscribe((res) => {
      if (res && res['success']) {
        this.openSnackBar('Account created ! ', 'Login', 4000);
      }
    }, (res) => {
      this.openSnackBar('Error: ' + res.error.error);
    });
  }

  login(creditentials) {
    this.http.post(environment.api.login, creditentials).subscribe(async (res) => {
      console.log(res);
      if (res['success']) {
        localStorage.setItem('token', res['token']);
        this.store.dispatch(new SetSession(res['token'], res['user']));
        this.socket.login(res['user']);
        this.recoverSelected();
        this.characterService.getMyCharacters().subscribe((characters: Character[]) => {
          this.store.dispatch(new SetCharacters(characters));
        });
        this.router.navigate(['']);
      }
    }, (res) => {
      console.log(res);
    });
  }

  recoverSelected() {
    const id = localStorage.getItem('selected');
    if (id) {
      const characters = this.store.selectOnce(state => state.user).subscribe((c) => {
        const char = c.characters.filter((chars) => {
          return chars._id === id;
        });
        console.log(char);
        if (c.user.id && char.length > 0 && char[0].user_id === c.user.id) {
          this.store.dispatch(new SelectCharacter(char[0]));
        }
      });
    }
  }

  logout() {
    localStorage.getItem('token');
    {
      localStorage.removeItem('token');
      this.router.navigate(['login']);
      this.socket.disconnect();
      this.store.dispatch(new SetSession(null, null));
    }
  }

  constructor(public snackBar: MatSnackBar, private http: HttpClient, private router: Router, private store: Store,
              private characterService: CharacterService, private socket: SocketService) {
    if (!this.store.selectSnapshot(UserState.token) && localStorage.getItem('token')) {
      // RETRIVE SESSION FROM LOCALSTORAGE
      const token = localStorage.getItem('token');
      this.store.dispatch(new SetToken(token));
      http.get(environment.api.profile).subscribe((res) => {
        this.store.dispatch(new SetUser(res['user']));
        this.socket.login(res['user']);
        this.characterService.getMyCharacters().subscribe((characters: Character[]) => {
          this.store.dispatch(new SetCharacters(characters));
          this.recoverSelected();
        });
      }, (res) => {
        console.log(res);
      });

    }
  }

}
