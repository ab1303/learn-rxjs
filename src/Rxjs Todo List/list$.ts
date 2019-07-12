import { Observable, Subject } from 'rxjs'; 
import { map,scan, tap, startWith, shareReplay } from 'rxjs/operators';

export interface Command {
  name: string,
  value?: any;
}

export enum CommandNames {
  insert = 'insert',
  insertMany = 'insertMany',
  remove = 'remove',
  update = 'update',
  upsert = 'upsert'
}

export class List<T> {

  listCommand: Subject<Command>;
  list$: Observable<T[]>;
  private initialValue: T[] =  []
  
  constructor() {

    this.listCommand = new Subject<Command>();
    this.list$ = this.listCommand.asObservable()
      .pipe(
        scan(this.listInteractions, this.initialValue),
        startWith(this.initialValue),
        shareReplay(1)
      );
  
  }

  private listInteractions = (list: T[], command: Command): T[] => {
      if(command.name === CommandNames.insert) {
        list = this.insert(list, command.value);
      }

      if(command.name === CommandNames.insertMany) {
        list = this.insertMany(list, command.value);
      }

      if(command.name === CommandNames.update) {
        list = this.update(list, command.value)
      }

      if(command.name === CommandNames.upsert) {
        list = this.upsert(list, command.value);
      }

      if(command.name === CommandNames.remove) {
        list = this.remove(list, command.value);
      }

    return list;
  }

  private insert(l, i): T[] {
    if(!l.find(process => process.id === i.id)) {
          l = [...l, {...i}];
    }
    return l
  }

  private insertMany(l, is): T[] {
    is.forEach(i =>  {
      if(!l.find(process => process.id === i.id)) {
            l = [...l, {...i}];
      }
    })
    return l
  }

  private update(l, i): T[] {
    return l.reduce((rl, process) => {
          if(process.id === i.id) {
            process = {...process, ...i}
          }
          return  [...rl, {...process}];
        }, []);
  }

  private remove(l, i): T[] {
    return l.reduce((rl, process) => {
          if(process.id !== i.id) {
            rl = [...rl, process];
          }
          return rl;
        }, []);
  }

  private upsert(l, i): T[] {
    if(!l.find(process => process.id === i.id)) {
      l = this.insert(l, i);
    } else {
      l = this.update(l, i);
    }
    return l;
  }

}
