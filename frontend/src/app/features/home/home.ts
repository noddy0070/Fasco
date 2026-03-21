import { Component } from '@angular/core';
import { Hero } from "./sections/hero/hero";
import { TrendingProducts } from "./sections/trending-products/trending-products";
import { BrandsCarousal } from "./sections/brands-carousal/brands-carousal";
import { Blogs } from "./sections/blogs/blogs";
import { PeakyBlinder } from "./sections/peaky-blinder/peaky-blinder";
import { Follow } from "./sections/follow/follow";
import { LimitedTimeDeal } from "./sections/limited-time-deal/limited-time-deal";

@Component({
  selector: 'app-home',
  imports: [Hero, TrendingProducts, BrandsCarousal, Blogs, PeakyBlinder, Follow, LimitedTimeDeal],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
