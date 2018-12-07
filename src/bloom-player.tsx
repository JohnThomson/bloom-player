import * as React from 'react';
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../node_modules/style-scoped/scoped.js"; // maybe use .min.js after debugging?
import "./bloom-player.css";
//import * as ReactDOM from "react-dom";

interface IBloomPlayerProps {
    url: string; // of the bloom book
    showContext?: string; // currently may be "no" or "yes"
}
interface IState {
    pages: Array<string>;
    styles: string;
    currentIndex: number;
}
export default class BloomPlayer extends React.Component<
IBloomPlayerProps,
IState
> {
    public readonly state: IState = {
            pages: ["loading..."],
            styles: '',
            currentIndex: 0
    };

    //private rootElt : HTMLElement;

    public componentDidMount() {
        var index = this.props.url.lastIndexOf("/");
        var filename = this.props.url.substring(index + 1); // enhance: no slash??
        var htmUrl = this.props.url + "/" + filename + ".htm"; // enhance: search directory if name doesn't match?
        axios.get(htmUrl).then(result => {
            var doc = document.createElement('html');
            doc.innerHTML = result.data;
            var pages = doc.getElementsByClassName("bloom-page");
            var sliderContent = [];
            for (var i = 0; i < pages.length; i++) {
                const page = pages[i];
                const content = page; //page.getElementsByClassName("marginBox")[0];
                const srcElts = document.evaluate(".//*[@src]", content, null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var j = 0; j < srcElts.snapshotLength; j++) {
                    const item = srcElts.snapshotItem(j) as HTMLElement;
                    if (!item) {
                        continue;
                    }
                    const srcName = item.getAttribute("src");
                    const srcPath = this.props.url + "/" + srcName;
                    item.setAttribute("src", srcPath);
                }
                sliderContent.push(content.outerHTML);
            }
            const linkElts = document.evaluate(".//link[@href and @type='text/css']", doc, null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            const promises = [];
            for (let i = 0; i < linkElts.snapshotLength; i++) {
                const link = linkElts.snapshotItem(i) as HTMLElement;
                const href = link.getAttribute("href");
                const fullHref = this.fullUrl(href);
                promises.push(axios.get(fullHref));
            }
            axios.all(promises.map(p => p.catch(()=> undefined))).then(results => {
                let combinedStyle = "";
                const styleElts = document.evaluate(".//style[@type='text/css']", doc, null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                for (let k = 0; k < styleElts.snapshotLength; k++) {
                    const styleElt = styleElts.snapshotItem(k) as HTMLElement;
                    combinedStyle += styleElt.innerText;
                }
                results.forEach(result => {
                    if (result && result.data) {
                        combinedStyle += result.data;}
                 });
                this.setState({styles: combinedStyle});
            })
            this.setState({pages: sliderContent});
        })

    }

    private fullUrl(url: string | null) : string {
        // Enhance: possibly we should only do this if we determine it is a relative URL?
        return this.props.url + "/" + url;
    }


    // ref={renderedElement => (this.rootElt = renderedElement as HTMLElement)}
    public render() {
        // multiple classes help make rules more specific than those in the book's stylesheet
        // (which benefit from an extra attribute item like __scoped_N)
        // It would be nice to use an ID but we don't want to assume there is
        // only one of these components on a page.";
        return <div className="bloomPlayer bloomPlayer1">
            <Slider className="pageSlider" 
                slidesToShow={(this.props.showContext === "yes" ? 3 : 1)}
                infinite={false}
                dots={true}
                afterChange={index => this.setIndex(index)}>
            {this.state.pages.map((slide, index) => {
            return (
                <div key={slide}  className={this.getItemClass(index)}>
                    <style scoped>{this.state.styles}</style>
                    <div dangerouslySetInnerHTML={{__html:slide}}>
              </div>
              </div>
            );
          })}
            </Slider>
        </div>;
    }

    private getItemClass(itemIndex: number): string {
        if (this.props.showContext !== "yes") {
            return "";
        }
        if (itemIndex === this.state.currentIndex || itemIndex === this.state.currentIndex + 2) {
            return "contextPage";
        }
        return "";
    }

    private setIndex(index: number) {
        this.setState({currentIndex: index});
    }
}