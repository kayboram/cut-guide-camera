import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = Object.fromEntries(
  await Promise.all(["index.html", "app.js", "styles.css"].map(async (name) => [name, await readFile(new URL(name, import.meta.url), "utf8")])),
);
const allSource = Object.values(files).join("\n");

assert.equal((allSource.match(/getUserMedia/g) || []).length, 0, "getUserMedia must not remain");
assert.equal((allSource.match(/\bcapture\s*=/g) || []).length, 0, "file inputs must not use capture");
assert.match(files["app.js"], /accept="\$\{isVideoCut \? "video\/\*,image\/\*" : "image\/\*"\}" multiple/);
assert.match(files["app.js"], /existing\.concat\(prepared\)/, "new files must append to existing IndexedDB files");
assert.match(files["app.js"], /2048 \/ longest/);
assert.match(files["app.js"], /toBlob\(resolve, "image\/jpeg", 0\.9\)/);

for (const value of [
  "cut-guide-camera-state-v1",
  "cut-guide-camera-campaign-states-v2",
  "cut-guide-camera-active-campaign-v2",
  "cut-guide-camera",
  "reference-images",
]) {
  assert.ok(files["app.js"].includes(`"${value}"`), `${value} must stay unchanged`);
}

for (const [name, count] of [
  ["올센느 8컷 · 기존 작업", 8],
  ["하이드히어 입원준비물 · 12컷", 12],
  ["액운클리너 풍경종 · 10컷", 10],
  ["오브맘 슬림&이너뷰티 · 10컷", 10],
  ["아르페 패치 글A · 7컷", 7],
  ["아르페 패치 글B · 9컷", 9],
  ["마리앤비 NTZ20 · 13컷", 13],
  ["가든오브라이프 여성 유산균 · 18컷", 18],
]) {
  assert.ok(files["app.js"].includes(`name: "${name}"`), `${name} (${count}) preset must remain`);
}

assert.match(files["index.html"], /id="requirements-banner"/);
assert.match(files["index.html"], /기본 카메라로 찍은 사진을 칸마다 올려요/);
assert.match(files["index.html"], /안 찍은 첫 칸부터 올리기/);

console.log("컷가이드 업로드 전용 정적 검증 통과");
