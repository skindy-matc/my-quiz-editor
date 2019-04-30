import { Component, OnInit } from '@angular/core';
import { QuizService } from './quiz.service';
import { 
  trigger,
  transition,
  animate,
  keyframes,
  style
 } from '@angular/animations';

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
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('detailsFromLeft', [
      transition('leftPosition => finalPosition', [
        animate('300ms', keyframes([
          style({ left: '-30px', offset: 0.0 }),
          style({ left: '-20px', offset: 0.25 }),
          style({ left: '-10px', offset: 0.5 }),
          style({ left: '-5px', offset: 0.75 }),
          style({ left: '0px', offset: 1.0 })
        ]))
      ]),
    ]),
    trigger('pulse', [
      transition('done => doPulse', [
        animate('400ms', keyframes([
          style({ transform: 'scale(1.0)', 'transform-origin': 'top left', offset: 0.0 }),
          style({ transform: 'scale(1.2)', 'transform-origin': 'top left', offset: 0.5 }),
          style({ transform: 'scale(1.0)', 'transform-origin': 'top left', offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {

  detailsAnimationState = 'leftPosition';

  detailsFromLeftAnimationComplete = () => {
    this.detailsAnimationState = 'leftPosition';
  }

  constructor(private qSvc: QuizService) {
    // could use the quiz service here but if it fails,
    // the creation of the component fails
  }

  quizzes: QuizDisplay[] = [];
  selectedQuiz: QuizDisplay;

  selectQuiz = (q: QuizDisplay) => {
    this.selectedQuiz = q;
    this.detailsAnimationState = 'finalPosition';
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
    this.selectQuiz(newQuiz);
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
    this.loadAllQuizzes();
  }

  private loadAllQuizzes() {
    this.qSvc.getQuizzes().subscribe((data) => {
      this.quizzes = (<any[]>data).map(x => ({
        name: x.name,
        originalName: x.name,
        description: "Grabbed from REST API endpoint",
        questions: x.questions,
        questionsChecksum: x.questions.map(q => q.name).join('~'),
        markedForDelete: false
      }));
      console.log(this.quizzes);
    }, (error) => {
      console.log(error);
      this.serviceDown = true;
    });
  }

  saveBatchEdits = () => {
    const editedQuizzes = this.getEditedQuizzes().map(x => ({
      name: x.name,
      originalName: x.originalName,
      questions: x.questions
    }));
    const newQuizzes = this.getAddedQuizzes().map(x => ({
      quizName: x.name,
      quizQuestions: x.questions.map(item => item.name)
    }));

    this.qSvc.saveQuizzes(editedQuizzes, newQuizzes).subscribe(
      numberOfChangedQuizzesSaved => console.log(numberOfChangedQuizzesSaved),
      error => console.log(error)
    );
  }

  cancelBatchEdits = () => {
    this.loadAllQuizzes();
    this.selectQuiz(undefined);
  }

  get numberOfDeletedQuizzes() {
    return this.quizzes.filter(x => x.markedForDelete).length;
  }

  get numberOfEditedQuizzes() {
    return this.getEditedQuizzes().length;
  }

  private getEditedQuizzes() {
    return this.quizzes.filter(
      x => !x.markedForDelete &&
      x.originalName !== "Untitled Quiz" && (x.name !== x.originalName ||
      x.questionsChecksum != x.questions.map(q => q.name).join('~'))
    );
  }

  get numberOfAddedQuizzes() {
    return this.getAddedQuizzes().length;
  }

  private getAddedQuizzes() {
    return this.quizzes.filter(x => !x.markedForDelete && x.originalName === "Untitled Quiz");
  }
}
