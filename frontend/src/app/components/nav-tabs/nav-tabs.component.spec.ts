import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavTabsComponent } from './nav-tabs.component';

describe('NavTabsComponent', () => {
  let component: NavTabsComponent;
  let fixture: ComponentFixture<NavTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
