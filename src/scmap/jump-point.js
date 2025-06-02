/**
* @author Lianna Eeftinck / https://github.com/Leeft
*/

import StarSystem from './star-system';
// import { Vector3 } from './three'; // Using plain objects for position

// Helper function for distance calculation
function calculateDistance(pos1, pos2) {
  if (!pos1 || !pos2) return 0;
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

class JumpPoint {
  constructor( data, scmapInstance, config ) { // Added scmapInstance, config
    this.scmapInstance = scmapInstance; // Store if needed, may not be used directly
    this.config = config; // Store if needed

    // this.id = data.id; // Assuming data.id is passed (was data.jumpPointId in StarSystem)
    this.id = data.id;
    this.name = ( typeof data.name === 'string' && data.name.length > 1 ) ? data.name : undefined;
    this.source = ( data.source instanceof StarSystem ) ? data.source : undefined;
    this.destination = ( data.destination instanceof StarSystem ) ? data.destination : undefined;
    // this.drawn = false; // Removed
    this.type = ( typeof data.type === 'string' ) ? data.type : 'UNDISC';
    this.size = ( typeof data.size === 'string' ) ? data.size : 'S';
    this.status = ( typeof data.status === 'string' ) ? data.status : 'P';
    this.direction = ( typeof data.direction === 'string' ) ? data.direction : 'S';

    this.entryAU = { x:0, y:0, z:0 };
    if ( Array.isArray( data.entryAU ) && data.entryAU.length === 3 ) {
      this.entryAU = { x: data.entryAU[0], y: data.entryAU[1], z: data.entryAU[2] };
    } else if (typeof data.entryAU === 'object' && data.entryAU !== null) {
      this.entryAU = { ...data.entryAU };
    }

    if ( !this.isValid() ) {
      console.warn( `Invalid JumpPoint created`, this, data );
    } else {
      if ( this.name === undefined || this.name === '' ) {
        this.name = `[${ this.source.name } to ${ this.destination.name }]`;
      }
    }
  }

  get distanceInLY () {
    if ( !this.isValid() ) { return 0; }
    return calculateDistance(this.source.position, this.destination.position);
  }

  length () {
    if ( !this.isValid() ) { return 0; }
    return calculateDistance(this.source.position, this.destination.position);
  }

  jumpTime () {
    if ( !this.isValid() ) { return 0; }
    // TODO FIXME: This is a rough guesstimate on how long it will take
    // to travel a JP, and not based in any facts ... no word from devs
    // on this so far.
    return this.length() * 4; // 2 mins for 30LY, ~Sol to Vega (27LY)
  }

  fuelConsumption () {
    if ( !this.isValid() ) { return 0; }
    // TODO: Devs have stated that JP's don't consume fuel to traverse.
    // If that changes, this needs to be quantified and fixed.
    return 0;
  }

  getOppositeJumppoint () {
    if (!this.destination || !this.destination.jumpPoints) return undefined;
    for ( let i = 0; i < this.destination.jumpPoints.length; i++ ) {
      const jumppoint = this.destination.jumpPoints[i];
      if ( jumppoint.destination === this.source ) {
        return jumppoint;
      }
    }
    return undefined;
  }

  isValid () {
    return !!(
      ( this.source instanceof StarSystem ) &&
      ( this.destination instanceof StarSystem ) &&
      ( this.source !== this.destination )
    );
  }

  isUnconfirmed () {
    return ( ( this.type === 'UNCONF' ) || ( this.type === 'UNDISC' ) );
  }

  // Removed setDrawn method
}

export default JumpPoint;
