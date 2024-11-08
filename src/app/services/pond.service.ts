//pond.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pond } from '../models/pond.model';
import { Sensor } from '../models/sensor.model';


@Injectable({
  providedIn: 'root' // This makes it available throughout the app
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
    return this.http.post<Pond>(`${this.baseUrl}/add`, pond); // Ensure the endpoint matches the backend
  }

  updatePond(pond: Pond): Observable<Pond> {
    return this.http.put<Pond>(`${this.baseUrl}/${pond.id}`, pond);
  }

  deletePond(pondId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${pondId}`);
  }
}
