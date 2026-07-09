import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="link" class="brand" [class.footer-brand]="variant === 'footer'">
      <img
        src="/taxpal-logo.png"
        alt="TaxPal"
        class="brand-logo"
        [class.brand-logo-lg]="size === 'lg'"
        width="40"
        height="40"
      />
      @if (showName) {
        <span class="brand-name">TaxPal</span>
      }
    </a>
  `,
})
export class BrandComponent {
  @Input() link = '/';
  @Input() showName = true;
  @Input() size: 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'footer' = 'default';
}
