let usiDevice = null;
let preferredColorReportId = null;
let preferredWidthReportId = null;
let preferredStyleReportId = null;

const usiColorMap = {
  '#F0F8FF': 0,   '#FAEBD7': 1,   '#00FFFF': 2,   '#7FFFD4': 3,
  '#F0FFFF': 4,   '#F5F5DC': 5,   '#FFE4C4': 6,   '#000000': 7,
  '#FFEBCD': 8,   '#0000FF': 9,   '#8A2BE2': 10,  '#A52A2A': 11,
  '#DEB887': 12,  '#5F9EA0': 13,  '#7FFF00': 14,  '#D2691E': 15,
  '#FF7F50': 16,  '#6495ED': 17,  '#FFF8DC': 18,  '#DC143C': 19,
  '#00FFFF': 20,  '#00008B': 21,  '#008B8B': 22,  '#B8860B': 23,
  '#A9A9A9': 24,  '#006400': 25,  '#BDB76B': 26,  '#8B008B': 27,
  '#556B2F': 28,  '#FF8C00': 29,  '#9932CC': 30,  '#8B0000': 31,
  '#E9967A': 32,  '#8FBC8F': 33,  '#483D8B': 34,  '#2F4F4F': 35,
  '#00CED1': 36,  '#9400D3': 37,  '#FF1493': 38,  '#00BFFF': 39,
  '#696969': 40,  '#1E90FF': 41,  '#B22222': 42,  '#FFFAF0': 43,
  '#228B22': 44,  '#FF00FF': 45,  '#DCDCDC': 46,  '#F8F8FF': 47,
  '#FFD700': 48,  '#DAA520': 49,  '#808080': 50,  '#008000': 51,
  '#ADFF2F': 52,  '#F0FFF0': 53,  '#FF69B4': 54,  '#CD5C5C': 55,
  '#4B0082': 56,  '#FFFFF0': 57,  '#F0E68C': 58,  '#E6E6FA': 59,
  '#FFF0F5': 60,  '#7CFC00': 61,  '#FFFACD': 62,  '#ADD8E6': 63,
  '#F08080': 64,  '#E0FFFF': 65,  '#FAFAD2': 66,  '#D3D3D3': 67,
  '#90EE90': 68,  '#FFB6C1': 69,  '#FFA07A': 70,  '#20B2AA': 71,
  '#87CEFA': 72,  '#778899': 73,  '#B0C4DE': 74,  '#FFFFE0': 75,
  '#00FF00': 76,  '#32CD32': 77,  '#FAF0E6': 78,  '#FF00FF': 79,
  '#800000': 80,  '#66CDAA': 81,  '#0000CD': 82,  '#BA55D3': 83,
  '#9370DB': 84,  '#3CB371': 85,  '#7B68EE': 86,  '#00FA9A': 87,
  '#48D1CC': 88,  '#C71585': 89,  '#191970': 90,  '#F5FFFA': 91,
  '#FFE4E1': 92,  '#FFE4B5': 93,  '#FFDEAD': 94,  '#000080': 95,
  '#FDF5E6': 96,  '#808000': 97,  '#6B8E23': 98,  '#FFA500': 99,
  '#FF4500': 100, '#DA70D6': 101, '#EEE8AA': 102, '#98FB98': 103,
  '#AFEEEE': 104, '#DB7093': 105, '#FFEFD5': 106, '#FFDAB9': 107,
  '#CD853F': 108, '#FFC0CB': 109, '#DDA0DD': 110, '#B0E0E6': 111,
  '#800080': 112, '#663399': 113, '#FF0000': 114, '#BC8F8F': 115,
  '#4169E1': 116, '#8B4513': 117, '#FA8072': 118, '#F4A460': 119,
  '#2E8B57': 120, '#FFF5EE': 121, '#A0522D': 122, '#C0C0C0': 123,
  '#87CEEB': 124, '#6A5ACD': 125, '#708090': 126, '#FFFAFA': 127,
  '#00FF7F': 128, '#4682B4': 129, '#D2B48C': 130, '#008080': 131,
  '#D8BFD8': 132, '#FF6347': 133, '#40E0D0': 134, '#EE82EE': 135,
  '#F5DEB3': 136, '#FFFFFF': 137, '#F5F5F5': 138, '#FFFF00': 139,
  '#9ACD32': 140 };

function _hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

function _findClosestColor(color) {
  let rgbInput = _hexToRgb(color);
  // 442 is the max euclidean distance between two colors.
  let lowestDistance = 442;
  let closestColor = null;
  Object.keys(usiColorMap).forEach((key, value) => {
    let currentColorRgb = _hexToRgb(key);
    let result = Math.sqrt(
      Math.pow((currentColorRgb.r - rgbInput.r), 2) + 
      Math.pow((currentColorRgb.g - rgbInput.g), 2) + 
      Math.pow((currentColorRgb.b - rgbInput.b), 2));
    if (result < lowestDistance) {
      lowestDistance = result;
      closestColor = usiColorMap[key];
    }
  });
  return closestColor;
}  

const usiStyleMap = {
  'INK': 1,
  'PENCIL': 2,
  'HIGHLIGHTER': 3,
  'MARKER': 4,
  'BRUSH': 5,
  'NOPREF': 6 
};

async function _open() {
  const usagePage = 0x0d;   // Digitizer
  const usage = 0x02;      // Pen
  let devices = await navigator.hid.requestDevice({ filters: [
    {
      usage: usage,
      usagePage: usagePage
    }
  ]});

  if (devices.length == 0) {
    console.log('No devices with USI capabilities were selected.');
    return;
  }

  usiDevice = devices[0];
  if (!usiDevice.opened)
      await usiDevice.open();

  let collection = _findCollectionByUsage(usiDevice, usagePage, usage);

  // feature reports
  preferredColorReportId = _findFeatureReportByUsage(collection, 0x5c).featureReports[0].reportId;  // preferred color
  preferredWidthReportId = _findFeatureReportByUsage(collection, 0x5e).featureReports[0].reportId;  // preferred line width
  preferredStyleReportId = _findFeatureReportByUsage(collection, 0x70).featureReports[0].reportId;  // preferred line style

  console.log(`WebHID device ${usiDevice.productName} opened`);
  console.log(`WebHID USI color feature report id ', ${preferredColorReportId}`);
  console.log(`WebHID USI style feature report id ', ${preferredWidthReportId}`);
  console.log(`WebHID USI width feature report id ', ${preferredStyleReportId}`);
}

function _findCollectionByUsage(device, usagePage, usage) {
  return device.collections.find(candidate =>
    candidate.usagePage === usagePage && candidate.usage === usage);
}

function _findFeatureReportByUsage(item, usage) {
  if(item.usage === usage && item.featureReports.length > 0) {
    return item;
  }

  for(let i in item.children) {
    let found = _findFeatureReportByUsage(item.children[i], usage);
    if(found)
      return found;
  }
  return null;
}

function _shouldPolyfill() {
  if (typeof window.navigator.hid === 'undefined') {
    console.info("WebHID is not supported in this browser. The polyfill will not work.");
    return false;
  }

  // Check if the pen customization is supported by the browser.
  const event = new PointerEvent('pen');
  if ('penCustomizationsDetails' in event) {
    console.log('Browser supports Pen Customizations API, the polyfill will do nothing.');
    return false;
  }
  
  return true;
}

export async function getPreferredStyle() {
  if (!_shouldPolyfill())
    return;

  if (!usiDevice) {
    await _open();
  }
  if (!usiDevice || !usiDevice.opened) {
    console.error('The touch panel with USI is not connected');
    return Promise.reject('The touch panel with USI is not connected');
  }

  let data = await usiDevice.receiveFeatureReport(preferredStyleReportId);
  let style = _reverseLookupMap(usiStyleMap, data.getUint8(2));
  return Promise.resolve(style);
}

export async function setPreferredStyle(style) {
  if (!_shouldPolyfill())
    return;

  if (!usiDevice) {
    await _open();
  }
  if (!usiDevice || !usiDevice.opened) {
    console.error('The touch panel with USI is not connected');
    return Promise.reject('The touch panel with USI is not connected');
  }

  const transducerIndex = 1;
  const styleIndex = usiStyleMap[style];
  let data = Uint8Array.from([transducerIndex, styleIndex]);
  await usiDevice.sendFeatureReport(preferredStyleReportId, data);
}

export async function getPreferredWidth() {
  if (!_shouldPolyfill())
    return;

  if (!usiDevice) {
    await _open();
  }
  if (!usiDevice || !usiDevice.opened) {
    console.error('The touch panel with USI is not connected');
    return Promise.reject('The touch panel with USI is not connected');
  }

  let data = await usiDevice.receiveFeatureReport(preferredWidthReportId);
  let width = data.getUint8(2);
  return Promise.resolve(width);
}

export async function setPreferredWidth(width) {
  if (!_shouldPolyfill())
    return;

  if (!usiDevice) {
    await _open();
  }
  if (!usiDevice || !usiDevice.opened) {
    console.error('The touch panel with USI is not connected');
    return Promise.reject('The touch panel with USI is not connected');
  }

  const transducerIndex = 1;
  let data = Uint8Array.from([transducerIndex, width]);
  await usiDevice.sendFeatureReport(preferredWidthReportId, data);

}

export async function getPreferredColor() {
  if (!_shouldPolyfill())
    return;

  if (!usiDevice) {
    await _open();
  }
  if (!usiDevice || !usiDevice.opened) {
    console.error('The touch panel with USI is not connected');
    return Promise.reject('The touch panel with USI is not connected');
  }

  let data = await usiDevice.receiveFeatureReport(preferredColorReportId);
  let preferredColor = _reverseLookupMap(usiColorMap, data.getUint8(2));
  return Promise.resolve(preferredColor);
}

export async function setPreferredColor(color) {
  if (!_shouldPolyfill())
    return;

  if (!usiDevice) {
    await _open();
  }
  if (!usiDevice || !usiDevice.opened) {
    console.error('The touch panel with USI is not connected');
    return Promise.reject('The touch panel with USI is not connected');
  }

  const transducerIndex = 1;
  let colorIndex = usiColorMap[color];
  if (colorIndex === undefined) {
    colorIndex = _findClosestColor(color);
  }
  let data = Uint8Array.from([transducerIndex, colorIndex]);
  await usiDevice.sendFeatureReport(preferredColorReportId, data);
}

function _reverseLookupMap(map, value) {
  return Object.keys(map).find(key => map[key] === value);
}
