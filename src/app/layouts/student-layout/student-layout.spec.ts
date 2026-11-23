import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { StudentLayout } from './student-layout';

describe('StudentLayout', () => {
  let component: StudentLayout;
  let fixture: ComponentFixture<StudentLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentLayout],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
