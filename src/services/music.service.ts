import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  apiUrl = 'http://localhost:5000/music';
  constructor(private http:HttpClient) { }


  getSongs() {
    return this.http.get(`${this.apiUrl}/songs`);
  }

  getSingleSong(songName: string) {
    const url = `${this.apiUrl}/${songName}`;
    const headers = new HttpHeaders({
      'Accept': 'audio/mpeg' // Optional: specify the accepted response type
    });
    return this.http.get(url, { headers, responseType: 'blob' });
  }
}
