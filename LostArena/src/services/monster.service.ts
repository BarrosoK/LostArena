import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {map} from "rxjs/operators";
import {IMonster} from "../classes/duel";

@Injectable({
  providedIn: 'root'
})
export class MonsterService {

  constructor(private http: HttpClient) { }

  getMonsters() {
    return this.http.get<IMonster>(environment.api.monster + '').pipe(
      map((m) => m['monsters'])
    );
  }
}
