# 멀티카 전송 프록시 붙이기

> 2026-11-26: 케이 계정에 `https://multica-proxy.kay-boram.workers.dev` 로 배포 완료. 앱 기본값이라 프록시 주소 칸은 비워 둔다. 코드 바꿀 때는 이 파일의 코드로 `npx wrangler deploy` (이름 `multica-proxy`).

컷가이드 카메라는 `https://kayboram.github.io`에서 열리지만 멀티카 API는 현재 `https://multica.ai`만 브라우저 호출을 허용합니다. 2026-11-20 실측에서 `https://kayboram.github.io` 오리진의 사전 요청은 HTTP 200이었지만 `Access-Control-Allow-Origin`이 없었고, 같은 요청을 `https://multica.ai`에서 보내면 해당 헤더와 인증·콘텐츠 헤더 허용값이 돌아왔습니다. 그래서 아이폰 브라우저에서 버튼 한 번으로 직접 보내려면 아래의 본인 전용 프록시가 필요합니다. 프록시가 없어도 앱의 ZIP 공유와 댓글 복사는 작동합니다.

## Cloudflare Worker 코드

Cloudflare Workers 무료 플랜에서 새 Worker를 만든 뒤 아래 코드를 통째로 붙여 넣습니다. 토큰은 Worker에 저장하지 않습니다. 앱이 보낸 `Authorization` 헤더를 그 요청 한 번에만 멀티카 API로 그대로 전달합니다.

```js
const ALLOWED_ORIGIN = "https://kayboram.github.io";
const API_ORIGIN = "https://api.multica.ai";

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    if (origin !== ALLOWED_ORIGIN) {
      return new Response("허용되지 않은 사이트입니다.", { status: 403 });
    }

    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const incoming = new URL(request.url);
    const upstream = new URL(incoming.pathname + incoming.search, API_ORIGIN);
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("origin");

    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });
    const responseHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(cors)) responseHeaders.set(key, value);
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  },
};
```

## 5분 배포 순서

1. Cloudflare 대시보드에서 **Workers & Pages → Create → Worker**를 누릅니다.
2. 위 코드를 붙여 넣고 **Deploy**를 누릅니다.
3. 발급된 `https://이름.계정.workers.dev` 주소를 복사합니다.
4. 컷가이드 카메라의 **⚙ 멀티카 설정 → 프록시 주소**에 붙여 넣고 저장합니다.
5. **연결 테스트**에서 `연결됨(이름)`이 나오는지 확인합니다.

## 주의할 점

- `multipart/form-data` 파일 업로드의 `Content-Type`과 본문은 Worker에서 다시 만들거나 수정하면 안 됩니다. 경계(boundary)가 바뀌면 파일이 깨집니다.
- 현재 앱은 멀티카의 `POST /api/upload-file`을 사용합니다. 나중에 API가 사전 서명된 `PUT` 업로드 주소를 돌려주는 방식으로 바뀌면, 그 별도 저장소 호스트에도 CORS가 필요하거나 Worker가 그 호스트를 안전하게 중계해야 합니다.
- Cloudflare 무료 플랜과 멀티카 서버의 요청 크기 제한보다 큰 영상은 실패할 수 있습니다. 큰 영상은 ZIP 공유 경로를 쓰는 편이 안전합니다.
- `corsproxy.io`, `allorigins`, `r.jina.ai` 같은 공용 프록시에 토큰을 보내면 안 됩니다.
