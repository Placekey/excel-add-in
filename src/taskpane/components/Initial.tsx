import * as React from "react";
import Auth from "./Auth";
import Home from "./Home";
import { Spin } from "antd";

export interface InitialProps {}

export interface InitialState {
  isLoading: boolean;
  isLogged: boolean;
}

class Initial extends React.Component<InitialProps, InitialState> {
  constructor(props) {
    super(props);
    this.state = {
      isLogged: false,
      isLoading: false
    };
  }

  async componentDidMount() {
    const authKey = Office.context.document.settings.get('placeKeyToken');
    if (authKey) {
      this.setState({ isLogged: true });
    } else {
      this.setState({ isLogged: false });
    }

    OfficeRuntime.storage.getItem("placeKeyToken").then(
      result => {
        if (result) {
          this.setState({ isLogged: true });
        } else {
          this.setState({ isLogged: false });
        }
      },
      error => {
        console.log(error);
        this.setState({ isLogged: false });
      }
    );
  }

  render() {
    return (
      <div className="ms-welcome">
        {this.state.isLoading ? (
          <div className="centered">
            <Spin />
          </div>
        ) : (
          <div>
            {this.state.isLogged ? (
              <div>
                <div
                  style={{
                    marginBottom: 40
                  }}
                >
                  <Home />
                </div>
              </div>
            ) : (
              <Auth />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Initial;
