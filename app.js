const STORAGE_KEY = "cut-guide-camera-state-v1";
const DB_NAME = "cut-guide-camera";
const DB_STORE = "reference-images";

const SAMPLE_TEXT = `| 컷 | 무엇을 | 팁 |
|---|---|---|
| 1 | 택배 받은 그대로 / 4종 한 번에 | 밝은 자연광 |
| 2 | 파우치 앞면 확대 | 디자인이 보이게 |
| 3 | 4종 파우치 나란히 | 색 구성 |
| 4 | 파우치에서 꺼낸 종이방향제 | 손에 들고 |
| 5 | 화장실 문고리에 건 모습 | 필수 |
| 6 | 옷장 옷걸이·문고리에 건 모습 | 옷장방향제를 제목에 쓰면 필수 |
| 7 | 차 룸미러에 건 모습 | 차 가능할 때만. 권장 컷 |
| 8 | 선물 포장처럼 몇 개 묶은 모습 | 집들이 선물 문단용 |`;

const el = (id) => document.getElementById(id);
const setupScreen = el("setup-screen");
const cameraScreen = el("camera-screen");
const cutInput = el("cut-input");
const parseMessage = el("parse-message");
const setupCutList = el("setup-cut-list");
const guideImage = el("guide-image");
const video = el("camera-video");

let state = loadState();
let currentIndex = 0;
let cameraStream = null;
let referenceUrl = null;
let messageTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.cuts?.length) return saved;
  } catch (_) {}
  return { sourceText: "", cuts: [], opacity: 38, overlayOn: true };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function parseCuts(text) {
  const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsed = [];

  rows.forEach((line) => {
    if (/^\|?\s*:?-{3,}/.test(line)) return;
    const markdown = line.startsWith("|") || line.endsWith("|");
    const parts = line.split("|").map((part) => part.trim()).filter((part, index, all) => {
      if (!part && (index === 0 || index === all.length - 1)) return false;
      return true;
    });
    if (!parts.length) return;
    if (/^(컷|cut|번호|#)$/i.test(parts[0]) || /무엇을|내용|이름/.test(parts[1] || "")) return;

    if (parts.length >= 2) {
      parsed.push({ title: parts[1] || parts[0], tip: parts.slice(2).join(" · "), done: false });
      return;
    }

    const cleaned = parts[0]
      .replace(/^[-*]\s+/, "")
      .replace(/^(?:컷\s*)?\d+\s*[.)\-:]?\s*/i, "")
      .trim();
    if (cleaned) parsed.push({ title: cleaned, tip: "", done: false });
  });

  return parsed.map((cut, index) => ({ id: `cut-${Date.now()}-${index}`, ...cut }));
}

function mergeProgress(newCuts) {
  return newCuts.map((cut, index) => ({
    ...cut,
    id: state.cuts[index]?.id || cut.id,
    done: state.cuts[index]?.title === cut.title ? state.cuts[index].done : false,
  }));
}

function createList() {
  const cuts = parseCuts(cutInput.value);
  if (!cuts.length) {
    parseMessage.textContent = "읽을 수 있는 컷이 없어요. 한 줄에 하나씩 적어 주세요.";
    return;
  }
  state.sourceText = cutInput.value;
  state.cuts = mergeProgress(cuts);
  saveState();
  parseMessage.textContent = `${cuts.length}개 컷을 만들었어요.`;
  renderSetupList();
}

async function renderSetupList() {
  const panel = el("cut-list-panel");
  panel.classList.toggle("hidden", !state.cuts.length);
  setupCutList.replaceChildren();
  const done = state.cuts.filter((cut) => cut.done).length;
  el("setup-progress").textContent = `${done}/${state.cuts.length} 촬영`;

  for (let index = 0; index < state.cuts.length; index += 1) {
    const cut = state.cuts[index];
    const item = document.createElement("article");
    item.className = "setup-cut";
    item.innerHTML = `
      <span class="cut-number">${String(index + 1).padStart(2, "0")}</span>
      <div><h3>${escapeHtml(cut.title)}</h3><p>${escapeHtml(cut.tip || "팁 없음")}</p></div>
      <label class="image-picker"><span>사진 선택</span><input type="file" accept="image/*" /></label>`;
    const picker = item.querySelector(".image-picker");
    const input = item.querySelector("input");
    const savedImage = await getReference(cut.id);
    if (savedImage) showPickerPreview(picker, savedImage);
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      await putReference(cut.id, file);
      showPickerPreview(picker, file);
    });
    setupCutList.append(item);
  }
}

function showPickerPreview(picker, file) {
  const oldUrl = picker.dataset.url;
  if (oldUrl) URL.revokeObjectURL(oldUrl);
  const url = URL.createObjectURL(file);
  picker.dataset.url = url;
  picker.style.backgroundImage = `linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.42)), url("${url}")`;
  picker.classList.add("has-image");
  picker.querySelector("span").textContent = "바꾸기";
}

async function startCamera() {
  if (!state.cuts.length) return;
  setupScreen.classList.add("hidden");
  cameraScreen.classList.remove("hidden");
  currentIndex = Math.max(0, state.cuts.findIndex((cut) => !cut.done));
  if (currentIndex < 0) currentIndex = 0;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    });
    video.srcObject = cameraStream;
    await video.play();
    await renderCamera();
  } catch (error) {
    showCameraMessage("카메라 권한을 허용해 주세요.", 4500);
    console.error(error);
  }
}

function stopCamera() {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  video.srcObject = null;
}

async function renderCamera() {
  const cut = state.cuts[currentIndex];
  if (!cut) return;
  el("camera-counter").textContent = `컷 ${currentIndex + 1} / ${state.cuts.length} · 남은 컷 ${state.cuts.filter((item) => !item.done).length}`;
  el("camera-cut-title").textContent = cut.title;
  el("camera-tip").textContent = cut.tip || "예시 구도에 맞춰 찍어 보세요";
  el("opacity-slider").value = state.opacity;
  el("previous-button").disabled = currentIndex === 0;
  el("next-button").disabled = currentIndex === state.cuts.length - 1;

  if (referenceUrl) URL.revokeObjectURL(referenceUrl);
  const reference = await getReference(cut.id);
  referenceUrl = reference ? URL.createObjectURL(reference) : null;
  guideImage.src = referenceUrl || "";
  guideImage.style.opacity = String(state.opacity / 100);
  updateOverlayControls(Boolean(reference));
  renderDrawer();
}

function updateOverlayControls(hasReference) {
  const controls = document.querySelector(".overlay-controls");
  const toggle = el("overlay-toggle");
  controls.classList.toggle("disabled", !hasReference);
  toggle.disabled = !hasReference;
  el("opacity-slider").disabled = !hasReference;
  guideImage.classList.toggle("hidden", !hasReference || !state.overlayOn);
  toggle.classList.toggle("active", hasReference && state.overlayOn);
  toggle.textContent = hasReference ? (state.overlayOn ? "겹침 끄기" : "겹침 켜기") : "예시 사진 없음";
}

function moveCut(change) {
  currentIndex = Math.min(state.cuts.length - 1, Math.max(0, currentIndex + change));
  renderCamera();
}

async function capturePhoto() {
  if (!video.videoWidth || !video.videoHeight) {
    showCameraMessage("카메라가 준비될 때까지 잠깐 기다려 주세요.");
    return;
  }
  const canvas = el("capture-canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) return;

  const cut = state.cuts[currentIndex];
  const filename = makeFilename(currentIndex + 1, cut.title);
  const file = new File([blob], filename, { type: "image/jpeg" });
  let saved = false;

  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      saved = true;
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1500);
      saved = true;
    }
  } catch (error) {
    if (error?.name !== "AbortError") showCameraMessage("저장하지 못했어요. 다시 찍어 주세요.");
  }

  if (!saved) return;
  cut.done = true;
  saveState();
  showCameraMessage(`${filename} 저장 완료`);
  const nextUndone = state.cuts.findIndex((item, index) => index > currentIndex && !item.done);
  if (nextUndone >= 0) currentIndex = nextUndone;
  else if (currentIndex < state.cuts.length - 1) currentIndex += 1;
  await renderCamera();
}

function makeFilename(number, title) {
  const safeTitle = title.replace(/[^가-힣a-zA-Z0-9]+/g, "").slice(0, 24) || "사진";
  return `컷${String(number).padStart(2, "0")}_${safeTitle}.jpg`;
}

function renderDrawer() {
  const drawerList = el("drawer-list");
  drawerList.replaceChildren();
  const done = state.cuts.filter((cut) => cut.done).length;
  el("drawer-progress").textContent = `${done}컷 완료 · ${state.cuts.length - done}컷 남음`;
  state.cuts.forEach((cut, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `drawer-cut${cut.done ? " done" : ""}${index === currentIndex ? " current" : ""}`;
    button.innerHTML = `<span class="cut-number">${cut.done ? "✓" : String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(cut.title)}</strong><small>${cut.done ? "다시 찍기" : "찍기"}</small>`;
    button.addEventListener("click", () => {
      currentIndex = index;
      el("cut-drawer").classList.add("hidden");
      renderCamera();
    });
    drawerList.append(button);
  });
}

function showCameraMessage(message, duration = 2200) {
  const output = el("camera-message");
  output.textContent = message;
  output.classList.add("show");
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => output.classList.remove("show"), duration);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putReference(key, file) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).put(file, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getReference(key) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE).objectStore(DB_STORE).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (_) {
    return null;
  }
}

el("sample-button").addEventListener("click", () => { cutInput.value = SAMPLE_TEXT; createList(); });
el("parse-button").addEventListener("click", createList);
el("start-button").addEventListener("click", startCamera);
el("back-button").addEventListener("click", () => { stopCamera(); cameraScreen.classList.add("hidden"); setupScreen.classList.remove("hidden"); renderSetupList(); });
el("edit-list-button").addEventListener("click", () => el("back-button").click());
el("previous-button").addEventListener("click", () => moveCut(-1));
el("next-button").addEventListener("click", () => moveCut(1));
el("shutter-button").addEventListener("click", capturePhoto);
el("list-button").addEventListener("click", () => el("cut-drawer").classList.remove("hidden"));
el("close-drawer-button").addEventListener("click", () => el("cut-drawer").classList.add("hidden"));
el("overlay-toggle").addEventListener("click", () => { state.overlayOn = !state.overlayOn; saveState(); updateOverlayControls(Boolean(referenceUrl)); });
el("opacity-slider").addEventListener("input", (event) => { state.opacity = Number(event.target.value); guideImage.style.opacity = String(state.opacity / 100); saveState(); });

window.addEventListener("pagehide", stopCamera);
cutInput.value = state.sourceText;
renderSetupList();
