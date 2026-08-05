import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { ChatSupport } from '../chat-support/chat-support';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, Sidebar, ChatSupport],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css'
})
export class AppLayout {}