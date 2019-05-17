import { Config } from '@stencil/core';
import { less } from '@stencil/less';

// https://stenciljs.com/docs/config

export const config: Config = {
  plugins: [
    less({
      injectGlobalPaths: [
        'src/styles/vars.less',
        'src/styles/component.less'
      ]
    })
  ],
  globalStyle: 'src/global/app.less',
  globalScript: 'src/global/app.ts',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        swSrc: 'src/sw.js'
      }
    }
  ]
};
