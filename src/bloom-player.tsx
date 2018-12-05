import * as React from 'react';
import axios from 'axios';
import Slider from "react-slick";
import "~slick-carousel/slick/slick.css";
import "~slick-carousel/slick/slick-theme.css";
//import * as ReactDOM from "react-dom";

interface IBloomPlayerProps {
    url: string; // of the bloom book
}
interface IState {
    pages: string;
}
export default class BloomPlayer extends React.Component<
IBloomPlayerProps,
IState
> {
    public readonly state: IState = {
        pages: "<div>loading...</div>"
    };

    public componentDidMount() {
        var index = this.props.url.lastIndexOf("/");
        var filename = this.props.url.substring(index + 1); // enhance: no slash??
        var htmUrl = this.props.url + "/" + filename + ".htm"; // enhance: search directory if name doesn't match?
        axios.get(htmUrl).then(result => {
            var doc = document.createElement('html');
            doc.innerHTML = result.data;
            var pages = doc.getElementsByClassName("bloom-page");
            var sliderContent = "";
            for (var i = 0; i < pages.length; i++) {
                var page = pages[i];
                var content = page.getElementsByClassName("marginBox")[0];
                sliderContent += content.outerHTML;
            }
            this.setState({pages: sliderContent});
        })
    }

    public render() {
        return <div>
            <Slider >
                <div>1</div>
                <div>2</div>
            </Slider>
        </div>;
    }
}