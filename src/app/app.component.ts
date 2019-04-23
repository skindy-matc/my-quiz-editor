import { Component, OnInit } from '@angular/core';
import { QuizService } from './quiz.service';

interface QuizDisplay {
  name: string;
  originalName: string;
  description: string;
  questions: QuestionDisplay[];
  questionsChecksum: string;
  markedForDelete: boolean;
}

interface QuestionDisplay {
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private qSvc: QuizService) {
    // could use the quiz service here but if it fails,
    // the creation of the component fails
  }

  quizzes: QuizDisplay[] = [];
  selectedQuiz: QuizDisplay;

  selectQuiz = (q: QuizDisplay) => {
    this.selectedQuiz = q;
  }

  deselectQuiz = () => {
    this.selectedQuiz = undefined;
  }

  addNewQuiz = () => {

    // create new quiz
    const newQuiz: QuizDisplay = {
      name: "Untitled Quiz",
      originalName: "Untitled Quiz",
      description: "Untitled Description",
      questions: [],
      questionsChecksum: "",
      markedForDelete: false
    };
    
    // create new list of quizzes with the new quiz
    this.quizzes = [
      ...this.quizzes,
      newQuiz
    ];

    // update the selected quiz to the new quiz
    this.selectedQuiz = newQuiz;
  }

  addNewQuestion = () => {
    // create new question
    const question: QuestionDisplay = {
      name: "New untitled question"
    }
    this.selectedQuiz.questions = [
      ...this.selectedQuiz.questions,
      question
    ];
  }

  removeQuestion = (question: QuestionDisplay) => {
    this.selectedQuiz.questions = this.selectedQuiz.questions.filter((q: QuestionDisplay) => q != question);
  }

  deleteQuiz = (quiz: QuizDisplay) => {
    this.selectedQuiz = undefined;
    this.quizzes = this.quizzes.filter(q => q != quiz);
  }

  serviceDown = false;

  // so use ngOnInit instead
  ngOnInit() {
    // rename numberQuestions property to numberOfQuestions 
    this.qSvc.getQuizzes().subscribe(
      (data) => {
        this.quizzes = (<any[]> data).map(x => ({
          name: x.name,
          originalName: x.name,
          description: "Grabbed from REST API endpoint",
          questions: x.questions,
          questionsChecksum: x.questions.map(q => q.name).join('~'),
          markedForDelete: false
        }));
        console.log(this.quizzes);
      },
      (error) => {
        console.log(error);
        this.serviceDown = true;
      }
    );
  }

  get numberOfDeletedQuizzes() {
    return this.quizzes.filter(x => x.markedForDelete).length;
  }

  get numberOfEditedQuizzes() {
    return this.quizzes
      .filter(x => 
        !x.markedForDelete && 
        x.originalName !== "Untitled Quiz" && (
          x.name !== x.originalName || 
          x.questionsChecksum != x.questions.map(q => q.name).join('~')
        )
      ).length;
  }

  get numberOfAddedQuizzes() {
    return this.quizzes.filter(x => 
      !x.markedForDelete && x.originalName === "Untitled Quiz"
    ).length;
  }
}
