import {Observable} from 'rxjs';

export function generateUniqueId (n?: number) {
   let uids: string[] =  [];
  return () => {
    let newId = generateId(n);
    while(uids.find(i => i === newId)) {
      newId  = generateId(n);
    }
    uids.push(newId);
    return newId;
  }
}

export function generateId (len = 10): string {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('');
}

export function dec2hex (dec): string {
    // dec2hex :: Integer -> String
    return ('0' + dec.toString(16)).substr(-2)
}

export function fakeHttpCall<T>(value: T, delay): Observable<T> {
  return Observable.create((o) => {
    // make it generic
    value = {...value};
    if(delay) {
      setTimeout(() => Promise.resolve().then(_ => {o.next(value); o.complete();}), delay);
    }

    else {
      Promise.resolve().then(_ => {o.next(value);  o.complete();})
    }

    return () => {};
  })
}

export function enderHtmlElem(tag, attrs = {}): string {
  return `
      <${tag}${(Object.entries(attrs).map(i => `${i[0]}="${i[1]}"`).join(' '))}>
      </${tag}>
    `;
}

/**
 
Part2 of @beorn_d_latch 📣DM for #RxJS 🆘 help 

- 🧠🖼️ Smart images preloading
- ✅maintaing a list
- 🤹‍♂️event handling of dynamic #html

I like how I used groupBy 😊

Demo: 🕹️ https://rxjs-giphy-todo-list.stackblitz.io
Code: 🧐https://stackblitz.com/edit/rxjs-giphy-todo-list

Welcome!
 
 */