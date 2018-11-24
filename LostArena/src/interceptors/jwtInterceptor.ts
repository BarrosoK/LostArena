import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {Store} from "@ngxs/store";
import {Injectable} from "@angular/core";
import {UserState} from "../app/stores/states/user.state";

@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  constructor(private _store: Store) {}

  static createHeader(options = {
    content: 'application/json',
    bearer: true
  }) {
      let headers = new HttpHeaders({
        'Content-Type':  options.content,
      });
    if (options.bearer) {
      headers = headers.set('Authorization', 'true');
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
    return next.handle(req);
  }

}
