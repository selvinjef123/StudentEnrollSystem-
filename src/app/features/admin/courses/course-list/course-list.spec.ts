import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CourseListComponent } from './course-list';
import { CourseService } from '../course.service';
import { of } from 'rxjs';

describe('CourseListComponent', () => {
  let component: CourseListComponent;
  let fixture: ComponentFixture<CourseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseListComponent],
      providers: [
        provideHttpClient(),
        {
          provide: CourseService,
          useValue: {
            getCourses: () => of({
              items: [],
              totalRecords: 0,
              totalPages: 0,
              pageNumber: 1,
              pageSize: 10,
            }),
            createCourse: (request: unknown) => of({
              courseId: 101,
              courseName: 'Test Course',
              duration: '3 Months',
              fees: 5000,
              capacity: 30,
              enrolledCount: 0,
              availableSeats: 30,
              isActive: true,
            }),
            updateCourse: () => of({}),
            deactivateCourse: () => of({ message: 'Course deactivated.' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the add-course dialog', () => {
    component.openAddModal();
    fixture.detectChanges();

    expect(component.isModalOpen()).toBe(true);
    expect(component.editingCourseId()).toBeNull();
    expect(component.courseForm.courseName).toBe('');
  });

  it('should create and show a course in the admin list', () => {
    component.openAddModal();
    component.courseForm = {
      courseName: 'Test Course',
      duration: '3 Months',
      fees: 5000,
      capacity: 30,
      isActive: true,
    };

    component.saveCourse();

    expect(component.isSaving()).toBe(false);
    expect(component.isModalOpen()).toBe(false);
    expect(component.successMessage()).toBe('Course created successfully.');
  });

  it('should keep the form open and reset it for another course', () => {
    component.openAddModal();
    component.courseForm = {
      courseName: 'First Course',
      duration: '3 Months',
      fees: 5000,
      capacity: 30,
      isActive: true,
    };

    component.saveCourse(true);

    expect(component.isModalOpen()).toBe(true);
    expect(component.courseForm.courseName).toBe('');
    expect(component.courseForm.duration).toBe('3 Months');
    expect(component.successMessage()).toContain('Add another course');
  });
});
