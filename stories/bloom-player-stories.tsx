import * as React from 'react';
import { storiesOf } from '@storybook/react';
//import { action } from '@storybook/addon-actions';
import BloomPlayer from '../src/bloom-player';

const stories = storiesOf('BloomPlayer', module);

stories.add(
  'a simple book',
  () => <div style={{backgroundColor:"lightyellow"}}>
      <BloomPlayer url="https://s3.amazonaws.com/BloomLibraryBooks/librarian%40bloomlibrary.org/32916f6b-02bd-4e0b-9b2b-d971096259b7/Grandpa+Fish+and+the+Radio"/>
    </div>,
  { info: { inline: true } }
);
stories.add(
  'simple book with context',
  () => <div style={{backgroundColor:"thistle"}}>
      <BloomPlayer
      showContext="yes"
      url="https://s3.amazonaws.com/BloomLibraryBooks/librarian%40bloomlibrary.org/32916f6b-02bd-4e0b-9b2b-d971096259b7/Grandpa+Fish+and+the+Radio"/>
    </div>,
  { info: { inline: true } }
);
stories.add(
  'motion book widows gift',
  () => <div style={{backgroundColor:"thistle"}}>
      <BloomPlayer
      showContext="yes"
      url="https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/bloom.bible.stories%40gmail.com/8bb123d6-7ab8-43a4-8863-2b39b7e1d013/003+Widow’s+Gift"/>
    </div>,
  { info: { inline: true } }
);