# 컷가이드 카메라

휴대폰 카메라 위에 촬영 컷 정보와 예시 사진을 반투명하게 띄워 보는 정적 웹앱입니다. 서버나 외부 라이브러리가 없고, 사진은 기기 안에서만 처리합니다.

## 로컬 실행

HTTPS가 아닌 `localhost`에서도 카메라 사용은 허용됩니다.

```bash
cd tools/cut-camera
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 공개 전 확인할 점

- 배포 후보: 별도 공개 저장소 `kayboram/cut-guide-camera`
- 주소 후보: `https://kayboram.github.io/cut-guide-camera/`
- 현재 작업 저장소의 다른 자료는 공개 저장소로 복사하지 않습니다.
- GitHub Pages 배포는 케이 확인 후 진행합니다.
