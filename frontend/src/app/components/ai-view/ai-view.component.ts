import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ChatMessage } from '../../../types/ChatMessage';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../../core/app-config.service';
import { ResourceService } from '../ResourceMenu/Services/ResourceService.service';
import { ResourceTypeService } from '../ResourceMenu/Services/ResourceTypeService.service';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { BookableResourceSlot } from '../../../types/BookableResourceSlot';
import { ChatService } from './ChatService.service';
import { NgClass } from '@angular/common';
import { BookingObject } from '../../../types/BookingObject';


@Component({
   selector: 'app-ai-view',
   imports: [FormsModule, NgClass],
   templateUrl: './ai-view.component.html',
   styleUrl: './ai-view.component.css'
})
export class AiViewComponent {
   aiViewIsOpen = signal<boolean>(false);
   aiViewIsMinimized = signal<boolean>(false);
   defaultFirstChat = "Hej! Jag kan hjälpa dig att göra din bokning. Skriv dina önskemål, så hjälper jag dig att hitta en ledig tid.";
   chatConversation = signal<ChatMessage[]>([{author: "bot", text: this.defaultFirstChat}]);
   chatInputText = signal<string>('');
   messageToBeSent = signal<string>('');
   answerIsPending = signal<boolean>(false);

   @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;

   private cfg = inject(AppConfigService);
   private resourceTypeService = inject(ResourceTypeService);
   private resourceService = inject(ResourceService);
   private chatService = inject(ChatService);

   openAiView() {
      this.aiViewIsOpen.set(true);
      this.aiViewIsMinimized.set(false);
      setTimeout(() => {
         this.chatInput.nativeElement.focus();
      });
   }

   closeAiView() {
      this.aiViewIsOpen.set(false);
      this.aiViewIsMinimized.set(false);
      this.chatConversation.set([{author: "bot", text: this.defaultFirstChat}]);
   }

   minimizeAiView() {
      this.aiViewIsMinimized.set(true);
   }

   enlargenAiView() {
      this.aiViewIsMinimized.set(false);
      setTimeout(() => {
         this.chatInput.nativeElement.focus();
      });
   }

   async sendChat() {
      console.log('answer pending', this.answerIsPending());
      console.log('meddelande', this.messageToBeSent());
      console.log('längd', this.messageToBeSent().length);
      
      const messageThatIsSent = this.messageToBeSent();
      this.answerIsPending.set(true);
      this.fetchAvailableTimes()
         .subscribe(times => {
            const chatData = {
               question: messageThatIsSent,
               chatHistory: JSON.stringify(this.chatConversation()),
               availableTimes: JSON.stringify(times)
            }
            this.chatService.sendChat(chatData)
               .subscribe(response => {
                  this.answerIsPending.set(false);

                  if (this.checkJson(response)) {
                     this.chatConversation.update(conv => [
                        ...conv,
                        { author: 'bot', text: response, bookingObjects: this.parseMessageJson(response)}
                     ])
                     console.log('josn parsat', this.chatConversation());
                  } else {
                     this.chatConversation.update(conv => [
                        ...conv,
                        { author: 'bot', text: response}
                     ])
                  }
               })
         })

      this.chatConversation.update(conv => [
         ...conv,
         { author: 'user', text: messageThatIsSent }
      ])
      this.messageToBeSent.set('');
      
   }



   fetchAvailableTimes(): Observable<BookableResourceSlot[]> {
      return this.resourceTypeService.getAll()
         .pipe(
         switchMap(resourceTypes => {

            const allRequests = [];
            for (const resourceType of resourceTypes) {
               for (let i = 0; i < 30; i++) {
               const todaysDate = new Date().setHours(0,0,0,0);

               const startDate = new Date(todaysDate);
               startDate.setDate(startDate.getDate() + i);

               const endDate = new Date(startDate);
               endDate.setDate(endDate.getDate() + 1);

               allRequests.push(
                  this.resourceService.getByType(resourceType.id, startDate, endDate).pipe(
                     map(resources => ({
                     resourceType,
                     startDate,
                     resources
                     }))
                  )
               )              
               }
            }  
            
            return forkJoin(allRequests);
         }),
         map(allResults => {
            const allResources: BookableResourceSlot[] = [];

            allResults.forEach(({ startDate, resources }) => {
               resources.forEach(resource => {
               const slotToBeAdded: BookableResourceSlot = {
                  id: resource.id,
                  name: resource.name,
                  resourceTypeId: resource.resourceTypeId,
                  resourceTypeName: resource.resourceTypeName,
                  isAvailable: resource.isAvailable,
                  time: startDate
               };

               if (slotToBeAdded.isAvailable) {
                  allResources.push(slotToBeAdded);
               }
               });
            });

         return allResources;
         })
      );
   }

   checkJson(message: string): boolean {
      if (message.match(/\[.*\]/s)) {
         return true;
      } else {
         return false;
      }
   }

   parseMessageJson(message: string): BookingObject[] {
      const matchingPart = message.match((/\[.*\]/s))![0];
      const parsed: BookingObject[] = JSON.parse(matchingPart);
      return parsed;
   }

}
