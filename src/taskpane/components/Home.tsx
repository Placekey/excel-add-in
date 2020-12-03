import { Button, Checkbox, Divider, Form, Select, Typography } from "antd";
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
        { key: 1, text: "--" },
        { key: 2, text: "column1" },
        { key: 3, text: "column2" },
        { key: 4, text: "column3" }
      ],
      allSheets: [],
      activeSheet: ""
    };
  }

  async componentDidMount() {
    const authKey = Office.context.document.settings.get("placeKeyToken");
    if (authKey) {
      if (authKey) {
        await this.getWorkSheets();
      }
      this.formRef.current.setFieldsValue({
        sheetName: this.state.activeSheet
      });
    } else {
    }
  }

  getWorkSheets = async () => {
    var that = this;
    var workSheets = [];
    Excel.run(async function(context) {
      var sheets = context.workbook.worksheets;
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
        that.setState({ allSheets: workSheets });
      });
    }).catch(this.errorHandlerFunction);
  };

  // getActiveSheet = async() => {
  //   var that = this;
  //   Excel.run(async function(context) {
  //     var sheet = context.workbook.worksheets.getActiveWorksheet();
  //     sheet.load("name");
  //     return context.sync().then(function() {
  //       that.setState({activeSheet: sheet.name});
  //     });
  //   }).catch(this.errorHandlerFunction);
  // }

  errorHandlerFunction = error => {
    console.log(error);
  };

  render() {
    const onViewDoc = () => {
      window.open("https://docs.placekey.io/", "_blank");
    };

    const onChangeAPIKey = () => {
      ReactDOM.render(<Auth />, document.getElementById("container"));
    };

    const onAddressChange = () => {};

    const onNameMatchChange = () => {};

    const onInssertErrorChange = () => {};

    const onOverwriteChange = () => {};

    const onGeneratePlaceKey =() => {

    }
    return (
      <div className="placekey-container">
        <Form name="map-columns" ref={this.formRef}>
          <p style={{ marginTop: "0px", marginBottom: "10px", fontWeight: "bold" }}>Data Location:</p>
          <Form.Item name="sheetName">
            <label>Sheets</label>
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
          <Form.Item name="streetAddress">
            <label>
              Street Address <i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. 598 Portola Dr </i>
            </label>
            <Select defaultValue="--">
              {this.state.columns.map((item, index) => {
                return (
                  <Option value={item.key} key={index}>
                    {item.text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item name="city">
            <label>
              City<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. San Fransisco</i>
            </label>
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
          <Form.Item name="region">
            <label>
              Region<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. California or CA</i>
            </label>
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
          <Form.Item name="postalCode">
            <label>
              Postal Code<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. 94131</i>
            </label>
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
          <Form.Item name="location">
            <label>
              Location Name<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. Twin Peaks Petroleum</i>
            </label>
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
          <Form.Item name="latitude">
            <label>
              Latitude<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. 37.7371</i>
            </label>
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
          <Form.Item name="longitude">
            <label>
              Longitude<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. -122.44283</i>
            </label>
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
          <Form.Item name="country">
            <label>
              Country<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. US</i>
            </label>
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
          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <Checkbox onChange={onAddressChange} name="addressMatch" style={{ padding: "5px" }}>
              {" "}
              Check for exact address matches only
            </Checkbox>
            <Checkbox onChange={onNameMatchChange} name="nameMatch" style={{ padding: "5px" }}>
              {" "}
              Check for exact name matches only
            </Checkbox>
            <Checkbox onChange={onInssertErrorChange} name="insertError" style={{ padding: "5px" }}>
              {" "}
              Insert errors in new column
            </Checkbox>
            <Checkbox onChange={onOverwriteChange} name="overwritePlacekey" style={{ padding: "5px" }}>
              {" "}
              <span style={{ fontWeight: "bolder" }}>Overwrite existing Placekey column</span>
            </Checkbox>
          </div>
          <div style={{ textAlign: "center" }}>
            <Button onClick={onGeneratePlaceKey} htmlType="submit" style={{ backgroundColor: "black", color: "white", margin: "3px", width: "80%" }}>
              Generate Placekeys
            </Button>
          </div>
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
        <Divider style={{ backgroundColor: "black", marginBottom: "45px", width: "85%" }} />
      </div>
    );
  }
}

export default Home;
