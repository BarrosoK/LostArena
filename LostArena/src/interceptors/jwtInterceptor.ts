import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Store} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {UserState} from '../app/stores/states/user.state';
import {catchError, map, tap} from 'rxjs/operators';
import {Character} from "../app/models/Character";
import {SelectCharacter, SetCharacters} from "../app/stores/actions/character.actions";



@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  constructor(private _store: Store) {}

  private static handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  static createHeader(options = {
    content: 'application/json',
    bearer: true
  }) {
      let headers = new HttpHeaders({
        'Content-Type':  options.content,
      });
    if (options.bearer) {
      headers = headers.set('Authorization', 'fff');
    }
    return {headers: headers};
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.has('Authorization') && req.headers.get('Authorization') === 'true') {
      const token = this._store.selectSnapshot<string>(UserState.token);
      req = req.clone({
        setHeaders: {
          Authorization: `${token}`
        }
      });
    }
    return next.handle(req).pipe(
      catchError(JWTInterceptor.handleError),
      tap((res) => {
        if (res['body'] && res['body']['character']) {
          this._store.dispatch(new SelectCharacter(res['body']['character']));
        }
      })
    );
  }

}
