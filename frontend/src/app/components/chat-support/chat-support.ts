import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chat-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-support.html',
  styleUrl: './chat-support.css'
})
export class ChatSupport implements AfterViewChecked {
  isOpen = false;
  userInput = '';
  isTyping = false;
  
  messages: ChatMessage[] = [
    { sender: 'bot', text: 'Hi 👋 I am your AI Financial Assistant. How can I help you today?' }
  ];

  suggestedQuestions: string[] = [
    'How much did I spend on food this month?',
    'What is my current balance?',
    'Am I over budget on travel?',
    'What was my total income last month?'
  ];

  @ViewChild('chatBody') private chatBody!: ElementRef;

  constructor(private chatService: ChatService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  closeChat() {
    this.isOpen = false;
  }

  sendMessage(text?: string) {
    const question = (text || this.userInput).trim();
    if (!question || this.isTyping) return;

    this.messages = [...this.messages, { sender: 'user', text: question }];
    this.userInput = '';
    this.isTyping = true;
    
    this.chatService.sendMessage(question).subscribe({
      next: (response) => {
        this.isTyping = false;
        this.messages = [...this.messages, { sender: 'bot', text: response.answer }];
      },
      error: (error) => {
        this.isTyping = false;
        const errorMessage = error.error?.message || 'Sorry, I am having trouble connecting to the server.';
        this.messages = [...this.messages, { sender: 'bot', text: errorMessage }];
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch(err) {}
  }
}
