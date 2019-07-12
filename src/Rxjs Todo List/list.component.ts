import { Subject, Observable, fromEvent, merge} from 'rxjs'; 
import { filter, map} from 'rxjs/operators';

import {generateId} from './utils'

class ListAttrs {
  class: string;
  id: string;
}

class ListConfig {
  tag?: string;
  className?: string;
  id?: string;
}


export class ListComponent<T> {

  private listId: string;
  private listElem:  HTMLUListElement; 
  
  protected html = (tag: string, attrs: ListAttrs): string => `
    <${tag} ${(Object.entries(attrs).map(i => `${i[0]}="${i[1]}"`).join(' '))}>
    </${tag}>
  `;

  
  constructor(private parent: HTMLElement, renderListItem, protected config: ListConfig = {}) {
    this.config = {
      tag: 'ul',
      ...this.config
    }

    this.config.id || (this.config.id = generateId());

  
    if(renderListItem) {
      this.renderListItem = renderListItem;
    }

    this.init(parent);
  }

  private init(parent: HTMLElement) {
    const a = {id: this.config.id, class: this.config.className};
    parent.innerHTML = this.html(this.config.tag, a);
    this.listElem = document.getElementById(this.config.id) as HTMLUListElement;
  } 

  public renderList = (list: T[]) => {
    
    this.listElem.innerHTML = '';

    list.map(i => {
      const item = this.renderListItem(i)
      return item;
    })
    .forEach(item => {
      this.listElem.appendChild(item);
    });
  }

  protected renderListItem = (data) => {
    let item = document.createElement('li');
    item.innerHTML = JSON.stringify(data);
    return item;
  }
  
}
