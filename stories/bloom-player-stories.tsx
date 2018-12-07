import * as React from 'react';
import { storiesOf } from '@storybook/react';
//import { action } from '@storybook/addon-actions';
import BloomPlayer from '../src/bloom-player';

const stories = storiesOf('BloomPlayer', module);

stories.add(
  'a simple book',
  () => <BloomPlayer url="https://s3.amazonaws.com/BloomLibraryBooks/librarian%40bloomlibrary.org/32916f6b-02bd-4e0b-9b2b-d971096259b7/Grandpa+Fish+and+the+Radio"/>,
  { info: { inline: true } }
);
stories.add(
  'simple book with context',
  () => <BloomPlayer
    showContext="yes"
    url="https://s3.amazonaws.com/BloomLibraryBooks/librarian%40bloomlibrary.org/32916f6b-02bd-4e0b-9b2b-d971096259b7/Grandpa+Fish+and+the+Radio"/>,
  { info: { inline: true } }
);