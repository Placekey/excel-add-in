import { Button, Checkbox, Divider, Form, Select, Spin, Typography } from "antd";
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
  isDataLoading: boolean;
  isEmptyDataView: string;
  isFillDataView: string;
}

class Home extends React.Component<HomeProps, HomeState> {
  formRef = React.createRef<FormInstance>();

  constructor(props) {
    super(props);
    this.state = {
      columns: ["--"],
      allSheets: [],
      activeSheet: "",
      isDataLoading: true,
      isEmptyDataView: "none",
      isFillDataView: "none"
    };
  }

  async componentDidMount() {
    await this.bindCurrentSheetData();
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
        that.getActiveSheet();
      });
    }).catch(this.errorHandlerFunction);
  };

  getActiveSheet = async () => {
    var that = this;
    Excel.run(async function(context) {
      var sheet = context.workbook.worksheets.getActiveWorksheet();
      sheet.load("name");
      return context.sync().then(function() {
        that.checkEmptySheet(sheet.name);
        that.setState({ activeSheet: sheet.name });
      });
    }).catch(this.errorHandlerFunction);
  };

  checkEmptySheet = worksheetName => {
    var that = this;
    Excel.run(function(context) {
      console.log("Hello");
      var range = context.workbook.worksheets
        .getItem(worksheetName)
        .getUsedRange()
        .getRow(0);
      range.load("address");
      return context.sync().then(function() {
        try {
          var lastChars = range.address.substr(range.address.length - 3);
          if (lastChars == "!A1") {
            that.setState({ isEmptyDataView: "block", isDataLoading: false });
          } else {
            that.getRows(worksheetName, range.address);
          }
        } catch (e) {
          that.setState({ isEmptyDataView: "block", isDataLoading: false });
        }
        console.log(range.address);
      });
    }).catch(this.errorHandlerFunction);
  };

  getRows = (worksheetName, rangeVal) => {
    var that = this;
    Excel.run(function(context) {
      var sheet = context.workbook.worksheets.getItem(worksheetName);
      var range = sheet.getRange(rangeVal);
      range.load("values");
      return context.sync().then(function() {
        var lastChars = rangeVal.substr(rangeVal.length - 3);
        if (lastChars != "!A1") {
          var rangeCol = range.values[0];
          var allColumns: any = [];
          if (rangeCol.length > 0) {
            allColumns = that.state.columns.concat(rangeCol);
          } else {
            allColumns = that.state.columns;
          }
          that.setState({ columns: allColumns, isFillDataView: "block", isDataLoading: false });
        }
      });
    }).catch(this.errorHandlerFunction);
  };

  onGenerateSampleData = () => {
    var that = this;
    Excel.run(function(context) {
      var sheet = context.workbook.worksheets.getItem(that.state.activeSheet);
      var sampleTable = sheet.tables.add("A1:G1", true);

      sampleTable.getHeaderRowRange().values = [
        ["Name", "Street Address", "City", "State", "Zip code", "Latitude", "Longitude"]
      ];

      sampleTable.rows.add(null, [
        ["Twin Peaks Petroleum", "598 Portola Dr", "San Francisco", "CA", "94131", "37.7371", "-122.44283"],
        ["", "", "", "", "", "37.7371", "-122.44283"],
        ["Beretta", "1199 Valencia St", "San Francisco", "CA", "94110", "", ""],
        ["Tasty Hand Pulled Noodle", "1 Doyers St", "New York", "ny", "10013", "", ""],
        ["", "1 Doyers St", "New York", "NY", "10013", "", ""]
      ]);

      if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
        sheet.getUsedRange().format.autofitColumns();
        sheet.getUsedRange().format.autofitRows();
      }

      //sheet.activate();
      that.setState({ isEmptyDataView: "none", isDataLoading: true });
      that.bindCurrentSheetData();
      that.setState({ isDataLoading: false });
      return context.sync();
    }).catch(this.errorHandlerFunction);
  };

  errorHandlerFunction = error => {
    console.log(error);
  };

  bindCurrentSheetData = async () => {
    const authKey = Office.context.document.settings.get("placeKeyToken");
    if (authKey) {
      if (authKey) {
        await this.getWorkSheets();
      }
    } else {
    }
  };

  onChangeActiveSheet = value => {
    console.log(value);
    this.setState({ activeSheet: value });
    Excel.run(function(context) {
      var sheet = context.workbook.worksheets.getItem(value);
      sheet.activate();
      sheet.load("name");
      return context.sync().then(function() {
        console.log(`The active worksheet is "${sheet.name}"`);
      });
    }).catch(this.errorHandlerFunction);
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

    const onGeneratePlaceKey = () => {};

    return (
      <div className="placekey-container">
        <div id="sampleDataInput" style={{ marginTop: "10px", display: this.state.isEmptyDataView }}>
          <span style={{ fontWeight: 600 }}>This Sheet looks empty.</span>
          <br /> Fill with sample data?
          <div style={{ textAlign: "center", paddingTop: "10px" }}>
            <Button
              onClick={this.onGenerateSampleData}
              htmlType="submit"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.897)",
                color: "white",
                margin: "3px",
                borderRadius: "5px",
                width: "95%"
              }}
            >
              Fill with sample data
            </Button>
          </div>
        </div>
        <div id="generateData" style={{ display: this.state.isFillDataView }}>
          <Form name="map-columns" ref={this.formRef}>
            <p style={{ marginTop: "0px", marginBottom: "10px", fontWeight: "bold" }}>Data Location:</p>
            <Form.Item name="sheetName">
              <label>Sheets</label>
              <Select
                defaultValue={this.state.activeSheet}
                value={this.state.activeSheet}
                onChange={this.onChangeActiveSheet}
              >
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
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="city">
              <label>
                City<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. San Fransisco</i>
              </label>
              <Select defaultValue="--">
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="region">
              <label>
                Region<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. California or CA</i>
              </label>
              <Select defaultValue="--">
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="postalCode">
              <label>
                Postal Code<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. 94131</i>
              </label>
              <Select defaultValue="--">
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="location">
              <label>
                Location Name<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. Twin Peaks Petroleum</i>
              </label>
              <Select defaultValue="--">
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="latitude">
              <label>
                Latitude<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. 37.7371</i>
              </label>
              <Select defaultValue="--">
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="longitude">
              <label>
                Longitude<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. -122.44283</i>
              </label>
              <Select defaultValue="--">
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="country">
              <label>
                Country<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. US</i>
              </label>
              <Select defaultValue="--">
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
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
              <Button
                onClick={onGeneratePlaceKey}
                htmlType="submit"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.897)",
                  color: "white",
                  margin: "3px",
                  borderRadius: "5px",
                  width: "95%"
                }}
              >
                Generate Placekeys
              </Button>
            </div>
          </Form>
        </div>
        <div>
          {this.state.isDataLoading && (
            <div className="centeredSpinner">
              <Spin />
            </div>
          )}
          <div>
            <Form name="basic">
              <Form.Item style={{ marginTop: "20px" }}>
                <Button
                  type="link"
                  onClick={onViewDoc}
                  style={{
                    float: "left",
                    borderRadius: "5px"
                  }}
                >
                  View API Docs
                </Button>
                <Button
                  type="link"
                  onClick={onChangeAPIKey}
                  style={{
                    float: "right",
                    borderRadius: "5px"
                  }}
                >
                  Change API Key
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <Divider style={{ backgroundColor: "black", marginBottom: "30px", width: "85%" }} />
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 23" width="80" height="25" style={{ float: "right" }}>
            <path d="M78.5 23h-76C1.1 23 0 21.9 0 20.5v-18C0 1.1 1.1 0 2.5 0h76C79.9 0 81 1.1 81 2.5v18c0 1.4-1.1 2.5-2.5 2.5z"></path>
            <path
              d="M70.3 8.5l2.2 4.3 1.9-4.3H77l-5.6 11h-2.5l2.4-4.6-3.5-6.4h2.5zm-61.6-5c2.6 0 4.7 2.1 4.7 4.7s-4.3 8.5-4.7 8.5S4 10.8 4 8.2s2.1-4.7 4.7-4.7zm24.4 4.8c.5 0 1 .1 1.5.3.4.2.8.5 1.1.8v-.9h2.2v7.3h-2.2v-1c-.3.4-.7.7-1.1.9-.4.2-.9.3-1.4.3-.7 0-1.3-.2-1.8-.5s-1-.8-1.3-1.4c-.3-.6-.5-1.3-.5-2s.2-1.4.5-2c.3-.6.7-1 1.3-1.4.4-.2 1-.4 1.7-.4zm9.5 0c.5 0 .9.1 1.4.2s.8.3 1 .5l-.7 1.5c-.4-.3-.8-.4-1.3-.4s-.8.1-1.1.3c-.3.2-.6.5-.7.8-.2.3-.2.7-.2 1 0 .4.1.7.3 1.1.2.3.4.6.7.8.3.2.7.3 1.1.3.3 0 .5 0 .7-.1l.6-.3.7 1.5c-.3.2-.6.4-1 .5h-1.5c-.6 0-1.1-.1-1.6-.3s-.9-.5-1.3-.8c-.4-.4-.7-.8-.9-1.2-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5c.2-.5.5-.9.9-1.2s.8-.6 1.3-.9 1.1-.3 1.6-.3zm6.4 0c.8 0 1.4.2 2 .5s1 .8 1.3 1.3c.3.6.5 1.2.5 2v.5h-5.6c0 .4.1.7.3 1 .2.3.4.5.7.6.3.2.7.2 1.1.2.4 0 .7-.1 1-.2.3-.1.6-.4.8-.7l1.6.8c-.3.6-.8 1.1-1.5 1.4-.6.3-1.3.5-2.1.5s-1.5-.2-2.1-.5c-.6-.3-1.1-.8-1.5-1.4-.4-.6-.5-1.2-.5-2 0-.5.1-1 .3-1.5.2-.5.5-.9.9-1.2.4-.4.8-.6 1.3-.8.4-.4.9-.5 1.5-.5zm15.7 0c.8 0 1.4.2 2 .5s1 .8 1.3 1.3c.3.6.5 1.2.5 2v.5h-5.6c0 .4.1.7.3 1 .2.3.4.5.7.6.3.2.7.2 1.1.2.4 0 .7-.1 1-.2.3-.1.6-.4.8-.7l1.6.8c-.3.6-.8 1.1-1.5 1.4-.6.3-1.3.5-2.1.5s-1.5-.2-2.1-.5c-.6-.3-1.1-.8-1.5-1.4-.4-.6-.5-1.2-.5-2 0-.5.1-1 .3-1.5.2-.5.5-.9.9-1.2.4-.4.8-.6 1.3-.8.4-.4.9-.5 1.5-.5zM21.9 4.1c.8 0 1.4.1 2 .4.6.3 1.1.7 1.4 1.2s.5 1.2.5 2-.2 1.4-.5 2c-.3.6-.8 1-1.4 1.3-.6.3-1.3.4-2 .4h-1.7v4.5h-2.3V4.1h4zm6.8-.1v11.9h-2.2V4h2.2zm27.1 0v7.2l2.7-2.7h2.8l-3.6 3.6 3.7 3.7h-2.8l-2.9-2.9v2.9h-2.2V4h2.3zm-22 6.2c-.4 0-.7.1-1 .3-.3.2-.5.4-.7.7s-.3.7-.3 1 .1.7.3 1c.2.3.4.5.7.7.3.2.6.3 1 .3s.7-.1 1-.3c.3-.2.5-.4.7-.7.2-.3.2-.7.2-1 0-.4-.1-.7-.3-1s-.4-.5-.7-.7c-.2-.3-.6-.3-.9-.3zM8.7 6.3c-1 0-1.9.9-1.9 1.9 0 .7.4 1.3 1 1.7h.1L7.8 11v.1c0 .5.4.9.9.9h.1c.5 0 .8-.4.8-.9V10c.6-.3 1.1-1 1.1-1.7-.1-1.1-.9-2-2-2zM49 9.9c-.3 0-.6.1-.8.2-.2.1-.4.3-.6.5s-.2.4-.3.7h3.4c0-.3-.1-.5-.3-.7-.2-.2-.4-.4-.6-.5-.2-.2-.5-.2-.8-.2zm15.7 0c-.3 0-.6.1-.8.2-.2.1-.4.3-.6.5s-.3.4-.3.6h3.4c0-.3-.1-.5-.3-.7-.2-.2-.4-.4-.6-.5s-.5-.1-.8-.1zm-43.5-4h-1v3.6h1c.4 0 .8-.1 1.1-.2.3-.1.6-.3.8-.6s.3-.6.3-1-.1-.8-.3-1c-.2-.3-.5-.4-.8-.6-.3-.1-.7-.2-1.1-.2z"
              fill="#fff"
            ></path>
          </svg>
        </div>
      </div>
    );
  }
}

export default Home;
