import { Component } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.less',
  shadow: true
})
export class AppRoot {
  render () {
    return [
      <header>
        <div class='container'>
          <h1>Hacker News</h1>
        </div>
      </header>,
      <div class='container'>
        <main>
          <app-stories />
        </main>
      </div>
    ];
  }
}
