# Agent Guide for `Rental`

## 1. Pham vi

Tai lieu nay ap dung cho project `Rental/` trong repo nay. Muc tieu la giu cho thay doi moi:

- Dung vi tri trong kien truc hien tai
- Giu naming/convention nhat quan
- Khong pha vo flow controller -> service -> repository -> entity
- Chay kiem tra truoc khi commit

## 2. Tong quan cau truc thu muc

```text
Rental/
  backend/
    src/
      app.js                 # khoi tao express app, middleware, route registration
      server.js              # bootstrap env, DB, sequelize sync, Socket.IO
      config/                # database config
      constants/             # hang so dung chung, vd roles
      controllers/           # HTTP layer
        admin/               # route/controller cho admin
        landlord/            # route/controller cho landlord
      services/              # business logic
        admin/               # service cho admin
        landlord/            # service cho landlord
      repositories/          # truy cap du lieu qua Sequelize entity
      entities/              # dinh nghia Sequelize model + association
      models/                # mapper/normalizer/serializer cho payload domain
      middleware/            # auth, authorize, validate, rate limit, error handler
      validators/            # validate req body/query, tra ve { error }
      utils/                 # response, token, transaction, pagination, upload...
      scripts/               # script phu tro, vd seed
      seeders/               # du lieu seed
    tests/                   # jest unit test cho service/controller
    uploads/                 # file upload runtime
  frontend/
    src/
      main.jsx               # entry point
      App.jsx                # route tree
      api/                   # axios client
      assets/                # static asset duoc import tu code
      components/            # UI component
        admin/
        common/
        home/
        landlord/
        layout/
        room/
      context/               # React context
      hooks/                 # custom hooks
      pages/                 # route-level page
        admin/
        landlord/
      services/              # goi API, cache invalidation
      utils/                 # helper UI/api/storage
    public/                  # static file, icon, css global
  docs/                      # tai lieu/mockup HTML tham khao
```

## 3. Kien truc backend

- Backend dang theo flow: `controller -> service -> repository -> entity`.
- `controller` chi nen lam 4 viec: doc `req`, goi service, tra `sendSuccess`, chuyen loi qua `next(error)`.
- `service` chua business logic, validate nghiep vu, phan quyen bo sung, transaction orchestration, throw `ApiError` khi co loi.
- `repository` chi truy cap DB. Khong dua business rule vao day.
- `entity` la dinh nghia bang Sequelize.
- `models/` dung cho convert/normalize/attach du lieu domain, khong phai noi viet query.
- Route duoc dang ky trong moi controller qua `registerRoutes(app, "/api")`, sau do duoc mount trong `backend/src/app.js`.

### Tach theo vai tro

- Public/shared controller nam o `backend/src/controllers/*.js`
- Landlord controller nam o `backend/src/controllers/landlord/*.js`
- Admin controller nam o `backend/src/controllers/admin/*.js`
- Service duoc tach tuong ung theo vai tro trong `services/`

Khi them tinh nang moi:

- Neu API chi danh cho admin/landlord, dat dung namespace `admin/` hoac `landlord/`
- Neu logic dung chung nhieu role, uu tien de o service/repository chung

## 4. Kien truc frontend

- Frontend dung React + Vite + JSX module.
- `pages/` la route-level container.
- `components/` la UI co the tai su dung, tach theo domain (`admin`, `landlord`, `room`, `common`, `layout`, `home`).
- `services/` la lop goi HTTP qua `api/client.js`, khong nen dat fetch truc tiep trai rac trong component neu da co service phu hop.
- `context/` chua state toan cuc.
- `hooks/` chua logic tai su dung.
- `utils/` chua helper tinh toan/format/cache/storage.

## 5. Dat file o dau khi them code moi

- Them endpoint moi:
  - `controllers/`
  - `services/`
  - `repositories/` neu can query moi
  - `validators/` neu co body/query validation
  - `tests/` cho service/controller chinh
- Them bang/quan he moi:
  - `entities/`
  - cap nhat `entities/index.js`
  - them repository neu can abstraction truy cap
- Them man hinh frontend:
  - `pages/`
  - tach component con vao `components/<domain>/` neu page dai
  - goi API qua `services/`

## 6. Naming convention

### Backend

- File backend dung `camelCase.js`
  - `roomController.js`
  - `authService.js`
  - `roomRepository.js`
  - `roomValidator.js`
- Class dung `PascalCase`
  - `RoomController`
  - `AuthService`
- Instance export singleton:
  - `module.exports = new RoomController(roomService);`
- Bien va ham dung `camelCase`
  - `listRooms`
  - `getReportStatus`
  - `normalizeSearchText`
- ID field dat ro nghia:
  - `roomId`, `userId`, `reportId`, `landlordId`
- Collection dat dang so nhieu:
  - `rooms`, `images`, `reviews`
- Boolean dat prefix:
  - `isProduction`, `isLandlord`, `shouldSync`, `hasToken`
- Payload trung gian uu tien cac ten dang duoc dung san:
  - `payload`, `options`, `where`, `nextPayload`, `parsedDetails`, `normalizedKeyword`, `existingReport`

### Frontend

- Component, page, context file dung `PascalCase.jsx`
  - `RoomsPage.jsx`
  - `SiteHeader.jsx`
  - `AuthContext.jsx`
- Hook dung `useXxx.js` hoac `useXxx.jsx`
  - `useAuth.js`
  - `useChatConversation.js`
- Service frontend hien tai dung `PascalCase.js`
  - `RoomService.js`
  - `AuthService.js`
- Helper/util dung `camelCase.js`
  - `storage.js`
  - `apiResponse.js`

## 7. Convention code quan trong

### Backend

- Controller phai mo, ro, ngan; khong dua query phuc tap vao controller.
- Service la noi kiem tra rule nghiep vu va throw `ApiError(status, message)`.
- Multi-write flow phai di qua `runInTransaction(...)`.
- Response thanh cong dung `sendSuccess(...)`, khong tu `.json(...)` theo kieu tuy y.
- Loi di qua `next(error)` de `errorHandler` xu ly tap trung.
- Query DB thong qua repository, tranh goi truc tiep entity khap noi neu da co repository phu hop.
- Validator tra ve object dang `{ error: { message } }` hoac `{ error: null }` de middleware `validate` dung lai.
- Uu tien su dung alias `@/` thay vi relative import dai.

### Frontend

- Uu tien functional component.
- State local o page/component; state dung chung moi dua vao `context/`.
- Goi API qua service layer, khong lap lai axios config trong nhieu component.
- Neu da co cache helper (`publicCache`, `apiResponse`, `storage`) thi dung lai thay vi tu viet cach khac.
- Component lon can tach component con vao `components/<domain>/`.

## 8. Format code

Repo hien tai chua co Prettier chung cho backend/frontend, vi vay:

- Khong mass reformat file khong lien quan.
- Giu style theo file dang sua de tranh diff lon vo ich.
- Mac dinh cho file moi:
  - indent 2 spaces
  - co semicolon
  - uu tien double quotes
  - dong trong giua cac khoi logic lon
  - destructuring khi giup code ro hon
- Backend co mot so file cu dung tab; khi sua nho phan do, uu tien giu style co san cua file do.
- JSX nen xuong dong ro rang khi props dai, giong cac page/component hien tai.
- Ten import sap xep hop ly: thu vien ngoai truoc, sau do alias noi bo, sau cung la util/hepler cuc bo neu co.
- Uu tien tiếng việt có dấu.

## 9. Quy tac viet logic

- Khong dua business rule vao repository.
- Khong dua formatting response vao service.
- Ham nen co mot trach nhiem ro rang.
- Neu mot ham can nhieu buoc chuyen doi du lieu, tach helper private trong class/service.
- Neu co gia tri trung gian de doc hon, dat bien co nghia thay vi chain qua dai.
- Khong dat ten bien qua ngan nhu `a`, `b`, `tmp` neu khong phai loop index cuc nho.

## 10. API va error handling

- Success response theo shape chuan cua du an:
  - `{ success, message, data, meta? }`
- Error response duoc xu ly tap trung boi middleware.
- Khi co loi nghiep vu, throw `ApiError`.
- Khi tra list co phan trang, shape uu tien:
  - `total`, `page`, `limit`, `data`

## 11. Test va check truoc khi commit

### Backend

Chay trong `Rental/backend`:

```bash
npm test
```

Bat buoc khi sua:

- service backend
- repository/query anh huong logic nghiep vu
- controller backend
- auth, room, appointment, review, favorite, chat, admin, landlord flow

Neu them logic moi ma chua co test, them it nhat unit test cho case chinh va case loi.

### Frontend

Chay trong `Rental/frontend`:

```bash
npm run lint
npm run build
```

Bat buoc khi sua:

- page/component JSX
- service frontend
- context/hook
- router/layout

### Full-stack

Neu thay doi ca backend va frontend, chay toan bo:

```bash
# backend
cd Rental/backend
npm test

# frontend
cd ../frontend
npm run lint
npm run build
```

## 12. Checklist truoc commit

- Dat file dung thu muc va dung namespace role (`admin`, `landlord`, `common`) neu can
- Khong de business logic trong controller/repository sai tang
- Dung `@/` alias khi phu hop
- Dung shape response va error handling dung chuan
- Khong de debug code: `console.log`, comment tam, code chet
- Khong sua file khong lien quan
- Da chay lenh kiem tra phu hop voi pham vi thay doi
- Neu co them API moi, da cap nhat frontend service hoac test lien quan
- Neu co transaction nhieu bang, da dung `runInTransaction`

## 13. Commit message goi y

- `backend: add room report status endpoint`
- `frontend: refactor landlord room modal`
- `fullstack: support room report workflow`

Commit nen mo ta:

- pham vi thay doi
- doi tuong chinh
- muc dich thay doi

## 14. Khong nen lam

- Khong import entity truc tiep vao controller de query DB
- Khong tra response custom moi moi endpoint
- Khong fetch API truc tiep khap page neu da co service layer
- Khong doi style ca file/ca repo chi de "dep hon"
- Khong commit khi chua chay test/lint/build lien quan
