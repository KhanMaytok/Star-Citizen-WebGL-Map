/**
* @author Lianna Eeftinck / https://github.com/Leeft
*/

// import SCMAP from '../scmap'; // Removed: Appears unused and avoids potential circular dependency
import StarSystem from './star-system';
// import { Color } from './three'; // Removed: Decoupling from Three.js global

const DEFAULTS = {
  id: undefined,
  name: 'Unclaimed',
  isRealFaction: false,
  color: '#FFFFFF', // Stored as string
  parentFaction: null,
};

class Faction {
  constructor ( data ) {
    Object.assign( this, DEFAULTS, data );

    // Internals
    this._claimed = {
      systems: {}
    };
  }

  // get planeColor () { // Removed: Dependent on THREE.Color
  //   return this.color.clone().offsetHSL( 0, 0.5, 0 ).multiplyScalar( 0.20 );
  // }

  // get lineColor () { // Removed: Dependent on THREE.Color
  //   return this.color.clone().offsetHSL( 0, 0.05, -0.05 );
  // }


  claim ( system ) {
    if ( ! system instanceof StarSystem ) {
      throw new Error( `A faction can only claim ownership over a system` );
    }
    this._claimed.systems[ system.uuid ] = true;
    return this;
  }

  claimed ( system ) {
    if ( ! system instanceof StarSystem ) {
      throw new Error( `A faction can only test ownership over a system` );
    }
    return this._claimed.systems[ system.uuid ];
  }

  isHostileTo ( comparedTo ) {
    if ( !( comparedTo instanceof Faction ) ) {
      throw new Error( `Can only compare to other factions` );
    }
    // FIXME: more data in database, more logic here
    // rather than lots of hardcoding
    if ( comparedTo.name === 'Vanduul' ) {
      return ( this.name !== 'Vanduul' );
    } else {
      return ( this.name === 'Vanduul' );
    }
  }
}

export default Faction;
