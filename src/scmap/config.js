/**
* @author Lianna Eeftinck / https://github.com/Leeft
*/

// These are deliberately strings where they might have been numbers,
// to reflect that in the original code they could come from HTML data attributes.
// Code using these values should be prepared to parse them if numbers are required.
const defaultMapConfig = {
  systemsJson:          'data/systems.min.json',
  goodsJson:            'data/goods.json',
  crimeLevelsJson:      'data/crime-levels.json',
  factionsJson:         'data/factions.json',
  strategicValuesJson:  'data/uee-strategic-values.json',

  glowImage:            'images/glow.png',

  rotateSpeed:          '0.1',
  zoomSpeed:            '1.0',
  panSpeed:             '0.6',

  minSystemScale:       '0.5',
  defaultSystemScale:   '1.0',
  maxSystemScale:       '1.50',
  systemScale:          0.5, // system geometry is multiplied by this for the actual scene

  // These should've been named *LabelUserScale
  minLabelScale:        '0.4',
  defaultLabelScale:    '1.0',
  maxLabelScale:        '2.0',
  labelScale:           2.5, // sprite labels are multiplied by this for the actual scene

  minLabelOffset:       '-6.5',
  defaultLabelOffset:   '4.0',
  maxLabelOffset:       '7.5',

  debug:                false,
  quality:              'high',

  renderScale:          0.5, // to grow or shrink

  // takes 8m 19s at 1c, but autopilot speed is only 0.2c
  // Value is in seconds.
  approximateTraveltimePerAU: ( ( 8 * 60 ) + 19 ) * 5,
};

export default defaultMapConfig;
