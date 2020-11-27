import * as React from "react";

export interface HomeProps {}

export interface HomeState {

}

class Home extends React.Component<HomeProps, HomeState> {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
    const authKey = Office.context.roamingSettings.get("placeKeyToken");
    if (authKey) {
      
    } else {
      
    }
  }

  render() {
    return (
      <div className="ms-welcome">
        Home Page
      </div>
    );
  }
}

export default Home;
