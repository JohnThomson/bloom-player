import React, { Component } from 'react';
import './App.css';
import BloomPlayer from './bloom-player';
import axios from 'axios';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {mainContent: "loading..."}
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bloom Player
        </header>
        {this.state.mainContent}
      </div>
    );
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    let url = urlParams.get('url') || "";
    const blPrefix = "bloomlibrary.org/browse/detail/";
    const index = url.indexOf(blPrefix);
    if (index >= 0) {
        // Bloom library URL. Need to query parse.com to get the S3
        let hash = url.substring(index + blPrefix.length);
        const indexOfSlash = hash.indexOf("/");
        if (indexOfSlash >= 0) {
          hash = hash.substring(0,indexOfSlash);
        }
        // production bloomlibrary.org
        let parseUrl = "https://bloom-parse-server-production.azurewebsites.net/parse/classes/books";
        let appKey = "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5";
        if (url.substring(0,index).endsWith("dev.")) {
          // dev sandbox
          parseUrl = "https://bloom-parse-server-develop.azurewebsites.net/parse/classes/books";
          appKey = "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR";
        }
        axios.get(parseUrl, {headers: {"X-Parse-Application-Id": appKey},
          params:{where: "{\"objectId\":\"" + hash + "\"}"}})
          .then(result => {
          this.setState({mainContent: <BloomPlayer showContext="yes" url={result.data.results[0].baseUrl.replace(/%2f/g, "/")}/>});
          }).catch(reason => {
            console.log(reason);
            this.setState({mainContent: "Failed to look up book location because " + reason});
          });
        
    } else if (url) {
      this.setState({mainContent:<BloomPlayer showContext="yes" url={url}/>});
    } else {
      this.setState({mainContent:"Please use this page with param ?url= followed by a book URL."});
    }
  }
}

export default App;
