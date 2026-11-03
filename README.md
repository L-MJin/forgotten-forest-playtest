# 잊힌 숲 — 웹 플레이테스트

이 저장소는 게임을 Render의 정적 사이트에서 테스트하기 위한 것입니다.

- `index.html`: 기존 게임 전체 (차세계 v16.8, 슬라임 v16.2 포함)
- `live-patch.js`: 앞으로의 수정사항을 추가하는 작고 독립적인 스크립트

## 배포

Render Static Site로 배포하고 다음과 같이 설정합니다.

- Repository: 이 저장소
- Branch: `main`
- Build Command: `echo ready`
- Publish Directory: `.`
- Auto Deploy: Yes

게임 수정 시 `live-patch.js`를 커밋하면 Render가 같은 URL로 새 버전을 배포합니다.
수정 확인은 일반 새로고침 또는 Ctrl+Shift+R로 진행합니다.

## 주의

테스트 링크는 Render가 발급한 공개 주소입니다. GitHub 저장소를 비공개로 만들더라도 테스트 링크를 아는 사람은 게임을 볼 수 있습니다.
