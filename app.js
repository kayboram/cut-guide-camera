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

const SAMPLE_REQUIREMENTS = `필수 컷: 화장실 문고리에 걸어 연출
옷장 방향제 키워드 사용 시: 옷장 옷걸이·문고리에 건 컷 필수
권장 컷: 차량 룸미러에 걸어 연출
제품 4종이 한 화면에 보이는 구성 포함`;

const el = (id) => document.getElementById(id);
const setupScreen = el("setup-screen");
const cameraScreen = el("camera-screen");
const cutInput = el("cut-input");
const requirementsInput = el("requirements-input");
const parseMessage = el("parse-message");
const setupCutList = el("setup-cut-list");
const guideImage = el("guide-image");
const video = el("camera-video");

let state = loadState();
let currentIndex = 0;
let cameraStream = null;
let referenceUrl = null;
let referenceUrls = [];
let currentReferences = [];
let setupReferenceUrls = [];
let messageTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.cuts?.length) {
      return {
        requirements: "",
        requirementsCollapsed: false,
        ...saved,
        cuts: saved.cuts.map((cut) => ({ selectedReference: 0, ...cut })),
      };
    }
  } catch (_) {}
  return { sourceText: "", requirements: "", requirementsCollapsed: false, cuts: [], opacity: 38, overlayOn: true };
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
    selectedReference: state.cuts[index]?.selectedReference || 0,
  }));
}

function createList() {
  const cuts = parseCuts(cutInput.value);
  if (!cuts.length) {
    parseMessage.textContent = "읽을 수 있는 컷이 없어요. 한 줄에 하나씩 적어 주세요.";
    return;
  }
  state.sourceText = cutInput.value;
  state.requirements = requirementsInput.value.trim();
  state.cuts = mergeProgress(cuts);
  saveState();
  parseMessage.textContent = `${cuts.length}개 컷을 만들었어요.`;
  renderSetupList();
}

async function renderSetupList() {
  const panel = el("cut-list-panel");
  panel.classList.toggle("hidden", !state.cuts.length);
  setupReferenceUrls.forEach((url) => URL.revokeObjectURL(url));
  setupReferenceUrls = [];
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
      <div class="reference-editor">
        <div class="setup-references" aria-label="등록한 예시 사진"></div>
        <label class="image-picker"><span>사진 추가</span><input type="file" accept="image/*" multiple /></label>
      </div>`;
    const previewList = item.querySelector(".setup-references");
    const input = item.querySelector("input");
    const savedImages = await getReferences(cut.id);
    savedImages.forEach((file, imageIndex) => {
      const preview = document.createElement("div");
      preview.className = "setup-reference";
      const url = URL.createObjectURL(file);
      setupReferenceUrls.push(url);
      preview.innerHTML = `<img src="${url}" alt="예시 사진 ${imageIndex + 1}" /><button class="delete-reference" type="button" aria-label="예시 사진 ${imageIndex + 1} 삭제">×</button>`;
      preview.querySelector("button").addEventListener("click", async () => {
        const nextImages = savedImages.filter((_, savedIndex) => savedIndex !== imageIndex);
        await putReferences(cut.id, nextImages);
        cut.selectedReference = Math.min(cut.selectedReference || 0, Math.max(0, nextImages.length - 1));
        saveState();
        await renderSetupList();
      });
      previewList.append(preview);
    });
    input.addEventListener("change", async () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      await putReferences(cut.id, [...savedImages, ...files]);
      input.value = "";
      await renderSetupList();
    });
    setupCutList.append(item);
  }
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

  referenceUrls.forEach((url) => URL.revokeObjectURL(url));
  referenceUrls = [];
  currentReferences = await getReferences(cut.id);
  cut.selectedReference = Math.min(cut.selectedReference || 0, Math.max(0, currentReferences.length - 1));
  referenceUrls = currentReferences.map((reference) => URL.createObjectURL(reference));
  referenceUrl = referenceUrls[cut.selectedReference] || null;
  guideImage.src = referenceUrl || "";
  guideImage.style.opacity = String(state.opacity / 100);
  updateOverlayControls(Boolean(referenceUrl));
  renderReferenceSelector();
  renderRequirements();
  renderDrawer();
}

function selectReference(index) {
  const cut = state.cuts[currentIndex];
  if (!cut || !referenceUrls.length) return;
  cut.selectedReference = Math.min(referenceUrls.length - 1, Math.max(0, index));
  referenceUrl = referenceUrls[cut.selectedReference];
  guideImage.src = referenceUrl;
  saveState();
  updateOverlayControls(true);
  renderReferenceSelector();
}

function renderReferenceSelector() {
  const selector = el("reference-selector");
  const thumbnails = el("reference-thumbnails");
  const cut = state.cuts[currentIndex];
  const selected = cut?.selectedReference || 0;
  selector.classList.toggle("hidden", referenceUrls.length < 2);
  thumbnails.replaceChildren();
  referenceUrls.forEach((url, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `reference-thumbnail${index === selected ? " active" : ""}`;
    button.setAttribute("aria-label", `예시 사진 ${index + 1} 선택`);
    button.setAttribute("aria-pressed", String(index === selected));
    button.innerHTML = `<img src="${url}" alt="" />`;
    button.addEventListener("click", () => selectReference(index));
    thumbnails.append(button);
    if (index === selected) requestAnimationFrame(() => button.scrollIntoView({ block: "nearest", inline: "center" }));
  });
  el("reference-previous-button").disabled = selected === 0;
  el("reference-next-button").disabled = selected >= referenceUrls.length - 1;
}

function renderRequirements() {
  const summary = state.requirements?.trim() || "입력된 업체 필수 조건이 없어요.";
  el("requirements-summary").textContent = summary;
  el("requirements-banner").classList.toggle("collapsed", state.requirementsCollapsed);
  el("requirements-toggle").setAttribute("aria-expanded", String(!state.requirementsCollapsed));
  el("requirements-chevron").textContent = state.requirementsCollapsed ? "⌄" : "⌃";
  requestAnimationFrame(updateRequirementsHeight);
}

function updateRequirementsHeight() {
  const height = el("requirements-banner").getBoundingClientRect().height;
  cameraScreen.style.setProperty("--requirements-height", `${height}px`);
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

async function putReferences(key, files) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).put(files, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getReferences(key) {
  try {
    const db = await openDb();
    const saved = await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE).objectStore(DB_STORE).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (Array.isArray(saved)) return saved;
    if (saved instanceof Blob) return [saved];
    return [];
  } catch (_) {
    return [];
  }
}

el("sample-button").addEventListener("click", () => {
  cutInput.value = SAMPLE_TEXT;
  requirementsInput.value = SAMPLE_REQUIREMENTS;
  createList();
});
el("parse-button").addEventListener("click", createList);
requirementsInput.addEventListener("input", () => {
  state.requirements = requirementsInput.value.trim();
  saveState();
});
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
el("reference-previous-button").addEventListener("click", () => selectReference((state.cuts[currentIndex]?.selectedReference || 0) - 1));
el("reference-next-button").addEventListener("click", () => selectReference((state.cuts[currentIndex]?.selectedReference || 0) + 1));
el("requirements-toggle").addEventListener("click", () => {
  state.requirementsCollapsed = !state.requirementsCollapsed;
  saveState();
  renderRequirements();
});

window.addEventListener("pagehide", stopCamera);
window.addEventListener("resize", updateRequirementsHeight);
cutInput.value = state.sourceText;
requirementsInput.value = state.requirements || "";
renderSetupList();
