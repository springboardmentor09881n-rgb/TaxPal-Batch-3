import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Auth, User } from '../../services/auth';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSub?: Subscription;
  private themeSub?: Subscription;
  isDarkMode = false;

  constructor(
    private authService: Auth,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges();
    });

    this.isDarkMode = this.themeService.isDarkMode;
    this.themeSub = this.themeService.isDarkMode$.subscribe((dark: boolean) => {
      this.isDarkMode = dark;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.themeSub?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get userInitial(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name.trim().charAt(0).toUpperCase();
  }
}
