// import React, { useEffect, useState } from "react";
// import VechileNav from "./VechileNav/VechileNav";
// import "./Vechile.css";
// import SearchBox from "../search-box/search-box";
// const Vechile = () => {
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [vechiles, setVechiles] = useState({});

//   const getTrips = async () => {
//     await fetch("https://rodhak11.onrender.com/himraahi/trips")
//       .then((response) => {
//         console.log(response.json);
//         return response.json();
//       })
//       .then((users) => {
//         console.log(users.data);
//         setVechiles(users);
//       });
//   };

//   useEffect(() => {
//     getTrips();
//   }, []);
//   console.log(vechiles);
//   return (
//     <div className="vechile-section">
//       <VechileNav />
//       <div className="filtering">
//         <h4>Search Buses</h4>
//         <div className="searchBars">
//           <SearchBox
//             // onChangeHandler={this.props.onSearchChange}
//             className="student-search-box mt-4 rounded-3xl "
//             placeholderr="From"
//           />
//           <SearchBox
//             // onChangeHandler={this.props.onSearchChange}
//             className="student-search-box mt-4 rounded-3xl "
//             placeholderr="To"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Vechile;

import VechileNav from "./VechileNav/VechileNav";
import "./Vechile.css";
import SearchBox from "../search-box/search-box";
import React, { Component } from "react";

class Vechile extends Component {
  constructor() {
    super();
    console.log("construtor request");

    this.state = {
      vechicles: [],
      from: "",
      to: "",
    };
  }
  componentDidMount() {
    console.log("componentDidMount request");
    fetch("http://195.35.45.35:3000/himraahi/trips")
      .then((response) => {
        console.log(response);
        console.log(response.json);
        return response.json();
      })
      .then((users) => {
        // whenever set state i called rneder function is re called
        this.setState(
          () => {
            console.log(users.data);
            return {
              vechicles: users.data,
            };
          },
          () => {
            console.log(this.state);
          }
        );
      });
  }
  onSearchChange = (event) => {
    // event.preventDefault();
    const from = event.target.value.toLowerCase();
    // console.log(event.target.value);
    this.setState(() => {
      return { from };
    });
  };
  onSearchChange2 = (event) => {
    // event.preventDefault();
    const to = event.target.value.toLowerCase();
    // console.log(event.target.value);
    this.setState(() => {
      return { to };
    });
  };

  render() {
    console.log("render");
    const { vechicles, from, to } = this.state;
    const { onSearchChange, onSearchChange2 } = this;
    const filteredfrom = vechicles.filter((vechile) =>
      vechile.Start.toLowerCase().includes(from)
    );
    console.log(filteredfrom);
    const filteredto = vechicles.filter((vechile) =>
      vechile.End.toLowerCase().includes(to)
    );
    console.log(filteredto);

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
              onChangeHandler={onSearchChange}
              className="student-search-box mt-4 rounded-3xl "
              placeholderr="From"
            />
            <SearchBox
              onChangeHandler={onSearchChange2}
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
                    style={
                      ({ Color: "#4cceac" },
                      { display: "flex" },
                      { justifyContent: "space-between" },
                      { flexDirection: "row" },
                      {
                        width: "100%",
                      })
                    }
                  >
                    <p>From: {Start}</p>
                    <p>To: {End}</p>
                  </div>
                  {/* <h3>Driver = {Driver}</h3> */}
                  <button style={{ backgroundColor: "#4cceac" }}>
                    <a
                      href={`https://rodhak11.onrender.com/himraahi/trip/${id}`}
                    >
                      Show Status Here
                    </a>
                  </button>
                </div>
              </div>
            );
          })}
          {/* Add a condition to check if there are no vehicles matching the filters */}
          {finalFilterVechicles.length === 0 && (
            <div className="no-results">No vehicles found.</div>
          )}
        </div>
      </div>
    );
  }
}

export default Vechile;
