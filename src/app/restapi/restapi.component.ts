import { Component, OnInit } from '@angular/core';
import { AuthorizationService} from "../shared/authorization.service";
import {Http, Headers, RequestOptions} from "@angular/http";
import { Observable } from 'rxjs';
import * as AWS from "amazon-cognito-identity-js/node_modules/aws-sdk";
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restapi',
  templateUrl: './restapi.component.html',
  styleUrls: ['./restapi.component.css']
})
export class RestApiComponent implements OnInit {

  _data : any;
  bAuthenticated = 0;
  username : string;
  email : string;
  Object = Object;
  _identityPollId : string = environment.IDENTITY_POOL_ID;
  _bucket : string = environment.BUCKET;
  

  constructor(private http: Http, private auth: AuthorizationService, private _router: Router) { }

  ngOnInit() {
    var authenticatedUser = this.auth.getAuthenticatedUser();
    if (authenticatedUser == null) {
      this._router.navigateByUrl('/');
      return;
    }
    this.bAuthenticated = 1;
    this.username = authenticatedUser.getUsername();

    authenticatedUser.getSession( (err, session) => {
      if (err) {
        console.log(err);
        return;
      }

      const token = session.getIdToken().getJwtToken();      
      const headers = new Headers();
      headers.append('Authorization', token);      
      var that = this;

      this.auth.getAuthenticatedUser().getSession((err, session) => {
        if (err) {
          console.log(err);
          return;
        }
        const token = session.getIdToken().getJwtToken();      
        const headers = new Headers();
        headers.append('Authorization', token);
        headers.append('Content-Type', 'application/json');
        this.http.get('https://a76sx552gj.execute-api.us-east-1.amazonaws.com/default/bootcampListBucket?user=' + this.username, { headers: headers})  
        .subscribe(
          response => {
            let arqui = JSON.parse(response.json().body).filter((pasta) => {
                pasta.ETag = environment.URL_BUCKET + pasta.Key ;
                pasta.Key  = pasta.Key.substring(this.username.length+1);
                return pasta.Key != 'log.txt';
            })
            that._data = arqui;
          },
          error => {
            console.log(error);
          }
        );
      });
    });
  }

  public baixar(arquivo){
    var authenticatedUser = this.auth.getAuthenticatedUser();
    if (authenticatedUser == null) {return;}

    this.auth.getAuthenticatedUser().getSession((err, session) => {
      if (err) {
        console.log('autenticacao = '+ err);
        return;
      }
      this.auth.gravaLog('DW',arquivo);
    });
  }


  public enviar(event) {
    var that = this;
    var authenticatedUser = this.auth.getAuthenticatedUser();
    if (authenticatedUser == null) {return;}

    this.auth.getAuthenticatedUser().getSession((err, session) => {
      if (err) {
        console.log('autenticacao = '+ err);
        return;
      }

      let albumName = authenticatedUser.getUsername();
      let file: File = event.target.form[0].files[0];
      var fileName = file.name;
      let albumPhotosKey = encodeURIComponent(albumName) + "/";
      let pathAndFile = albumPhotosKey + fileName;

      AWS.config.region = session.idToken.payload.iss.substring(20,29);
      let loginMap = {};
      let idToken = session.getIdToken().getJwtToken();
      loginMap[session.idToken.payload.iss.substring(8)] = idToken;

      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: that._identityPollId,
          Logins: loginMap
      });

      if(file) {
        var upload = new AWS.S3.ManagedUpload({
          params: {
            Bucket: that._bucket,
            Key: pathAndFile,
            Body: file,
            ACL: 'public-read'
          }
        });

        var promise = upload.promise();
        promise.then(
          function(data) {
            that.auth.gravaLog('IN',fileName);
            alert("Sucesso ao enviar arquivo!");
            that.notificaNovoArquivo(); 
          },
          function(err) {
            console.log(err);
          }
        );
      }
    });
  };

  public deletar(username, arquivo) {
    var authenticatedUser = this.auth.getAuthenticatedUser();
    if (authenticatedUser == null) {
      return;
    }
    this.bAuthenticated = 1;
    this.username = authenticatedUser.getUsername();

    authenticatedUser.getSession( (err, session) => {
      if (err) {
        console.log(err);
        return;
      }

      const token = session.getIdToken().getJwtToken();      
      const headers = new Headers();
      headers.append('Authorization', token);      
      var that = this;

      this.auth.getAuthenticatedUser().getSession((err, session) => {
        if (err) {
          console.log(err);
          return;
        }
        const token = session.getIdToken().getJwtToken();      
        const headers = new Headers();
        headers.append('Authorization', token);
        headers.append('Content-Type', 'application/json');

        let pathFile = username + '/' + arquivo;

        headers.append('pathFile', 'pathFile');

        this.http.delete('https://a76sx552gj.execute-api.us-east-1.amazonaws.com/default/bootcampListBucket?pathFile=' + pathFile, { headers: headers})  
        .subscribe(
          response => {
            that.auth.gravaLog('DT',arquivo);
            alert('Registro deletado com sucesso!');
            location.reload();
          },
          error => {
            console.log('Erro ao deletar arquivo. ' + error);
          }
        );
      });
    });
  }


  public notificaNovoArquivo() {
    var authenticatedUser = this.auth.getAuthenticatedUser();
    if (authenticatedUser == null) {
      return;
    }
    authenticatedUser.getSession( (err, session) => {
      if (err) {
        console.log(err);
        return;
      }
      this.email = session.idToken.payload.email;
      const token = session.getIdToken().getJwtToken();      
      const headers = new Headers();
      headers.append('Authorization', token);      
      var that = this;

      this.auth.getAuthenticatedUser().getSession((err, session) => {
        if (err) {
          console.log(err);
          return;
        }
        const token = session.getIdToken().getJwtToken();      
        const headers = new Headers();
        headers.append('Authorization', token);
        headers.append('Content-Type', 'application/json');
        this.http.get('https://a76sx552gj.execute-api.us-east-1.amazonaws.com/default/bootcampnotificaemailbucket?email=' + this.email, { headers: headers})  
        .subscribe(
          response => {
            location.reload();
          },
          error => {
            console.log(error);
          }
        );
      });
    });
  }



  public enviaLog() {
      var authenticatedUser = this.auth.getAuthenticatedUser();
      if (authenticatedUser == null) {
        return;
      }
      authenticatedUser.getSession( (err, session) => {
        if (err) {
          console.log(err);
          return;
        }
        this.email = session.idToken.payload.email;
        this.username = authenticatedUser.getUsername();
  
        const token = session.getIdToken().getJwtToken();      
        const headers = new Headers();
        headers.append('Authorization', token);      
        var that = this;
  
        this.auth.getAuthenticatedUser().getSession((err, session) => {
          if (err) {
            console.log(err);
            return;
          }
          const token = session.getIdToken().getJwtToken();      
          const headers = new Headers();
          headers.append('Authorization', token);
          headers.append('Content-Type', 'application/json');
          this.http.get('https://a76sx552gj.execute-api.us-east-1.amazonaws.com/default/bootcamplogemail?email=' + this.email + '&path=' + this.username, { headers: headers})  
          .subscribe(
            response => {
              console.log(response);
              alert("Sucesso! Um arquivo de log foi enviado para o email " + this.email);
            },
            error => {
              console.log(error);
            }
          );
        });
      });
  }

}
