import { Button, Divider, Form, Select, Typography } from "antd";
import * as React from "react";
import ReactDOM = require("react-dom");
import Auth from "./Auth";
import { FormInstance } from "antd/lib/form";

const { Title } = Typography;

const { Option } = Select;

export interface HomeProps {}

export interface HomeState {
  columns: any[];
  allSheets: any[];
  activeSheet: string;
}

class Home extends React.Component<HomeProps, HomeState> {
  formRef = React.createRef<FormInstance>();

  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { key: 1, text: "column1" },
        { key: 2, text: "column2" },
        { key: 3, text: "column3" }
      ],
      allSheets: [],
      activeSheet: ""
    };
  }

  async componentDidMount() {
    const authKey = Office.context.document.settings.get("placeKeyToken");
    if (authKey) {
      let workSheets = [];
      Excel.run(function(context) {
        var sheets = context.workbook.worksheets;
        var sheet = context.workbook.worksheets.getActiveWorksheet();
        sheets.load("items/name");

        return context.sync().then(function() {
          if (sheets.items.length > 1) {
            console.log(`There are ${sheets.items.length} worksheets in the workbook:`);
          } else {
            console.log(`There is one worksheet in the workbook:`);
          }
          sheets.items.forEach(function(sheet) {
            workSheets.push(sheet.name);
          });
          this.setState({ allSheets: workSheets });
          this.setState({activeSheet: sheet.name});
        });
      }).catch(this.errorHandlerFunction);

      // this.formRef.current.setFieldsValue({
      //   sheetName: this.state.activeSheet
      // });
    } else {
    }
  }

  errorHandlerFunction = () => {};

  render() {
    const onViewDoc = () => {
      window.open("https://docs.placekey.io/", "_blank");
    };

    const onChangeAPIKey = () => {
      ReactDOM.render(<Auth />, document.getElementById("container"));
    };

    return (
      <div className="placekey-container">
        <Form name="map-columns" ref={this.formRef}>
          <Form.Item label="Sheets" name="sheetName">
            <Select>
              {this.state.allSheets.map((item, index) => {
                return (
                  <Option value={item} key={index}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Title level={5}>Match the headers in your document to the fields below.</Title>
          <Form.Item label="Street Address - 598 Portola Dr" name="streetAddress">
            <Select>
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label="City - e.g. San Fransisco" name="city">
            <Select>
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label="Region - e.g. California or CA" name="region">
            <Select>
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label="Postal Code - e.g. 94131" name="postalCode">
            <Select>
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label="Location Name - e.g. Twin Peaks Petroleum" name="location">
            <Select allowClear>
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label="Latitude - e.g. 37.7371" name="latitude">
            <Select allowClear>
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label="Longitude - e.g. -122.44283" name="longitude">
            <Select>
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label="Country - e.g. US" name="country">
            <Select>
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
        <Form name="basic">
          <Form.Item style={{ marginTop: "20px" }}>
            <Button
              type="link"
              onClick={onViewDoc}
              style={{
                float: "left"
              }}
            >
              View API Docs
            </Button>
            <Button
              type="link"
              onClick={onChangeAPIKey}
              style={{
                float: "right"
              }}
            >
              Change API Key
            </Button>
          </Form.Item>
        </Form>
        <Divider style={{ backgroundColor: "black" }} />
      </div>
    );
  }
}

export default Home;
