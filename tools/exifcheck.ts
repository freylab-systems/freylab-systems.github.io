// Finds the TIFF header (II*\0 / MM\0*) anywhere in the file and parses IFD0.
// HEIC wraps EXIF with a 4-byte offset prefix, so scanning for the magic is
// more reliable than assuming it sits right after "Exif\0\0".
const path = process.argv[2];
const name = path.split("/").pop();
const b = new Uint8Array(await Bun.file(path).arrayBuffer());

let t = -1, le = false;
for (let i = 0; i < b.length - 8; i++) {
  if (b[i]===0x49 && b[i+1]===0x49 && b[i+2]===0x2a && b[i+3]===0x00) { t=i; le=true;  break; }
  if (b[i]===0x4d && b[i+1]===0x4d && b[i+2]===0x00 && b[i+3]===0x2a) { t=i; le=false; break; }
}
if (t < 0) { console.log(`  ${name}: NO EXIF AT ALL`); process.exit(0); }

const dv = new DataView(b.buffer, b.byteOffset + t, b.length - t);
const u16 = (o:number) => dv.getUint16(o, le);
const u32 = (o:number) => dv.getUint32(o, le);
const str = (off:number, cnt:number) => new TextDecoder().decode(b.slice(t+off, t+off+cnt-1)).replace(/\0/g,"");

const TAGS: Record<number,string> = {
  0x010f:"Make", 0x0110:"Model", 0x0112:"Orientation",
  0x0132:"DateTime", 0x8769:"ExifIFD", 0x8825:"GPS IFD",
};

const ifd0 = u32(4);
const n = u16(ifd0);
console.log(`  ${name}: EXIF present — ${n} tags in IFD0`);
let gpsOff = 0;
for (let i = 0; i < n; i++) {
  const o = ifd0 + 2 + i*12;
  const tag = u16(o), type = u16(o+2), cnt = u32(o+4);
  if (tag === 0x8825) gpsOff = u32(o+8);
  const label = TAGS[tag];
  if (!label) continue;
  let val = "";
  if (type === 2) { const p = cnt > 4 ? u32(o+8) : o+8; val = " = " + str(p, cnt); }
  else if (type === 3) val = " = " + u16(o+8);
  console.log(`      ${label}${val}`);
}
if (gpsOff) {
  const gn = u16(gpsOff);
  console.log(`      >>> GPS IFD PRESENT — ${gn} entries. This file records where it was taken.`);
} else {
  console.log(`      >>> no GPS IFD`);
}
