import { Component } from '@angular/core';
import { GithubService } from './github.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  username: string = '';
  userInfo: any;
  totalStars: number = 0;
  totalCommits: number = 0;
  errorMessage: string = '';
  rateLimit: number = 0;
  rateRemaining: number = 0;
  rateReset: number = 0;
  usePersonalAccessToken: boolean = environment.usePersonalAccessToken;

  constructor(private githubService: GithubService) {}

  searchUser() {

    this.errorMessage = '';

    this.githubService.getUserInfo(this.username, this.usePersonalAccessToken).subscribe(
      (response: any) => {
        this.userInfo = response.body;
        this.rateLimit = +response.headers.get('X-RateLimit-Limit');
        this.rateRemaining = +response.headers.get('X-RateLimit-Remaining');
        this.rateReset = +response.headers.get('X-RateLimit-Reset');
      },
      (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    );

  // Only fetch stars and commits if a personal access token is being used
  if (this.usePersonalAccessToken) {
    this.githubService.getTotalStars(this.username, this.usePersonalAccessToken).subscribe(
      stars => {
        this.totalStars = stars;
      },
      (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    );

    this.githubService.getTotalCommits(this.username, this.usePersonalAccessToken).subscribe(
      commits => {
        this.totalCommits = commits;
      },
      (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    );
  }
  }

  getCompleteUrl(url: string): string {
    if (!url.includes('http://') && !url.includes('https://')) {
      return 'https://' + url; // or 'http://' depending on what you need
    }
    return url;
  }

  handleError(error: HttpErrorResponse) {
    this.userInfo = null;  // Clear out the userInfo
    if (error.status === 404) {
      this.errorMessage = 'User profile not found.';
    } else if (error.status === 403) {
      const rateLimitReset = error.headers.get('X-RateLimit-Reset');
      if (rateLimitReset) {
        const resetTime = new Date(parseInt(rateLimitReset) * 1000);
        this.errorMessage = `Rate limit exceeded. Please wait until ${resetTime.toLocaleTimeString()} to make more requests or use a Personal Access Token for more requests.`;
      } else {
        this.errorMessage = 'Rate limit exceeded, but reset time is unavailable.';
      }
    } else {
      this.errorMessage = 'An unknown error occurred.';
    }
  }
  
}
