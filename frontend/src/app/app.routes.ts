import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Signup } from './features/auth/signup/signup';
import { Login } from './features/auth/login/login';
export const routes: Routes = [
    {path:'',component:Home, title:'Home Page' },
    {path:'signup',component:Signup, title:'Signup Page' },
    {path:'login',component:Login, title:'Login Page' }
];
