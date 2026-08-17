import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.cdr.detectChanges();
  }

  closeChat() {
    this.isOpen = false;
    this.cdr.detectChanges();
  }

  sendMessage(text?: string) {
    const question = (text || this.userInput).trim();
    if (!question || this.isTyping) return;

    this.messages = [...this.messages, { sender: 'user', text: question }];
    this.userInput = '';
    this.isTyping = true;
    this.cdr.detectChanges();
    
    this.chatService.sendMessage(question).pipe(
      timeout(4000),
      catchError(() => {
        return of({ answer: this.getSmartResponse(question) });
      })
    ).subscribe({
      next: (response) => {
        this.isTyping = false;
        this.messages = [...this.messages, { sender: 'bot', text: response.answer || this.getSmartResponse(question) }];
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: () => {
        this.isTyping = false;
        this.messages = [...this.messages, { sender: 'bot', text: this.getSmartResponse(question) }];
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  private getSmartResponse(queryText: string): string {
    const q = queryText.toLowerCase().trim();

    // 1. Transactions (including typos like trabsaction)
    if (q.includes('add') && (q.includes('tran') || q.includes('trab') || q.includes('income') || q.includes('expense'))) {
      return 'To add a transaction in TaxPal:\n\n1. Click **Transactions** in the left sidebar.\n2. Select **Income** or **Expense**.\n3. Enter the amount (₹) and choose or type a category.\n4. Pick the date and click **Add Transaction**.';
    }
    if (q.includes('delete') && (q.includes('tran') || q.includes('trab'))) {
      return 'To delete a transaction:\n\n1. Open the **Transactions** page.\n2. In the Transaction History panel on the right, find the transaction.\n3. Click the red **Delete** button next to it.';
    }

    // 2. Profile & Settings
    if (q.includes('profile') || q.includes('photo') || q.includes('picture') || q.includes('avatar') || q.includes('password') || q.includes('name')) {
      return 'To update your profile or password:\n\n1. Click **Settings** in the bottom sidebar.\n2. Click directly on your **Profile Picture Icon** to upload a new picture from your device.\n3. Update your full name, phone number, address, or password and click **Save Changes**.';
    }

    // 3. Reports & Downloads
    if (q.includes('report') || q.includes('download') || q.includes('export') || q.includes('pdf') || q.includes('excel') || q.includes('csv') || q.includes('statement')) {
      return 'To download or generate reports:\n\n1. Click **Reports** in the left sidebar.\n2. Select your **Report Type** (e.g. Income vs Expense, Category Breakdown, Annual Tax Summary).\n3. Pick the Period and Format (**PDF**, **CSV**, or styled **Excel** spreadsheet).\n4. Click **Generate Report** to preview, print, or download your statement.';
    }

    // 4. Tax Calculator
    if (q.includes('tax') || q.includes('calculate') || q.includes('slab') || q.includes('80c') || q.includes('deduction')) {
      return 'To calculate your income tax:\n\n1. Open the **Tax Calculator** tab in the sidebar.\n2. Enter your Gross Annual Income and any deductions (80C, 80D, standard deduction).\n3. TaxPal instantly computes your taxable income, tax bracket breakdown, and net tax liability under the New Tax Regime (0% up to ₹3L, 5% up to ₹6L, 10% up to ₹9L, 15% up to ₹12L, etc., with ₹0 effective tax up to ₹7L with 87A rebate!).';
    }

    // 5. Budgets & Travel/Food queries
    if (q.includes('travel') && (q.includes('budget') || q.includes('spend') || q.includes('over'))) {
      return 'To check or manage your travel budget, visit the **Budgets** section in the sidebar. You can set a monthly spending limit for Travel, and TaxPal will automatically track your progress and notify you if you are within or over budget!';
    }
    if (q.includes('food') && (q.includes('spend') || q.includes('how much') || q.includes('budget'))) {
      return 'You can track all your Food & Dining expenses under the **Dashboard** and **Transactions** pages. In the **Budgets** page, you can also set a monthly spending limit for Food & Dining!';
    }
    if (q.includes('budget') || q.includes('limit') || q.includes('over budget')) {
      return 'To create or check budgets:\n\n1. Click **Budgets** in the sidebar.\n2. Enter a category name (e.g. Travel, Food & Dining, Shopping) and your monthly limit in ₹.\n3. Click **Create Budget** to track your spending status with real-time progress bars!';
    }

    // 6. Income & Balance
    if (q.includes('income') || q.includes('salary') || q.includes('earned')) {
      return 'You can view your complete income breakdown, monthly earnings, and historical comparison charts on the **Dashboard** and **Transactions** pages.';
    }
    if (q.includes('balance') || q.includes('how much do i have') || q.includes('savings')) {
      return 'Your current balance and net savings are dynamically calculated as (Total Income - Total Expenses) and displayed prominently on your **Dashboard**.';
    }

    // 7. Dark Mode & Theme
    if (q.includes('dark') || q.includes('light') || q.includes('theme') || q.includes('mode')) {
      return 'You can switch between **Dark Mode** and **Light Mode** at any time by clicking the Sun (☀️) / Moon (🌙) toggle button located on the left of your name in the Top Navbar!';
    }

    // 8. Categories
    if (q.includes('categor')) {
      return 'To manage categories, open the **Categories** tab in the sidebar where you can view default categories and create custom categories for your income and expenses.';
    }

    return 'I can help you manage your finances in TaxPal! You can ask me:\n\n- *"How to add transactions?"*\n- *"How to update profile?"*\n- *"How to download reports?"*\n- *"How to calculate tax?"*\n- *"How to create budgets?"*';
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
