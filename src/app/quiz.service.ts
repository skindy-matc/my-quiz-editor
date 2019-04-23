import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // have to manually update from str

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor(private angularHttpClient: HttpClient) { }

  getQuizzes() {
    return this.angularHttpClient.get('https://modern-js.azurewebsites.net/api/HttpTriggerJS1?code=8XD3vN3ehHLdZacBQJQhgUnNst9202gdd5VM3kWCytDkz2nXhia6kA==&name=Mystery%20Quiz');
  }

  // newQuizzes defaults to empty arr so optional argument
  saveQuizzes(changedQuizzes: any[], newQuizzes: any[] = []) {

    let h = new HttpHeaders({
      'Content-Type': 'application/json', 
      'X-Sas-Token': 'sig=K2WE6NQPtyoV6ke5hwPEaEaW52fgvyFWUeCEdPJls1s'
    });

    return this.angularHttpClient.post(
      'https://modern-js.azurewebsites.net/save-quizzes-proxy', 
      JSON.stringify(
        {
          "changedQuizzes": changedQuizzes,
          "newQuizzes": newQuizzes
        }
      ), 
      {
        headers: h
      }
    );
  }
}
