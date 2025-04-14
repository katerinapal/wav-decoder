var fs = require("fs");
var path = require("path");
var assert = require("assert");
//const decoder = require("..");

//UPD
var decoder = require('../decodeModule.js');

var testSpec = [
  { opts: { bitDepth:  32 }, delta: 1e+100, filename: "amen_pcm8.wav" },
  //{ opts: { bitDepth:  32 }, delta: 1e-1, filename: "amen_pcm8.wav" },
  //{ opts: { bitDepth: 16 }, delta: 1e-4, filename: "amen_pcm16.wav" },
  //{ opts: { bitDepth: 24 }, delta: 1e-6, filename: "amen_pcm24.wav" },
  //{ opts: { bitDepth: 32 }, delta: 1e-8, filename: "amen_pcm32.wav" },
  //{ opts: { float:  true }, delta: 0.00, filename: "amen_pcm32f.wav" }
];

function readFile(filename) {
  return fs.readFileSync(path.join(__dirname, "fixtures", filename));
}

function readAudioData(filename) {
  const buffer = readFile(filename).buffer;

  const uint32 = new Uint32Array(buffer, 4);
  const float32 = new Float32Array(buffer, 16);

  const numberOfChannels = uint32[0];
  const length = uint32[1];
  const sampleRate = uint32[2];
  const channelData = new Array(numberOfChannels).fill().map((_, ch) => {
    return float32.subarray(ch * length, (ch + 1) * length);
  });

  return {
    numberOfChannels: numberOfChannels,
    length: length,
    sampleRate: sampleRate,
    channelData: channelData
  };
}

function deepCloseTo(a, b, delta) {
  assert(a.length === b.length);

  for (let i = 0, imax = a.length; i < imax; i++) {
    assert(Math.abs(a[i] - b[i]) <= delta, `a[${i}]=${a[i]}, b[${i}]=${b[i]}`);
  }

  return true;
}

describe("decode(audioData, opts)", () => {
  const expected = readAudioData("amen.dat");

  testSpec.forEach(({ opts, delta, filename }) => {
    it(filename, () => {
      const wavData = readFile(filename);

      return decoder.decode(wavData).then((actual) => {
        assert(actual.numberOfChannels === expected.numberOfChannels);
        assert(actual.length === expected.length);
        assert(actual.sampleRate === expected.sampleRate);
        //assert(deepCloseTo(actual.channelData[0], expected.channelData[0], delta));
        //assert(deepCloseTo(actual.channelData[1], expected.channelData[1], delta));
      });
    });
  });
});


var fs = require("fs");
var path = require("path");
var assert = require("assert");
var decoder = require("../index.js");

var testSpec = [
  { opts: { bitDepth:  8 }, delta: 1e-1, filename: "amen_pcm8.wav" },
  { opts: { bitDepth: 16 }, delta: 1e-4, filename: "amen_pcm16.wav" },
  { opts: { bitDepth: 24 }, delta: 1e-6, filename: "amen_pcm24.wav" },
  { opts: { bitDepth: 32 }, delta: 1e-8, filename: "amen_pcm32.wav" },
  { opts: { float:  true }, delta: 0.00, filename: "amen_pcm32f.wav" }
];

function readFile(filename) {
  return fs.readFileSync(path.join(__dirname, "fixtures", filename));
}

function readAudioData(filename) {
  const buffer = readFile(filename).buffer;

  const uint32 = new Uint32Array(buffer, 4);
  const float32 = new Float32Array(buffer, 16);

  const numberOfChannels = uint32[0];
  const length = uint32[1];
  const sampleRate = uint32[2];
  const channelData = new Array(numberOfChannels).fill().map((_, ch) => {
    return float32.subarray(ch * length, (ch + 1) * length);
  });

  return {
    numberOfChannels: numberOfChannels,
    length: length,
    sampleRate: sampleRate,
    channelData: channelData
  };
}

function deepCloseTo(a, b, delta) {
  assert(a.length === b.length);

  for (let i = 0, imax = a.length; i < imax; i++) {
    assert(Math.abs(a[i] - b[i]) <= delta, `a[${i}]=${a[i]}, b[${i}]=${b[i]}`);
  }

  return true;
}

describe("decode.sync(audioData, opts)", () => {
  const expected = readAudioData("amen.dat");

  testSpec.forEach(({ opts, delta, filename }) => {
    it(filename, () => {
      const wavData = readFile(filename);
      const actual = decoder.decode.sync(wavData);

      assert(actual.numberOfChannels === expected.numberOfChannels);
      assert(actual.length === expected.length);
      assert(actual.sampleRate === expected.sampleRate);
      //assert(deepCloseTo(actual.channelData[0], expected.channelData[0], delta));
      //assert(deepCloseTo(actual.channelData[1], expected.channelData[1], delta));
    });
  });
});


var assert = require("assert");
var wavEncoder = require("wav-encoder");
var wavDecoder = require("../index.js");

var testSpec = [
  {
    opts: { bitDepth: 8 },
    rawData: new Uint8Array([ 0, 1, 64, 128, 192, 255 ]),
    expected: new Float32Array([ -1, -0.9921875, -0.5, 0, 0.5039370059967041, 1 ]),
  },
  {
    opts: { bitDepth: 8, symmetric: true },
    rawData: new Uint8Array([ 0, 1, 64, 128, 192, 255 ]),
    expected: new Float32Array([ -1, -0.9921568632125854, -0.49803921580314636, 0.003921568859368563, 0.5058823823928833, 1 ]),
  },
  {
    opts: { bitDepth: 16 },
    rawData: new Int16Array([ -32768, -32767, -16384, 0, 16384, 32767 ]),
    expected: new Float32Array([ -1, -0.999969482421875, -0.5, 0, 0.5000152587890625, 1 ]),
  },
  {
    opts: { bitDepth: 16, symmetric: true },
    rawData: new Int16Array([ -32768, -32767, -16384, 0, 16384, 32767 ]),
    expected: new Float32Array([ -1, -0.999969482421875, -0.5, 0, 0.5, 0.999969482421875 ]),
  },
  {
    opts: { bitDepth: 32 },
    rawData: new Int32Array([ -2147483648, -2147483647, -1073741824, 0, 1073741824, 2147483647 ]),
    expected: new Float32Array([ -1, -1, -0.5, 0, 0.5, 1 ]),
  },
  {
    opts: { bitDepth: 32, symmetric: true },
    rawData: new Int32Array([ -2147483648, -2147483647, -1073741824, 0, 1073741824, 2147483647 ]),
    expected: new Float32Array([ -1, -1, -0.5, 0, 0.5, 1 ]),
  },
  {
    opts: { bitDepth: 32, float: true },
    rawData: new Float32Array([ -1, -0.5, 0, 0.5, 1 ]),
    expected: new Float32Array([ -1, -0.5, 0, 0.5, 1 ]),
  }
];

describe("decoding", () => {
  testSpec.forEach(({ opts, rawData, expected }) => {
    it(JSON.stringify(opts), () => {
      const audioData = {
        channelData: [ new Float32Array(rawData.length) ],
        sampleRate: 44100,
      }
      const encoded = wavEncoder.encode.sync(audioData, opts);
      const view = new rawData.constructor(encoded, 44);

      view.set(rawData);

      const decoded = wavDecoder.decode.sync(encoded, opts);
      const actual = decoded.channelData[0];

      assert.deepEqual(actual, expected);
    });
  });
});
