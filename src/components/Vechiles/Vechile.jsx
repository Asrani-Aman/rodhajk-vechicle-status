import React, { Component } from "react";
import { DNA } from "react-loader-spinner";
import VechileNav from "./VechileNav/VechileNav";
import "./Vechile.css";
import SearchBox from "../search-box/search-box";

class Vechile extends Component {
  constructor() {
    super();

    this.state = {
      vechicles: [],
      from: "",
      to: "",
      loading: true, // Add loading state
    };
  }

  componentDidMount() {
    fetch("https://www.himraahi.in/himraahi/trips")
      .then((response) => response.json())
      .then((users) => {
        this.setState(
          {
            vechicles: users.data,
            loading: false, // Set loading to false once data is fetched
          },
          () => {
            console.log(this.state);
          }
        );
      });
  }

  onSearchChange = (event) => {
    const from = event.target.value.toLowerCase();
    this.setState(() => {
      return { from };
    });
  };

  onSearchChange2 = (event) => {
    const to = event.target.value.toLowerCase();
    this.setState(() => {
      return { to };
    });
  };

  render() {
    const { vechicles, from, to, loading } = this.state;

    if (loading) {
      return (
        <div className="loader-container">
          <DNA
            visible={true}
            height="512"
            width="512"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
          />
        </div>
      );
    }

    const filteredfrom = vechicles.filter((vechile) =>
      vechile.Start.toLowerCase().includes(from)
    );

    const filteredto = vechicles.filter((vechile) =>
      vechile.End.toLowerCase().includes(to)
    );

    const finalFilterVechicles = filteredfrom.filter((value) =>
      filteredto.includes(value)
    );

    return (
      <div className="vechile-section">
        <VechileNav />
        <div className="filtering">
          <h4>Search Buses</h4>
          <div className="searchBars">
            <SearchBox
              onChangeHandler={this.onSearchChange}
              className="student-search-box mt-4 rounded-3xl "
              placeholderr="From"
            />
            <SearchBox
              onChangeHandler={this.onSearchChange2}
              className="student-search-box mt-4 rounded-3xl "
              placeholderr="To"
            />
          </div>
        </div>
        <div className="card-list vechiles">
          {finalFilterVechicles.map((vechiclee) => {
            const id = vechiclee._id;
            const Start = vechiclee.Start;
            const End = vechiclee.End;
            return (
              <div key={id}>
                <div className="vechile-card">
                  <img
                    src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80"
                    alt="vechileImg"
                  ></img>

                  <div
                    className="vechile-location"
                    style={{
                      color: "#4cceac",
                      display: "flex",
                      justifyContent: "space-between",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    <p>From: {Start} </p>

                    <p> To: {End}</p>
                  </div>
                  <button style={{ backgroundColor: "#4cceac" }}>
                    <a href={`http://89.116.33.224:3000/himraahi/trip/${id}`}>
                      Show Status Here
                    </a>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Vechile;
