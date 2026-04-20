import { Component, Inject, signal } from '@angular/core';
import { BlackButton } from "../../../shared/components/black-button/black-button";
import { TransitionLink } from "../../../shared/components/transition-link/transition-link";
import { AuthFrame } from "../../../layout/auth-frame/auth-frame";
import { EyeTrack } from "../../../shared/components/eye-track/eye-track";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [BlackButton, TransitionLink, AuthFrame, EyeTrack],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login{
  isEyeClosed = signal(true);
  
  httpClient=Inject(HttpClient);

  userData=signal({})
  ressendData(){
    return this.httpClient.post('/api/auth/login',{
      email:'',
      password:''
    });
  }
}
