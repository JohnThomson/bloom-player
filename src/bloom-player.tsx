import * as React from 'react';
//import * as ReactDOM from "react-dom";

interface IBloomPlayerProps {
    url: string; // of the bloom book
}
interface IState {}
export default class BloomPlayer extends React.Component<
IBloomPlayerProps,
IState
> {
    public readonly state: IState = {
    };

    public render() {
        return <div>{ this.props.url }</div>;
    }
}