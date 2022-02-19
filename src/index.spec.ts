import { getImagePaths, calcImageHash, findDuplicate } from "./";
import path from "path";

const TEST_DATA_DIR = path.join(__dirname, "./test_data");

describe("getImageFiles", () => {
  it("should work", async () => {
    const dirPath = TEST_DATA_DIR;
    const files = await getImagePaths(dirPath);
    expect(files).toHaveLength(2);
  });
});

describe("calcImageHash", () => {
  it("should work", async () => {
    const hashs = await Promise.all(
      [
        path.join(TEST_DATA_DIR, "image1.jpg"),
        path.join(TEST_DATA_DIR, "image2.jpg"),
        path.join(TEST_DATA_DIR, "image2.jpg"),
      ].map(calcImageHash)
    );
    expect(hashs[0]).not.toBe(hashs[1]);
    expect(hashs[1]).toBe(hashs[2]);
  });
});
