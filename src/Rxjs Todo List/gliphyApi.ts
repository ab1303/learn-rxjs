import axios from 'axios'

import { from } from 'rxjs'
import { } from 'rxjs/operators'


export class GliphyApi {

  baseUrl = 'https://api.giphy.com/v1/gifs';

  constructor(private key: string) {

  }

  random() {
    return from(axios.get(this.getUrl()));
  };

  search(queryParams: { q: 'string', [key: string]: any }) {
    queryParams = {
      limit: 25,
      offset: 0,
      lang: 'en',
      ...queryParams
    };
    return from(axios.get(this.getUrl(['search'], queryParams))
    );
  };

  private getUrl(params = ['random'], queryParams?: {}) {
    const qP = {
      api_key: this.key,
      tag: '',
      rating: 'G',
      ...queryParams
    };

    return [
      this.baseUrl,
      [
        params.join('/'),
        Object
          .entries(qP)
          .reduce((s, i) => {
            s.push(i[0] + '=' + i[1]);
            return s;
          }, [])
          .join('&')
      ]
        .join('?')
    ]
      .join('/')
  }

}