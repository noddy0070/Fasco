import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Signup } from './features/auth/signup/signup';
export const routes: Routes = [
    {path:'',component:Home, title:'Home Page' },
    {path:'signup',component:Signup, title:'Signup Page' }
];
