import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {CharacterService} from '../../../services/character.service';
import {Store} from "@ngxs/store";
import {AddCharacter} from "../../stores/actions/character.actions";

@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss']
})
export class CreationComponent implements OnInit {

  creationForm = this.fb.group({
    name: ['', Validators.compose([
      Validators.required, Validators.minLength(4), Validators.maxLength(15)])
    ],
  });


  constructor(private router: Router, private authService: AuthService, private fb: FormBuilder,
              public snackBar: MatSnackBar, private http: HttpClient,
              private characterService: CharacterService, public dialogRef: MatDialogRef<CreationComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Object, private store: Store) {
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.creationForm.invalid) {
      this.snackBar.open('Form incorrect');
      return;
    }
    this.characterService.createCharacter(this.creationForm.getRawValue()).subscribe((res) => {
      console.log(res);
      if (res['success']) {
        this.store.dispatch(new AddCharacter(res['character']));
        this.snackBar.open('Character created !',  'Close', {duration: 2000});
        this.dialogRef.close();
      }
    });
  }

  ngOnInit(): void {
  }

}
