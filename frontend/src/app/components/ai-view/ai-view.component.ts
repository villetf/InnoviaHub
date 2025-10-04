import { Component, signal } from '@angular/core';
import { ChatMessage } from '../../../types/ChatMessage';

@Component({
  selector: 'app-ai-view',
  imports: [],
  templateUrl: './ai-view.component.html',
  styleUrl: './ai-view.component.css'
})
export class AiViewComponent {
  aiViewIsOpen = signal<boolean>(false);
  aiViewIsMinimized = signal<boolean>(false);
  chatConversation = signal<ChatMessage[]>([{author: "bot", text: "Hej! Jag kan hjälpa dig att göra din bokning. Skriv dina önskemål, så hjälper jag dig att hitta en ledig tid."}])

  openAiView() {
    this.aiViewIsOpen.set(true);
    this.aiViewIsMinimized.set(false);
  }

  closeAiView() {
    this.aiViewIsOpen.set(false);
    this.aiViewIsMinimized.set(false);
    this.chatConversation.set([{author: "bot", text: "Hej och välkommen! Skriv dina önskemål, så hjälper jag dig att hitta en ledig tid."}])
  }

  minimizeAiView() {
    this.aiViewIsMinimized.set(true);
  }

  enlargenAiView() {
    this.aiViewIsMinimized.set(false);
  }
}
