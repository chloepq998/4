# 이니티움 실시간 구현소 — 갤러리 프로토타입

소학술제 부스용 "오늘의 제작 갤러리"입니다. 로컬에서는 의존성 설치 없이도 동작하고(Node 내장 모듈만 사용), Vercel에 배포하면 Upstash Redis를 통해 데이터가 영구 저장됩니다.

## 로컬에서 실행하기

```bash
cd booth
node server.js
```

기본 포트는 3000번입니다 (`PORT=4321 node server.js`처럼 바꿀 수 있습니다). 로컬 실행 시 Redis 환경변수가 없으면 자동으로 `data/apps.json` 파일에 저장됩니다.

- 운영 콘솔(구현자용, 관객에게 노출 X): http://localhost:3000/console.html
- 갤러리(관객용, iPad/QR로 보여줄 화면): http://localhost:3000/gallery.html

갤러리는 가상의 폰 한 대로 표시됩니다. 콘솔에서 새 프로토타입을 추가하면 2.5초마다 자동으로 폴링하여, 그 폰의 홈 화면에 앱 아이콘이 설치되는 애니메이션과 함께 실시간으로 나타납니다. 아이콘을 탭하면 해당 프로토타입의 상세 화면(앱처럼)이 열리고, ‹ 홈 버튼으로 다시 홈 화면으로 돌아갑니다. 투표 템플릿은 실제로 집계되고, 기기당 1회만 투표할 수 있도록 localStorage로 제한합니다.

## Vercel에 배포하기

1. 이 저장소를 GitHub에 push한 상태에서 [vercel.com](https://vercel.com) → **Add New → Project** → 이 저장소를 import 합니다.
2. **Root Directory를 `booth`로 지정합니다** (저장소 루트에는 다른 프로젝트도 있으므로 꼭 `booth` 폴더를 가리켜야 합니다).
3. 프로젝트 생성 후 **Storage** 탭 → **Create Database** → Marketplace에서 **Redis(Upstash)** 통합을 추가하고 이 프로젝트에 연결합니다. 연결하면 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` 환경변수가 자동으로 주입됩니다.
4. Deploy를 누르면 끝입니다. 같은 도메인의 `/console.html`, `/gallery.html`로 접속하면 됩니다.

배포 후에는 모든 프로토타입/투표 데이터가 Redis에 저장되어 서버리스 함수가 재시작되어도 유지됩니다. 환경변수가 없는 로컬 환경에서는 계속 `data/apps.json` 파일을 사용하므로, 평소 개발/리허설은 추가 설정 없이 그대로 하면 됩니다.

## 지금 버전의 한계 (다음에 다듬을 것)

- 템플릿별 전용 입력 폼(혼잡도 슬라이더, 체크리스트 항목 등)은 아직 없고, 지금은 제목+한줄요약(또는 투표 선택지)만 받습니다.
- 지도 템플릿의 학교 평면도 배경 그래픽은 아직 없습니다.
