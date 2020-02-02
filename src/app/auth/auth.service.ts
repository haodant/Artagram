import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { AuthData } from "./auth-data.model";
import { environment } from 'src/environments/environment';

const AUTH_URL = environment.apiUrl + "/user";

@Injectable({ providedIn: "root" })
export class AuthService {
    private token: string;
    private tokenTimer: any;
    private isAuthenticated = false;
    private userId: string;
    private authStatusLisener = new Subject<boolean>();

    constructor(private http: HttpClient, private router: Router) {}

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    getAuthStatusListener() {
        return this.authStatusLisener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = {email: email, password: password}
        return this.http.post(AUTH_URL + "/signup", authData)
            .subscribe(() => {
                this.router.navigate(["/"]);
            }, error => {
                this.authStatusLisener.next(false);
            })
    };
    login(email: string, password: string) {
        const authData: AuthData = {email: email, password: password}
        this.http.post<{token: string, expiresIn: number, userId: string}>(AUTH_URL + "/login", authData)
            .subscribe(response => {
                const token = response.token;
                this.token = token;
                if(token) {
                    const expireDuration = response.expiresIn;
                    this.setAuthTime(expireDuration);
                    this.isAuthenticated = true;
                    this.userId = response.userId;
                    this.authStatusLisener.next(true);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expireDuration * 1000);
                    this.saveAuthData(token, expirationDate, this.userId);
                    this.router.navigate(["/"]);
                };
            })
    };

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusLisener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.userId = null;
        this.router.navigate(["/"]);
    };

    autoAuthUser() {
        const authInformation = this.getAuthDate();
        if (!authInformation) {
            return;
        }
        const now = new Date();
        const expireIn = authInformation.expirationDate.getTime() - now.getTime();
        if (expireIn > 0) {
            this.setAuthTime(expireIn / 1000);
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.authStatusLisener.next(true);
        }
    }

    private setAuthTime(duration: number) {
        this.tokenTimer = setTimeout(()=>{
            this.logout();
        }, duration * 1000)
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearAuthData() {
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
        localStorage.removeItem("userId");
    }

    private getAuthDate() {
        const token = localStorage.getItem("token");
        const expirationDate = localStorage.getItem("expiration");
        const userId = localStorage.getItem("userId");
        if (!token || !expirationDate) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        }
    }
}