import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesPaneComponent } from './resources-pane.component';

describe('ResourcesPaneComponent', () => {
  let component: ResourcesPaneComponent;
  let fixture: ComponentFixture<ResourcesPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcesPaneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourcesPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
