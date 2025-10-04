import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AdminTab,
  AdminTabId,
  NavTabsComponent,
} from '../nav-tabs/nav-tabs.component';
import { AiViewComponent } from "../ai-view/ai-view.component";

@Component({
  selector: 'app-bookingpage-menu',
  standalone: true,
  imports: [CommonModule, AiViewComponent],
  templateUrl: './bookingpage-menu.component.html',
})
export class BookingpageMenuComponent {
  @Input() types: any[] = [];
  @Input() selectedTypeId?: number;

  @Output() selectType = new EventEmitter<number>();

  onSelectType(id: number) {
    this.selectType.emit(id);
  }

  get tabsForMenu(): AdminTab[] {
    return (this.types ?? []).map((t: any) => ({
      id: String(t.id) as unknown as AdminTabId,
      label: t.name,
      countAvailable: t.countAvailable,
      countAll: t.countAll,
    }));
  }

  //Aktiv flik = vald resurstyp
  get activeTabId(): AdminTabId {
    return this.selectedTypeId != null
      ? (String(this.selectedTypeId) as unknown as AdminTabId)
      : ('' as unknown as AdminTabId);
  }

  onChangeTab(id: AdminTabId) {
    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      this.selectType.emit(numericId);
    } else {
    }
  }
}
