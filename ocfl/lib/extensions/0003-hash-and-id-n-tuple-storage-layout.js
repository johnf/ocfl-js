const { OcflStorageLayout } = require("../extension");
const { OcflDigest } = require("../digest");
const path = require("path");

function encodeIdentifier(id) {
  return encodeURIComponent(id).toLowerCase().replace(/\./g, '%2e');
}

const DefaultConfig = {
  extensionName: '0003-hash-and-id-n-tuple-storage-layout',
  digestAlgorithm: 'sha256',
  tupleSize: 3,
  numberOfTuples: 3,
};

class HashAndIdNTupleStorageLayout extends OcflStorageLayout {
  static get NAME() { return DefaultConfig.extensionName }
  static get DESCRIPTION() {
    return "OCFL object identifiers are hashed and encoded as lowercase hex strings." +
      " These digests are then divided into N n-tuple segments," +
      " which are used to create nested paths under the OCFL storage root." +
      " Finally, the OCFL object identifier is percent-encoded to create a directory name for the OCFL object root.";
  }

  constructor(config) {
    /** @type {DefaultConfig} */
    let c = Object.assign(Object.create(DefaultConfig), config);
    if (!OcflDigest.FIXITY.of(c.digestAlgorithm)) throw new Error('Invalid digestAlgorithm');
    let digest = OcflDigest.digestSync(c.digestAlgorithm, 'test');
    let p = c.numberOfTuples * c.tupleSize
    if (p > digest.length) throw new Error('Product of numberOfTuples and tupleSize is greater than the number of characters in the hex encoded digest.');
    super(c);
  }

  /**
   * @param {string} id
   * @return {string} 
   */
  map(id) {
    let digest = OcflDigest.digestSync(this.config.digestAlgorithm, id);
    let segments = [];
    let s = this.config.tupleSize;
    let n = this.config.numberOfTuples;
    let i;
    for (i = 0; i < n; ++i) {
      segments.push(digest.slice(s * i, s * i + s));
    }
    segments.push(encodeIdentifier(id));
    return segments.join(path.sep);
  }
}

module.exports = { HashAndIdNTupleStorageLayout };