import * as React from 'react';
import { storiesOf } from '@storybook/react';
//import { action } from '@storybook/addon-actions';
import BloomPlayer from '../src/bloom-player';

const stories = storiesOf('BloomPlayer', module);

stories.add(
  'a simple book',
  () => <BloomPlayer url="this should be a url"/>,
  { info: { inline: true } }
);