import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pond, Sensor } from '../models/pond.model';

@Injectable({
  providedIn: 'root',
})
export class PondService {
  private baseUrl = 'http://localhost:8080/admin/ponds';

  constructor(private http: HttpClient) {}

  getAllPonds(): Observable<Pond[]> {
    return this.http.get<Pond[]>(this.baseUrl);
  }

  getSensorsByPond(pondId: string): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.baseUrl}/${pondId}/sensors`);
  }
  
  

  addPond(pond: Pond): Observable<Pond> {
    return this.http.post<Pond>(this.baseUrl, pond);
  }
}
