import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  helper = new JwtHelperService();

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !this.helper.isTokenExpired(token);
  }


  constructor(private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.isAuthenticated()) {
      return true;
    } else {
        if (localStorage.getItem('token')) {
          localStorage.clear();
        }
      this.router.navigate(['login']);
      return false;
    }
  }
}
