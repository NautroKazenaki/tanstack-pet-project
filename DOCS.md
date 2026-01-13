# 📚 Документация Pet-проекта: TanStack + FSD

> Справочник по технологиям, архитектуре и паттернам проекта

## 🎯 Обзор проекта

Этот проект создан для изучения современного стека технологий React-экосистемы с применением архитектуры Feature-Sliced Design (FSD).

### Основной стек технологий

- **React 19** - UI библиотека
- **TypeScript 5.9** - типизация
- **Vite 7** - сборщик и dev-сервер
- **TanStack Router** - файловый роутинг
- **TanStack Query** - управление серверным состоянием
- **OpenAPI Fetch** - типизированные API запросы
- **CSS Modules** - изолированные стили

---

## 📁 Архитектура: Feature-Sliced Design (FSD)

### Структура проекта

```
src/
├── app/                    # Слой приложения (инициализация)
│   ├── entrypoint/        # Точка входа
│   │   └── main.tsx       # Рендер приложения
│   ├── routes/            # Роуты приложения
│   │   ├── __root.tsx     # Корневой роут
│   │   ├── index.tsx      # Главная страница
│   │   └── my-playlists.tsx
│   ├── layouts/           # Глобальные лайауты
│   │   └── root-layout.tsx
│   ├── styles/            # Глобальные стили
│   │   ├── reset.css
│   │   └── index.css
│   └── routeTree.gen.ts   # Автогенерируемое дерево роутов
│
├── pages/                 # Слой страниц (композиция)
│   ├── playlists-page.tsx
│   └── my-playlists-page.tsx
│
├── features/              # Слой фичей (бизнес-логика)
│   └── playlists.tsx
│
└── shared/                # Слой shared (переиспользуемое)
    ├── api/               # API клиент и схемы
    │   ├── client.ts      # Настроенный HTTP клиент
    │   ├── schema.ts      # TypeScript типы из OpenAPI
    │   └── openapi.json   # OpenAPI спецификация
    └── ui/                # Переиспользуемые UI компоненты
        └── header.tsx
```

### Принципы слоёв FSD

#### 1. **App** - Инициализация приложения
- Настройка провайдеров (Router, Query, Theme)
- Глобальные стили
- Роуты приложения

#### 2. **Pages** - Композиция страниц
- Собирают features и widgets в страницы
- Минимум логики, максимум композиции

#### 3. **Features** - Бизнес-функциональность
- Законченные пользовательские сценарии
- Могут использовать shared

#### 4. **Shared** - Переиспользуемый код
- UI-kit компоненты
- API клиенты
- Утилиты
- Константы

---

## 🛠 Технологии и паттерны

### 1. TanStack Router - Файловый роутинг

#### Концепция
TanStack Router использует **файловую структуру** для определения роутов. Каждый файл в `app/routes/` автоматически становится маршрутом.

#### Структура роутов

```typescript
app/routes/
├── __root.tsx           → корневой роут (обёртка для всех)
├── index.tsx            → / (главная)
├── my-playlists.tsx     → /my-playlists
└── oauth/
    └── callback.tsx     → /oauth/callback
```

#### Пример: Корневой роут (`__root.tsx`)

```typescript
import {createRootRoute} from '@tanstack/react-router'
import { RootLayout } from '../layouts/root-layout'

export const Route = createRootRoute({
    component: RootLayout
})
```

#### Пример: Страничный роут (`index.tsx`)

```typescript
import { createFileRoute } from "@tanstack/react-router";
import PlaylistsPage from "../../pages/playlists-page";

// Путь '/' автоматически определяется из имени файла (index)
export const Route = createFileRoute('/')({
    component: PlaylistsPage
})
```

#### Навигация между роутами

```typescript
import {Link} from '@tanstack/react-router'

// Типизированная навигация
<Link to="/">Все плейлисты</Link>
<Link to="/my-playlists">Мои плейлисты</Link>
```

#### Конфигурация в Vite

```typescript
// vite.config.ts
import {tanstackRouter} from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      routesDirectory: './src/app/routes',        // где искать роуты
      generatedRouteTree: './src/app/routeTree.gen.ts', // куда генерить дерево
      target: 'react',
      autoCodeSplitting: true,  // автоматический code-splitting
    }),
    react()
  ],
})
```

#### Регистрация типов роутера

```typescript
// main.tsx
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen.ts'

const router = createRouter({routeTree})

// Регистрация для TypeScript автокомплита
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

---

### 2. TanStack Query - Управление серверным состоянием

#### Концепция
TanStack Query (React Query) - библиотека для **кеширования, синхронизации и обновления** серверных данных.

#### Настройка QueryClient

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,           // данные никогда не устаревают
      refetchOnMount: false,         // не перезапрашивать при монтировании
      refetchOnWindowFocus: false,   // не перезапрашивать при фокусе окна
      refetchOnReconnect: false,     // не перезапрашивать при reconnect
      retry: false                   // не повторять при ошибке
    }
  }
})

<QueryClientProvider client={queryClient}>
  <ReactQueryDevtools initialIsOpen={false} />
  <RouterProvider router={router} />
</QueryClientProvider>
```

#### Пример: useQuery для получения данных

```typescript
// features/playlists.tsx
import { useQuery } from "@tanstack/react-query"
import { client } from "../shared/api/client"

export const Playlists = () => {
    const query = useQuery({
        queryKey: ['playlists'],  // уникальный ключ для кеша
        queryFn: async () => {
            const response = await client.GET('/playlists')
            
            // Обработка ошибок
            if (response.error) {
                throw response.error
            }
            
            return response.data
        }
    })

    // Состояния загрузки
    if (query.status === 'pending') return <span>Loading...</span>
    if (query.isError) return <span>{query.error.message}</span>

    // Рендер данных
    return (
        <div>
            {query.fetchStatus === 'fetching' ? 'Обновление...' : null}
            <ul>
                {query.data.data.map(playlist => (
                    <li key={playlist.id}>
                        {playlist.attributes.title}
                    </li>
                ))}
            </ul>
        </div>
    )
}
```

#### Ключевые концепции Query

| Свойство | Описание |
|----------|----------|
| `queryKey` | Уникальный ключ для кеширования (массив) |
| `queryFn` | Функция для получения данных (Promise) |
| `status` | Статус запроса: `pending` \| `error` \| `success` |
| `fetchStatus` | Статус фетчинга: `idle` \| `fetching` \| `paused` |
| `data` | Полученные данные |
| `error` | Объект ошибки |
| `isLoading` | `true` при первой загрузке |
| `isFetching` | `true` при любой загрузке (включая фоновую) |

---

### 3. OpenAPI Fetch - Типизированные API запросы

#### Концепция
`openapi-fetch` автоматически генерирует TypeScript типы из OpenAPI спецификации и предоставляет типизированный HTTP клиент.

#### Workflow генерации типов

```bash
# 1. OpenAPI схема уже скачана в src/shared/api/openapi.json

# 2. Генерация TypeScript типов
npm run api:gen

# Эта команда выполняет:
# openapi-typescript ./src/shared/api/openapi.json 
#   -o ./src/shared/api/schema.ts 
#   --root-types
```

#### Создание типизированного клиента

```typescript
// shared/api/client.ts
import createClient from 'openapi-fetch';
import type { paths } from './schema';  // автогенерированные типы

export const client = createClient<paths>({
    baseUrl: "https://musicfun.it-incubator.app/api/1.0/",
    headers: {
        'api-key': "2892e453-fa01-42fb-9adc-33d6c592c78d"
    }
})
```

#### Использование клиента с автокомплитом

```typescript
// Полная типизация пути, параметров и ответа
const response = await client.GET('/playlists')

// TypeScript знает структуру:
response.data         // данные при успехе
response.error        // ошибка при неудаче
response.response     // нативный Response object

// Типизированные параметры
const user = await client.GET('/users/{id}', {
    params: {
        path: { id: '123' },      // path параметры
        query: { include: 'all' }  // query параметры
    }
})

// POST с телом запроса
const created = await client.POST('/playlists', {
    body: {
        title: 'New Playlist',
        // TypeScript проверит все поля
    }
})
```

#### Обновление API схемы

Когда API обновляется:

```bash
# 1. Скачать новую схему (вручную)
node -e "const fs = require('fs'); fetch('https://musicfun.it-incubator.app/api-json').then(r => r.text()).then(t => fs.writeFileSync('src/shared/api/openapi.json', t))"

# 2. Регенерировать типы
npm run api:gen
```

---

### 4. CSS Modules - Изолированные стили

#### Концепция
CSS Modules автоматически создают уникальные имена классов, предотвращая конфликты стилей.

#### Создание модуля

```css
/* header.module.css */
.header {
    background: #fff;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.linksBlock {
    display: flex;
    gap: 20px;
}
```

#### Использование в компоненте

```typescript
// header.tsx
import styles from './header.module.css'

export const Header = () => (
    <header className={styles.header}>
        <div className={styles.container}>
            <div className={styles.linksBlock}>
                {/* контент */}
            </div>
        </div>
    </header>
)
```

#### Преимущества

- ✅ Локальная область видимости классов
- ✅ Автокомплит в TypeScript
- ✅ Нет конфликтов имён
- ✅ Дедупликация стилей при сборке

---

### 5. TypeScript паттерны

#### Типизация props компонентов

```typescript
import type {ReactNode} from 'react'

type Props = {
    renderAccountBar: () => ReactNode
}

export const Header = ({renderAccountBar}: Props) => (
    <header>
        {renderAccountBar()}
    </header>
)
```

#### Работа с генерируемыми типами

```typescript
// Типы автоматически импортируются из schema.ts
import type { paths } from './shared/api/schema'

// Извлечение типа конкретного эндпоинта
type PlaylistsResponse = paths['/playlists']['get']['responses']['200']['content']['application/json']
```

#### Типизация асинхронных функций

```typescript
const queryFn = async () => {
    const response = await client.GET('/playlists')
    
    if (response.error) {
        // Явное приведение для обработки ошибок
        throw (response as unknown as {error: Error}).error!
    }
    
    return response.data  // TypeScript выведет правильный тип
}
```

---

## 🎨 Композиция компонентов (паттерн Render Props)

### Пример из проекта

```typescript
// shared/ui/header.tsx
type Props = {
    renderAccountBar: () => ReactNode  // принимаем функцию рендера
}

export const Header = ({renderAccountBar}: Props) => (
    <header>
        <nav>{/* навигация */}</nav>
        <div>{renderAccountBar()}</div>  {/* вызываем переданную функцию */}
    </header>
)

// app/layouts/root-layout.tsx
export const RootLayout = () => (
    <>
        <Header 
            renderAccountBar={() => <div>Account</div>}  {/* передаём реализацию */}
        />
        <Outlet />
    </>
)
```

### Преимущества паттерна

- Header остаётся в shared (не знает о бизнес-логике)
- RootLayout управляет содержимым (можем передать авторизацию, профиль и т.д.)
- Гибкость без prop drilling

---

## 🔧 Утилиты и команды

### Команды проекта

```bash
# Разработка
npm run dev          # Запуск dev-сервера (http://localhost:5173)

# Сборка
npm run build        # Production сборка

# Линтинг
npm run lint         # Проверка кода ESLint

# API
npm run api:gen      # Генерация TypeScript типов из OpenAPI схемы
```

### Структура package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "api:gen": "openapi-typescript ./src/shared/api/openapi.json -o ./src/shared/api/schema.ts --root-types"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.90.16",    // Управление серверным состоянием
    "@tanstack/react-router": "^1.147.3",   // Роутинг
    "openapi-fetch": "^0.15.0",             // Типизированный HTTP клиент
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@tanstack/router-plugin": "^1.149.0",  // Vite плагин для роутера
    "openapi-typescript": "^7.10.1",        // Генератор типов из OpenAPI
    "typescript": "~5.9.3",
    "vite": "^7.2.4"
  }
}
```

---

## 📝 Чеклист для добавления новой фичи

### 1. Создание новой страницы

- [ ] Создать компонент в `src/pages/`
- [ ] Создать роут в `src/app/routes/`
- [ ] Добавить навигацию в Header (если нужно)

### 2. Добавление API эндпоинта

- [ ] Проверить наличие в `src/shared/api/openapi.json`
- [ ] Если нужно - обновить схему и запустить `npm run api:gen`
- [ ] Использовать `client.GET()` / `client.POST()` с автокомплитом

### 3. Создание фичи с данными

- [ ] Создать компонент в `src/features/`
- [ ] Использовать `useQuery` для загрузки данных
- [ ] Обработать состояния: pending, error, success
- [ ] Интегрировать в страницу через композицию

### 4. Добавление UI компонента

- [ ] Создать в `src/shared/ui/`
- [ ] Создать `.module.css` файл для стилей
- [ ] Типизировать props
- [ ] Сделать переиспользуемым (без бизнес-логики)

---

## 🐛 Типичные проблемы и решения

### Проблема: TypeScript ошибка в createFileRoute()

```
Argument of type '"/"' is not assignable to parameter of type 'undefined'
```

**Причина:** Файл `routeTree.gen.ts` не сгенерирован

**Решение:** Запустить `npm run dev` - плагин автоматически создаст файл

---

### Проблема: openapi-typescript выдаёт ECONNRESET

**Причина:** Проблемы с сетевым соединением или внешними референсами в OpenAPI схеме

**Решение:** Использовать локальный файл вместо URL:
1. Скачать схему в `src/shared/api/openapi.json`
2. Изменить команду на: `openapi-typescript ./src/shared/api/openapi.json ...`

---

### Проблема: Query не обновляется при изменении данных

**Причина:** Данные кешированы, `staleTime: Infinity`

**Решение:** 
- Использовать `queryClient.invalidateQueries(['queryKey'])`
- Или использовать `useMutation` для изменения данных

---

## 📚 Полезные ссылки

### Официальная документация

- [TanStack Router](https://tanstack.com/router/latest) - файловый роутинг
- [TanStack Query](https://tanstack.com/query/latest) - серверное состояние
- [OpenAPI TypeScript](https://openapi-ts.dev/) - генерация типов
- [Feature-Sliced Design](https://feature-sliced.design/ru/) - архитектура

### Дополнительные материалы

- [React 19 Docs](https://react.dev/) - официальная документация React
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - справочник TS
- [Vite Guide](https://vite.dev/guide/) - документация Vite

---

## 🎯 Следующие шаги для изучения

1. **Мутации данных** - `useMutation` для POST/PUT/DELETE
2. **Оптимистичные обновления** - обновление UI до получения ответа сервера
3. **Suspense** - React Suspense для загрузки данных
4. **Prefetching** - предзагрузка данных для улучшения UX
5. **Error Boundaries** - обработка ошибок на уровне компонентов
6. **Loader данных в роутах** - загрузка данных до рендера страницы

---

*Документация обновлена: 13.01.2026*

