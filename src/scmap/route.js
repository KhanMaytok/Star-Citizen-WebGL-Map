/**
  * @author Lianna Eeftinck / https://github.com/Leeft
  */

// import SCMAP from './../scmap'; // Will use scmapInstance passed in constructor
import StarSystem from './star-system';
import Dijkstra from './dijkstra';
import { hasSessionStorage } from '../helpers/functions';
// import { scene, map } from '../starcitizen-webgl-map'; // UI/Three.js concerns
// import JumpRouteGeometry from './map/geometry/jump-route-geometry'; // UI/Three.js concerns
// import RouteUI from './ui/route'; // UI concerns

class Route {
  constructor ( startSystem, waypointsArray, scmapInstance, routingSettings, mapConfig ) {
    this.scmapInstance = scmapInstance;
    this.routingSettings = routingSettings;
    this.mapConfig = mapConfig;

    this.start = ( startSystem instanceof StarSystem ) ? startSystem : null;
    this.waypoints = []; // Array of StarSystem instances
    this._graphs = []; // Array of Dijkstra instances, each representing a segment
    // this._routeObject = undefined; // Removed - UI concern
    this._error = undefined; // Stores any error from graph building

    if ( waypointsArray instanceof StarSystem ) {
      waypointsArray = [ waypointsArray ];
    }

    if ( Array.isArray( waypointsArray ) ) {
      waypointsArray.forEach( waypoint => {
        if ( waypoint instanceof StarSystem ) {
          this.waypoints.push( waypoint );
        }
      });
    }

    this.__syncGraphs();
  }

  // Find the first matching graph or pair of graphs for the given
  // waypoint. Returns two graphs if the waypoint lies on the end
  // of one and the start of another
  __findGraphs ( system ) {
    let graphs = [];
    let seen = {};

    for ( let i = 0, graphsLength = this._graphs.length; i < graphsLength; i += 1 )
    {
      const graph = this._graphs[ i ];

      let routeArray = [];
      try {
        routeArray = graph.routeArray();
      } catch ( e ) {
        console.error( `Error getting route array: ${ e.message }` );
      }

      if ( graphs.length ) {
        if ( routeArray[0].system.id === system.id ) {
          graphs.push( graph );
          return graphs;
        }
      }

      routeArray.forEach( waypoint => {
        if ( waypoint.system === system && ! ( seen[ waypoint.system.id ] ) ) {
          seen[ waypoint.system.id ] = true;
          graphs.push( graph );
        }
      });
    }

    return graphs;
  }

  splitAt ( waypoint ) {
    const graphs = this.__findGraphs( waypoint );

    if ( graphs.length > 1 ) {
      console.error( `Can't split at '${ waypoint.name }', graphs are already split` );
      return false;
    }

    if ( graphs.length !== 1 ) {
      console.error( `Couldn't find graph for waypoint '${ waypoint.name }'` );
      return false;
    }

    const graph = graphs[0];
    const oldEnd = graph.lastNode().system;

    graph.end = waypoint; // set end of graph to wp

    for ( let i = 0, graphsLength = this._graphs.length; i < graphsLength; i += 1 )
    {
      if ( this._graphs[i] === graph ) {
        // insert new graph at wp, starting at wp, ending at oldEnd
        if (!this.scmapInstance) {
            console.error("Cannot split graph: scmapInstance is not available.");
            return false;
        }
        this._graphs.splice( i + 1, 0, new Dijkstra( this.scmapInstance.allSystems, waypoint, oldEnd, this.routingSettings, this.scmapInstance, this.mapConfig ) );

        for ( let j = 0; j < this.waypoints.length; j += 1 ) {
          if ( this.waypoints[j] === oldEnd ) {
            this.waypoints.splice( j, 0, waypoint );
            break;
          }
        }

        this.__syncGraphs();
        this.storeToSession();
        return true;
      }
    }

    console.error( `Couldn't match graph to split` );
    return false;
  }

  toString () {
    const result = [];

    if ( this.start instanceof StarSystem ) {
      result.push( this.start.toString() );
    }

    this.waypoints.forEach( system => {
      if ( system instanceof StarSystem ) {
        result.push( system.toString() );
      }
    });

    return result.join( ' > ' );
  }

  removeWaypoint ( toRemove ) {
    const graphs = this.__findGraphs( toRemove );

    if ( graphs.length !== 2 ) {
      // console.error( `Can't remove waypoint '${ toRemove.name }', it is not a waypoint or is a terminal point.` );
      return false;
    }

    const [ graphOne, graphTwo ] = graphs;

    // The end of the first graph should now connect to the end of the second graph
    graphOne.end = graphTwo.destination; // graphTwo.end is a system, not a graph node.

    // Remove graphTwo from _graphs array
    const indexToRemove = this._graphs.indexOf(graphTwo);
    if (indexToRemove > -1) {
        this._graphs.splice(indexToRemove, 1);
    }

    // Remove the waypoint from this.waypoints array
    const waypointIndexToRemove = this.waypoints.indexOf(toRemove);
    if (waypointIndexToRemove > -1) {
        this.waypoints.splice(waypointIndexToRemove, 1);
    }

    this.__syncGraphs(); // Re-sync to rebuild graphOne with its new end
    this.storeToSession();
    return true;
  }

  moveWaypoint ( waypoint, destination ) {
    if ( waypoint === destination ) {
      return false;
    }

    if ( destination === this.start || this.waypoints.indexOf( destination ) >= 0 ) {
      // console.warn("Cannot move waypoint to start or an existing waypoint in the route.");
      return false;
    }

    // Easy case, moving start: update start and sync
    if ( waypoint === this.start ) {
      if ( this.waypoints.length === 1 && destination === this.waypoints[0] ) { // Prevent moving start to be the same as the only waypoint
        return false;
      }
      this.start = destination;
      this.__syncGraphs();
      this.storeToSession();
      return true;
    }

    // Slightly more difficult, moving any waypoint: update waypoint and sync
    let index = this.waypoints.indexOf( waypoint );
    if ( index > -1 ) {
      this.waypoints[ index ] = destination;
      this.__syncGraphs();
      this.storeToSession();
      return true;
    }
    
    // If waypoint is not the start and not in waypoints, it might be a system within a segment.
    // This case requires splitting the graph at 'waypoint', then effectively replacing 'waypoint' with 'destination'.
    if (this.splitAt(waypoint)) { // This action adds 'waypoint' to this.waypoints
        index = this.waypoints.indexOf(waypoint); // Find the newly added waypoint
        if (index > -1) {
            this.waypoints[index] = destination; // Replace it with the actual destination
            this.__syncGraphs();
            this.storeToSession();
            return true;
        }
    }

    // console.error( `Couldn't find waypoint '${ waypoint.name }' to move or failed to split graph.` );
    return false;
  }

  setRoute ( ...systems ) {
    if (systems.length === 0) {
        this.start = null;
        this.waypoints = [];
    } else {
        const newStart = systems.shift();
        this.start = (newStart instanceof StarSystem) ? newStart : null;
        this.waypoints = systems.filter(s => s instanceof StarSystem);
    }

    this.__syncGraphs();
    this.storeToSession();
  }

  // Updates the graphs to match the current waypoints, and recalculates
  // the graphs where needed
  __syncGraphs () {
    if (!this.scmapInstance) {
      this._error = new Error("SCMAP instance not available for graph synchronization.");
      console.error(this._error.message);
      this._graphs = []; // Clear graphs if scmapInstance is missing
      return;
    }
    if (!this.scmapInstance.allSystems || this.scmapInstance.allSystems.length === 0) {
        this._error = new Error("No systems loaded in SCMAP instance for graph synchronization.");
        // console.warn(this._error.message); // Potentially noisy if called before systems are loaded
        this._graphs = [];
        return;
    }


    const newGraphs = [];
    this._error = undefined;

    try {
      // Determine the sequence of stops: start system followed by all waypoints.
      const allStops = [];
      if (this.start instanceof StarSystem) {
        allStops.push(this.start);
      }
      this.waypoints.forEach(wp => {
        if (wp instanceof StarSystem) {
          allStops.push(wp);
        }
      });

      if (allStops.length < 2) { // Need at least two systems to form a segment
        this._graphs = [];
        return;
      }

      for ( let i = 0; i < allStops.length - 1; i += 1 ) {
        const segmentStart = allStops[i];
        const segmentEnd   = allStops[i+1];

        const graph = new Dijkstra( this.scmapInstance.allSystems, segmentStart, segmentEnd, this.routingSettings, this.scmapInstance, this.mapConfig );
        graph.buildGraph( 'time', true ); // forceUpdate = true
        newGraphs.push( graph );

        // Check if the route segment is valid (more than just the start system)
        const routeArray = graph.routeArray(); // Get the calculated path for this segment
        if ( !routeArray || (routeArray.length <= 1 && segmentStart !== segmentEnd) ) {
          console.warn( `No route from ${ segmentStart.name } to ${ segmentEnd.name } possible` );
          throw new RouteSegmentFailed( `No route from ${ segmentStart.name } to ${ segmentEnd.name } available` );
        }
      }
      this._graphs = newGraphs;
    }
    catch ( e ) {
      this._error = e;
      if ( !( e instanceof RouteSegmentFailed ) ) {
        // console.error( `Error building route: ${ e.message }`, e);
      }
    }
  }

  lastError () {
    return this._error;
  }

  isSet () {
    return this.currentRoute().length > 1;
  }

  currentRoute () {
    const route = [];
    if (this._graphs.length === 0) {
        // If there's a start system but no waypoints (so no graphs), the route is just the start system.
        if (this.start instanceof StarSystem) {
            route.push({ system: this.start, distance: 0, previous: null }); // Mimic Dijkstra node
        }
        return route;
    }

    this._graphs.forEach((graph, index) => {
        const segmentPath = graph.routeArray(); // routeArray() uses graph's own destination
        if (segmentPath && segmentPath.length > 0) {
            // Avoid duplicating connection points between segments
            const startIndex = (index > 0 && route.length > 0 && route[route.length - 1].system === segmentPath[0].system) ? 1 : 0;
            for (let j = startIndex; j < segmentPath.length; j++) {
                route.push(segmentPath[j]);
            }
        }
    });
    return route;
  }

  // Returns a float 0.0 to 1.0 to indicate where 'system' is in 'routePath'
  // 'routePath' is expected to be an array of Dijkstra-like nodes { system, ... }
  alphaOfSystem ( system, routePath ) {
    if (!routePath || routePath.length === 0) return 0;
    const currentStep = this.indexOfSystemInRoute( system, routePath );

    if ( currentStep > -1 && routePath.length > 1 ) {
      return ( currentStep / ( routePath.length - 1 ) ); // Normalize from 0 to 1
    }
    return 0;
  }

  // Finds index of 'system' in 'routePath' (array of Dijkstra-like nodes)
  indexOfSystemInRoute ( system, routePath ) {
    if ( !(system instanceof StarSystem) || !Array.isArray(routePath) ) {
      return -1;
    }
    for (let i = 0; i < routePath.length; i++) {
      if (routePath[i].system === system) {
        return i;
      }
    }
    return -1;
  }

  rebuildCurrentRoute () {
    // this.removeFromScene(); // Removed - UI concern
    this._graphs.forEach( graph => {
      graph.rebuildGraph(); // This internally calls buildGraph(..., true)
    });
    this.update(); // Ensures graphs are synced and consistent after individual rebuilds
  }

  destroy () {
    this.start = null;
    this.waypoints = [];
    this.__syncGraphs(); // This will clear _graphs as allStops will be < 2
    this.storeToSession(); // Update session storage to reflect cleared route
  }

  // Removed removeFromScene method

  update () {
    // const before = this.toString(); // For debugging
    this.__syncGraphs();
    // UI update logic (like RouteUI.update(this)) is removed.
    // The state of the route is now self-contained.
    // Consumers of this class would typically call currentRoute() after an update.
    // if (this.lastError()) {
    //   console.warn("Route update resulted in an error:", this.lastError());
    // }
  }

  storeToSession () {
    if ( !hasSessionStorage() ) return;

    const routeData = { start: null, waypoints: [] };
    if (this.start instanceof StarSystem) {
        routeData.start = this.start.id;
    }
    routeData.waypoints = this.waypoints
        .filter(wp => wp instanceof StarSystem) // Ensure only valid systems are stored
        .map(waypoint => waypoint.id);

    if (routeData.start || routeData.waypoints.length > 0) {
        window.sessionStorage.currentRoute = JSON.stringify(routeData);
    } else {
        delete window.sessionStorage.currentRoute;
    }
  }

  restoreFromSession ( scmapInstance ) {
    if ( !hasSessionStorage() || !( 'currentRoute' in window.sessionStorage ) ) {
      return;
    }
    if (!scmapInstance) {
        console.error("SCMAP instance not provided to restoreFromSession.");
        return;
    }
    
    this.scmapInstance = scmapInstance; // Ensure scmapInstance is set for getById calls

    try {
      const data = JSON.parse( window.sessionStorage.currentRoute );
      this.start = data.start ? StarSystem.getById( data.start, this.scmapInstance ) : null;
      this.waypoints = data.waypoints
        .map( waypointId => StarSystem.getById( waypointId, this.scmapInstance ) )
        .filter(system => system instanceof StarSystem); // Ensure all are valid StarSystem instances

      this.__syncGraphs(); // Rebuild graphs based on restored data
    } catch (e) {
      console.error("Error restoring route from session storage:", e);
      delete window.sessionStorage.currentRoute; // Clear corrupted data
      this.start = null;
      this.waypoints = [];
      this.__syncGraphs(); // Ensure graphs are cleared
    }
  }
}

function RouteSegmentFailed( message ) {
  this.message = message;
  this.name = 'RouteSegmentFailed';
}
RouteSegmentFailed.prototype = new Error();
RouteSegmentFailed.prototype.constructor = RouteSegmentFailed;

export default Route;
