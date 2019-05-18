import { Component, State } from '@stencil/core';

/**
 * This is the data fetcher for the Hacker News stories.
 * Renders and manages the story list.
 */
@Component({
  tag: 'app-fetcher',
  shadow: true
})
export class AppFetcher {
  /** Initial keys retrieved from Hacker news */
  storyKeys: number[] = [];

  /** Observer of a loading element that fires when visible at the end of the list */
  observer: IntersectionObserver;

  /** Fetch position */
  fetchIndex: number = 0;

  /** URLs to process and update data */
  fetchQueue: [number, number][] = [];

  /** Load more when done */
  loadMore: boolean = false;

  /** loader div state */
  loaderState: IntersectionObserverEntry;

  /** Currently fetching records */
  @State() isFetching: boolean = false;

  /** Hacker News story objects */
  @State() stories: Object[] = [];

  /** Error state */
  @State() hasError: boolean = false;

  /** End of list */
  @State() isListEnd: boolean = false;

  componentWillLoad () {
    this.observer = new IntersectionObserver(this.observerCallback, {
      root: null,
      rootMargin: '0% 0% 50% 0%',
      threshold: 0
    });
    fetch('https://hacker-news.firebaseio.com/v0/newstories.json')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          this.storyKeys = data;
          this.getNewRecords();
        } else {
          this.hasError = true;
        }
      });
  }

  componentDidUnload () {
    this.observer.disconnect();
  }

  getNewRecords = () => {
    if (this.isFetching || this.storyKeys.length === 0) {
      return;
    }

    /** Retrieve 50 at a time */
    if (!this.storyKeys[this.fetchIndex]) {
      this.isListEnd = true;
      this.observer.disconnect();
      return;
    }
    this.isFetching = true;
    const endRange = 50 + this.fetchIndex;
    for (let i = this.fetchIndex; i < endRange; i++, this.fetchIndex++) {
      const key = this.storyKeys[i];
      if (!key) {
        break;
      }
      this.fetchQueue.unshift([i, key]);
    }
    this.fetchNext(this.fetchQueue.pop());
  }

  observerCallback = (entries) => {
    if (!entries) {
      return;
    }
    const entry: IntersectionObserverEntry = entries[0];
    if (!entry) {
      return;
    }
    this.loaderState = entry;
    this.getNewRecords();
  };

  fetchNext = ([index, key]) => {
    fetch(`https://hacker-news.firebaseio.com/v0/item/${key}.json`)
      .then(response => response.json())
      .then(data => {
        /**
         * If data is mal-formed, then fail this response
         */
        if (!data || !data.title) {
          return Promise.reject();
        }
        if (data.url && data.by) {
          this.stories = [...this.stories, data];
        }
        const nextKey = this.fetchQueue.pop();
        if (nextKey) {
          this.fetchNext(nextKey);
        } else {
          this.isFetching = false;
          /**
           * If we're done fetching but the user is scrolled to the end of the list,
           * start fetching again.
           */
          if (this.loaderState && this.loaderState.isIntersecting) {
            this.getNewRecords();
          }
        }
      })
      .catch(() => {
        this.isFetching = false;
        this.fetchIndex = index + 1;
        this.fetchQueue = [];
        /**
         * If fetch failed, but we're scrolled to the end of the list, the pick up
         * with another chunk past our failed request.
         */
        if (this.loaderState && this.loaderState.isIntersecting) {
          this.getNewRecords();
        }
      });
  }

  getRef = ref => {
    this.observer.observe(ref);
  }

  render = () => (
    <app-storylist
      ref={this.getRef}
      data={this.stories}
      hasError={this.hasError}
      isLoading={this.isFetching}
      isListEnd={this.isListEnd}
    />
  )

}