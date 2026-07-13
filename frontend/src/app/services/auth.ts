import { Injectable } from '@angular/core';

export interface User {
  name: string;
  email: string;
  country: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly USERS_KEY = 'taxpal_users';
  private readonly CURRENT_USER_KEY = 'taxpal_current_user';

  register(user: User): boolean {
    const users = this.getUsers();

    const userExists = users.some(
      existingUser =>
        existingUser.email.toLowerCase() === user.email.toLowerCase()
    );

    if (userExists) {
      return false;
    }

    users.push(user);

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();

    const user = users.find(
      existingUser =>
        existingUser.email.toLowerCase() === email.toLowerCase() &&
        existingUser.password === password
    );

    if (!user) {
      return false;
    }

    localStorage.setItem(
      this.CURRENT_USER_KEY,
      JSON.stringify(user)
    );

    return true;
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.CURRENT_USER_KEY) !== null;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);

    return user ? JSON.parse(user) : null;
  }

  private getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);

    return users ? JSON.parse(users) : [];
  }
}