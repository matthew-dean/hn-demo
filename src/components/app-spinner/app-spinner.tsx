import { Component } from '@stencil/core';

@Component({
  tag: 'app-spinner',
  styleUrl: 'app-spinner.less',
  shadow: true
})
export class AppSpinner {
  render = () => (
    <div class="spinner">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
  )
}