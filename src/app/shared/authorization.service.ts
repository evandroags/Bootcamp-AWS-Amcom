import { Injectable } from '@angular/core';
import {Http, Headers, RequestOptions} from "@angular/http";
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

const poolData = {
  UserPoolId: environment.USER_POOL_ID, // <User Pool ID>
  ClientId: environment.CLIENT_ID, // <App Client ID>
  region: environment.REGION, // <region>
  identityPoolId: environment.IDENTITY_POOL_ID, // <Identity Pool ID>
  bucket: environment.BUCKET// <bucket>
};

const userPool = new CognitoUserPool(poolData);

@Injectable()
export class AuthorizationService {
  cognitoUser: any;
  username : string;

  constructor(private http: Http) { }

  register(email, user, password) {

    const attributeList = [];

    var dataEmail = {
       Name : 'email',
       Value : email
    };
    attributeList.push(dataEmail);
    
    return Observable.create(observer => {
      userPool.signUp(user, password, attributeList, null, (err, result) => {
        if (err) {
          console.log("signUp error", err);
          observer.error(err);
        }

        this.cognitoUser = result.user;
        console.log("signUp success", result);
        observer.next(result);
        observer.complete();
      });
    });
  }

  confirmAuthCode(code) {
    const user = {
      Username : this.cognitoUser.username,
      Pool : userPool
    };
    return Observable.create(observer => {
      const cognitoUser = new CognitoUser(user);
      cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
          console.log(err);
          observer.error(err);
        }
        console.log("confirmAuthCode() success", result);
        observer.next(result);
        observer.complete();
      });
    });
  }

  signIn(email, password) { 

    const authenticationData = {
      Username : email,
      Password : password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username : email,
      Pool : userPool
    };
    const cognitoUser = new CognitoUser(userData);
    
    return Observable.create(observer => {

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          observer.next(result);
          observer.complete();
        },
        onFailure: function(err) {
          console.log(err);
          observer.error(err);
        },
      });
    });
  }

  isLoggedIn() { 
    return userPool.getCurrentUser() != null;
  }

  getAuthenticatedUser() {
    return userPool.getCurrentUser();
  }

  logOut() {
    this.getAuthenticatedUser().signOut();
    this.cognitoUser = null;
  }

  gravaLog(tipo, arquivo){console.log(tipo, arquivo);
    var authenticatedUser = this.getAuthenticatedUser();
    if (authenticatedUser == null) {
      return;
    }
    authenticatedUser.getSession( (err, session) => {
      if (err) {
        console.log(err);
        return;
      }
      this.username = authenticatedUser.getUsername();
      const token = session.getIdToken().getJwtToken();      
      const headers = new Headers();
      headers.append('Authorization', token);      
      var that = this;

      this.getAuthenticatedUser().getSession((err, session) => {
        if (err) {
          console.log(err);
          return;
        }
        const token = session.getIdToken().getJwtToken();      
        const headers = new Headers();
        headers.append('Authorization', token);
        headers.append('Content-Type', 'application/json');
        this.http.get('https://a76sx552gj.execute-api.us-east-1.amazonaws.com/default/bootcamplog?tipo=' + tipo + '&path=' + this.username+ '&namefile=' + arquivo, { headers: headers})  
        .subscribe(
          response => {
            console.log(response);
          },
          error => {
            console.log(error);
          }
        );
      });
    }); 
  }

}
