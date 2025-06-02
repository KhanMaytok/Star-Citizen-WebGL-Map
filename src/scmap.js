/**
  * @author Lianna Eeftinck / https://github.com/Leeft
  **/

import StarSystem from './scmap/star-system';
import Faction from './scmap/faction';
import Goods from './scmap/goods';
import { humanSort } from './helpers/functions';

const MAPREVISION = 5;

class SCMAP {
  constructor (config) {
    this.config = config;
    this.data = {
      systems: {},
      systemsById: {},
      factions: {},
      crimeLevels: {},
      ueeStrategicValues: {},
      commodities: {},
      allSystems: [],
    };
  }

  get REVISION () {
    return MAPREVISION;
  }

  importStarSystems ( json ) {
    const systems = [];

    // First build basic objects to make them all known
    // (this will also initialise any jumppoints it can)
    for ( let systemName in json ) {
      // Pass scmapInstance (this) and config to fromJSON
      const system = StarSystem.fromJSON( json[ systemName ], this, this.config );
      this.data.systems[ system.name ]     = system;
      this.data.systemsById[ system.id ]   = system;
      this.data.systemsById[ system.uuid ] = system;
      systems.push( system );
    }

    // Now go through the built objects again, fixing any leftover jumppoint data
    // _fixJumpPoints now needs scmapInstance and config
    systems.forEach( system => {
      if (system && system._fixJumpPoints) { // Ensure system and method exist
        system._fixJumpPoints( system.jumpPoints, true, this, this.config );
      }
    });

    // And provide them in a "human friendly" sort order
    this.data.allSystems = SCMAP.SortSystemList( systems );
  }

  getStarSystemByName ( name ) {
    return this.data.systems[ name ];
  }

  getStarSystemById ( id ) {
    return this.data.systemsById[ id ];
  }

  get allSystems () {
    return this.data.allSystems;
  }


  static SortSystemList ( systems ) {
    const array = [];
    let i = systems.length;
    while( i-- ) {
      array[i] = systems[i];
    }
    return array.sort( humanSort );
  }

  importFactions ( json ) {
    const factions = [];

    for ( let factionId in json ) {
      const data = json[ factionId ];
      const faction = new Faction({
        id: data.id,
        name: data.name,
        color: data.color, // Store as string, let rendering layer handle Three.Color
        isRealFaction: data.isActualFaction,
        parentFaction: data.parentFaction,
      });
      this.data.factions[ data.id ] = faction;
      factions.push( faction );
    }

    factions.forEach( faction => {
      if ( faction.parentFaction ) {
        faction.parentFaction = this.data.factions[ faction.parentFaction ];
      }
    });
  }

  getFactionById ( id ) {
    let faction = this.data.factions[ id ];
    if ( ! ( faction instanceof Faction ) ) {
      faction = this.data.factions.UCLM;
    }
    return faction;
  }

  importCommodities ( json ) {
    for ( let commodityId in json ) {
      const data = json[ commodityId ];
      this.data.commodities[ data.id ] = new Goods({
        id: data.id,
        name: data.name,
        blackMarket: data.blackMarket,
      });
    }
  }

  getCommodityById ( id ) {
    return this.data.commodities[ id ];
  }

  importUEEStrategicValues( json ) {
    this.data.ueeStrategicValues = json;
  }

  getUEEStrategicValueById( id ) {
    return this.data.ueeStrategicValues[ id ];
  }

  importCrimeLevels( json ) {
    this.data.crimeLevels = json;
  }

  getCrimeLevelById( id ) {
    return this.data.crimeLevels[ id ];
  }
}

export default SCMAP;
