import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Signup } from './features/auth/signup/signup';
import { Login } from './features/auth/login/login';
import { SignupVerification } from './features/auth/signup-verification/signup-verification';
export const routes: Routes = [
    {path:'',component:Home, title:'Home Page' },
    {path:'signup',component:Signup, title:'Signup Page' },
    {path:'login',component:Login, title:'Login Page' },
    {path:'signup/verification',component:SignupVerification, title:'Email Verification Page' },
];
