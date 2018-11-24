import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required]
  });

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private router: Router) {}

  onSubmit() {
      this.authService.login(this.loginForm.getRawValue());
  }
}
