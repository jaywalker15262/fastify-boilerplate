declare module 'google-search-results-nodejs' {
  export class GoogleSearch {
    constructor(apiKey: string);
    json(
      params: { q: string; num?: number; [key: string]: any },
      callback: (response: any) => void,
    ): void;
  }
}
