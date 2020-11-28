import * as React from "react";
import { Form, Button, Input, Spin } from "antd";
import ReactDOM = require("react-dom");
import AdditionalInfo from "./AdditionalInfo";

export interface AuthProps {}

export interface AuthState {
  inProgress: boolean;
}

export default class Auth extends React.Component<AuthProps, AuthState> {
  constructor(props, {}) {
    super(props, {});

    this.state = {
      inProgress: false
    };
  }

  render() {
    const onTokenValidate = async values => {
        console.log(values);
    };

    const onFAQ = () => {
      window.open("https://placekey.io/faq", "_blank");
    }

    const onGetApiKey = () => {
      window.open("https://dev.placekey.io/default/register", "_blank");
    }

    const onAdditionalInfo = () => {
      ReactDOM.render(
        <AdditionalInfo />,
        document.getElementById("container")
      );
    }

    return (
      <div className="placekey-container">
        <img
          src={window.location.origin + "/assets/placekey-logo.svg"}
          alt="Banner"
          style={{ width: "60%", marginLeft: "auto", marginRight: "auto", paddingTop: "10%", display: "block" }}
        />
        {!this.state.inProgress ? (
          <div style={{marginTop: "10%"}}>
            <Form name="basic" onFinish={onTokenValidate}>
              <Form.Item
                label="API Key"
                name="apiKey"
                rules={[{ required: true, message: "Please input your API Key!" }]}
              >
                <Input.Password placeholder="8fdERUkFSnI2fsE4j1fd2CczAplSINEj"/>
              </Form.Item>
              <Form.Item style={{marginTop: "20px"}}>
                <Button type="link" onClick={onFAQ} style={{margin: "3px"}}>
                    FAQ
                </Button>
                <Button onClick={onGetApiKey} style={{margin: "3px"}}>
                    Get a Free API Key
                </Button>
                <Button htmlType="submit" style={{ backgroundColor: "black", color: "white", margin: "3px" }}>
                    Finish Setup
                </Button>
              </Form.Item>
            </Form>
            <div  style={{textAlign: "center"}}>
            <Button type="link" onClick={onAdditionalInfo}>Additional Information</Button>
            </div>
          </div>
        ) : (
          <div className="centered">
            <Spin />
          </div>
        )}
      </div>
    );
  }
}
