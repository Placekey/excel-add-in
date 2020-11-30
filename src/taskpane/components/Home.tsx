import { Button, Divider, Form } from "antd";
import * as React from "react";
import ReactDOM = require("react-dom");
import Auth from "./Auth";

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

    const onViewDoc = () => {
      window.open("https://docs.placekey.io/", "_blank");
    }

    const onChangeAPIKey = () => {
      ReactDOM.render(
        <Auth />,
        document.getElementById("container")
      );
    }

    return (
      <div className="placekey-container">
        <Form name="basic">
            <Form.Item style={{ marginTop: "20px" }}>
              <Button
                type="link" 
                onClick={onViewDoc}
                style={{
                  float: "left",
                }}
              >
                View API Docs
              </Button>
              <Button
              type="link"
                onClick={onChangeAPIKey}
                style={{
                  float: "right",
                }}
              >
                Change API Key
              </Button>
            </Form.Item>
          </Form>
          <Divider style={{backgroundColor: "black"}}/>
      </div>
    );
  }
}

export default Home;
