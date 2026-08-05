import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FAQ_DATA } from './faq-data';

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
  
  messages: ChatMessage[] = [
    { sender: 'bot', text: 'Hi 👋 Welcome to Expense Tracker Support. How can I help you today?' }
  ];

  suggestedQuestions: string[] = [
    'How do I create a budget?',
    'How do I add a transaction?',
    'How do categories work?',
    'How do reports work?'
  ];

  @ViewChild('chatBody') private chatBody!: ElementRef;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  closeChat() {
    this.isOpen = false;
  }

  sendMessage(text?: string) {
    const question = (text || this.userInput).trim();
    if (!question) return;

    this.messages = [...this.messages, { sender: 'user', text: question }];
    this.userInput = '';

    const answer = this.findAnswer(question);
    
    setTimeout(() => {
      this.messages = [...this.messages, { sender: 'bot', text: answer }];
    }, 400);
  }

  private findAnswer(question: string): string {
    const lowerQ = question.toLowerCase();
    
    let match = FAQ_DATA.find(f => f.question.toLowerCase() === lowerQ);
    
    if (!match) {
      const cleanLowerQ = lowerQ.replace(/[^\w\s]/gi, '');
      const userWords = cleanLowerQ.split(' ').filter(w => w.length > 3);
      
      if (userWords.length > 0) {
        match = FAQ_DATA.find(f => {
           const cleanFAQ = f.question.toLowerCase().replace(/[^\w\s]/gi, '');
           const keywords = cleanFAQ.split(' ').filter(w => w.length > 3);
           return userWords.some(uw => keywords.some(kw => kw.includes(uw) || uw.includes(kw)));
        });
      }
    }

    return match ? match.answer : "Sorry, I couldn't find an answer to that. Please contact support or try asking another question.";
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
