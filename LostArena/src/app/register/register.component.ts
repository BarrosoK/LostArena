import { Component } from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm = this.fb.group({
    username: ['', Validators.compose([
      Validators.required, Validators.minLength(4), Validators.maxLength(15)])
    ],
    email: ['', Validators.compose([
      Validators.required, Validators.email])],
    passwords: this.fb.group({
      password: ['', [Validators.required]],
      passwordConfirmation: ['', [Validators.required]],
    }, {validator: this.passwordConfirming}),

  });

  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('password').value !== c.get('passwordConfirmation').value) {
      return {invalid: true};
    }
  }

  constructor(private router: Router, private authService: AuthService, private fb: FormBuilder, public snackBar: MatSnackBar, private http: HttpClient) {
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.openSnackBar('Form incorrect');
      return;
    }

    const account = this.registerForm.getRawValue();
    this.authService.register(account);
  }

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
}
