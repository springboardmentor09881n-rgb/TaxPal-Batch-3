import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';
import { ChatSupport } from '../chat-support/chat-support';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Navbar, ChatSupport],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css'
})
export class AppLayout {}