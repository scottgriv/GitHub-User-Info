import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  personalAccessToken: string = environment.personalAccessToken;

  constructor(private http: HttpClient) { }

  getHeaders(usePersonalAccessToken: boolean): HttpHeaders {
    let headers = new HttpHeaders();
    if (usePersonalAccessToken) {
      headers = headers.set('Authorization', `token ${this.personalAccessToken}`);
    }
    return headers;
  }

  getUserInfo(username: string, usePersonalAccessToken: boolean): Observable<any> {
    const headers = this.getHeaders(usePersonalAccessToken);
    return this.http.get(`https://api.github.com/users/${username}`, { headers, observe: 'response' })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalStars(username: string, usePersonalAccessToken: boolean): Observable<number> {
    const headers = this.getHeaders(usePersonalAccessToken);
    return this.http.get<any[]>(`https://api.github.com/users/${username}/repos?per_page=100`, { headers })
      .pipe(map(repos => {
        return repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
      }));
  }
  
  getTotalCommits(username: string, usePersonalAccessToken: boolean): Observable<number> {
    const headers = this.getHeaders(usePersonalAccessToken);
    return this.http.get<any[]>(`https://api.github.com/users/${username}/repos?per_page=100`, { headers }).pipe(
      switchMap(repos => {
        const commitRequests = repos.map(repo => this.http.get<any[]>(`https://api.github.com/repos/${username}/${repo.name}/contributors`, { headers }));
        return forkJoin(commitRequests);
      }),
      map(commitData => {
        return commitData.reduce((acc, contributors) => {
          const userContribution = contributors.find(c => c.login === username);
          return userContribution ? acc + userContribution.contributions : acc;
        }, 0);
      })
    );
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }
  
}
