import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, User } from '../../services/auth';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;

  currentUser: User | null = null;
  avatarPreview: string = '';
  isLoadingProfile = false;
  isSavingProfile = false;
  isChangingPassword = false;

  profileSuccessMessage = '';
  profileErrorMessage = '';
  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phoneNumber: [''],
      country: [''],
      address: ['']
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.avatarPreview = this.currentUser.avatar || '';
      this.populateForm(this.currentUser);
    }

    this.isLoadingProfile = true;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.isLoadingProfile = false;
        if (res.user) {
          this.currentUser = res.user;
          this.avatarPreview = res.user.avatar || '';
          this.populateForm(res.user);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      country: user.country || '',
      address: user.address || ''
    });
  }

  get userInitial(): string {
    const name = this.profileForm.get('name')?.value || this.currentUser?.name || 'U';
    return name.trim().charAt(0).toUpperCase();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.profileErrorMessage = 'Please select a valid image file (PNG, JPG, JPEG, WEBP).';
      this.cdr.detectChanges();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          this.avatarPreview = canvas.toDataURL('image/jpeg', 0.85);
        } else {
          this.avatarPreview = reader.result as string;
        }
        this.profileErrorMessage = '';
        this.cdr.detectChanges();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.avatarPreview = '';
    this.cdr.detectChanges();
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';
    this.cdr.detectChanges();

    const { name, phoneNumber, country, address } = this.profileForm.getRawValue();

    this.authService.updateProfile({ 
      name, 
      phoneNumber, 
      country, 
      address, 
      avatar: this.avatarPreview 
    }).subscribe({
      next: (res) => {
        this.isSavingProfile = false;
        this.profileSuccessMessage = res.message || 'Profile updated successfully!';
        if (res.user) {
          this.currentUser = res.user;
          this.avatarPreview = res.user.avatar || '';
        }
        this.cdr.detectChanges();
        setTimeout(() => {
          this.profileSuccessMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.profileErrorMessage = err.error?.message || 'Failed to update profile. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordErrorMessage = 'New passwords do not match';
      return;
    }

    this.isChangingPassword = true;
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';
    this.cdr.detectChanges();

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.isChangingPassword = false;
        this.passwordSuccessMessage = res.message || 'Password changed successfully!';
        this.passwordForm.reset();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.passwordSuccessMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordErrorMessage = err.error?.message || 'Failed to change password. Please check your current password.';
        this.cdr.detectChanges();
      }
    });
  }
}
