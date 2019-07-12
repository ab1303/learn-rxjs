import '../.scss/main.scss';


import { of, from, race as raceFrom, EMPTY, timer,fromEvent, Observer, Observable,pipe,merge} from 'rxjs'
import { map,mergeAll, mergeMap,switchMap, catchError, delay, startWith, withLatestFrom, takeUntil, tap, combineLatest, filter, shareReplay, groupBy, distinctUntilChanged } from 'rxjs/operators'
import {t} from 'typy';

import {GliphyApi} from './gliphyApi';
import {TodoListComponent, CommandNames, Status, Item} from './todo-list.component';

// = CONSTANTS ===========================================================

const btnInsertElem = document.getElementById('btn-insert');
const listElem = document.getElementById('todo-list');
const titleInputElem = document.getElementById('title');

const gliphyApi = new GliphyApi('WdEZdJfMkSLstt4it0mULiRb4fSr3JoO');

// = BASE OBSERVABLES  ==================================================

// == SOURCE OBSERVABLES ================================================

// === STATE OBSERVABLES ================================================
const todoList = new TodoListComponent(listElem);

// === INTERACTION OBSERVABLES ==========================================
const btnInsertClick$ = merge(
  fromEvent(btnInsertElem, 'click'),
  fromEvent(titleInputElem, 'keydown').pipe(filter(e => (e as KeyboardEvent).keyCode === 13))
);

// == INTERMEDIATE OBSERVABLES ==========================================

const idleList$ = todoList.list$.pipe(map(l => l.filter(i => i.status === Status.idle)));
const doneList$ = todoList.list$.pipe(map(l => l.filter(i => i.status === Status.done)));

// Observable of items to create
const itemToCreate$ = btnInsertClick$
  .pipe(
    map(_ => (titleInputElem as HTMLInputElement).value),
    // Filter out empty titles
    filter(v => !!v),
    map(title => todoList.getNewItem({title}))
  );

// Observable of remove button clicks
const btnRemoveClick$ = todoList.list$
  .pipe(
    // Resubscribe when ever list changes
    switchMap(list => of(list)
      .pipe(
        // For all items in the list
        mergeMap(li => from(li)),
        // Get the remove btn elem
        map(i => todoList.getRemovebuttonFromItem(document.getElementById(i.id))),
        // Get
        mergeMap(btn => fromEvent(btn, 'click')),
      )
    )
  );

// Observable of items to remove
const itemToRemove$ = btnRemoveClick$.pipe(
    map(ce => todoList.getItemFromRemoveButtomm(ce).getAttribute('id')),
    map(id => ({id}))
);

// Observable of items which state changed
const checkboxChange$ = todoList.list$
  .pipe(
    // Resubscribe when ever list changes
    switchMap(list => of(list)
      .pipe(
        // For every item
        mergeMap(li => from(li).pipe(
          // Get checkbox elem
          map(i => todoList.getCheckboxFromItem(document.getElementById(i.id))),
          // Get clicks from checkbox
          mergeMap(cbx => fromEvent(cbx, 'input')),
          // If checked value chenges
          distinctUntilChanged((x, y) => ((x as KeyboardEvent).target as HTMLInputElement).checked === ((y as KeyboardEvent).target as HTMLInputElement).checked),
          // distinctUntilChanged((x, y) => x.target.checked === y.target.checked),
          // Map to itme obj with new state
          map(e => ({id: todoList.getItemFromCheckbox(e).id, status: (((e as KeyboardEvent).target as HTMLInputElement).checked ? Status.done : Status.idle)})
          )
        )),
      )
    )
  );

// Observable of items which title was edited by the user and should update in state management
const titleEdit$ = todoList.list$
  .pipe(
    // Resubscribe when ever list changes
    switchMap(l => of(l)
      // Get a strema of title blur events of all items 
      .pipe(
       // For every item in the list
        mergeMap(li => from(li)),
        // get the title elem
        map(i => todoList.getTitleFromItem(document.getElementById(i.id))),
        // get the title elems blur events
        mergeMap(div => fromEvent(div, 'blur')),
      )
    ),
    // If the title has changed 
    // distinctUntilChanged((x,y) => x.target.innerHTML === y.target.innerHTML),
    distinctUntilChanged((x,y) => ((x as KeyboardEvent).target as HTMLInputElement).innerHTML === ((y as KeyboardEvent).target as HTMLInputElement).innerHTML),
    // Create item obj with new title
    map(ce => ({
        id : todoList.getItemFromTitle(ce).getAttribute('id'),
        title: ((ce as KeyboardEvent).target as HTMLInputElement).innerHTML
      })
    )
  );

// Creation method for observable of smart image requests
const getLoadImageForItem$ = (i) => delaySmart(getUrl(i.title), 55, 450, todoList.getDefaultImage())
    .pipe(
      map(url => ({...i, url})),
    );

// Observable of items which title changed
const titleUpdates$ = todoList.item$
  .pipe(
    // For every item with a unknown id return an observable 
    // Which contains all incoming items with the same id including the first
    groupBy(item => item.id),
    // Forward distinct titles
    map(i$ => i$.pipe(distinctUntilChanged((x,y) => x.title === y.title))),
    // Flatten all item observables to one
    mergeAll(),
    // Load image for item title
    mergeMap(item => getLoadImageForItem$(item))
  );

// = SIDE EFFECTS =======================================================

// == INPUTS ============================================================

// Render idle items count 
const renderIdleCount$ = idleList$
  .pipe(
    map(l => l.length),
    distinctUntilChanged(),
    tap(todoList.renderIdleCount)
  );

// Render done items count
const renderDoneCount$ = doneList$
  .pipe(
    map(l => l.length),
    distinctUntilChanged(),
    tap(todoList.renderDoneCount)
  );

// Render list items
const renderList$ = todoList.list$
  .pipe(
    tap((l: Item[]) => todoList.renderList(l))
  );

// == OUTPUTS ===========================================================

// On button click add item to the list
const addItem$ = itemToCreate$
  .pipe(
    tap((item) => todoList.listCommand.next({name: CommandNames.insert, value: item}))
  );

// Remove item from list if user clicks remove
const removeItem$ = itemToRemove$
  .pipe(
    tap((i) => todoList.listCommand.next({name: CommandNames.remove, value: i }))
  );

// Update title if user blurs field
const updateItemTitle$ = titleEdit$
  .pipe(
    tap((i) => todoList.listCommand.next({name: CommandNames.update, value: i }))
  );

// Load images for items title whenever title changes and update url
const updateItemImage$ = titleUpdates$
  .pipe(
    tap((i) => todoList.listCommand.next({name: CommandNames.update, value: i }))
  );

// Update statue of items
const updateItemStatus$ = checkboxChange$
  .pipe(
    tap((i) => todoList.listCommand.next({name: CommandNames.update, value: i }))
  );

// = SUBSCRIPTIOS ========================================================

const inputs = [
  renderIdleCount$,
  renderDoneCount$,
  renderList$,
];

const outputs = [
  addItem$,
  updateItemImage$,
  updateItemTitle$,
  updateItemStatus$,
   removeItem$
];

merge(...[...inputs, ...outputs]) 
  .subscribe();

// = HELPER ===================================================================

// Creation method to fetch an image from the gliphy API 
function getUrl(title: string): Observable<string> {
  return gliphyApi.search({q: title, limit:25})
    .pipe(
      // network errors get replaced with defaultImage
      catchError(e => of({})),
      map(res => {
        const r = t(res, 'data.data').safeObject || [];
        const i = Math.floor(Math.random() * r.length);
        return !t(r).isEmptyArray ? t(r[i], 'images.fixed_height_downsampled.url').safeObject : todoList.getDefaultImage()
      }),
      catchError(e => of(new Error('Unknown obj structure gliphy response'))),
    );
}

// Creation method that uses preloadPlaceholdedAtleast and some values to preload the image in a smart way
// Details to image preloading and experienced performance can be found here: https://stackblitz.com/edit/rxjs-image-preloading
function delaySmart(url$, isFastMs, minDelayMs, getDefaultImage) {
  const isFaMs = isFastMs;
  // @TODO find better solution => magicString
  const fast$ = of('magicString').pipe(delay(isFaMs));
  const lastUrl$ = url$.pipe(shareReplay(1));
  
  const delayAtLeast$ = lastUrl$
    .pipe(
      preloadPlaceholdedAtleast(minDelayMs - isFaMs, getDefaultImage)
    );

  return raceFrom([lastUrl$, fast$])
    .pipe(
      switchMap(isSlower => (isSlower === 'magicString') ? delayAtLeast$ : lastUrl$)
    ); 
}

// Operator that uses delayAtLeastTime and 
function preloadPlaceholdedAtleast(minDelay, placeholder) {
  return pipe(
    switchMap((url: string) => safePreloadImg(url, placeholder)),
    delayAtLeastTime(minDelay),
    startWith(placeholder) 
  );
}

// Helper for TDD ( trace drive developement ;-) )
function l(s: string, isV: boolean | Function = true) {
 return pipe(tap(v => console.log(s, isV instanceof Function ? isV(v) : isV ? v : '')))
}

// = CUSTOM OPERATORS =====================================================

// Creation method for preloading an image url with fallback url
function safePreloadImg(loadUrl: string, errorUrl: string) {
  return preloadImg(loadUrl)
    .pipe(catchError(e => of(errorUrl)))
}

// Creation method for programmatic image preloading
function preloadImg(url: string): Observable<string> {
  return Observable.create((o: Observer<string>) => {
    const img1 = new Image();
    img1.src = url;
    img1.onload = (e:any) => {
      o.next(e.path[0].src);
      o.complete();
    }
    img1.onerror = e => {
      o.error(e);
    }
    return () => { }
  });
}

// Operator that delays the given observable at least [x] ms
function delayAtLeastTime<T>(minDelay: number):(s$: Observable<T>) => Observable<T> {
  return (s$: Observable<T>): Observable<T> => of(true)
      .pipe(
        delay(minDelay),
        combineLatest(s$, (_, s) => s),
      )
}

// Operator that forwards every object only once based un a given property anem
function filterByUniqueProperty<T>(propName: string)  {
  const uniqueValues: any[] = [];
  return (source: Observable<T>): Observable<T> => {
    return source
      .pipe(
        filter((v: T) => !uniqueValues.find(i => i === v[propName])),
        tap(v => uniqueValues.push(v[propName]))
      );
  }
}


