import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav, MatSidenavModule} from '@angular/material';
import {AuthService} from "../../services/auth.service";
import {SocketService} from "../../services/socket.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  isMobile = false;

  @ViewChild('drawer') sidenav: MatSidenav;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  toogleNav() {
    console.log(this.sidenav);

  }

  onNavClick() {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }


  ngOnInit() {
    this.isHandset$.subscribe((onMobile) => {
      this.isMobile = onMobile;
        if (!onMobile && !this.sidenav.opened) {
          this.sidenav.open();
        } else if (onMobile && this.sidenav.opened) {
          this.sidenav.close();
        }
    });
  }

  constructor(private breakpointObserver: BreakpointObserver, protected authService: AuthService,
              protected socket: SocketService) {
   }

}
