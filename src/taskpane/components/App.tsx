import * as React from "react";
import Progress from "./Progress";
// images references in the manifest
import "../../../assets/ribbon-ico-16.png";
import "../../../assets/ribbon-ico-32.png";
import "../../../assets/ribbon-ico-64.png";
import "../../../assets/ribbon-ico-80.png";
import "../../../assets/placekey-logo.svg";
import Initial from "./Initial";
/* global Button, console, Excel, Header, HeroList, HeroListItem, Progress */

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {
  
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {

    };
  }

  componentDidMount() {

  }

  click = async () => {
    try {
      await Excel.run(async context => {
        /**
         * Insert your Excel code here
         */
        const range = context.workbook.getSelectedRange();

        // Read the range address
        range.load("address");

        // Update the fill color
        range.format.fill.color = "yellow";

        await context.sync();
        console.log(`The range address was ${range.address}.`);
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} message="Please sideload your addin to see app body." />
      );
    }

    return (
      <div className="ms-welcome">
        <Initial />
      </div>
    );
  }
}
