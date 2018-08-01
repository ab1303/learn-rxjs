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
      return {
        unsubscribe() {
          console.log("UnSubscribe map !!");
          subscription.unsubscribe();
        }
      };
    });
  }
}

const button = document.getElementById("button");

const clicks = Observable.fromEvent(button, "click")
  .map(e => e.offsetX)
  .subscribe({
    next(ev) {
      console.log(ev);
    },
    complete() {
      console.log("completed");
    }
  });

  //clicks.unsubscribe();