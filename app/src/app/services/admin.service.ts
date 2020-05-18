import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { Response } from '../interfaces/response';
import { LoginService } from './login.service';
import { AlumnoData, GrupoData } from '../interfaces/admin';

const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class AdminService {

    constructor(
        private http:HttpClient,
        private loginService:LoginService
    ) {}

    addStudents(data: AlumnoData | AlumnoData[]) {
        const headers = { 'x-token': this.loginService.getToken() }
        return this.http.put<Response>(`${URL}/api/admin/students`,data,{headers});
    }

    addGroups(data:GrupoData |GrupoData[]) {
        const headers = { 'x-token': this.loginService.getToken() }
        return this.http.put<Response>(`${URL}/api/admin/groups`,data,{headers});
    }

}