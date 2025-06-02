/**
* @author Lianna Eeftinck / https://github.com/Leeft
*/

// import SCMAP from '../scmap'; // Will be passed via scmapInstance
import Faction from './faction'; // Assuming Faction is a data class now
import JumpPoint from './jump-point';
// import MapSymbols from './ui/symbols'; // UI concern
// import config from './config'; // Will be passed in
// import settings from './settings'; // State to be managed externally
// import { map } from '../starcitizen-webgl-map'; // UI/Three.js concern
// import { Color, Vector3 } from './three'; // Using plain objects/strings
// import { generateUUID } from './three/math'; // Using provided uuid or id

const UNSET_COLOR_STRING = '#80a0cc';

class StarSystem {
  constructor ( initialData = {}, scmapInstance, config ) {
    this.scmapInstance = scmapInstance;
    this.config = config;

    this.id = initialData.id || undefined;
    this.uuid = initialData.uuid || (initialData.name ? initialData.name.replace(/\s+/g, '-').toLowerCase() : undefined); // Basic UUID from name if not given
    this.name = initialData.name || 'Unknown System';
    this.description = initialData.description || '';
    this.nickname = initialData.nickname || '';
    this.position = initialData.position ? { ...initialData.position } : { x: 0, y: 0, z: 0 }; // Expects {x,y,z}
    this.faction = initialData.faction || null; // Expects Faction instance or ID to be resolved
    this.size = initialData.size || 'medium';
    this.jumpPoints = []; // Will be populated by _fixJumpPoints or fromJSON
    this.poi = initialData.poi || [];
    this.color = initialData.color || '#FFFFFF'; // Expects hex string
    this.planets = initialData.planets || 0;
    this.planetaryRotation = initialData.planetaryRotation || [];
    this.import = initialData.import || [];
    this.export = initialData.export || [];
    this.status = initialData.status || 'Unknown';
    this.crimeStatus = initialData.crimeStatus || ''; // Expects resolved string or ID
    this.blackMarket = initialData.blackMarket || [];
    this.ueeStrategicValue = initialData.ueeStrategicValue || undefined; // Expects resolved string or ID
    this.info = initialData.info || [];
    this.binary = initialData.binary || false;
    this.isOffLimits = initialData.isOffLimits || false;
    this.hasWarning = initialData.hasWarning || false;
    this.isMajorTradeHub = initialData.isMajorTradeHub || false;

    // If jumpPoints data was passed in initialData, process it.
    // This is a bit redundant with fromJSON but makes constructor more robust.
    if (initialData.jumpPoints && initialData.jumpPoints.length > 0 && this.scmapInstance) {
      this._fixJumpPoints(initialData.jumpPoints, true, this.scmapInstance, this.config);
    }
  }

  get scale () {
    let scaleFactor = 1.0;
    switch ( this.size ) {
      case 'dwarf':  scaleFactor = 0.90; break;
      case 'medium': scaleFactor = 1.0;  break;
      case 'large':  scaleFactor = 1.15; break;
      case 'giant':  scaleFactor = 1.27; break;
      case 'binary': scaleFactor = 1.4;  this.binary = true; break; // Note: direct mutation in getter
    }
    return scaleFactor;
  }

  // Removed getIcons, refreshIcons, labelScale, refreshScale (UI concerns)

  // Returns the jumppoint leading to the given destination StarSystem instance
  jumpPointTo ( destinationSystem ) {
    for ( let i = 0; i < this.jumpPoints.length; i++ ) {
      if ( this.jumpPoints[i].destination === destinationSystem ) {
        return this.jumpPoints[i];
      }
    }
    return undefined;
  }

  isUnknown () {
    return ( this.status === 'Unknown' );
  }

  // Removed isBookmarked, setBookmarkedState, hasHangar, setHangarState,
  // isToBeAvoided, setToBeAvoidedState, hasComments, getComments, setComments,
  // storedSettings, saveSettings (state to be managed externally)

  toString () {
    return this.name;
  }

  getValue ( key ) {
    if ( key === undefined || !this.hasOwnProperty(key) ) {
      return undefined;
    }
    return this[key];
  }

  // Removed factionStyle (UI concern)

  // Populates this.jumpPoints from raw jump point data
  // rawJumpPointsData is expected to be an array from the JSON
  _fixJumpPoints( rawJumpPointsData, cleanup = true, scmapInstance, config ) {
    if (!scmapInstance) {
      console.warn(`_fixJumpPoints called on ${this.name} without scmapInstance.`);
      return this;
    }

    let processedJumpPoints = [];

    for ( let i = 0; i < rawJumpPointsData.length; i++ ) {
      const jpData = rawJumpPointsData[i];

      // If already processed and stored in this.jumpPoints, skip if not cleaning
      if (!cleanup && this.jumpPoints.find(jp => jp.id === jpData.jumpPointId && jp instanceof JumpPoint)) {
        processedJumpPoints.push(this.jumpPoints.find(jp => jp.id === jpData.jumpPointId));
        continue;
      }

      let destinationSystem = StarSystem.getById(jpData.destinationSystemId, scmapInstance);
      // If destination is self, it means this system is the destination of an inbound JP.
      // We need the source system for the JP object.
      if (destinationSystem === this) {
        destinationSystem = StarSystem.getById(jpData.sourceSystemId, scmapInstance);
      }

      if (destinationSystem instanceof StarSystem) {
        const jumpPoint = new JumpPoint({
          id: jpData.jumpPointId,
          direction: jpData.direction,
          source: this, // The current StarSystem instance
          destination: destinationSystem,
          name: jpData.name,
          size: jpData.size,
          status: jpData.status,
          type: jpData.type,
          entryAU: jpData.coordsAu,
        }, scmapInstance, config); // Pass scmapInstance & config to JumpPoint constructor
        processedJumpPoints.push(jumpPoint);
      } else {
        console.warn(`Could not find destination system for jump point ${jpData.jumpPointId} from ${this.name}`);
      }
    }

    this.jumpPoints = processedJumpPoints;
    return this;
  }

  // Simplified setValues, mainly for direct properties. Complex relations handled in fromJSON or specific methods.
  setValues ( values ) {
    let key, newValue;

    if (values === undefined) {
      return;
    }

    for (key in values) {
      if (!values.hasOwnProperty(key)) continue;

      newValue = values[key];
      if (newValue === undefined) {
        // console.log(`StarSystem: "${key}" parameter is undefined for "${this.name}"`);
        continue;
      }

      if (this.hasOwnProperty(key) || key === 'position' || key === 'color' || key === 'faction') {
        if (key === 'position') {
          if (newValue instanceof Array && newValue.length === 3) {
            this.position = { x: newValue[0], y: newValue[1], z: newValue[2] };
          } else if (typeof newValue === 'object' && newValue !== null && 'x' in newValue && 'y' in newValue && 'z' in newValue) {
            this.position = { ...newValue };
          }
        } else if (key === 'color') {
          this.color = typeof newValue === 'string' ? newValue.toLowerCase() : UNSET_COLOR_STRING;
        } else if (key === 'faction') {
          // Assuming newValue is either a Faction instance or an ID
          if (this.scmapInstance && !(newValue instanceof Faction)) {
            this.faction = this.scmapInstance.getFactionById(newValue);
            if (this.faction) this.faction.claim(this); // If faction resolved, claim system
          } else if (newValue instanceof Faction) {
            this.faction = newValue;
            this.faction.claim(this);
          }
        } else {
          this[key] = newValue;
        }
      }
    }
  }

  static fromJSON ( json, scmapInstance, config ) {
    if (json instanceof StarSystem) {
      return json;
    }

    const systemData = {
      id: json.id,
      uuid: json.uuid,
      name: json.name,
      description: json.description,
      position: Array.isArray(json.coordinates) ? { x: json.coordinates[0], y: json.coordinates[1], z: json.coordinates[2] } : json.coordinates,
      color: (json.color === 'Unknown' || !json.color) ? UNSET_COLOR_STRING : String(json.color).toLowerCase().replace('0x','#'),
      isMajorTradeHub: json.isMajorTradeHub,
      hasWarning: json.hasWarning,
      isOffLimits: json.isOffLimits,
      nickname: json.nickname,
      size: json.size,
      info: json.info,
      status: json.status,
      import: json.importing,
      export: json.exporting,
      blackMarket: json.blackMarkets,
      // planets, planetaryRotation would be set here if data available
      // jumpPoints are handled separately for clarity and dependency resolution
    };

    const system = new StarSystem(systemData, scmapInstance, config);

    // Resolve faction, crimeStatus, ueeStrategicValue using scmapInstance
    if (scmapInstance) {
      system.faction = scmapInstance.getFactionById(json.faction);
      if (system.faction && system.faction.claim) { // Ensure faction object has claim method
          system.faction.claim(system);
      }
      system.crimeStatus = scmapInstance.getCrimeLevelById(json.crimeLevel);
      system.ueeStrategicValue = scmapInstance.getUEEStrategicValueById(String(json.ueeStrategicValue));
    } else {
      console.warn(`scmapInstance not provided to StarSystem.fromJSON for ${json.name}, some data may not be resolved.`);
    }
    
    // Process jump points after system instance is created and basic properties are set
    if (json.jumpPoints && json.jumpPoints.length > 0 && scmapInstance) {
      system._fixJumpPoints(json.jumpPoints, true, scmapInstance, config);
    }

    return system;
  }

  static getById ( id, scmapInstance ) {
    if (!scmapInstance) {
      console.error("StarSystem.getById requires scmapInstance");
      return undefined;
    }
    return scmapInstance.getStarSystemById( id );
  }
}

export default StarSystem;
