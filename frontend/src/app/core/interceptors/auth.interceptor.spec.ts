import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpRequest,
  HttpHandlerFn,
  provideHttpClient,
  withInterceptors,
  HttpInterceptorFn,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should attach withCredentials: true to every request', () => {
    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.withCredentials).toBe(true);
  });

  it('should not alter the request URL or method', () => {
    http.post('/api/login', { email: 'a@b.com' }).subscribe();

    const req = httpMock.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.url).toBe('/api/login');
    req.flush({});
  });
});
