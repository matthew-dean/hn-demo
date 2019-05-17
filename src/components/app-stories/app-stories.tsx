import { Component, State } from '@stencil/core';
import { formatDate } from '../../util/locale';

interface IStoryObject {
  by: string;
  title: string;
  time: number;
  url: string;
}

@Component({
  tag: 'app-stories',
  styleUrl: 'app-stories.less',
  shadow: true
})
export class AppStories {
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
  @State() error: boolean = false;

  /** End of list */
  @State() listEnd: boolean = false;

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
          this.error = true;
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
      this.listEnd = true;
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
          if (this.loaderState && this.loaderState.isIntersecting) {
            this.getNewRecords();
          }
        }
      })
      .catch(() => {
        this.isFetching = false;
        this.fetchIndex = index + 1;
        this.fetchQueue = [];
        if (this.loaderState && this.loaderState.isIntersecting) {
          this.getNewRecords();
        }
      });
  }

  getRef = ref => {
    this.observer.observe(ref);
  }

  renderStoryItems = () => {
    return this.stories.map((item: IStoryObject) => {
      /** HN is in unix time */
      const time = new Date(item.time * 1000);

      return (
        <div class='story'>
          <a class='title' target="_blank" href={item.url}>
            {item.title}
          </a>
          <span class='byline'>by {item.by}</span>
          <span class='published'>{formatDate(time)}</span>
        </div>
      );
    });
  }

  render = () => (
    <div>
      <div>
        {this.error
          ? 'There was an error getting the list of stories.'
          : this.renderStoryItems()
        }
      </div>
      <div class='loading' ref={this.getRef}>
        {this.isFetching && <app-spinner />}
        {this.listEnd && <span>End of list</span>}
      </div>
    </div>
  )
}