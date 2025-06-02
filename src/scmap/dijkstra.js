/**
* @author Lianna Eeftinck / https://github.com/Leeft
*/

import { travelTimeForAU } from '../helpers/functions';
import StarSystem from './star-system';
// import settings from './settings'; // Will be replaced by routingSettings

class Dijkstra {
  constructor( systems, startSystem, endSystem, routingSettings, scmapInstance, mapConfig ) {
    if ( ! ( typeof systems === 'object' && Array.isArray( systems ) ) ) {
      console.error( `No systems array specified to Dijkstra constructor!` );
      return;
    }
    if ( ! ( startSystem instanceof StarSystem ) ) {
      console.error( `No valid startSystem specified to Dijkstra constructor!` );
      return;
    }
    if ( ! ( endSystem instanceof StarSystem ) ) {
      console.error( `No valid endSystem specified to Dijkstra constructor!` );
      return;
    }

    this.start = startSystem;
    this.end = endSystem;
    this.routingSettings = routingSettings || {};
    this.scmapInstance = scmapInstance; // May be needed for more complex checks later
    this.mapConfig = mapConfig || {};

    // Default routing settings if not provided
    this.routingSettings.avoidUnknownJumppoints = this.routingSettings.avoidUnknownJumppoints !== undefined ? this.routingSettings.avoidUnknownJumppoints : true;
    this.routingSettings.avoidHostile = this.routingSettings.avoidHostile !== undefined ? this.routingSettings.avoidHostile : true;
    this.routingSettings.avoidOffLimits = this.routingSettings.avoidOffLimits !== undefined ? this.routingSettings.avoidOffLimits : true;
    this.routingSettings.usersFaction = this.routingSettings.usersFaction || null; // Expects a Faction object or null
    this.routingSettings.systemsToAvoid = this.routingSettings.systemsToAvoid || []; // Expects array of system IDs

    // First build a list of all nodes in the graph and
    // map them by system.id so they can be found quickly
    this._nodes = [];
    this._mapping = {}; // system.id to _nodes map

    let i = systems.length;
    while( i-- ) {
      this._nodes[ i ] = {
        system:   systems[ i ],
        distance: Number.POSITIVE_INFINITY,
        previous: null
      };
      this._mapping[ systems[ i ].id ] = this._nodes[ i ];
    }

    this._result = {};
  }

  buildGraph ( priority = 'time', forceUpdate = false ) {
    let nodes, i, distance, system, currentNode, jumpPoint,
        otherNode, endTime, startTime = new Date();
    // let distAU; // Not used

    if ( ! ( this.start instanceof StarSystem ) ) { throw new Error( `Dijkstra: No source system given` ); }
    if ( ! ( this.end instanceof StarSystem )   ) { throw new Error( `Dijkstra: No or invalid destination system given` ); }

    this._result.destination = this.end;
    // TODO: expiry, map may have changed
    if ( !forceUpdate && this._result.source instanceof StarSystem && this._result.source === this.start && this._result.priority === priority ) {
      return;
    }

    this.destroyGraph();
    this._result.source = this.start;
    this._result.destination = this.end;
    this._result.priority = priority;

    for ( i = 0; i < this._nodes.length; i++ ) {
      this._nodes[ i ].distance = Number.POSITIVE_INFINITY;
      this._nodes[ i ].previous = null;
    }

    currentNode = this._mapping[ this.start.id ];
    currentNode.distance = 0;
    currentNode.previous = null;

    nodes = Dijkstra.quickSort( this._nodes );

    while ( nodes.length ) {
      currentNode = nodes[0];

      if ( currentNode.system === this.end ) {
        break;
      }

      nodes.splice( 0, 1 );

      if ( Dijkstra.isInfinite( currentNode.distance ) ) {
        break;
      }

      for ( i = 0; i < currentNode.system.jumpPoints.length; i++ ) {
        jumpPoint = currentNode.system.jumpPoints[i];
        otherNode = this._mapping[ jumpPoint.destination.id ];

        if ( jumpPoint.isUnconfirmed() && this.routingSettings.avoidUnknownJumppoints ) {
          continue;
        }

        if ( !this.isStartOrEnd( otherNode.system ) ) {
          if ( this.routingSettings.avoidHostile &&
               this.routingSettings.usersFaction && // Ensure usersFaction is set
               currentNode.system.faction && // Ensure current system has a faction
               !currentNode.system.faction.isHostileTo( this.routingSettings.usersFaction ) &&
               otherNode.system.faction && // Ensure other system has a faction
               otherNode.system.faction.isHostileTo( this.routingSettings.usersFaction ) ) {
            continue;
          }

          if ( this.routingSettings.avoidOffLimits && otherNode.system.isOffLimits ) {
            continue;
          }

          // Check against systemsToAvoid list (using system IDs)
          if ( this.routingSettings.systemsToAvoid.includes(otherNode.system.id) &&
              (!currentNode.system || !this.routingSettings.systemsToAvoid.includes(currentNode.system.id)) // only if current is not also avoided
          ) {
            continue;
          }
        }

        distance = currentNode.distance + jumpPoint.jumpTime();

        const travelTimePerAU = this.mapConfig.approximateTraveltimePerAU || ( ( 8 * 60 ) + 19 ) * 5; // Fallback if not in config

        if ( currentNode.previous === null ) { // Start of route from source system
          distance += travelTimeForAU( 0.35, travelTimePerAU ); // FIXME: Magic number 0.35 AU
        } else { // Mid-route, from one jump point to another via a system
          distance += travelTimeForAU( 0.7, travelTimePerAU ); // FIXME: Magic number 0.7 AU
        }

        if ( this.routingSettings.avoidHostile &&
             this.routingSettings.usersFaction &&
             otherNode.system.faction &&
             otherNode.system.faction.isHostileTo( this.routingSettings.usersFaction ) ) {
          distance *= 15; // Penalty for hostile systems
        }

        if ( distance < otherNode.distance ) {
          otherNode.distance = distance;
          otherNode.previous = currentNode;
          nodes = Dijkstra.quickSort( nodes ); // Re-sort nodes based on new distances
        }
      }
    }

    this._result.nodes = nodes; // Remaining nodes (should be empty if target found and optimal)
    this._result.priority = priority;
    endTime = new Date();
    // console.log( `Graph building for ${this.start.name} to ${this.end.name} took ` + (endTime.getTime() - startTime.getTime()) + ' msec' );
  }

  isStartOrEnd ( system ) {
    if ( ! ( system instanceof StarSystem ) ) {
      return false;
    }

    return( system === this.start || system === this.end );
  }

  firstNode () {
    let routeArray = this.routeArray();
    return routeArray[ 0 ];
  }

  lastNode () {
    let routeArray = this.routeArray();
    return routeArray[ routeArray.length - 1 ];
  }

  source () {
    if ( this.start instanceof StarSystem ) {
      return this.start;
    }
  }

  destination () {
    if ( this.end instanceof StarSystem ) {
      return this.end;
    }
  }

  rebuildGraph () {
    //console.log( 'rebuildGraph from', source, 'to', destination );
    this.destroyGraph();

    if ( this.start instanceof StarSystem ) {
      this.buildGraph( 'time', true );
      return true;
    }
  }

  destroyGraph () {
    this._result = {};
  }

  routeArray ( destination ) {
    if ( ! ( destination instanceof StarSystem ) ) {
      if ( ! ( this._result.destination instanceof StarSystem ) ) {
        console.error( 'No or invalid destination specified.' );
        return;
      }
      destination = this._result.destination;
    }

    if ( this._result.nodes.length > 0 ) {
      // Get path and print it out, we're traversing backwards
      // through the optimal path for the destination
      let visited = [];
      let x = this._mapping[ destination.id ];
      let seen = {};
      while ( x !== null ) {
        seen[ x.system.name ] = true;
        visited.push( x );
        x = x.previous;
      }
      visited.reverse();
      return visited;
    }
  }

  static quickSort ( nodes ) {
    // makes a copy, prevents overwriting
    let array = [];
    let i = nodes.length;
    while( i-- ) {
      array[ i ] = nodes[ i ];
    }

    if ( array.length <= 1 ) {
      return array;
    }

    let lhs = [];
    let rhs = [];
    let pivot = Math.ceil( array.length / 2 ) - 1;

    pivot = array.splice( pivot, 1 )[ 0 ];

    for ( i = 0; i < array.length; i++ ) {
      if ( array[ i ].distance <= pivot.distance ) {
        lhs.push( array[ i ] );
      } else {
        rhs.push( array[ i ] );
      }
    }

    let t1 = Dijkstra.quickSort( lhs );
    let t2 = Dijkstra.quickSort( rhs );

    t1.push( pivot );
    return t1.concat( t2 );
  }

  static isInfinite ( num ) {
    return !isFinite( num );
  }
}

export default Dijkstra;
