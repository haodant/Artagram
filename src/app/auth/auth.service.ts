import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { AuthData } from "./auth-data.model";

@Injectable({ providedIn: "root" })
export class AuthService {
    private token: string;
    private tokenTimer: any;
    private isAuthenticated = false;
    private authStatusLisener = new Subject<boolean>();
    constructor(private http: HttpClient, private router: Router) {}

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getAuthStatusListener() {
        return this.authStatusLisener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = {email: email, password: password}
        this.http.post("http://localhost:3000/api/user/signup", authData)
            .subscribe(response => {
                console.log(response)
            })
    };
    login(email: string, password: string) {
        const authData: AuthData = {email: email, password: password}
        this.http.post<{token: string, expiresIn: number}>("http://localhost:3000/api/user/login", authData)
            .subscribe(response => {
                const token = response.token;
                this.token = token;
                if(token) {
                    const expireDuration = response.expiresIn;
                    this.setAuthTime(expireDuration);
                    this.isAuthenticated = true;
                    this.authStatusLisener.next(true);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expireDuration * 1000);
                    this.saveAuthData(token, expirationDate);
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
            this.authStatusLisener.next(true);
        }
    }

    private setAuthTime(duration: number) {
        this.tokenTimer = setTimeout(()=>{
            this.logout();
        }, duration * 1000)
    }

    private saveAuthData(token: string, expirationDate: Date) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
    }

    private clearAuthData() {
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
    }

    private getAuthDate() {
        const token = localStorage.getItem("token");
        const expirationDate = localStorage.getItem("expiration");
        if (!token || !expirationDate) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate)
        }
    }
}