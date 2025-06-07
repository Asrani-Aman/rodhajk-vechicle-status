import React, { useState, useEffect, useRef } from "react";
import { DNA, MagnifyingGlass } from "react-loader-spinner";
import busImg from "../../assets/bus.png";
import VechileNav from "./VechileNav/VechileNav";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "./Vechile.css";
import SearchBox from "../search-box/search-box";
import io from "socket.io-client";
import {
  FaBus,
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import logo from "../../assets/rd.png";

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
  const [routeNum, setRouteNum] = useState(0);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const socket = useRef(null);
  // Add a state to track whether the map is loaded
  const [mapLoaded, setMapLoaded] = useState(false);

  const fetchRouteGeometry = async (vehicle) => {
    if (!vehicle || !vehicle.tripID) {
      console.error("Invalid vehicle data:", vehicle);
      return;
    }

    const tripId = vehicle.tripID;
    let response2;
    try {
      const response = await fetch(
        `https://www.himraahi.in/himraahi/trip/Coords/${tripId}`
      );
      const tripData = await response.json();

      const sourceLocation = tripData.coordinateStart;
      const destinationLocation = tripData.coordinateEnd;
      const via = tripData.via;
      if (via.length !== 0) {
        response2 = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceLocation[1]},${sourceLocation[0]};${via[1]},${via[0]};${destinationLocation[1]},${destinationLocation[0]}?alternatives=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        console.log(
          "fetched data via there",
          `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceLocation[1]},${sourceLocation[0]};${via[1]},${via[0]};${destinationLocation[1]},${destinationLocation[0]}?alternatives=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
      } else {
        response2 = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceLocation[1]},${sourceLocation[0]};${destinationLocation[1]},${destinationLocation[0]}?alternatives=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );

        console.log(
          "fetched data ",
          `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceLocation[1]},${sourceLocation[0]};${destinationLocation[1]},${destinationLocation[0]}?alternatives=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
      }

      const data = await response2.json();

      setRouteGeometry(data.routes[0].geometry);
      setRouteNum((prevRouteNum) => prevRouteNum + 1);
    } catch (error) {
      console.error("Error fetching route geometry:", error);
    }
  };

  // Function to focus on a specific vehicle when clicked in the summary
  const focusVehicle = (vehicleId) => {
    const marker = markers.current.find((m) => m._vehicleID === vehicleId);
    if (marker) {
      const lngLat = marker.getLngLat();
      map.current.flyTo({
        center: [lngLat.lng, lngLat.lat],
        zoom: 12,
        speed: 1.5,
      });
      marker.togglePopup();
    }
  };

  // Helper function to get filtered vehicles from both sources
  const getFilteredVehicles = () => {
    // Filter API vehicles
    const filteredFrom = vechicles.filter(
      (vehicle) => vehicle.Start && vehicle.Start.toLowerCase().includes(from)
    );

    const filteredTo = vechicles.filter(
      (vehicle) => vehicle.End && vehicle.End.toLowerCase().includes(to)
    );

    const filteredApiVehicles = filteredFrom.filter((value) =>
      filteredTo.includes(value)
    );

    return filteredApiVehicles;
  };

  // Filter socket (map) vehicles
  const getFilteredSocketVehicles = () => {
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    return Object.values(socketVechicles).filter((vehicle) => {
      const sourceMatch =
        vehicle.sourceLocation &&
        vehicle.sourceLocation.toLowerCase().includes(fromLower);
      const destMatch =
        vehicle.destinationLocation &&
        vehicle.destinationLocation.toLowerCase().includes(toLower);

      // If both search terms are provided, require both to match
      if (fromLower && toLower) {
        return sourceMatch && destMatch;
      }
      // If only from is provided
      else if (fromLower && !toLower) {
        return sourceMatch;
      }
      // If only to is provided
      else if (!fromLower && toLower) {
        return destMatch;
      }
      // If no search terms
      return true;
    });
  };

  // Add function to filter map markers based on search
  const filterMapMarkers = () => {
    if (!map.current) return;

    // Get filtered vehicles from socket data (for map markers)
    const filteredSocketVehicles = getFilteredSocketVehicles();
    const filteredIDs = filteredSocketVehicles.map((v) => v.tripID);

    // Show/hide markers based on filter
    markers.current.forEach((marker) => {
      const vehicleID = marker._vehicleID;
      if (
        filteredIDs.includes(vehicleID) ||
        (filteredIDs.length === 0 && !from && !to)
      ) {
        marker.getElement().style.display = "block";
      } else {
        marker.getElement().style.display = "none";
      }
    });

    // Update summary sidebar with both filtered datasets
    updateSummarySidebar();
  };

  // Add function to update the summary sidebar
  const updateSummarySidebar = () => {
    const summaryElement = document.getElementById("route-summary");
    if (!summaryElement) return;

    const filteredApiVehicles = getFilteredVehicles();
    const filteredSocketVehicles = getFilteredSocketVehicles();

    // Show results from both data sources
    if (
      filteredApiVehicles.length === 0 &&
      filteredSocketVehicles.length === 0 &&
      (from || to)
    ) {
      summaryElement.innerHTML = `
        <div class="empty-results">
          <h3>No routes found</h3>
          <p>No vehicles found for route from "${from}" to "${to}"</p>
        </div>
      `;
    } else if (
      filteredApiVehicles.length > 0 ||
      filteredSocketVehicles.length > 0
    ) {
      let routesList = "";

      // Add API vehicles (static route data)
      if (filteredApiVehicles.length > 0) {
        routesList += `
          <div class="summary-subheader">
            <h4>Scheduled Routes (${filteredApiVehicles.length})</h4>
          </div>
        `;

        routesList += filteredApiVehicles
          .map(
            (vehicle) => `
          <div class="route-item" onclick="window.focusVehicle('${
            vehicle._id
          }')">
            <div class="route-info">
              <div class="route-endpoints">
                <span>${vehicle.Start}</span>
                <span class="route-arrow">→</span>
                <span>${vehicle.End}</span>
              </div>
              <div class="route-details">
                <span>Bus ID: ${vehicle._id.slice(-4)}</span>
              </div>
            </div>
            <button class="focus-btn" onclick="event.stopPropagation(); window.location.href='https://himraahi.in/himraahi/trip/${
              vehicle._id
            }'">
              Details
            </button>
          </div>
        `
          )
          .join("");
      }

      // Add socket vehicles (live buses on map)
      if (filteredSocketVehicles.length > 0) {
        routesList += `
          <div class="summary-subheader">
            <h4>Live Buses (${filteredSocketVehicles.length})</h4>
          </div>
        `;

        routesList += filteredSocketVehicles
          .map(
            (vehicle) => `
          <div class="route-item" onclick="window.focusVehicle('${vehicle.tripID}')">
            <div class="route-info">
              <div class="route-endpoints">
                <span>${vehicle.sourceLocation}</span>
                <span class="route-arrow">→</span>
                <span>${vehicle.destinationLocation}</span>
              </div>
              <div class="route-details">
                <span>Updated: ${vehicle.currentTime}</span>
              </div>
            </div>
            <button class="focus-btn" onclick="event.stopPropagation(); window.location.href='https://himraahi.in/himraahi/trip/${vehicle.tripID}'">
              Details
            </button>
          </div>
        `
          )
          .join("");
      }

      summaryElement.innerHTML = `
        <div class="summary-header">
          <h3>Found ${
            filteredApiVehicles.length + filteredSocketVehicles.length
          } routes</h3>
          ${
            from && to
              ? `<p>From "${from}" to "${to}"</p>`
              : from
              ? `<p>From "${from}"</p>`
              : to
              ? `<p>To "${to}"</p>`
              : ""
          }
        </div>
        <div class="routes-list">
          ${routesList}
        </div>
      `;
    } else {
      summaryElement.innerHTML = `
        <div class="welcome-message">
          <h3>Search for routes</h3>
          <p>Use the search fields above to find buses</p>
        </div>
      `;
    }
  };

  // Make focusVehicle available to window so it can be called from HTML
  useEffect(() => {
    window.focusVehicle = focusVehicle;
    return () => {
      delete window.focusVehicle;
    };
  }, []);

  useEffect(() => {
    // socket.current = io("http://localhost:3000/");
    // let SOCKET_URL = "https://himraahi.in/";
    socket.current = io("http://localhost:3000");
    socket.current.on("broadcastDriverData", (data) => {
      console.log("Received data from backend:", data);
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
    fetch("http://localhost:3000/trips")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setVechicles(data.data);
        setLoading(false);
        console.log("making api", loading);
        // Update summary after data is loaded
        setTimeout(updateSummarySidebar, 100);
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
        setLoading(false); // Set loading to false in case of an error
      });
  }, []);

  useEffect(() => {
    console.log("making map", loading, mapContainer.current);
    if (!map.current && mapContainer.current) {
      setMapLoaded(true);
      console.log("making map", routeGeometry, map.current);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v9",
        center: [77.1666, 31.9165], // Center on Himachal Pradesh
        zoom: 8,
      });

      map.current.on("load", () => {
        // Add markers for each vehicle
        Object.values(socketVechicles).forEach((vehicle) => {
          // Create a custom HTML element for the marker
          const markerElement = document.createElement("div");
          markerElement.className = "custom-marker";
          markerElement.style.backgroundImage = `url(${busImg})`;

          const marker = new mapboxgl.Marker(markerElement)
            .setLngLat([vehicle.longitude, vehicle.latitude])
            .setPopup(
              new mapboxgl.Popup({
                offset: 25,
                closeButton: true,
                closeOnClick: true,
                maxWidth: "300px",
              }).setHTML(`
                <div style="font-family: Arial, sans-serif; padding: 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h3 style="margin: 0 0 8px 0; color: #3D5A80; border-bottom: 2px solid #4cceac; padding-bottom: 6px;">Trip Details</h3>
                  
                  <div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <div style="min-width: 28px; color: #4cceac;"><i>🚏</i></div>
                    <div>
                      <strong style="color: #333;">From:</strong> 
                      <span style="color: #555;">${vehicle.sourceLocation}</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <div style="min-width: 28px; color: #4cceac;"><i>📍</i></div>
                    <div>
                      <strong style="color: #333;">To:</strong> 
                      <span style="color: #555;">${vehicle.destinationLocation}</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="min-width: 28px; color: #4cceac;"><i>⏱️</i></div>
                    <div>
                      <strong style="color: #333;">Time:</strong> 
                      <span style="color: #555;">${vehicle.currentTime}</span>
                    </div>
                  </div>
                  
                  <a href="https://himraahi.in/himraahi/trip/${vehicle.tripID}" 
                     style="display: block; background-color: #4cceac; color: white; text-align: center; 
                            padding: 8px 12px; border-radius: 4px; text-decoration: none; 
                            font-weight: bold; transition: background-color 0.3s;">
                    View Trip Details
                  </a>
                </div>
              `)
            )
            .addTo(map.current);

          // Add vehicle ID to marker for filtering
          marker._vehicleID = vehicle.tripID;

          // Add click event handler to the marker
          marker.getElement().addEventListener("click", () => {
            console.log("checking selected", vehicle);
            setSelectedVehicle(vehicle);
            fetchRouteGeometry(vehicle.longitude, vehicle.latitude);
          });

          markers.current.push(marker);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (map.current && socketVechicles) {
      console.log("setSelectedVehicle", map.current);

      // Remove existing markers
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];

      // Add new markers
      Object.values(socketVechicles).forEach((vehicle) => {
        // Create a custom HTML element for the marker
        const markerElement = document.createElement("div");
        markerElement.className = "custom-marker";
        markerElement.style.backgroundImage = `url(${busImg})`;

        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setPopup(
            new mapboxgl.Popup({
              offset: 25,
              closeButton: true,
              closeOnClick: true,
              maxWidth: "300px",
            }).setHTML(`
              <div style="font-family: Arial, sans-serif; padding: 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 8px 0; color: #3D5A80; border-bottom: 2px solid #4cceac; padding-bottom: 6px;">Trip Details</h3>
                
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                  <div style="min-width: 28px; color: #4cceac;"><i>🚏</i></div>
                  <div>
                    <strong style="color: #333;">From:</strong> 
                    <span style="color: #555;">${vehicle.sourceLocation}</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                  <div style="min-width: 28px; color: #4cceac;"><i>📍</i></div>
                  <div>
                    <strong style="color: #333;">To:</strong> 
                    <span style="color: #555;">${vehicle.destinationLocation}</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <div style="min-width: 28px; color: #4cceac;"><i>⏱️</i></div>
                  <div>
                    <strong style="color: #333;">Time:</strong> 
                    <span style="color: #555;">${vehicle.currentTime}</span>
                  </div>
                </div>
                
                <a href="https://himraahi.in/himraahi/trip/${vehicle.tripID}" 
                   style="display: block; background-color: #4cceac; color: white; text-align: center; 
                          padding: 8px 12px; border-radius: 4px; text-decoration: none; 
                          font-weight: bold; transition: background-color 0.3s;">
                  View Trip Details
                </a>
              </div>
            `)
          )
          .addTo(map.current);

        // Add vehicle ID to marker for filtering
        marker._vehicleID = vehicle.tripID;

        // Add click event handler to the marker
        marker.getElement().addEventListener("click", () => {
          console.log("checking selected", vehicle);
          setSelectedVehicle(vehicle);
          fetchRouteGeometry(vehicle);
        });

        markers.current.push(marker);
      });

      // Apply any current filters
      if (from || to) {
        filterMapMarkers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketVechicles]);

  useEffect(() => {
    if (routeGeometry && map.current) {
      console.log("hit req", map.current, routeGeometry);

      // Check if source with ID "route" already exists
      const existingSource = map.current.getSource(`route-${routeNum - 1}`);

      // If source already exists, remove it
      if (existingSource) {
        map.current.removeLayer(`route-${routeNum - 1}`);
        map.current.removeSource(`route-${routeNum - 1}`);
      }

      // Add the route layer to the map
      map.current.addLayer({
        id: `route-${routeNum}`,
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
          "line-color": "#FF0000",
          "line-width": 4,
        },
      });
    }
  }, [routeGeometry, routeNum]);

  // Update summary when filters change
  useEffect(() => {
    updateSummarySidebar();
  }, [from, to, vechicles]);

  const handleSearchFromChange = (event) => {
    setFrom(event.target.value.toLowerCase());
    // Filter markers after a short delay to allow state to update
    setTimeout(filterMapMarkers, 100);
  };

  const handleSearchToChange = (event) => {
    setTo(event.target.value.toLowerCase());
    // Filter markers after a short delay to allow state to update
    setTimeout(filterMapMarkers, 100);
  };

  return (
    <div className="vechile-section">
      {/* Enhanced Header with Logo */}
      <div className="enhanced-header">
        <div className="logo-container">
          <img src={logo} alt="Himraahi Logo" className="app-logo" />
          <h1>Himraahi</h1>
        </div>
        <VechileNav />
      </div>

      {/* Enhanced Search Area */}
      <div className="filtering">
        <div className="search-heading">
          <FaBus className="icon-accent" />
          <h4>Find Your Bus</h4>
        </div>
        <div className="search-description">
          <p>Track buses in real-time across Himachal Pradesh</p>
        </div>
        <div className="searchBars">
          <div className="search-input-container">
            <FaMapMarkerAlt className="search-icon source-icon" />
            <SearchBox
              onChangeHandler={handleSearchFromChange}
              className="student-search-box rounded-3xl"
              placeholderr="From (e.g., Kullu, Mandi)"
            />
            {from && (
              <button
                className="clear-search"
                onClick={() => {
                  setFrom("");
                  setTimeout(filterMapMarkers, 100);
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="search-input-container">
            <FaMapMarkerAlt className="search-icon destination-icon" />
            <SearchBox
              onChangeHandler={handleSearchToChange}
              className="student-search-box rounded-3xl"
              placeholderr="To (e.g., Shimla, Chandigarh)"
            />
            {to && (
              <button
                className="clear-search"
                onClick={() => {
                  setTo("");
                  setTimeout(filterMapMarkers, 100);
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button className="search-button" onClick={filterMapMarkers}>
            <FaSearch /> Search
          </button>
        </div>
      </div>

      {/* Map and Summary Panel with Enhanced UI */}
      <div className="map-container-wrapper">
        {/* Side summary panel */}
        <div className="route-summary-panel" id="route-summary">
          <div className="welcome-message">
            <div className="welcome-icon">
              <FaBus />
            </div>
            <h3>Search for routes</h3>
            <p>Use the search fields above to find buses</p>
          </div>
        </div>

        {/* Map container with enhanced controls */}
        <div className="map-container-with-overlay">
          <div ref={mapContainer} className="map-container" />

          <div className="map-overlay map-info">
            <div className="map-info-content">
              <FaInfoCircle className="info-icon" />
              <div className="info-text">
                <p>Click on a bus to see its route</p>
              </div>
            </div>
          </div>

          <div className="map-overlay map-legend">
            <div className="legend-item">
              <div className="legend-color bus-marker"></div>
              <span>Bus Location</span>
            </div>
            <div className="legend-item">
              <div className="legend-color route-line"></div>
              <span>Bus Route</span>
            </div>
          </div>
        </div>
      </div>

      {!mapLoaded && (
        <div className="loader-container">
          <MagnifyingGlass
            visible={true}
            color="#4cceac"
            height={100}
            width={100}
            radius={50}
            margin={10}
          />
          <div className="loading-text">
            <p>Loading Map</p>
          </div>
        </div>
      )}

      {/* Vehicle Cards with Enhanced UI */}
      <div className="vechiles-section-heading">
        <h2>Available Buses</h2>
        <p>Choose from scheduled routes across Himachal Pradesh</p>
      </div>

      <div className="card-list vechiles">
        {getFilteredVehicles().map((vehicle) => (
          <div
            key={vehicle._id}
            className="card-container"
            onClick={() => focusVehicle(vehicle._id)}
          >
            <div className="vechile-card">
              <div className="card-badge">Available</div>
              <img
                src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80"
                alt="vehicleImg"
              />
              <div className="card-content">
                <div className="vechile-details">
                  <h3>Bus #{vehicle._id.slice(-4)}</h3>
                  <div className="vechile-location">
                    <div className="location-item">
                      <FaMapMarkerAlt className="location-icon source" />
                      <p>{vehicle.Start}</p>
                    </div>
                    <div className="location-arrow">→</div>
                    <div className="location-item">
                      <FaMapMarkerAlt className="location-icon destination" />
                      <p>{vehicle.End}</p>
                    </div>
                  </div>
                </div>
                <button className="view-details-btn">
                  <a href={`https://himraahi.in/himraahi/trip/${vehicle._id}`}>
                    View Details
                  </a>
                </button>
              </div>
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

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="Himraahi Logo" className="footer-logo-img" />
            <h3>Himraahi</h3>
          </div>
          <div className="footer-info">
            <p>© 2025 Himraahi - Real-time bus tracking for Himachal Pradesh</p>
          </div>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Vechile;
