import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./layout/header/header";
import { Footer } from "./layout/footer/footer";
@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: `./app.html`,
})
export class App {
  protected readonly title=signal('Ecommerce App');
}
