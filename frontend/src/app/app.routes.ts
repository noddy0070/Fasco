import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Signup } from './features/auth/signup/signup';
import { Login } from './features/auth/login/login';
import { SignupVerification } from './features/auth/signup-verification/signup-verification';
import { CollectionPage } from './features/collections/collection-page/collection-page';
export const routes: Routes = [
    {path:'',component:Home, title:'Home Page' },
    {path:'shop',redirectTo:'collections/mens-new-arrivals',pathMatch:'full'},
    {path:'deals',redirectTo:'collections/sale',pathMatch:'full'},
    {path:'new-arrivals',redirectTo:'collections/womens-new-arrivals',pathMatch:'full'},
    {path:'packages',redirectTo:'collections/featured',pathMatch:'full'},
    {path:'collections',redirectTo:'collections/mens-new-arrivals',pathMatch:'full'},
    {path:'collections/:collectionSlug',component:CollectionPage, title:'Collection Page' },
    {path:'signup',component:Signup, title:'Signup Page' },
    {path:'login',component:Login, title:'Login Page' },
    {path:'signup/verification',component:SignupVerification, title:'Email Verification Page' },
];
