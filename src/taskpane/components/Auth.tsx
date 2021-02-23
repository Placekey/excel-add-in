import * as React from "react";
import { Form, Button, Input, Spin, Row } from "antd";
import ReactDOM = require("react-dom");
import AdditionalInfo from "./AdditionalInfo";
import Home from "./Home";
import { FormInstance } from "antd/lib/form";

export interface AuthProps {}

export interface AuthState {
  inProgress: boolean;
  token: string;
}

export default class Auth extends React.Component<AuthProps, AuthState> {
  formRef = React.createRef<FormInstance>();
  
  constructor(props, {}) {
    super(props, {});

    this.state = {
      inProgress: false,
      token: ""
    };
  }

  componentDidMount() {
    const authKey = Office.context.document.settings.get('placeKeyToken');
    if (authKey) {
      this.formRef.current.setFieldsValue({
        apiKey: authKey
      });
    }
  }

  render() {
    const onTokenValidate = async values => {
      await Excel.run(async (_context) => {
        if(values.apiKey) {
          Office.context.document.settings.set('placeKeyToken', values.apiKey);
          Office.context.document.settings.saveAsync(function(asyncResult) {
            if (asyncResult.status == Office.AsyncResultStatus.Failed) {
              console.log("save token failed");
            } else {
              ReactDOM.render(
                <Home />,
                document.getElementById("container")
              );
            }
          });
        }
      });
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
            <Form name="basic" onFinish={onTokenValidate} ref={this.formRef}>
              <Form.Item
                label="API Key"
                name="apiKey"
                rules={[{ required: true, message: "Please input your API Key!" }]}
              >
                <Input placeholder="8fdERUkFSnI2fsE4j1fd2CczAplSINEj"/>
              </Form.Item>
              <Row>
              <Form.Item style={{marginTop: "20px"}}>
                <Button type="link" onClick={onFAQ} style={{margin: "3px", paddingLeft: "8px", paddingRight: "8px"}}>
                    FAQ
                </Button>
                <Button onClick={onGetApiKey} style={{margin: "3px", paddingLeft: "8px", paddingRight: "8px"}}>
                    Get a Free API Key
                </Button>
                <Button htmlType="submit" style={{ backgroundColor: "rgba(0, 0, 0, 0.897)", color: "white", margin: "3px" , borderRadius: "5px", paddingLeft: "8px",  paddingRight: "8px"}}>
                    Finish Setup
                </Button>
              </Form.Item>
              </Row>
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
