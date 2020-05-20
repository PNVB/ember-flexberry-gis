import Ember from 'ember';
import rhumbOperations from '../utils/rhumb-operations';
import { getLeafletCrs } from '../utils/leaflet-crs';
import jsts from 'npm:jsts';

export default Ember.Mixin.create(rhumbOperations, {

  /**
    Add object to layer.

    @method addObjectToLayer
    @param {string} layerId Layer ID.
    @param {string} crsName Name of coordinate reference system, in which to give coordinates.
    @param {Object} object Object.
    Example:
    var object = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
        },
      properties: {
        name: 'test_polygon'
      }
    };
    @returns {Object} New featureLayer.
  */
  addObjectToLayer(layerId, object, crsName) {
    if (Ember.isNone(object)) {
      throw new Error('Passed object is null.');
    }

    let [layer, leafletObject] = this._getModelLeafletObject(layerId);

    if (Ember.isNone(layer)) {
      throw new Error('No layer with such id.');
    }

    let crs = leafletObject.options.crs;
    if (!Ember.isNone(crsName)) {
      crs = getLeafletCrs('{ "code": "' + crsName.toUpperCase() + '", "definition": "" }', this);
    }

    let coordsToLatLng = function(coords) {
      return crs.unproject(L.point(coords));
    };

    let geoJSON = null;
    if (crs.code !== 'EPSG:4326') {
      geoJSON = L.geoJSON(object, { coordsToLatLng: coordsToLatLng.bind(this) });
    } else {
      geoJSON = L.geoJSON(object);
    }

    let newObj = geoJSON.getLayers()[0];

    leafletObject.addLayer(newObj);

    newObj.layerId = layerId;

    return newObj;
  },

  /**
    Create multi-circuit object.

    @method createMulti
    @param {array} objects Array of objects to union.
    Example:
    var objects = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  56.18425369262695,
                  58.07197581354065
                ],
                [
                  56.210689544677734,
                  58.07197581354065
                ],
                [
                  56.210689544677734,
                  58.07987312382643
                ],
                [
                  56.18425369262695,
                  58.07987312382643
                ],
                [
                  56.18425369262695,
                  58.07197581354065
                ]
              ]
            ]
          },
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          }
        },
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  56.19712829589844,
                  58.067708723599544
                ],
                [
                  56.22322082519531,
                  58.067708723599544
                ],
                [
                  56.22322082519531,
                  58.075516203173024
                ],
                [
                  56.19712829589844,
                  58.075516203173024
                ],
                [
                  56.19712829589844,
                  58.067708723599544
                ]
              ]
            ]
          },
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          }
        }
      ]
    }
    @returns {Object} new multi-circuit object.
  */
  createMulti(objects)
  {
    let geojsonReader = new jsts.io.GeoJSONReader();
    let geojsonWriter = new jsts.io.GeoJSONWriter();  
    let geometries = [];
    let separateObjects = [];
    let resultObject = null;

    if (objects.length === 0) {
      throw 'error: data is empty';
    } else if (objects.length === 1) {
      return objects[0];
    }

    for (var i = 0; i < objects.length; i++)
    {
      objects[i] = objects[i].crs.properties.name === 'EPSG:4326' ? objects[i] : this._convertObjectCoordinates(objects[i].crs.properties.name, objects[i]);  
    }

    //read the geometry of features
    for (var i=0; i < objects.length; i++)
    {
      geometries.push(geojsonReader.read(objects[i].geometry))
      if (i != 0 && geometries[i].getGeometryType() != geometries[i-1].getGeometryType())
        throw 'error: type mismatch. Objects must have the same type';
    }

    //check the intersections and calculate the difference between objects
    for (var i = 0; i < geometries.length; i++) {
      let current = geometries[i];
      for (var j = 0; j < geometries.length; j++) {
        if (i !== j) {
          if (geometries[i].intersects(geometries[j])) {
            current = current.difference(geometries[j]);
          }
        }
      }
      separateObjects.push(current);
    }

    //union the objects
    separateObjects.forEach(function(element, i) {
      if (i === 0) { resultObject = element; }
      else {resultObject = resultObject.union(element); }
    });

    let unionres = geojsonWriter.write(resultObject);
    
    const multiObj = {
      type: 'Feature',
      geometry: {
        type: unionres.type,
        coordinates: unionres.coordinates
      },
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326'
        }
      }
    }

    //let result = mapApi.mapModel.addObjectToLayer('56f4b518-e375-4b24-be2f-88d48110c0a3', multiObj, multiObj.crs.properties.name);
    return multiObj;
  },

  /**
    Create polygon object by rhumb.

    @method createPolygonObjectRhumb
    @param {string} layerId Layer id.
    @param {Object} data Coordinate objects.
    Example:
    var data = {
          type: 'LineString',
          crs: 'EPSG:3857',
          properties: { name: 'test_polygon' },
          startPoint: [85, 79],
          skip:0,
          points: [
            { rhumb: 'ЮВ', angle: 86.76787457562546, distance: 8182.6375760837955 },
            { rhumb: 'СВ', angle: 79.04259420114585, distance: 8476.868426796427 },
            { rhumb: 'ЮЗ', angle: 86.0047147391561, distance: 16532.122718537685 }
          ]
        };
    @returns {Object} New polygon object.
  */
  createPolygonObjectRhumb(layerId, data) {
    let [, leafletObject] = this._getModelLeafletObject(layerId);
    const obj = this.createObjectRhumb(data, leafletObject.options.crs, this);

    let crs = leafletObject.options.crs;
    if (!Ember.isNone(data.crs)) {
      crs = getLeafletCrs('{ "code": "' + data.crs.toUpperCase() + '", "definition": "" }', this);
    }
    obj.crs = crs;
    
    return obj;
    //this.addObjectToLayer(layerId, obj, data.crs);
  }
});
