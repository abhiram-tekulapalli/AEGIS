import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Creates valid 16x16, 48x48, 128x128 PNG files with an elegant shield logo
 */

function createPNG(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const scanlines = [];
  for (let y = 0; y < height; y++) {
    scanlines.push(0);
    for (let x = 0; x < width; x++) {
      const cx = width / 2;
      const cy = height / 2;
      const dx = Math.abs(x - cx) / cx;
      const dy = Math.abs(y - cy) / cy;

      const isBorder = (dx > 0.8 || dy > 0.8) && (dx < 0.95 && dy < 0.95);
      const isInner = dx < 0.6 && dy < 0.6;

      if (isInner || isBorder) {
        scanlines.push(15, 23, 42, 255);
      } else {
        scanlines.push(99, 102, 241, 255);
      }
    }
  }

  const rawData = Buffer.from(scanlines);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte = byte >>> 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

const extensionIconsDir = path.resolve(process.cwd(), 'extension/icons');
if (!fs.existsSync(extensionIconsDir)) {
  fs.mkdirSync(extensionIconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const pngBuf = createPNG(size, size);
  fs.writeFileSync(path.join(extensionIconsDir, `icon-${size}.png`), pngBuf);
  console.log(`Generated extension/icons/icon-${size}.png (${pngBuf.length} bytes)`);
});
