import * as React from "react";
import { Spinner, SpinnerType } from "office-ui-fabric-react";
/* global Spinner */

export interface ProgressProps {
  message: string;
  title: string;
}

export default class Progress extends React.Component<ProgressProps> {
  render() {
    const { message, title } = this.props;

    return (
      <section className="ms-welcome__progress ms-u-fadeIn500">
        <h1>{title}</h1>
        <Spinner type={SpinnerType.large} label={message} />
      </section>
    );
  }
}
