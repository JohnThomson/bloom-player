import * as React from 'react';
import BloomPlayer from "./bloom-player";

interface IBloomControlsProps {
    url: string; // of the bloom book (folder)
    showContext?: string; // currently may be "no" or "yes"
}
interface IState {
    paused: boolean;
}
export default class BloomPlayerControls extends React.Component<
IBloomControlsProps,
IState
> {
    public readonly state: IState = {
            paused: false
    };

    public render() {

        return <div >
            <button onClick={() => this.setState({paused: false})}>Play</button>
            <button onClick={() => this.setState({paused: true})}>Pause</button>
            <BloomPlayer 
                url={this.props.url}
                showContext={this.props.showContext}
                paused={this.state.paused} />
        </div>;
    }
}