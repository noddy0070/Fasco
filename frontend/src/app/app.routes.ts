import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Signup } from './features/auth/signup/signup';
import { Login } from './features/auth/login/login';
import { SignupVerification } from './features/auth/signup-verification/signup-verification';
import { Profile } from './features/profile/profile';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { NotFound } from './features/not-found/not-found';
export const routes: Routes = [
    {path:'',component:Home, title:'Home Page' },
    {path:'signup',component:Signup, title:'Signup Page' },
    {path:'login',component:Login, title:'Login Page' },
    {path:'forgot-password',component:ForgotPassword, title:'Forgot Password Page' },
    {path:'profile',component:Profile, title:'Profile Page' },
    {path:'signup/verify',component:SignupVerification, title:'Email Verification Page' },
    {path:'signup/verification',redirectTo:'signup/verify',pathMatch:'full'},
    {path:'404',component:NotFound, title:'Page Not Found'},
    {path:'**',redirectTo:'/404',pathMatch:'full'},
];
