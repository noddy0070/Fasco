import { Component,signal } from '@angular/core';

@Component({
  selector: 'app-brands-carousal',
  imports: [],
  templateUrl: './brands-carousal.html',
  styleUrl: './brands-carousal.css',
})
export class BrandsCarousal {
  brands = signal([
    { name: 'Calvin Klein', logo: 'assets/images/brands/calvin_klein.png' },
    { name: 'Chanel', logo: 'assets/images/brands/chanel.png' },
    { name: 'Denim', logo: 'assets/images/brands/denim.png' },
    { name: 'Gucci', logo: 'assets/images/brands/guici.png' },
    { name: 'Louis Vuitton', logo: 'assets/images/brands/louis_vuitton.png' },
    { name: 'Prada', logo: 'assets/images/brands/prada.png' },
    { name: 'Reebok', logo: 'assets/images/brands/versace.png' },
    { name: 'Zara', logo: 'assets/images/brands/zara.png' },
  ]);

  duplicatedBrands = signal([
    ...this.brands(),
    ...this.brands(),
    
  ]);

}
