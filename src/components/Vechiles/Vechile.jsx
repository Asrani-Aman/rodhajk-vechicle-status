import React, { useState, useEffect, useRef } from "react";
import { DNA } from "react-loader-spinner";
import VechileNav from "./VechileNav/VechileNav";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "./Vechile.css";
import SearchBox from "../search-box/search-box";
import io from "socket.io-client";

mapboxgl.accessToken =
  "pk.eyJ1IjoibXJpZ2VzaHRoYWt1ciIsImEiOiJjbDdwdjZ2MG4wbGVmM3JzMzVtb2U1MnJ0In0.nbEGuAgv1N1c-tXDyR7d4g";

const Vechile = () => {
  const [vechicles, setVechicles] = useState([]);
  const [socketVechicles, setSocketVechicles] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const socket = useRef(null);

  const fetchRouteGeometry = async (sourceLongitude, sourceLatitude) => {
    const tripId = selectedVehicle.tripID;
    try {
      const response = await fetch(
        `https://www.himraahi.in/himraahi/trip/Coords/${tripId}`
      );
      const tripData = await response.json();

      const sourceLocation = tripData.coordinateStart;
      const destinationLocation = tripData.coordinateEnd;

      const response2 = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceLocation[0]},${sourceLocation[1]};${destinationLocation[0]},${destinationLocation[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      const data = await response2.json();
      console.log("fetched data", data);
      setRouteGeometry(data.routes[0].geometry);
    } catch (error) {
      console.error("Error fetching route geometry:", error);
    }
  };

  useEffect(() => {
    socket.current = io("http://localhost:3000/");

    socket.current.on("broadcastDriverData", (data) => {
      // console.log("Received data from backend:", data);
      setSocketVechicles((prevVehicles) => ({
        ...prevVehicles,
        [data.tripID]: data,
      }));
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch("https://www.himraahi.in/himraahi/trips")
      .then((response) => response.json())
      .then((data) => {
        setVechicles(data.data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [77.1666, 31.9165],
        zoom: 8,
      });

      map.current.on("load", () => {
        // Add markers for each vehicle
        Object.values(socketVechicles).forEach((vehicle) => {
          const marker = new mapboxgl.Marker()
            .setLngLat([vehicle.longitude, vehicle.latitude])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<h3>Trip ID: ${vehicle.tripID}</h3>`
              )
            )
            .addTo(map.current);
          markers.current.push(marker);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && map.current && socketVechicles) {
      // Remove existing markers
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];

      // Add new markers
      Object.values(socketVechicles).forEach((vehicle) => {
        setSelectedVehicle(vehicle);
        const marker = new mapboxgl.Marker()
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<h3>Trip ID: ${vehicle.tripID}</h3><button id="showRoute">Show Bus Route</button>`
            )
          )
          .addTo(map.current);

        // Add click event handler to the marker
        marker.getElement().addEventListener("click", () => {
          console.log("checking selected", selectedVehicle);
          fetchRouteGeometry(vehicle.longitude, vehicle.latitude);
        });
        markers.current.push(marker);
      });
      // Add event listener to each marker
      // markers.current.forEach((marker) => {
      //   marker
      //     .getElement()
      //     .querySelector("#showRoute")
      //     .addEventListener("click", () => {
      //       const vehicle = socketVechicles.find(
      //         (v) => v.tripID === marker.getPopup().getText()
      //       );
      //       if (vehicle) {
      //         setSelectedVehicle(vehicle);
      //         fetchRouteGeometry(vehicle.longitude, vehicle.latitude);
      //       }
      //     });
      // });
    }
  }, [socketVechicles, selectedVehicle]);

  useEffect(() => {
    if (map.current && routeGeometry) {
      console.log("hit req", routeGeometry);

      // Check if source with ID "route" already exists
      const existingSource = map.current.getSource("route");

      // If source already exists, remove it
      if (existingSource) {
        map.current.removeSource("route");
      }
      // Add the route layer to the map
      map.current.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: routeGeometry,
          },
        },
        paint: {
          "line-color": "#4cceac",
          "line-width": 4,
        },
      });
    }
  }, [routeGeometry]);

  const handleSearchFromChange = (event) => {
    setFrom(event.target.value.toLowerCase());
  };

  const handleSearchToChange = (event) => {
    setTo(event.target.value.toLowerCase());
  };

  const filteredFrom = vechicles.filter((vehicle) =>
    vehicle.Start.toLowerCase().includes(from)
  );

  const filteredTo = vechicles.filter((vehicle) =>
    vehicle.End.toLowerCase().includes(to)
  );

  const finalFilteredVehicles = filteredFrom.filter((value) =>
    filteredTo.includes(value)
  );

  return (
    <div className="vechile-section">
      <VechileNav />

      {routeGeometry && (
        <source-map-layer
          id="route"
          type="line"
          source={{
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: routeGeometry,
                },
              ],
            },
          }}
          paint={{
            "line-color": "#4cceac",
            "line-width": 4,
          }}
        />
      )}

      <div className="filtering">
        <h4>Search Buses</h4>
        <div className="searchBars">
          <SearchBox
            onChangeHandler={handleSearchFromChange}
            className="student-search-box mt-4 rounded-3xl "
            placeholderr="From"
          />
          <SearchBox
            onChangeHandler={handleSearchToChange}
            className="student-search-box mt-4 rounded-3xl "
            placeholderr="To"
          />
        </div>
      </div>

      <div ref={mapContainer} className="map-container" />

      <div className="card-list vechiles">
        {finalFilteredVehicles.map((vehicle) => (
          <div key={vehicle._id}>
            <div className="vechile-card">
              <img
                src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80"
                alt="vehicleImg"
              />
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
                <p>From: {vehicle.Start} </p>
                <p> To: {vehicle.End}</p>
              </div>
              <button style={{ backgroundColor: "#4cceac" }}>
                <a href={`https://himraahi.in/himraahi/trip/${vehicle._id}`}>
                  Show Status Here
                </a>
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && (
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
      )}
    </div>
  );
};

export default Vechile;
