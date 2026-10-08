import { describe, expect, it } from "vitest";
import { HttpError, imageExtension, parseStyle } from "../server/validate.ts";

const png = (w = 4, h = 4) => {
  const b = Buffer.alloc(8 + 25 + 12);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "latin1");
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  b.writeUInt32BE(0, b.length - 12);
  b.write("IEND", b.length - 8, "latin1");
  return b;
};

const jpeg = (w = 8, h = 8, withFrame = true) => {
  const frame = Buffer.alloc(19);
  frame.set([0xff, 0xc0, 0x00, 0x11, 0x08]);
  frame.writeUInt16BE(h, 5);
  frame.writeUInt16BE(w, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), withFrame ? frame : Buffer.alloc(0), Buffer.from([0xff, 0xda, 0x00, 0x02]), Buffer.alloc(8), Buffer.from([0xff, 0xd9])]);
};

const webp = () => {
  const b = Buffer.alloc(30);
  b.write("RIFF", 0, "latin1");
  b.writeUInt32LE(b.length - 8, 4);
  b.write("WEBPVP8 ", 8, "latin1");
  return b;
};

const rejects = (b: Buffer) => expect(() => imageExtension(b)).toThrow(HttpError);

describe("imageExtension", () => {
  it("accepts well-formed PNG, JPEG and WebP files", () => {
    expect(imageExtension(png())).toBe("png");
    expect(imageExtension(jpeg())).toBe("jpg");
    expect(imageExtension(webp())).toBe("webp");
  });
  it("rejects a file that only starts like a JPEG", () => {
    rejects(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.from("<svg onload=alert(1)>".repeat(5))]));
    rejects(jpeg(8, 8, false));
  });
  it("rejects truncated files", () => {
    rejects(png().subarray(0, 30));
    rejects(jpeg().subarray(0, jpeg().length - 2));
    rejects(webp().subarray(0, 20));
  });
  it("rejects absurd dimensions", () => {
    rejects(png(100000, 4));
    rejects(jpeg(60000, 8));
  });
  it("rejects other types", () => {
    rejects(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>"));
  });
});

describe("parseStyle", () => {
  const base = { name: "Style", blurb: "", previews: [], format: [{ id: "a", kind: "slide" }], slides: [] };
  it("accepts a minimal style", () => {
    expect(parseStyle(base, "s1").name).toBe("Style");
  });
  it("requires a name and at least one position", () => {
    expect(() => parseStyle({ ...base, name: " " }, "s1")).toThrow(HttpError);
    expect(() => parseStyle({ ...base, format: [] }, "s1")).toThrow(HttpError);
  });
  it("drops pictures whose position is gone and rejects bad picture urls", () => {
    const url = "/uploads/11111111-1111-1111-1111-111111111111.png";
    expect(parseStyle({ ...base, slides: [{ id: "x", slotId: "gone", url, text: "" }] }, "s1").slides).toEqual([]);
    expect(() => parseStyle({ ...base, previews: ["/uploads/../etc/passwd"] }, "s1")).toThrow(HttpError);
  });
});
