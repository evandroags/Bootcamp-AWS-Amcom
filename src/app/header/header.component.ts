import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from "../shared/authorization.service";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(private _auth: AuthorizationService,
              private _router: Router) { }

  doLogout(){  
    this._auth.gravaLog('LO',null); 
    this._auth.logOut();
    this._router.navigateByUrl('/login');
  }
}
