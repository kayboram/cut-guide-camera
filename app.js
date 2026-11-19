const STORAGE_KEY = "cut-guide-camera-state-v1";
const CAMPAIGN_STORAGE_KEY = "cut-guide-camera-campaign-states-v2";
const ACTIVE_CAMPAIGN_KEY = "cut-guide-camera-active-campaign-v2";
const DB_NAME = "cut-guide-camera";
const DB_STORE = "reference-images";
const LEGACY_CAMPAIGN_ID = "legacy-allsenne";

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

const CAMPAIGNS = [
  { id: LEGACY_CAMPAIGN_ID, name: "올센느 8컷 · 기존 작업", sourceText: SAMPLE_TEXT, requirements: SAMPLE_REQUIREMENTS },
  {
    id: "hidehere-hospital",
    name: "하이드히어 입원준비물 · 12컷",
    requirements: `제목: 입원준비물 + (휴대용 화장품/파우치형 화장품/기초화장품 세트/가성비 화장품 중 1개) + 하이드히어
필수 콘셉트: 실제 입원 준비물과 함께 하이드히어를 챙기는 모습
필수 링크: 구매 링크 본문에 (쇼핑커넥트 가능)
제출: 11/09~11/23`,
    sourceText: `| 컷 | 무엇을 | 팁 |
|---|---|---|
| 1 | 택배 상자 | 송장 개인정보 가리기 |
| 2 | 5종 한 번에 펼침 | 위에서 · 제품명 읽히게 |
| 3 | 파우치 1개 손에 든 모습 | 크기·두께 감 |
| 4 | 파우치 뒷면 | 전성분·사용기한 읽히게 가까이 |
| 5 | 입원 준비물 + 5종 펼침 | 필수 · 위에서 · 대표 사진 |
| 6 | 세면 파우치에 5종 | 지퍼 열린 채 |
| 7 | 입원가방에 다 넣은 모습 | 필수 · 화장품 부피 작아 보이게 |
| 8 | 에센스·크림 제형 손등 | 2장 · 빛 비스듬히 |
| 9 | 폼 클렌저 거품 | 손바닥 위 |
| 10 | 바르는 장면 | 손+볼만 |
| 11 | 협탁에 슬리핑 마스크+물병 | 선택 · 병실 느낌 |
| 12 | 큰 용기 옆 파우치 | 부피 비교 · 타사 로고 뒤로 |`,
  },
  {
    id: "bad-luck-cleaner-chime",
    name: "액운클리너 풍경종 · 10컷",
    requirements: `필수 사진: 포장 상태 / 손에 올린 크기 / 빗자루 문구·풍경종 근접 / 현관에 건 모습 / 공간 전체 1장
권장 영상: 배경음악 없이 문 여닫는 종소리 10초
제목: 액운클리너 + 주제 키워드 1개
필수 키워드: 연말 선물, 새해 선물, 2027년 삼재띠, 액막이 소품, 인테리어 소품
본문 하단 링크: https://vo.la/9QcXXKO
제출: 11/20~11/26`,
    sourceText: `| 컷 | 무엇을 | 팁 |
|---|---|---|
| 1 | 택배 상자·포장 그대로 | 필수 · 송장 가리기 |
| 2 | 구성품 전체 (본품+사은품) | 위에서 |
| 3 | 손바닥에 올린 모습 | 필수 · 크기 보이게 |
| 4 | 빗자루 문구 근접 | 필수 · 글자 읽히게 |
| 5 | 풍경종 근접 | 필수 |
| 6 | 문에 거는 과정 | 자석후크 쓰면 후크도 |
| 7 | 현관문에 건 모습 근접 | 필수 · 현관등 켜기 |
| 8 | 현관 전체 | 필수 · 한두 걸음 뒤 세로 |
| 9 | 선물 포장해 본 모습 | 선택 |
| 10 | 영상: 문 여닫는 종소리 | 권장 · 10초 · 배경음악 없이 |`,
  },
  {
    id: "ofmom-slim-inner-beauty",
    name: "오브맘 슬림&이너뷰티 · 10컷",
    requirements: `사진 5장 이상 필수: 제품 단독컷 / 섭취컷(손, 일상) / 패키지·내용물 디테일컷
권장: 영상 또는 GIF 1개
필수 문구: 본 포스팅은 제품을 제공받아 솔직하게 작성되었습니다.
필수 키워드: 다이소 건강기능식품, 다이소 영양제, 가성비 영양제, 오브맘 다이어트, 오브맘
글자: 600자 이상
제출: 11/17~11/29`,
    sourceText: `| 컷 | 무엇을 | 팁 |
|---|---|---|
| 1 | 택배 연 모습 (두 상품) | 송장 가리기 |
| 2 | CLA 상자 앞면 | 필수 단독컷 · 흰 바탕 |
| 3 | 톡톡 상자 앞면 | 필수 단독컷 · 흰 바탕 |
| 4 | 두 상자 뒷면 성분표 | 필수 디테일컷 · 글씨 읽히게 |
| 5 | 알약판 + 캡슐 손가락 옆 | 디테일컷 · 크기 |
| 6 | 톡톡 스틱 + 덜어 낸 가루 | 디테일컷 · 알갱이 보이게 |
| 7 | 손에 캡슐 2개 | 필수 섭취컷 · 식탁 일상 |
| 8 | 톡톡 스틱 먹기 직전 | 필수 섭취컷 · 얼굴 X |
| 9 | 가방에 넣은 모습 | 권장 · 휴대성 |
| 10 | 영상: 톡톡 튀는 가루 | 권장 · 5초 |`,
  },
  {
    id: "arpe-patch-a",
    name: "아르페 패치 글A · 7컷",
    requirements: `사진 필수: 제품 단독컷 2장 + 사용컷 3장 이상
필수 문구: 올리브영 온라인몰에서 '아르페'를 검색하면 구매할 수 있다는 내용
공정위 문구: 본 콘텐츠는 아르페 제품을 체험하고 솔직하게 작성한 후기입니다.
필수 키워드: 아르페, 마이크로니들패치, 여드름패치, 트러블패치, 초기진정패치
글자: 700자 이상 · 공개 3개월 이상
제출: 11/13~11/30 (캠페인마다 글 1편)`,
    sourceText: `| 컷 | 무엇을 | 팁 |
|---|---|---|
| 1 | 택배 연 모습 (두 상품) | 송장 가리기 |
| 2 | 10패치 상자 앞면 | 필수 단독컷 |
| 3 | 10패치 시트 · 패치 한 장 근접 | 필수 단독컷 |
| 4 | 붙이기 전 트러블 부위 | 필수 사용컷 · 부위만 |
| 5 | 붙인 모습 | 필수 사용컷 · 4번과 같은 각도 |
| 6 | 아침에 떼어낸 패치 | 필수 사용컷 · 팁 쪽 |
| 7 | 다음 날 아침 같은 부위 | 4번과 같은 각도·빛 |`,
  },
  {
    id: "arpe-patch-b",
    name: "아르페 패치 글B · 9컷",
    requirements: `사진 필수: 제품 단독컷 2장 + 사용컷 3장 이상
필수 문구: 올리브영 온라인몰에서 '아르페'를 검색하면 구매할 수 있다는 내용
공정위 문구: 본 콘텐츠는 아르페 제품을 체험하고 솔직하게 작성한 후기입니다.
필수 키워드: 아르페, 마이크로니들패치, 여드름패치, 트러블패치, 초기진정패치
글자: 700자 이상 · 공개 3개월 이상
제출: 11/13~11/30 (캠페인마다 글 1편)`,
    sourceText: `| 컷 | 무엇을 | 팁 |
|---|---|---|
| 1 | 27패치 상자 앞면 | 필수 단독컷 |
| 2 | 파우치 3개 펼침 | 필수 단독컷 · 위에서 |
| 3 | 10패치·27패치 손가락 옆 비교 | 크기 차이 |
| 4 | 붙이기 전 트러블 부위 | 필수 사용컷 · A와 다른 날 |
| 5 | 붙인 모습 | 필수 사용컷 · 4번과 같은 각도 |
| 6 | 아침에 떼어낸 패치 | 필수 사용컷 |
| 7 | 다음 날 아침 같은 부위 | 4번과 같은 각도·빛 |
| 8 | 가방에 파우치 넣은 모습 | 권장 |
| 9 | 밖에서 파우치 꺼내 쓰기 | 선택 |`,
  },
  {
    id: "marienb-ntz20",
    name: "마리앤비 NTZ20 · 13컷",
    requirements: `최소 10~14일 사용 후 작성
사진 8장 이상 권장 (직접 촬영) · 본문 1,500자 이상 권장
제목: 나이아신아마이드 세럼 또는 나이아신아마이드 20% + 마리앤비 NTZ20
첫 문단: 협찬 표시 > 피부 고민 > 쓴 이유 > 사용 기간
필수 링크: 공식 스마트스토어 (제품 정보 부분)
전후 사진: 선택, 같은 조명·각도, 보정 금지
제출: 11/23~12/07`,
    sourceText: `| 컷 | 무엇을 | 팁 |
|---|---|---|
| 1 | 택배 상자·포장 | 도착일 · 송장 가리기 |
| 2 | 박스 앞면 | 도착일 · NTZ20·20% 읽히게 |
| 3 | 박스 뒷면 전성분 | 도착일 · 사용기한 포함 |
| 4 | 용기+박스 크기 | 도착일 · 손이나 립밤 옆 |
| 5 | 스포이트 1회 양 | 1일차 · 손등 · 방울 수 메모 |
| 6 | 제형 클로즈업 | 1일차 · 2장 · 기울인 모습도 |
| 7 | 펴 바른 직후 손등 | 1일차 · 빛 비스듬히 |
| 8 | 1~2분 뒤 같은 손등 | 1일차 · 7번과 같은 각도 |
| 9 | 토너→세럼→크림 순서 | 타사 로고 뒤로 |
| 10 | 바르는 장면 | 손+볼만 |
| 11 | 선크림·메이크업 위 | 밀림 있으면 그것도 |
| 12 | 화장대에 둔 모습 | 생활감 |
| 13 | 2주 뒤 줄어든 양 | 14일차 · 처음과 같은 자리 |`,
  },
  {
    id: "garden-of-life-women-probiotic",
    name: "가든오브라이프 여성 유산균 · 18컷",
    requirements: `제목: '가든오브라이프 원스 데일리 여성 유산균' 꼭 넣기 (키워드 나열 금지)
메인 키워드: 여성유산균, 임산부유산균 — 제목 1번 + 본문 5번 이상
서브 키워드: 갱년기유산균, 유산균효능
분량: 본문 1,500자 이상 · 사진 15장 이상 · 영상 1개(세로 10~20초) · 공개 6개월 이상
필수 링크: https://brand.naver.com/cp/products/7361474734
필수 언급: 공식몰·스마트스토어·카카오 선물하기에서 판매 / 남성용도 있어 부부 선물로 좋음
"1위" 문구에는 출처 *SPINSSCAN 2015~2024 기준 꼭 붙이기
"질유산균" 대신 "질 유래 특허 유산균 3종"으로 쓰기
금지: 전도연 언급, 병 이름, 다른 회사 제품 노출·비교
제출: 11/05~11/22 (블로그 1건)`,
    sourceText: `| 컷 | 무엇을 | 팁 |
|---|---|---|
| 1 | 제품 박스 앞면 | 필수 단독컷 · 흰 바탕 |
| 2 | 제품 박스 앞면 비스듬히 | 제품명 읽히게 · 앞면 2장째 |
| 3 | 박스 뒷면 성분표 | 필수 · 글씨 선명 · 화면 눌러 초점 |
| 4 | 박스 옆면 (섭취법·주의사항) | 필수 · 글씨 선명 |
| 5 | 구성품 전체 | 위에서 · 설명서까지 |
| 6 | 구성품 펼침 (통·캡슐) | 위에서 · 2장째 |
| 7 | 포장·인증 마크 클로즈업 | 필수 · 가까이 · 흔들리지 않게 |
| 8 | 인증 마크 한 곳 더 | 글자 읽히게 |
| 9 | 캡슐 손바닥 위 | 크기 감 |
| 10 | 캡슐 + 동전 크기 비교 | 같은 높이에서 |
| 11 | 아침 물컵이랑 먹는 장면 | 필수 · 얼굴 X |
| 12 | 캡슐 먹기 직전 | 필수 · 손+입만 |
| 13 | 아침 식탁 (물컵·제품 통) | 필수 · 3장째 |
| 14 | 상온 보관 — 서랍·화장대 | 생활감 |
| 15 | 가방에 넣은 모습 | 휴대성 |
| 16 | (선택) 남성용과 같이 | 있으면 1장 |
| 17 | (선택) 1주일 뒤 줄어든 모습 | 처음과 같은 자리 |
| 18 | 영상: 상자 열고 캡슐 꺼내기 | 필수 · 세로 10~20초 |`,
  },
];

const el = (id) => document.getElementById(id);
const cutInput = el("cut-input");
const requirementsInput = el("requirements-input");
const parseMessage = el("parse-message");
const setupCutList = el("setup-cut-list");

let activeCampaignId = loadActiveCampaignId();
let state = loadState(activeCampaignId);
let setupExportFiles = [];
let setupObjectUrls = [];
let renderVersion = 0;
let previewObjectUrl = null;
let previewFile = null;
let pendingExportBatches = [];

function emptyState(sourceText = "", requirements = "") {
  return { sourceText, requirements, requirementsCollapsed: false, cuts: [], opacity: 38, overlayOn: true };
}

function normalizeState(saved) {
  return {
    requirements: "",
    requirementsCollapsed: false,
    opacity: 38,
    overlayOn: true,
    ...saved,
    cuts: saved.cuts.map((cut) => ({ selectedReference: 0, ...cut })),
  };
}

function loadActiveCampaignId() {
  const saved = localStorage.getItem(ACTIVE_CAMPAIGN_KEY);
  return CAMPAIGNS.some((campaign) => campaign.id === saved) ? saved : LEGACY_CAMPAIGN_ID;
}

function loadCampaignStates() {
  try {
    return JSON.parse(localStorage.getItem(CAMPAIGN_STORAGE_KEY)) || {};
  } catch (_) {
    return {};
  }
}

function createPresetState(campaign) {
  const preset = emptyState(campaign.sourceText, campaign.requirements);
  preset.cuts = parseCuts(campaign.sourceText).map((cut, index) => ({ ...cut, id: `${campaign.id}-cut-${index + 1}` }));
  return preset;
}

function loadState(campaignId) {
  const campaign = CAMPAIGNS.find((item) => item.id === campaignId) || CAMPAIGNS[0];
  if (campaignId !== LEGACY_CAMPAIGN_ID) {
    const saved = loadCampaignStates()[campaignId];
    return saved?.cuts?.length ? normalizeState(saved) : createPresetState(campaign);
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.cuts?.length) {
      return normalizeState(saved);
    }
  } catch (_) {}
  return createPresetState(campaign);
}

function saveState() {
  if (activeCampaignId === LEGACY_CAMPAIGN_ID) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return;
  }
  const campaignStates = loadCampaignStates();
  campaignStates[activeCampaignId] = state;
  localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaignStates));
}

function switchCampaign(campaignId) {
  if (campaignId === activeCampaignId) return;
  saveState();
  activeCampaignId = campaignId;
  localStorage.setItem(ACTIVE_CAMPAIGN_KEY, activeCampaignId);
  state = loadState(activeCampaignId);
  cutInput.value = state.sourceText;
  requirementsInput.value = state.requirements || "";
  parseMessage.textContent = `${state.cuts.length}개 컷을 불러왔어요.`;
  renderSetupList();
}

function parseCuts(text, idPrefix = "cut") {
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

  return parsed.map((cut, index) => ({ id: `${idPrefix}-${Date.now()}-${index}`, ...cut }));
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
  const idPrefix = activeCampaignId === LEGACY_CAMPAIGN_ID ? "cut" : activeCampaignId;
  const cuts = parseCuts(cutInput.value, idPrefix);
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
  const version = ++renderVersion;
  const panel = el("cut-list-panel");
  panel.classList.toggle("hidden", !state.cuts.length);
  setupObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  setupObjectUrls = [];
  setupExportFiles = [];
  setupCutList.replaceChildren();
  const done = state.cuts.filter((cut) => cut.done).length;
  el("setup-progress").textContent = `${done}/${state.cuts.length} 완료`;
  el("export-all-button").disabled = true;
  let totalImages = 0;

  renderRequirements();

  for (let index = 0; index < state.cuts.length; index += 1) {
    const cut = state.cuts[index];
    const isVideoCut = /영상/.test(`${cut.title} ${cut.tip || ""}`);
    const savedFiles = await getReferences(cut.id);
    if (version !== renderVersion) return;
    const uploadLabel = savedFiles.length ? "사진 더 올리기" : isVideoCut ? "영상 올리기" : "사진 올리기";
    const item = document.createElement("article");
    item.className = "setup-cut";
    item.dataset.cutIndex = String(index);
    item.innerHTML = `
      <span class="cut-number">${String(index + 1).padStart(2, "0")}</span>
      <div class="cut-heading">
        <div><h3>${escapeHtml(cut.title)}</h3><p>${escapeHtml(cut.tip || "팁 없음")}</p></div>
        <span class="cut-status">${cut.done ? "완료" : "아직 안 올림"}</span>
      </div>
      <div class="reference-editor">
        <div class="file-count">${savedFiles.length ? `${savedFiles.length}장` : ""}</div>
        <div class="setup-references"></div>
        <button class="shoot-cut-button" type="button">${uploadLabel}</button>
        <input class="file-input hidden" type="file" accept="${isVideoCut ? "video/*,image/*" : "image/*"}" multiple>
      </div>`;
    item.classList.toggle("done", cut.done);
    const input = item.querySelector(".file-input");
    item.querySelector(".shoot-cut-button").addEventListener("click", () => input.click());
    input.addEventListener("change", () => handleSelectedFiles(index, input));
    const references = item.querySelector(".setup-references");
    totalImages += savedFiles.length;
    savedFiles.forEach((file, imageIndex) => {
      setupExportFiles.push({ cutIndex: index, imageIndex, file: makeReferenceFile(file, index, imageIndex) });
      references.append(createReferenceThumbnail(file, index, imageIndex));
    });
    setupCutList.append(item);
  }

  el("export-toolbar").classList.toggle("hidden", totalImages === 0);
  el("export-all-button").textContent = `기존 저장 사진 꺼내기 (${totalImages}장)`;
  el("export-all-button").disabled = totalImages === 0;
}

function createReferenceThumbnail(file, cutIndex, imageIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "setup-reference";
  const preview = document.createElement("button");
  preview.type = "button";
  preview.className = "preview-reference";
  preview.setAttribute("aria-label", `컷 ${cutIndex + 1}의 ${imageIndex + 1}번째 파일 크게 보기`);
  const url = URL.createObjectURL(file);
  setupObjectUrls.push(url);
  const media = document.createElement(file.type?.startsWith("video/") ? "video" : "img");
  media.src = url;
  if (media.tagName === "VIDEO") {
    media.muted = true;
    media.playsInline = true;
    media.preload = "metadata";
  } else {
    media.alt = "";
  }
  preview.append(media);
  preview.addEventListener("click", () => openPreview(cutIndex, imageIndex, file));
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-reference";
  remove.setAttribute("aria-label", `${imageIndex + 1}번째 파일 삭제`);
  remove.textContent = "×";
  remove.addEventListener("click", () => deleteReference(cutIndex, imageIndex));
  wrapper.append(preview, remove);
  return wrapper;
}

async function handleSelectedFiles(cutIndex, input) {
  const selected = Array.from(input.files || []);
  input.value = "";
  if (!selected.length) return;
  const cut = state.cuts[cutIndex];
  const existing = await getReferences(cut.id);
  const prepared = [];
  let largeVideoCount = 0;

  for (const file of selected) {
    if (file.type.startsWith("video/")) {
      if (file.size > 100 * 1024 * 1024) largeVideoCount += 1;
      prepared.push(file);
      continue;
    }
    try {
      prepared.push(await resizeImage(file));
    } catch (error) {
      console.error(error);
      showExportMessage(`${file.name || "사진"}을 읽지 못했어요. 다른 사진을 골라 주세요.`);
    }
  }
  if (!prepared.length) return;
  if (largeVideoCount) showExportMessage("영상이 커요. 저장하는 데 시간이 걸릴 수 있어요.");

  try {
    await putReferences(cut.id, existing.concat(prepared));
  } catch (error) {
    console.error(error);
    showExportMessage(error?.name === "QuotaExceededError" ? "저장 공간이 부족해요." : "파일을 저장하지 못했어요. 다시 시도해 주세요.");
    return;
  }

  cut.done = true;
  saveState();
  const savedCount = existing.length + prepared.length;
  showExportMessage(`${cutIndex + 1}번 칸에 ${prepared.length}개를 올렸어요. 지금 ${savedCount}장 있어요.`);
  await renderSetupList();
  scrollToNextUndone(cutIndex);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("사진을 읽을 수 없습니다."));
    };
    image.src = url;
  });
}

async function resizeImage(file) {
  const image = await loadImage(file);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.min(1, 2048 / longest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("사진 변환에 실패했습니다.");
  const base = (file.name || "photo").replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: file.lastModified || Date.now() });
}

async function deleteReference(cutIndex, imageIndex) {
  const cut = state.cuts[cutIndex];
  const files = await getReferences(cut.id);
  files.splice(imageIndex, 1);
  try {
    await putReferences(cut.id, files);
  } catch (error) {
    console.error(error);
    showExportMessage("파일을 삭제하지 못했어요. 다시 시도해 주세요.");
    return;
  }
  if (!files.length) {
    cut.done = false;
    saveState();
  }
  showExportMessage(`${cutIndex + 1}번 칸에서 파일을 지웠어요.`);
  await renderSetupList();
}

function scrollToNextUndone(afterIndex = -1) {
  let nextIndex = state.cuts.findIndex((cut, index) => index > afterIndex && !cut.done);
  if (nextIndex < 0) nextIndex = state.cuts.findIndex((cut) => !cut.done);
  if (nextIndex < 0) return;
  setupCutList.querySelector(`[data-cut-index="${nextIndex}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function openFirstUndonePicker() {
  let index = state.cuts.findIndex((cut) => !cut.done);
  if (index < 0) index = 0;
  const item = setupCutList.querySelector(`[data-cut-index="${index}"]`);
  item?.scrollIntoView({ behavior: "smooth", block: "center" });
  item?.querySelector(".file-input")?.click();
}

function referenceExtension(type) {
  if (/video\/quicktime/i.test(type)) return "mov";
  if (/video\/webm/i.test(type)) return "webm";
  if (/video/i.test(type)) return "mp4";
  if (/svg/i.test(type)) return "svg";
  if (/png/i.test(type)) return "png";
  if (/webp/i.test(type)) return "webp";
  if (/gif/i.test(type)) return "gif";
  if (/avif/i.test(type)) return "avif";
  if (/hei[cf]/i.test(type)) return /heif/i.test(type) ? "heif" : "heic";
  return "jpg";
}

function makeReferenceFile(blob, cutIndex, imageIndex) {
  const type = blob.type || "image/jpeg";
  const extension = referenceExtension(type);
  const filename = `컷${String(cutIndex + 1).padStart(2, "0")}_${String(imageIndex + 1).padStart(2, "0")}.${extension}`;
  return new File([blob], filename, { type, lastModified: Date.now() });
}

function showExportMessage(message) {
  el("export-message").textContent = message;
}

function downloadFiles(files) {
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  });
}

async function shareOrDownload(files, title = "컷가이드 사진") {
  if (!files.length) return false;
  try {
    const shareData = { files, title };
    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      await navigator.share(shareData);
      showExportMessage(`${files.length}장 공유를 마쳤어요. 아이폰에서는 공유창의 ‘이미지 저장’을 선택해 주세요.`);
      return true;
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      showExportMessage("공유창을 닫았어요. 사진은 브라우저에 그대로 있습니다.");
      return false;
    }
    console.error(error);
  }
  downloadFiles(files);
  showExportMessage(`${files.length}장을 파일로 내려받았어요.`);
  return true;
}

function exportFiles(files, title) {
  if (!files.length) {
    showExportMessage("저장할 사진이 없어요.");
    return;
  }
  if (files.length > 10) {
    openExportSheet(files, title);
    return;
  }
  shareOrDownload(files, title);
}

function exportAll() {
  exportFiles(setupExportFiles.map((item) => item.file), "컷가이드 사진 전체");
}

function openPreview(cutIndex, imageIndex, blob) {
  closePreview();
  previewFile = makeReferenceFile(blob, cutIndex, imageIndex);
  previewObjectUrl = URL.createObjectURL(blob);
  el("preview-title").textContent = `컷 ${String(cutIndex + 1).padStart(2, "0")} · 파일 ${String(imageIndex + 1).padStart(2, "0")}`;
  const isVideo = blob.type?.startsWith("video/");
  el("preview-image").classList.toggle("hidden", isVideo);
  el("preview-video").classList.toggle("hidden", !isVideo);
  if (isVideo) el("preview-video").src = previewObjectUrl;
  else el("preview-image").src = previewObjectUrl;
  el("preview-modal").classList.remove("hidden");
  document.body.classList.add("modal-open");
  el("preview-close-button").focus();
}

function closePreview() {
  el("preview-modal").classList.add("hidden");
  el("preview-video").pause();
  el("preview-video").removeAttribute("src");
  el("preview-image").removeAttribute("src");
  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
  previewObjectUrl = null;
  previewFile = null;
  if (el("export-sheet").classList.contains("hidden")) document.body.classList.remove("modal-open");
}

function openExportSheet(files, title) {
  closePreview();
  pendingExportBatches = [];
  for (let index = 0; index < files.length; index += 10) pendingExportBatches.push(files.slice(index, index + 10));
  const list = el("export-batch-list");
  list.replaceChildren();
  pendingExportBatches.forEach((batch, index) => {
    const start = index * 10 + 1;
    const end = start + batch.length - 1;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "export-batch-button";
    button.textContent = `${start}~${end}번 사진 저장/공유 (${batch.length}장)`;
    button.addEventListener("click", () => shareOrDownload(batch, `${title} ${index + 1}`));
    list.append(button);
  });
  el("export-sheet").classList.remove("hidden");
  document.body.classList.add("modal-open");
  list.querySelector("button")?.focus();
}

function closeExportSheet() {
  el("export-sheet").classList.add("hidden");
  pendingExportBatches = [];
  document.body.classList.remove("modal-open");
}

function renderRequirements() {
  const summary = state.requirements?.trim() || "입력된 업체 필수 조건이 없어요.";
  el("requirements-summary").textContent = summary;
  el("requirements-banner").classList.toggle("collapsed", state.requirementsCollapsed);
  el("requirements-toggle").setAttribute("aria-expanded", String(!state.requirementsCollapsed));
  el("requirements-chevron").textContent = state.requirementsCollapsed ? "⌄" : "⌃";
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

CAMPAIGNS.forEach((campaign) => {
  const option = document.createElement("option");
  option.value = campaign.id;
  option.textContent = campaign.name;
  el("campaign-select").append(option);
});
el("campaign-select").value = activeCampaignId;
el("campaign-select").addEventListener("change", (event) => switchCampaign(event.target.value));
el("parse-button").addEventListener("click", createList);
el("export-all-button").addEventListener("click", exportAll);
requirementsInput.addEventListener("input", () => {
  state.requirements = requirementsInput.value.trim();
  saveState();
});
el("start-button").addEventListener("click", openFirstUndonePicker);
el("requirements-toggle").addEventListener("click", () => {
  state.requirementsCollapsed = !state.requirementsCollapsed;
  saveState();
  renderRequirements();
});
el("preview-close-button").addEventListener("click", closePreview);
el("preview-backdrop").addEventListener("click", closePreview);
el("preview-save-button").addEventListener("click", () => {
  if (previewFile) shareOrDownload([previewFile], previewFile.name);
});
el("export-close-button").addEventListener("click", closeExportSheet);
el("export-backdrop").addEventListener("click", closeExportSheet);
window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!el("preview-modal").classList.contains("hidden")) closePreview();
  if (!el("export-sheet").classList.contains("hidden")) closeExportSheet();
});

cutInput.value = state.sourceText;
requirementsInput.value = state.requirements || "";
renderSetupList();
