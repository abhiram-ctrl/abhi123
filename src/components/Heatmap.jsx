import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { heatmapPaint } from '../features/heatmap';
import { getDistanceKm, getNearbyLocations } from '../services/locationService';
import './HeatMap.css';

const HeatMap = ({ 
  mode = 'citizen', // 'citizen' | 'volunteer' | 'admin'
  incidents = [],
  volunteers = [],
  helpers = [],
  height = '100vh'
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userMarkerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [78.5, 17.4], // India center
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.on('load', () => setLoading(false));

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  // Request user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Location services not available');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        if (map.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 13 });
        }
      },
      (err) => {
        setError('Location permission denied. Please enable location access.');
        console.error('Location error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Add user marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.background = '#007aff';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 8px rgba(0,122,255,0.6)';
    el.style.cursor = 'pointer';

    userMarkerRef.current = new maplibregl.Marker(el)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
  }, [userLocation]);

  // Add incidents to map
  useEffect(() => {
    if (!map.current || loading || !incidents || incidents.length === 0) return;

    const incidentsGeoJSON = {
      type: 'FeatureCollection',
      features: incidents.map(incident => {
        const lng = incident.lng !== undefined ? incident.lng : (incident.location?.lng || incident.location?.coordinates?.[0] || 0);
        const lat = incident.lat !== undefined ? incident.lat : (incident.location?.lat || incident.location?.coordinates?.[1] || 0);
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: incident.id || incident._id,
            title: incident.title || incident.description || 'Incident',
            severity: incident.severity || incident.priority || 3,
            status: incident.status || 'open'
          }
        };
      })
    };

    if (map.current.getSource('incidents')) {
      map.current.getSource('incidents').setData(incidentsGeoJSON);
    } else {
      map.current.addSource('incidents', {
        type: 'geojson',
        data: incidentsGeoJSON,
        cluster: true,
        clusterRadius: 50
      });

      // Add heatmap layer
      map.current.addLayer({
        id: 'incidents-heat',
        type: 'heatmap',
        source: 'incidents',
        paint: heatmapPaint
      });

      // Add clusters
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'incidents',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#f28cb1',
          'circle-radius': 20,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2
        }
      });

      // Add unclustered incident points
      map.current.addLayer({
        id: 'incident-points',
        type: 'circle',
        source: 'incidents',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#ff3b30',
          'circle-radius': 8,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2
        }
      });
    }
  }, [incidents, loading]);

  // Add volunteers to map
  useEffect(() => {
    if (!map.current || loading || !volunteers || volunteers.length === 0) return;

    const volunteersGeoJSON = {
      type: 'FeatureCollection',
      features: volunteers.map(volunteer => {
        const lng = volunteer.lng !== undefined ? volunteer.lng : (volunteer.location?.lng || volunteer.location?.coordinates?.[0] || 0);
        const lat = volunteer.lat !== undefined ? volunteer.lat : (volunteer.location?.lat || volunteer.location?.coordinates?.[1] || 0);
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: volunteer.id || volunteer._id,
            name: volunteer.name || 'Volunteer',
            status: volunteer.status || 'available'
          }
        };
      })
    };

    if (map.current.getSource('volunteers')) {
      map.current.getSource('volunteers').setData(volunteersGeoJSON);
    } else {
      map.current.addSource('volunteers', {
        type: 'geojson',
        data: volunteersGeoJSON
      });

      map.current.addLayer({
        id: 'volunteer-points',
        type: 'circle',
        source: 'volunteers',
        paint: {
          'circle-color': '#2ecc71',
          'circle-radius': 8,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2
        }
      });
    }
  }, [volunteers, loading]);

  // Add helpers (for citizen view)
  useEffect(() => {
    if (!map.current || loading || !helpers || helpers.length === 0) return;

    const helpersGeoJSON = {
      type: 'FeatureCollection',
      features: helpers.map(helper => {
        const lng = helper.lng !== undefined ? helper.lng : (helper.location?.lng || helper.location?.coordinates?.[0] || 0);
        const lat = helper.lat !== undefined ? helper.lat : (helper.location?.lat || helper.location?.coordinates?.[1] || 0);
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: helper.id || helper._id,
            name: helper.name || 'Helper',
            type: helper.type || 'helper'
          }
        };
      })
    };

    if (map.current.getSource('helpers')) {
      map.current.getSource('helpers').setData(helpersGeoJSON);
    } else {
      map.current.addSource('helpers', {
        type: 'geojson',
        data: helpersGeoJSON
      });

      map.current.addLayer({
        id: 'helper-points',
        type: 'circle',
        source: 'helpers',
        paint: {
          'circle-color': '#f39c12',
          'circle-radius': 8,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2
        }
      });
    }
  }, [helpers, loading]);

  return (
    <div className="heatmap-container">
      <div ref={mapContainer} className="heatmap-canvas" style={{ height }} />
      
      {error && (
        <div className="heatmap-error-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="heatmap-legend">
        <div className="legend-item">
          <span className="legend-color incident-color"></span>
          <span>Incidents</span>
        </div>
        <div className="legend-item">
          <span className="legend-color volunteer-color"></span>
          <span>Volunteers</span>
        </div>
        <div className="legend-item">
          <span className="legend-color helper-color"></span>
          <span>Helpers</span>
        </div>
        <div className="legend-item">
          <span className="legend-color user-color"></span>
          <span>You</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
