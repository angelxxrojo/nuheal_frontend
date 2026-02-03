import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenResponse,
  Enfermera,
  ChangePasswordRequest,
  UpdateProfileRequest
} from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<Enfermera | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = this.storage.getUser<Enfermera>();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, data).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, data).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  logout(): Observable<void> {
    const refresh = this.storage.getRefreshToken();
    return this.http.post<void>(`${this.apiUrl}/logout/`, { refresh }).pipe(
      tap(() => this.clearSession()),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refresh = this.storage.getRefreshToken();
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh/`, { refresh }).pipe(
      tap(response => {
        this.storage.setAccessToken(response.access);
      }),
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<Enfermera> {
    return this.http.get<Enfermera>(`${this.apiUrl}/me/`).pipe(
      tap(enfermera => {
        this.currentUserSubject.next(enfermera);
        this.storage.setUser(enfermera);
      }),
      catchError(this.handleError)
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<Enfermera> {
    return this.http.patch<Enfermera>(`${this.apiUrl}/me/`, data).pipe(
      tap(enfermera => {
        this.currentUserSubject.next(enfermera);
        this.storage.setUser(enfermera);
      }),
      catchError(this.handleError)
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password/`, data).pipe(
      catchError(this.handleError)
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.storage.setTokens(response.tokens.access, response.tokens.refresh);
    if (response.enfermera) {
      this.currentUserSubject.next(response.enfermera);
      this.storage.setUser(response.enfermera);
    }
  }

  private clearSession(): void {
    this.storage.clearAll();
    this.currentUserSubject.next(null);
  }

  private handleError(error: unknown): Observable<never> {
    return throwError(() => error);
  }

  get isAuthenticated(): boolean {
    return this.storage.isAuthenticated();
  }

  get accessToken(): string | null {
    return this.storage.getAccessToken();
  }

  get currentUserValue(): Enfermera | null {
    return this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.usuario?.is_admin ?? false;
  }
}
