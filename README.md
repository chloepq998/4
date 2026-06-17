# 우리 학교 분실물 찾기

학교 내 분실물·발견물을 등록하고 검색할 수 있는 단일 페이지 웹앱입니다.
빌드 도구 없이 `index.html` 하나로 동작합니다.

## 주요 기능

- 분실물 등록 (카테고리, 사진, 장소, 날짜, 학번·이름·반)
- 발견물 등록
- 유형·카테고리 필터, 키워드 검색
- 항목별 실시간 댓글(연락) 스레드
- "찾았어요 / 주인 찾음" 해결 처리

로그인 시스템은 없으며, 글·댓글 작성 시 입력하는 학번·이름·반으로 신원을 식별합니다.

## 실행 방법

```bash
python3 -m http.server 8000
```

이후 브라우저에서 `http://localhost:8000` 접속 (또는 `index.html`을 직접 열어도 동작합니다).

## 데이터 저장 (Firebase)

기존 Firebase 프로젝트(`mapp-a8e39`)를 재사용하며, 다른 프로젝트와 데이터가 섞이지 않도록
`lostfound/items`, `lostfound/comments` 루트 키 아래에 저장합니다. 사진은 Firebase Storage의
`lostfound_photos/` 경로에 업로드됩니다.

실제 운영 시에는 Firebase 콘솔에서 아래 사항을 설정하는 것을 권장합니다.

- `lostfound/items`, `lostfound/comments`: 공개 읽기/쓰기 + 데이터 형태 검증 규칙
- Storage: 이미지 타입 및 5MB 이하 용량 제한 규칙
- 별도 Firebase 프로젝트를 쓰고 싶다면 `index.html` 상단의 `firebaseConfig` 값을 교체하면 됩니다.
