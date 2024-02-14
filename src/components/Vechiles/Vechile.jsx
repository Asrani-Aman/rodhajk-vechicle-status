import React, { Component } from "react";
import { DNA } from "react-loader-spinner";
import VechileNav from "./VechileNav/VechileNav";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "./Vechile.css";
import SearchBox from "../search-box/search-box";

mapboxgl.accessToken =
  "pk.eyJ1IjoibXJpZ2VzaHRoYWt1ciIsImEiOiJjbDdwdjZ2MG4wbGVmM3JzMzVtb2U1MnJ0In0.nbEGuAgv1N1c-tXDyR7d4g";

class Vechile extends Component {
  constructor() {
    super();

    this.state = {
      vechicles: [],
      from: "",
      to: "",
      loading: true, // Add loading state
    };
    this.mapContainer = React.createRef();
  }

  componentDidUpdate() {
    console.log("this.mapContainer.current", this, this.mapContainer.current);
    // Check if the ref is available
    if (this.mapContainer.current) {
      const map = new mapboxgl.Map({
        container: this.mapContainer.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [77.1666, 31.9165],
        zoom: 8,
      });

      map.on("move", () => {
        this.setState({
          lng: map.getCenter().lng.toFixed(4),
          lat: map.getCenter().lat.toFixed(4),
          zoom: map.getZoom().toFixed(2),
        });
      });

      map.addControl(new mapboxgl.NavigationControl());

      // Dummy coordinates for demonstration in Himachal Pradesh, India
      const dummyCoordinates = [
        { longitude: 76.3319, latitude: 32.0842 },
        { longitude: 77.1734, latitude: 31.9064 },
        { longitude: 77.1736, latitude: 32.2462 },
        { longitude: 76.9409, latitude: 32.1022 },
        { longitude: 76.2966, latitude: 31.6478 },
        { longitude: 76.3125, latitude: 32.2396 },
        { longitude: 77.6041, latitude: 32.2396 },
        { longitude: 77.8375, latitude: 32.3204 },
        { longitude: 77.8375, latitude: 31.6844 },
        { longitude: 76.7137, latitude: 31.8491 },
        // Add more dummy coordinates in Himachal Pradesh, India, as needed
      ];

      // Add markers for each vehicle to the map
      dummyCoordinates.forEach((coordinates, index) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([coordinates.longitude, coordinates.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(`<h3>Vehicle ${index + 1}</h3>`)
          )
          .addTo(map);
      });
    }
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

  // renderMap() {
  //   // Add navigation control to the map
  //   map.addControl(new mapboxgl.NavigationControl());

  //   // Dummy coordinates for demonstration in Himachal Pradesh, India
  //   const dummyCoordinates = [
  //     { longitude: 76.3319, latitude: 32.0842 },
  //     { longitude: 77.1734, latitude: 31.9064 },
  //     { longitude: 77.1736, latitude: 32.2462 },
  //     { longitude: 76.9409, latitude: 32.1022 },
  //     { longitude: 76.2966, latitude: 31.6478 },
  //     { longitude: 76.3125, latitude: 32.2396 },
  //     { longitude: 77.6041, latitude: 32.2396 },
  //     { longitude: 77.8375, latitude: 32.3204 },
  //     { longitude: 77.8375, latitude: 31.6844 },
  //     { longitude: 76.7137, latitude: 31.8491 },
  //     // Add more dummy coordinates in Himachal Pradesh, India, as needed
  //   ];

  //   // Add markers for each vehicle to the map
  //   dummyCoordinates.forEach((coordinates, index) => {
  //     const marker = new mapboxgl.Marker()
  //       .setLngLat([coordinates.longitude, coordinates.latitude])
  //       .setPopup(new mapboxgl.Popup().setHTML(`<h3>Vehicle ${index + 1}</h3>`))
  //       .addTo(map);
  //   });
  // }

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
        {/* Add a container for the map */}
        <div ref={this.mapContainer} className="map-container" />

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
                    <a href={`https://himraahi.in/himraahi/trip/${id}`}>
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
