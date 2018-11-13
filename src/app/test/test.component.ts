import { Component, OnInit } from '@angular/core';
import {FacebookService, InitParams, LoginResponse} from 'ng2-facebook-sdk';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})

export class TestComponent implements OnInit {
  fbToken = '';
  initFbParams: InitParams = {
    appId: '381529608984233',
    xfbml: true,
    version: 'v2.8'
  };
  appSecret = '923e9f2e1bd80bc6d40a40b21d11bb10';
  redirectUrl = '';
  machineId;

  constructor(private fb: FacebookService, private http: HttpClient) {
    this.fb.init(this.initFbParams);
  }

  ngOnInit() {

  }
  // front-end
  loginWithFacebook(): void {
    this.fb.login()
      .then((response: LoginResponse) => {
        console.log(response);
        this.fbToken = response.authResponse.accessToken;
        this.getLongLivedAccessToken(response.authResponse.accessToken);
      })
      .catch((error: any) => console.error(error));
  }

  // back-end
  getLongLivedAccessToken (accessToken) {
    this.fb.api(`/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.initFbParams.appId}&client_secret=${this.appSecret}&fb_exchange_token=${accessToken}`)
      .then((data) => {
        console.log(data);
        this.getCode(data.access_token);
      });
  }

  // back-end
  getCode(accessToken) {
    this.http.get(`https://graph.facebook.com/oauth/client_code?access_token=${accessToken}&client_secret=${this.appSecret}&redirect_uri=${this.redirectUrl}&client_id=${this.initFbParams.appId}`)
      .subscribe((data: any) => {
        console.log(data);
        this.getClientLongLivedToken(data.code);
      });
  }

  // front-end
  getClientLongLivedToken(code) {
    this.http.get(`https://graph.facebook.com/oauth/access_token?code=${code}&client_id=${this.initFbParams.appId}&redirect_uri=${this.redirectUrl}`)
      .subscribe((data: any) => {
        console.log(data);
        this.machineId = data.machine_id;
        this.getPageAccessFacebook(data.access_token);
      });
  }

  // front-end
  getPageAccessFacebook(access_token) {
    this.http.get(`https://graph.facebook.com/me/accounts?access_token=${access_token}`)
      .subscribe((data: any) => {
        console.log(data);
        this.getInstagramPageToken(data.data[0].id, data.data[0].access_token);
      });
  }

  getInstagramPageToken(id, access_token) {
    this.http.get(`https://graph.facebook.com/${id}?access_token=${access_token}&fields=page_token`)
      .subscribe((data: any) => {
        console.log(data);
      });
  }



}



