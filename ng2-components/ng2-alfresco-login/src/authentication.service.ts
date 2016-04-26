import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Rx';
import {Http, Headers, URLSearchParams, Response} from 'angular2/http';

declare let xml2json:any;

@Injectable()
export class Authentication {
    token:string;

    private _host:string = 'http://192.168.99.100:8080';
    private _baseUrl:string = this._host + '/alfresco/service/api/';

    /**
     * Constructor
     * @param http
     */
    constructor(public http:Http) {
        this.token = localStorage.getItem('token');
    }

    /**
     * The method return tru if the user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    /**
     * Method to delegate GET or POST login
     * @param method
     * @param username
     * @param password
     * @returns {Observable<R>|Observable<T>}
     */
    login(method:string, username:string, password:string) {
        if (method === 'GET') {
            return this.loginGet(username, password);
        } else {
            return this.loginPost(username, password);
        }
    }

    /**
     * The method provide the login with GET Request
     * @param username
     * @param password
     * @returns {Observable<R>|Observable<T>}
     */
    loginGet(username:string, password:string) {
        const searchParams = new URLSearchParams();
        searchParams.set('u', username);
        searchParams.set('pw', password);

        return this.http.get(this._baseUrl + 'login', {search: searchParams})
            .map((res:any) => {
                let data = JSON.parse(xml2json(res.text(), '  '));
                this.token = data.ticket;
                this.saveJwt(this.token);
            })
            .catch(this.handleError);
    }

    /**
     * The method provide the login with POST Request
     * @param username
     * @param password
     * @returns {Observable<R>|Observable<T>}
     */
    loginPost(username:string, password:string) {
        let credentials = '{ username: ' + username + ', password: ' + password + ' }';

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http.post(this._baseUrl + 'login', credentials, {
            headers: headers
        })
            .map((res:any) => {
                let response = res.json();
                this.token = response.data.ticket;
                this.saveJwt(this.token);
            })
            .catch(this.handleError);
    }

    /**
     * The method save the toke in the localStorage
     * @param jwt
     */
    saveJwt(jwt) {
        if (jwt) {
            localStorage.setItem('token', jwt);
        }
    }

    /**
     * The method remove the token from the local storage
     * @returns {Observable<T>}
     */
    logout() {
        this.token = undefined;
        localStorage.removeItem('token');

        return Observable.of(true);
    }

    /**
     * The method write the error in the console browser
     * @param error
     * @returns {ErrorObservable}
     */
    private handleError(error:Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}
