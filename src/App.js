import React, { Component } from 'react';
import './App.css';
import BloomPlayer from './bloom-player';

class App extends Component {
  render() {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');
    let mainContent;
    if (url) {
      mainContent = <BloomPlayer showContext="yes" url={url}/>
    } else {
      mainContent = "Please use this page with param ?url= followed by a book URL."
    }
    return (
      <div className="App">
        <header className="App-header">
          Bloom Player
        </header>
        {mainContent}
      </div>
    );
  }
}

export default App;
