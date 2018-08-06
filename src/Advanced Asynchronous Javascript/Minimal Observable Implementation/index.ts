class Observable {
  _subscribe: any;
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  subscribe(observer) {
    return this._subscribe(observer);
  }

  static timeout(time) {
    return new Observable(function subscribe(observer) {
      const handle = setTimeout(function() {
        observer.next();
        observer.complete();
      }, time);

      return {
        unsubscribe() {
          clearTimeout(handle);
        }
      };
    });
  }

  static fromEvent(dom, eventName) {
    return new Observable(function subscribe(observer) {
      console.log("Subscribe fromEvent !!");
      const evtHandler = ev => {
        observer.next(ev);
      };

      dom.addEventListener(eventName, evtHandler);

      return {
        unsubscribe() {
          console.log("UnSubscribe fromEvent !!");
          dom.removeEventListener(eventName, evtHandler);
        }
      };
    });
  }

  map(projection) {
    const self = this;
    return new Observable(function subscribe(observer) {
      console.log("Subscribe map !!");
      const subscription = self.subscribe({
        next(data) {
          let value;
          try {
            value = projection(data);
            observer.next(value);
          } catch (e) {
            observer.error(e);
            subscription.unsubscribe();
          }
        },
        error(err) {
          observer.error(err);
        }
      });

      return subscription;
    });
  }

  filter(predicate) {
    const self = this;
    return new Observable(function subscribe(observer) {
      console.log("Subscribe filter !!");
      const subscription = self.subscribe({
        next(data) {
          let value;
          try {
            if (predicate(data)) observer.next(data);
          } catch (e) {
            observer.error(e);
            subscription.unsubscribe();
          }
        },
        error(err) {
          observer.error(err);
        }
      });

      return subscription;
    });
  }

  concat(...observables) {
    return new Observable(function subscribe(observer) {
      const myObservables = observables.slice();
      let currentSubscription = null;
      let processObservable = () => {
        if (myObservables.length == 0) {
          observer.complete();
        } else {
          let observable = myObservables.shift();
          currentSubscription = observable.subscribe({
            next: v => {
              observer.next(v);
            },
            error: e => {
              observer.error(e);
              currentSubscription.unsubscribe();
            },
            complete: () => {
              processObservable();
            }
          });

          processObservable();

          // return currentSubscription;  // rather than this
          // By wrapping it an object literal; we've delayed it 
          return {
            unsubscribe() {
              return currentSubscription; 
            }
          }
        }
      };
    });
  }
}

const button = document.getElementById("button");

const clicks = Observable.fromEvent(button, "click")
  .map(e => e.offsetX)
  .filter(offsetX => offsetX > 10)
  .subscribe({
    next(ev) {
      console.log(ev);
    },
    complete() {
      console.log("completed");
    }
  });

//clicks.unsubscribe();
