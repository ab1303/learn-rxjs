
import { Observable, Observer } from 'rxjs';
import { from } from 'rxjs/observable/from';

var observable = Observable.create(function (observer) {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    setTimeout(() => {
      observer.next(4);
      observer.complete();
    }, 1000);
  });


class MyObserver implements Observer<number> {
  closed?: boolean;

  next(value: number){
    console.log('got value ' + value);
  }

  error(err: any){
    console.error('something wrong occurred: ' + err);
  }

  complete(){
    console.log('done')
  }
}

  
  console.log('just before subscribe');
  observable.subscribe(new MyObserver());
  console.log('just after subscribe');