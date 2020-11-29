import * as React from "react";
import { Form, Button, PageHeader } from "antd";
import ReactDOM = require("react-dom");
import Initial from "./Initial";

export interface AdditionalInfoProps {}

export interface AdditionalInfoState {}

export default class AdditionalInfo extends React.Component<AdditionalInfoProps, AdditionalInfoState> {
  constructor(props, {}) {
    super(props, {});

    this.state = {};
  }

  render() {
    const onJoinSlack = () => {
      window.open("https://www.placekey.io/community", "_blank");
    };

    const onReadPlaceKey = () => {
      window.open("https://docs.placekey.io/Placekey_Technical_White_Paper.pdf", "_blank");
    };

    const onAPIDoc = () => {
      window.open("https://docs.placekey.io/#b02e2799-21ea-43af-b5ee-922dc4bdd164", "_blank");
    };

    const onFeedback = () => {
      window.open("https://www.placekey.io/feedback", "_blank");
    };

    const onTerms = () => {
      window.open("https://www.placekey.io/terms-of-service", "_blank");
    };

    const onPrivacy = () => {
      window.open("https://www.placekey.io/privacy-policy", "_blank");
    };

    const goToHome = () => {
      ReactDOM.render(<Initial />, document.getElementById("container"));
    };

    return (
      <div className="placekey-container">
        <div className="site-page-header-ghost-wrapper">
          <PageHeader className="site-page-header" onBack={goToHome} title="" subTitle="back" />
        </div>
        <div>
          <Form name="basic">
            <Form.Item>
              <Button block onClick={onJoinSlack} style={{ margin: "3px", borderRadius: "5px" }}>
                Join the Placekey Community on Slack
              </Button>
            </Form.Item>
            <Form.Item>
              <Button block onClick={onReadPlaceKey} style={{ margin: "3px", borderRadius: "5px" }}>
                Read the Placekey Whitepaper
              </Button>
            </Form.Item>
            <Form.Item>
              <Button block onClick={onAPIDoc} style={{ margin: "3px", borderRadius: "5px" }}>
                View the API Docs
              </Button>
            </Form.Item>
            <Form.Item>
              <Button block onClick={onFeedback} style={{ margin: "3px", borderRadius: "5px" }}>
                Terms of Service
              </Button>
            </Form.Item>
            <Form.Item style={{ marginTop: "20px" }}>
              <Button
                onClick={onPrivacy}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  margin: "3px",
                  float: "left",
                  borderRadius: "4px",
                  width: "45%"
                }}
              >
                Privacy policy
              </Button>
              <Button
                onClick={onTerms}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  margin: "3px",
                  float: "right",
                  borderRadius: "4px",
                  width: "45%"
                }}
              >
                Terms of Service
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}
