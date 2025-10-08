import { HttpClient } from "@angular/common/http";
import { AppConfigService } from "../../core/app-config.service";
import { Injectable } from "@angular/core";
import { ChatMessage } from "../../../types/ChatMessage";
import { BookableResourceSlot } from "../../../types/BookableResourceSlot";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ChatService {
   private readonly baseUrl: string;
   
   constructor(private http: HttpClient, private cfg: AppConfigService) {
      this.baseUrl = `${this.cfg.apiUrl}/api/chat`;
   }

   sendChat(chatData: {question: string, chatHistory: string, availableTimes: string}): Observable<string> {
      return this.http.post(this.baseUrl, chatData, {
         headers: { 'Content-Type': 'application/json' },
         responseType: 'text'
      })
   }
}