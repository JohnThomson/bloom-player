import * as React from 'react';
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../node_modules/style-scoped/scoped.js"; // maybe use .min.js after debugging?
import "./bloom-player.css";

// BloomPlayer takes the URL of a folder containing a Bloom book. The file name
// is expected to match the folder name.
// It displays pages from the book and allows them to be turned by dragging.
// On a wide screen, an option may be used to show the next and previous pages
// beside the current one.

interface IBloomPlayerProps {
    url: string; // of the bloom book (folder)
    showContext?: string; // currently may be "no" or "yes"
}
interface IState {
    pages: Array<string>; // of the book. First and last are empty in context mode.
    styles: string; // concatenated stylesheets the book references or embeds.
    // indicates current page, though typically not corresponding to the page
    // numbers actually on the page.
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

    private sourceUrl: string;

    private shouldShow3Pages(): boolean {
        // enhance: this may acquire a third state in which it responds to width.
        return this.props.showContext === "yes";
    }

    public componentDidMount() {
        this.sourceUrl = this.props.url;
        // Folder urls often (but not always) end in /. If so, remove it, so we don't get
        // an empty filename or double-slashes in derived URLs.
        if (this.sourceUrl.endsWith("/")) {
            this.sourceUrl =  this.sourceUrl.substring(0,  this.sourceUrl.length - 1);
        }
        var index =  this.sourceUrl.lastIndexOf("/");
        var filename =  this.sourceUrl.substring(index + 1);
        var htmUrl =  this.sourceUrl + "/" + filename + ".htm"; // enhance: search directory if name doesn't match?
        axios.get(htmUrl).then(result => {
            const doc = document.createElement('html');
            doc.innerHTML = result.data;

            // This is a preview, it's distracting to have it be editable.
            const editable = document.evaluate(".//*[@contenteditable]", doc, null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let iedit = 0; iedit < editable.snapshotLength; iedit++) {
                (editable.snapshotItem(iedit) as HTMLElement).removeAttribute("contenteditable");
            }

            // assemble the page content list
            var pages = doc.getElementsByClassName("bloom-page");
            var sliderContent = [];
            if (this.shouldShow3Pages()) {
                sliderContent.push(""); // blank page to fill the space left of first.
            }
            for (var i = 0; i < pages.length; i++) {
                const page = pages[i];
                const content = page;
                // urls of images and videos (and eventually audio) need to be made
                // relative to the original book folder, not the page we are embedding them into.
                const srcElts = document.evaluate(".//*[@src]", content, null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var j = 0; j < srcElts.snapshotLength; j++) {
                    const item = srcElts.snapshotItem(j) as HTMLElement;
                    if (!item) {
                        continue;
                    }
                    const srcName = item.getAttribute("src");
                    const srcPath = this.fullUrl(srcName);
                    item.setAttribute("src", srcPath);
                }
                sliderContent.push(content.outerHTML);
            }
            if (this.shouldShow3Pages()) {
                sliderContent.push(""); // blank page to fill the space right of last.
            }

            // Assemble all the style rules from all the stylesheets the book references.
            const linkElts = document.evaluate(".//link[@href and @type='text/css']", doc, null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            const promises = [];
            for (let i = 0; i < linkElts.snapshotLength; i++) {
                const link = linkElts.snapshotItem(i) as HTMLElement;
                const href = link.getAttribute("href");
                const fullHref = this.fullUrl(href);
                promises.push(axios.get(fullHref));
            }
            // The map trick here causes us to ignore errors and just use the stylesheets
            // we can get.
            axios.all(promises.map(p => p.catch(()=> undefined))).then(results => {
                let combinedStyle = "";

                // start with embedded styles (typically before links in a bloom doc...)
                const styleElts = document.evaluate(".//style[@type='text/css']", doc, null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                for (let k = 0; k < styleElts.snapshotLength; k++) {
                    const styleElt = styleElts.snapshotItem(k) as HTMLElement;
                    combinedStyle += styleElt.innerText;
                }

                // then add the stylesheet contents we just retrieved
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
        return  this.sourceUrl + "/" + url;
    }

    private slider: Slider | null;

    public render() {
        // multiple classes help make rules more specific than those in the book's stylesheet
        // (which benefit from an extra attribute item like __scoped_N)
        // It would be nice to use an ID but we don't want to assume there is
        // only one of these components on a page.";
        return <div className="bloomPlayer bloomPlayer1">
            <Slider className="pageSlider" 
                ref={slider => this.slider = slider}
                slidesToShow={(this.shouldShow3Pages() ? 3 : 1)}
                infinite={false}
                dots={true}
                beforeChange={(current, next) => this.setIndex(next) }>
                {this.state.pages.map((slide, index) => {
                    return (
                        <div key={slide}  className={this.getSlideClass(index)}>
                            <style scoped>{this.state.styles}</style>
                            <div dangerouslySetInnerHTML={{__html:slide}}
                            onClick={() => this.slider!.slickGoTo(index - 1)}>
                    </div>
                    </div>
                    );
                })}
            </Slider>
        </div>;
    }

    // Get a class to apply to a particular slide. This is used to apply the
    // contextPage class to the slides before and after the current one.
    private getSlideClass(itemIndex: number): string {
        if (!this.shouldShow3Pages()) {
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