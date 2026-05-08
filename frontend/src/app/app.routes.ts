import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Signup } from './features/auth/signup/signup';
import { Login } from './features/auth/login/login';
import { SignupVerification } from './features/auth/signup-verification/signup-verification';
import { Profile } from './features/profile/profile';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { NotFound } from './features/not-found/not-found';
import { CollectionPage } from './features/collections/collection-page/collection-page';
import { ProductDetail } from './features/product-detail/product-detail';
import { SearchPage } from './features/search/search-page/search-page';
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
    {path:'',component:Home, title:'Home Page' },
    {path:'shop',redirectTo:'collections/mens-new-arrivals',pathMatch:'full'},
    {path:'deals',redirectTo:'collections/sale',pathMatch:'full'},
    {path:'new-arrivals',redirectTo:'collections/womens-new-arrivals',pathMatch:'full'},
    {path:'packages',redirectTo:'collections/featured',pathMatch:'full'},
    {path:'collections',redirectTo:'collections/mens-new-arrivals',pathMatch:'full'},
    {path:'collections/:collectionSlug',component:CollectionPage, title:'Collection Page' },
    {path:'product/:id',component:ProductDetail, title:'Product Detail'},
    {path:'search',component:SearchPage, title:'Search Results' },
    {path:'signup',component:Signup, title:'Signup Page' },
    {path:'login',component:Login, title:'Login Page' },
    {path:'forgot-password',component:ForgotPassword, title:'Forgot Password Page' },
    {path:'profile',component:Profile, title:'Profile Page', canActivate:[authGuard] },
    {path:'signup/verify',component:SignupVerification, title:'Email Verification Page' },
    {path:'signup/verification',redirectTo:'signup/verify',pathMatch:'full'},
    {path:'404',component:NotFound, title:'Page Not Found'},
    {path:'**',redirectTo:'/404',pathMatch:'full'},
];
