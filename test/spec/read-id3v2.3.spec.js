//     mp3-parser test suite: ID3v2.3 tag / ISO-8859-1 encoded frames. Tests run against
//     id3v2.3-iso-8859-1.mp3 (maintained with [Kid3 ID3 Tagger](http://kid3.sourceforge.net/))

//     https://github.com/biril/mp3-parser
//     Licensed and freely distributed under the MIT License
//     Copyright (c) 2013 Alex Lambiris

/*jshint node:true */
/*global describe, beforeEach, it, expect, Uint8Array, ArrayBuffer */
"use strict";

describe("ID3v2.3 reader run on ID3v2.3 tag with ISO-8859-1 encoded frames", function () {

    var util = require("util"),

        _ = require("underscore"),

        mp3Parser = require(__dirname + "/../../mp3-parser.js"),

        filePath = __dirname + "/../id3v2.3-iso-8859-1.mp3",

        // Read the file into a DataView-wrapped ArrayBuffer
        buffer = (function (b) {
            if (!b) {
                util.error("Oops: Failed to load " + filePath);
                process.exit(1);
            }

            var i = 0, bufferLength = b.length,
                uint8Array = new Uint8Array(new ArrayBuffer(bufferLength));

            for (; i < bufferLength; ++i) { uint8Array[i] = b[i]; }

            return new DataView(uint8Array.buffer);
        }(require("fs").readFileSync(filePath))),

        // Read the ID3v2 tag. This is done once, here, and all tests run on `capturedId3v2Tag`
        capturedId3v2Tag = mp3Parser.readId3v2Tag(buffer),

        // Helper to get all captured ID3v2 tag frames of given `id`
        getCapturedFrames = function (id) {
            return _(capturedId3v2Tag.frames).filter(function (frame) {
                return frame.header.id === id;
            });
        },

        // All ID3v2 tag frames along with their 'friendly names' as defined in the spec and and,
        //  in certain cases, an `expected` hash which defines values to test against
        id3v2TagFrames = {
            AENC: {
                name: "Audio encryption",
                expected: { } },
            APIC: {
                name: "Attached picture",
                expected: { } },
            COMM: {
                name: "Comments",
                expected: { } },
            COMR: {
                name: "Commercial frame",
                expected: { } },
            ENCR: {
                name: "Encryption method registration",
                expected: { } },
            EQUA: {
                name: "Equalization",
                expected: { } },
            ETCO: {
                name: "Event timing codes",
                expected: { } },
            GEOB: {
                name: "General encapsulated object",
                expected: { } },
            GRID: {
                name: "Group identification registration",
                expected: { } },
            IPLS: {
                name: "Involved people list",
                expected: { } },
            LINK: {
                name: "Linked information",
                expected: { } },
            MCDI: {
                name: "Music CD identifier",
                expected: { } },
            MLLT: {
                name: "MPEG location lookup table",
                expected: { } },
            OWNE: {
                name: "Ownership frame",
                expected: { } },
            PRIV: {
                name: "Private frame",
                expected: { } },
            PCNT: {
                name: "Play counter",
                expected: { } },
            POPM: {
                name: "Popularimeter",
                expected: { } },
            POSS: {
                name: "Position synchronisation frame",
                expected: { } },
            RBUF: {
                name: "Recommended buffer size",
                expected: { } },
            RVAD: {
                name: "Relative volume adjustment",
                expected: { } },
            RVRB: {
                name: "Reverb",
                expected: { } },
            SYLT: {
                name: "Synchronized lyric/text",
                expected: { } },
            SYTC: {
                name: "Synchronized tempo codes",
                expected: { } },

            TALB: { name: "Album/Movie/Show title" },
            TBPM: { name: "BPM (beats per minute)", expected: { value: "303" } }, // Integer represented as a numeric string.
            TCOM: { name: "Composer" },
            TCON: { name: "Content type" },
            TCOP: { name: "Copyright message", expected: { value: "2013 whatever" } }, // Begins with a year followed by space character
            TDAT: { name: "Date", expected: { value: "0101" } }, // Numeric string in DDMM format
            TDLY: { name: "Playlist delay", expected: { value: "10" } }, // Numeric string - number of ms
            TENC: { name: "Encoded by" },
            TEXT: { name: "Lyricist/Text writer" },
            TFLT: { name: "File type" },
            TIME: { name: "Time", expected: { value: "1802" } }, // Numeric string in HHMM format
            TIT1: { name: "Content group description" },
            TIT2: { name: "Title/songname/content description" },
            TIT3: { name: "Subtitle/Description refinement" },
            TKEY: { name: "Initial key", expected: { value: "Cbm" } }, // 3 chars max. A/Ab/A#/Abm/A#m
            TLAN: { name: "Language(s)", expected: { value: "eng"} }, // Multiple ISO-639-2 lang codes
            TLEN: { name: "Length", expected: { value: "10" } }, // Numeric string - number of ms
            TMED: { name: "Media type" },
            TOAL: { name: "Original album/movie/show title" },
            TOFN: { name: "Original filename" },
            TOLY: { name: "Original lyricist(s)/text writer(s)" },
            TOPE: { name: "Original artist(s)/performer(s)" },
            TORY: { name: "Original release year", expected: { value: "1999" } }, // Numeric string in YYYY format
            TOWN: { name: "File owner/licensee" },
            TPE1: { name: "Lead performer(s)/Soloist(s)" },
            TPE2: { name: "Band/orchestra/accompaniment" },
            TPE3: { name: "Conductor/performer refinement" },
            TPE4: { name: "Interpreted, remixed, or otherwise modified by" },
            TPOS: { name: "Part of a set", expected: { value: "01/02" } }, // Numeric string, optionally extended with '/'
            TPUB: { name: "Publisher" },
            TRCK: { name: "Track number/Position in set", expected: { value: "303/909" } }, // Numeric string, optionally extended with '/'
            TRDA: { name: "Recording dates" },
            TRSN: { name: "Internet radio station name" },
            TRSO: { name: "Internet radio station owner" },
            TSIZ: { name: "Size", expected: { value: "1" } }, // Numeric string - Size of file in bytes, excluding ID3v2 tag
            TSRC: { name: "ISRC (international standard recording code)", expected: { value: "0123456789AB" } }, // 12 chars
            TSSE: { name: "Software/Hardware and settings used for encoding" },
            TYER: { name: "Year", expected: { value: "2013" } }, // Numeric string in YYYY format

            TXXX: { name: "User defined text information frame" },

            UFID: {
                name: "Unique file identifier",
                expected: { } },
            USER: {
                name: "Terms of use",
                expected: { } },
            USLT: {
                name: "Unsychronized lyric/text transcription",
                expected: { } },

            WCOM: { name: "Commercial information" },
            WCOP: { name: "Copyright/Legal information" },
            WOAF: { name: "Official audio file webpage" },
            WOAR: { name: "Official artist/performer webpage" },
            WOAS: { name: "Official audio source webpage" },
            WORS: { name: "Official internet radio station homepage" },
            WPAY: { name: "Payment" },
            WPUB: { name: "Publishers official webpage" },

            WXXX: { name: "User defined URL link frame" }
        };

    // beforeEach(function () { });

    // Pick text-information frames only, preprocess them and test each one. For frames that
    //  don't provide an `expected` hash, their value is checked against their 'friendly name',
    //  as defined in the ID3v2 spec. This testing-policy isn't used for _all of them_ as some
    //  require their value to follow certain formatting rules according to the spec. In these
    //  cases the `expected` hash contains such a conforming `value`. (Note that, in practice,
    //  it is actually highly unlikely that taggers enforce the spec's formatting rules)
    _.chain(id3v2TagFrames)
        .map(function (frame, id) {
            return { id: id, name: frame.name, expected: frame.expected };
        }).filter(function (frame) {
            return frame.id.charAt(0) === "T" && frame.id !== "TXXX";
        }).each(function (frame) {
            it("should read " + frame.id + ": " + frame.name, function () {
                var capturedFrames = getCapturedFrames(frame.id),
                    f = null;

                expect(capturedFrames.length).toBe(1);
                f = capturedFrames[0];

                expect(f.content.encoding).toBe(0);
                expect(f.content.value).toBe(frame.expected ? frame.expected.value : frame.name);
            });
        });

    //
    it("should read TXXX: User defined text information frame", function () {
        var capturedFrames = getCapturedFrames("TXXX"),
            f = null;

        expect(capturedFrames.length).toBe(1);
        f = capturedFrames[0];

        expect(f.content.encoding).toBe(0);
        expect(f.content.description).toBe(id3v2TagFrames.TXXX.name + " description");
        expect(f.content.value).toBe(id3v2TagFrames.TXXX.name);
    });

    // Pick URL-link frames only, preprocess them and test each one. Frame values are checked
    //  against each frame's 'friendly name', as defined in the ID3v2 spec.
    _.chain(id3v2TagFrames)
        .map(function (frame, id) {
            return { id: id, name: frame.name };
        }).filter(function (frame) {
            return frame.id.charAt(0) === "W" && frame.id !== "WXXX";
        }).each(function (frame) {
            it("should read " + frame.id + ": " + frame.name, function () {
                var capturedFrames = getCapturedFrames(frame.id);

                expect(capturedFrames.length).toBe(1);
                expect(capturedFrames[0].content.value).toBe(frame.name);
            });
        });

    //
    it("should read WXXX: User defined URL link frame", function () {
        var capturedFrames = getCapturedFrames("WXXX"),
            f = null;

        expect(capturedFrames.length).toBe(1);
        f = capturedFrames[0];

        expect(f.content.encoding).toBe(0);
        expect(f.content.description).toBe(id3v2TagFrames.WXXX.name + " description");
        expect(f.content.value).toBe(id3v2TagFrames.WXXX.name);
    });

});