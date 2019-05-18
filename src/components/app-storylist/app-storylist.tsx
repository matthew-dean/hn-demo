import { Component, Prop } from '@stencil/core';
import { formatDate } from '../../util/locale';

interface IStoryObject {
  by: string;
  title: string;
  time: number;
  url: string;
}

/**
 * This is the renderer of the story list.
 */
@Component({
  tag: 'app-storylist',
  styleUrl: 'app-storylist.less',
  shadow: true
})
export class StoryList {
  @Prop() data: Object[];
  @Prop() hasError: boolean = false;
  @Prop() isLoading: boolean = false;
  @Prop() isListEnd: boolean = false;
  @Prop() ref: (el?: HTMLDivElement) => void;
  
  getRef = (el?: HTMLDivElement) => {
    if (el && this.ref) {
      this.ref(el);
    }
  }

  renderStoryItems = () => {
    if (!this.data) {
      return;
    }
    return this.data.map((item: IStoryObject) => {
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
      <div class={`list ${this.hasError && 'has-error'}`}>
        {this.hasError
          ? 'There was an error getting the list of stories.'
          : this.renderStoryItems()
        }
      </div>
      <div class='loading' ref={this.getRef}>
        {this.isLoading && <app-spinner />}
        {(!this.data || this.isListEnd) && <span>End of list</span>}
      </div>
    </div>
  )
}