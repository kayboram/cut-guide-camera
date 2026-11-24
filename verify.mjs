import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = Object.fromEntries(
  await Promise.all(["index.html", "app.js", "styles.css", "docs/multica-proxy.md"].map(async (name) => [name, await readFile(new URL(name, import.meta.url), "utf8")])),
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

assert.ok(files["app.js"].includes('const MULTICA_SETTINGS_KEY = "cgc-multica-settings-v1"'));
assert.equal((files["app.js"].match(/cgc-multica-settings-v1/g) || []).length, 1, "new settings must use one dedicated key");
for (const [campaign, issue] of Object.entries({
  "garden-of-life-women-probiotic": "BLOG-1053",
  "hidehere-hospital": "BLOG-1240",
  "bad-luck-cleaner-chime": "BLOG-1257",
  "ofmom-slim-inner-beauty": "BLOG-1295",
  "arpe-patch-a": "BLOG-1270",
  "arpe-patch-b": "BLOG-1270",
  "marienb-ntz20": "BLOG-1216",
})) {
  assert.ok(files["app.js"].includes(`"${campaign}": "${issue}"`), `${campaign} must map to ${issue}`);
}
assert.match(files["app.js"], /formData\.append\("issue_id", session\.issue\.id\)/);
assert.match(files["app.js"], /attachment_ids: session\.files\.map/);
assert.match(files["docs/multica-proxy.md"], /Access-Control-Allow-Origin/);
assert.equal((files["index.html"].match(/완료 · 멀티카로 전송/g) || []).length, 0, "send labels are populated from state so empty campaigns stay disabled");
assert.equal((files["index.html"].match(/class="multica-send-button"/g) || []).length, 3, "two send buttons plus ZIP fallback must remain");

for (const [name, count] of [
  ["올센느 8컷 · 기존 작업", 8],
  ["하이드히어 입원준비물 · 12컷", 12],
  ["액운클리너 풍경종 · 10컷", 10],
  ["오브맘 슬림&이너뷰티 · 11컷", 11],
  ["아르페 패치 글A · 9컷", 9],
  ["아르페 패치 글B · 11컷", 11],
  ["마리앤비 NTZ20 · 15컷", 15],
  ["가든오브라이프 여성 유산균 · 18컷", 18],
]) {
  assert.ok(files["app.js"].includes(`name: "${name}"`), `${name} (${count}) preset must remain`);
}

assert.match(files["index.html"], /id="requirements-banner"/);
assert.match(files["index.html"], /기본 카메라로 찍은 사진을 칸마다 올려요/);
assert.match(files["index.html"], /안 찍은 첫 칸부터 올리기/);

console.log("컷가이드 업로드 전용 정적 검증 통과");
