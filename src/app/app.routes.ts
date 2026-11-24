import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Administrator' },
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/admin/students/student-list/student-list').then((m) => m.StudentList),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/admin/courses/course-list/course-list').then(
            (m) => m.CourseListComponent,
          ),
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./features/enrollments/admin/enrollment-list/enrollment-list').then(
            (m) => m.EnrollmentListComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
  path: 'cancellation-requests',
  loadComponent: () =>
    import(
      './features/admin/cancellation-requests/cancellation-request-list/cancellation-request-list'
    ).then((m) => m.CancellationRequestListComponent),
},
    ],
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Student' },
    loadComponent: () =>
      import('./layouts/student-layout/student-layout').then((m) => m.StudentLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/student/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/student/courses/courses').then((m) => m.StudentCourses),
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./features/student/enrollments/enrollments').then((m) => m.StudentEnrollments),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/student/profile/profile').then((m) => m.Profile),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];