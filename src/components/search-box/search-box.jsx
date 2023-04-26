import { Component } from "react";
import "./search-box.styles.css";

class SearchBox extends Component {
  render() {
    console.log("render from SearcBox");
    // const { onChangeHandler } = this.props;

    return (
      <>
        <input
          className={`search-box ${this.props.className}`}
          type="search"
          placeholder={this.props.placeholderr}
          onChange={this.props.onChangeHandler}
        />
      </>
    );
  }
}
export default SearchBox;
