import { Component, OnInit } from '@angular/core';
import {AuthorizationService} from "../shared/authorization.service";
import {NgForm} from "@angular/forms";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  emailVerificationMessage: boolean = false;

  constructor(private auth: AuthorizationService,
              private _router: Router) {

  }

  onSubmit(form: NgForm) {

    const user = form.value.user;
    const password = form.value.password;
    
    this.auth.signIn(user, password).subscribe((data) => {
      this.auth.gravaLog('LI',null);
      this._router.navigateByUrl('/');
    }, (err)=> {
      this.emailVerificationMessage = true;
    });   
  }
}
