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
│   │   ├── my-playlists.tsx
│   │   └── oauth/
│   │       └── callback.tsx  # OAuth callback
│   ├── layouts/           # Глобальные лайауты
│   │   └── root-layout.tsx
│   ├── styles/            # Глобальные стили
│   │   ├── reset.css
│   │   └── index.css
│   └── routeTree.gen.ts   # Автогенерируемое дерево роутов
│
├── pages/                 # Слой страниц (композиция)
│   ├── auth/
│   │   └── oauth-callback-page.tsx
│   ├── playlists-page.tsx
│   └── my-playlists-page.tsx
│
├── features/              # Слой фичей (бизнес-логика)
│   ├── auth/              # Фича аутентификации
│   │   ├── api/
│   │   │   ├── use-login-mutation.tsx
│   │   │   ├── use-logout-mutation.tsx
│   │   │   └── use-me.ts
│   │   └── ui/
│   │       ├── account-bar.tsx
│   │       ├── account-bar.module.css
│   │       ├── login-button.tsx
│   │       ├── logout-button.tsx
│   │       └── current-user/
│   │           └── current-user.tsx
│   └── playlists.tsx
│
└── shared/                # Слой shared (переиспользуемое)
    ├── api/               # API клиент и схемы
    │   ├── client.ts      # HTTP клиент с auth middleware
    │   ├── schema.ts      # TypeScript типы из OpenAPI
    │   └── openapi.json   # OpenAPI спецификация
    └── ui/                # Переиспользуемые UI компоненты
        └── header/
            ├── header.tsx
            └── header.module.css
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
- Структура фичи:
  ```
  features/[feature-name]/
  ├── api/           # Хуки для работы с API (queries, mutations)
  ├── ui/            # UI компоненты фичи
  ├── model/         # Бизнес-логика, состояние (если нужно)
  └── lib/           # Вспомогательные функции фичи (если нужно)
  ```

#### 4. **Shared** - Переиспользуемый код
- UI-kit компоненты (без бизнес-логики!)
- API клиенты и конфигурация
- Утилиты общего назначения
- Константы
- Типы

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

#### Пример: useMutation для изменения данных

```typescript
// features/auth/api/use-login-mutation.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "../../../shared/api/client"

export const useLoginMutation = () => {
    const queryClient = useQueryClient()
    
    const mutation = useMutation({
        // Функция для выполнения запроса
        mutationFn: async ({code}: {code: string}) => {
            const response = await client.POST('/auth/login', {
                body: {
                    code,
                    redirectUri: 'http://localhost:5173/oauth/callback',
                    rememberMe: true,
                    accessTokenTTL: '1d'
                }
            })
            if (response.error) throw new Error(response.error.message)
            return response.data
        },
        // Callback при успешном выполнении
        onSuccess: (data) => {
            // Сохранение токенов
            localStorage.setItem('musicfun-token', data.accessToken)
            localStorage.setItem('musicfun-refresh-token', data.refreshToken)
            
            // Инвалидация кеша для перезагрузки данных
            queryClient.invalidateQueries({
                queryKey: ['auth', 'me']
            })
        }
    })

    return mutation
}

// Использование в компоненте
export const LoginButton = () => {
    const mutation = useLoginMutation()
    
    const handleLogin = () => {
        mutation.mutate({code: 'auth-code'})
    }
    
    return <button onClick={handleLogin}>Login</button>
}
```

#### Ключевые концепции Mutation

| Свойство | Описание |
|----------|----------|
| `mutationFn` | Функция для изменения данных (Promise) |
| `mutate()` | Вызов мутации с параметрами |
| `onSuccess` | Callback при успешном выполнении |
| `onError` | Callback при ошибке |
| `status` | Статус: `idle` \| `pending` \| `error` \| `success` |
| `isPending` | `true` во время выполнения |
| `isError` | `true` при ошибке |
| `isSuccess` | `true` при успехе |

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

#### Middleware для авторизации и обновления токенов

```typescript
// shared/api/client.ts
import createClient, { type Middleware } from 'openapi-fetch';

let refreshPromise: Promise<void> | null = null

// Функция для обновления access token через refresh token
function makeRefreshToken() {
    if (!refreshPromise) {
        refreshPromise = (async (): Promise<void> => {
            const refreshToken = localStorage.getItem('musicfun-refresh-token')
            if (!refreshToken) throw new Error('No refresh token')

            const response = await fetch(baseUrl + '/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': '2892e453-fa01-42fb-9adc-33d6c592c78d'
                },
                body: JSON.stringify({ refreshToken })
            })

            if (!response.ok) {
                localStorage.removeItem('musicfun-token')
                localStorage.removeItem('musicfun-refresh-token')
                throw new Error('Refresh token failed')
            }

            const data = await response.json()
            localStorage.setItem('musicfun-token', data.accessToken)
            localStorage.setItem('musicfun-refresh-token', data.refreshToken)
        })()

        refreshPromise.finally(() => {
            refreshPromise = null
        })
    }
    return refreshPromise
}

// Middleware для автоматической авторизации
const authMiddleware: Middleware = {
    // Добавляем Authorization header к каждому запросу
    onRequest({request}) {
        const accessToken = localStorage.getItem('musicfun-token')
        if (accessToken) {
            request.headers.set('Authorization', `Bearer ${accessToken}`)
        }
        // Сохраняем копию запроса для повтора после refresh
        request._retryRequest = request.clone()
        return request
    },
    
    // Обрабатываем ответы с ошибкой 401 (Unauthorized)
    async onResponse({request, response}) {
        if (response.ok) return response
        if (response.status !== 401) {
            throw new Error(`${response.url}: ${response.status}`)
        }

        try {
            // Обновляем токен
            await makeRefreshToken()
            
            // Повторяем оригинальный запрос с новым токеном
            const originalRequest = request._retryRequest
            const retryRequest = new Request(originalRequest, {
                headers: new Headers(originalRequest.headers)
            })
            retryRequest.headers.set(
                'Authorization', 
                'Bearer ' + localStorage.getItem('musicfun-token')
            )
            return fetch(retryRequest)
        } catch {
            return response
        }
    }
}

// Подключаем middleware к клиенту
export const client = createClient<paths>({
    baseUrl: 'https://musicfun.it-incubator.app/api/1.0/',
    headers: { 'api-key': '2892e453-fa01-42fb-9adc-33d6c592c78d' }
})

client.use(authMiddleware)
```

#### Как работает механизм refresh token

1. **Запрос с истекшим токеном**: Клиент делает запрос → сервер возвращает 401
2. **Автоматический refresh**: Middleware перехватывает 401 → вызывает `/auth/refresh`
3. **Сохранение новых токенов**: Получает новые access/refresh токены → сохраняет в localStorage
4. **Повтор запроса**: Автоматически повторяет оригинальный запрос с новым токеном
5. **Прозрачность для кода**: Компоненты не знают о refresh, просто получают данные

---

### 4. Аутентификация - OAuth 2.0 Flow

#### Концепция
Приложение использует OAuth 2.0 с authorization code flow через popup окно.

#### Структура фичи auth

```
features/auth/
├── api/
│   ├── use-login-mutation.tsx    # Мутация для логина
│   ├── use-logout-mutation.tsx   # Мутация для логаута
│   └── use-me.ts                 # Query для получения текущего пользователя
└── ui/
    ├── account-bar.tsx           # Переключатель Login/CurrentUser
    ├── login-button.tsx          # Кнопка авторизации
    ├── logout-button.tsx         # Кнопка выхода
    └── current-user/
        └── current-user.tsx      # Информация о пользователе
```

#### OAuth Flow с Popup окном

```typescript
// features/auth/ui/login-button.tsx
export const callbackUrl = 'http://localhost:5173/oauth/callback'

export const LoginButton = () => {
    const mutation = useLoginMutation()

    const handleLoginClick = () => {
        // Подписываемся на сообщение от popup
        window.addEventListener('message', handleOauthMessage)

        // Открываем OAuth в popup
        window.open(
            `https://musicfun.it-incubator.app/api/1.0/auth/oauth-redirect?callbackUrl=${callbackUrl}`,
            'apihub-oauth2',
            'width=500,height=600'
        )
    }

    // Обработчик сообщения от popup
    const handleOauthMessage = (event: MessageEvent) => {
        window.removeEventListener('message', handleOauthMessage)
        
        // Проверка origin для безопасности
        if (event.origin !== window.location.origin) {
            console.warn('Invalid origin', event.origin)
            return
        }
        
        // Получаем код авторизации и вызываем мутацию
        const code = event.data.code
        if (code) {
            mutation.mutate({code})
        }
    }

    return <button onClick={handleLoginClick}>Login with apihub</button>
}
```

#### OAuth Callback страница

```typescript
// pages/auth/oauth-callback-page.tsx
export function OAuthCallbackPage() {
    useEffect(() => {
        // Извлекаем код из URL параметров
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        
        // Отправляем код родительскому окну
        if (code && window.opener) {
            window.opener.postMessage({code}, window.location.origin)
        }
        
        // Закрываем popup
        window.close()
    }, [])

    return <h2>OAuth2 callback page</h2>
}
```

#### Query для получения текущего пользователя

```typescript
// features/auth/api/use-me.ts
import { useQuery } from "@tanstack/react-query"
import { client } from "../../../shared/api/client"

export const useMeQuery = () => {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const response = await client.GET('/auth/me')
            return response.data
        }
    })
}
```

#### Композиция Account Bar

```typescript
// features/auth/ui/account-bar.tsx
export const AccountBar = () => {
    const query = useMeQuery()

    if (query.isPending) return <></>
    
    return (
        <div>
            {!query.data && <LoginButton />}
            {query.data && <CurrentUser />}
        </div>
    )
}

// app/layouts/root-layout.tsx
export const RootLayout = () => (
    <>
        <Header renderAccountBar={() => <AccountBar />} />
        <Outlet />
    </>
)
```

#### Logout с очисткой кеша

```typescript
// features/auth/api/use-logout-mutation.tsx
export const useLogoutMutation = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async () => {
            const response = await client.POST('/auth/logout', {
                body: {
                    refreshToken: localStorage.getItem('musicfun-refresh-token')!
                }
            })
            return response.data
        },
        onSuccess: () => {
            // Удаляем токены
            localStorage.removeItem('musicfun-token')
            localStorage.removeItem('musicfun-refresh-token')
            
            // Сбрасываем кеш пользователя
            queryClient.resetQueries({
                queryKey: ['auth', 'me']
            })
        }
    })
}
```

#### Диаграмма OAuth Flow

```
1. User clicks "Login"
   ↓
2. Open popup → OAuth provider
   ↓
3. User authorizes → Redirect to /oauth/callback?code=XXX
   ↓
4. Callback page → postMessage({code}) to opener
   ↓
5. Main window → mutation.mutate({code})
   ↓
6. POST /auth/login → Get access & refresh tokens
   ↓
7. Save tokens to localStorage
   ↓
8. Invalidate ['auth', 'me'] → Refetch user data
   ↓
9. Show CurrentUser instead of LoginButton
```

---

### 5. CSS Modules - Изолированные стили

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

### 6. TypeScript паттерны

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

## 🎨 Паттерны и лучшие практики

### 1. Render Props - Композиция компонентов

#### Пример из проекта

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

#### Преимущества паттерна

- Header остаётся в shared (не знает о бизнес-логике)
- RootLayout управляет содержимым (можем передать авторизацию, профиль и т.д.)
- Гибкость без prop drilling

---

### 2. PostMessage - Безопасная коммуникация между окнами

#### Концепция
Паттерн для передачи данных между основным окном и popup при OAuth авторизации.

#### Реализация

```typescript
// Родительское окно (main window)
const handleLoginClick = () => {
    // 1. Подписываемся на сообщения
    window.addEventListener('message', handleOauthMessage)
    
    // 2. Открываем popup
    window.open(oauthUrl, 'popup-name', 'width=500,height=600')
}

const handleOauthMessage = (event: MessageEvent) => {
    // 3. Удаляем listener после получения
    window.removeEventListener('message', handleOauthMessage)
    
    // 4. ВАЖНО: Проверяем origin для безопасности
    if (event.origin !== window.location.origin) {
        console.warn('Invalid origin', event.origin)
        return
    }
    
    // 5. Обрабатываем данные
    const code = event.data.code
    if (code) {
        mutation.mutate({code})
    }
}

// Popup окно (callback page)
useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code')
    
    // Отправляем данные родителю
    if (code && window.opener) {
        window.opener.postMessage(
            {code},                    // данные
            window.location.origin     // target origin для безопасности
        )
    }
    
    window.close()
}, [])
```

#### Безопасность PostMessage

| Проверка | Зачем | Где |
|----------|-------|-----|
| `event.origin` | Защита от фишинга | В родительском окне |
| `window.location.origin` как target | Только свой домен может получить | В popup |
| Удаление listener | Предотвращение утечек памяти | После получения сообщения |

---

### 3. Singleton Pattern для Refresh Token

#### Проблема
Если несколько запросов одновременно получат 401, каждый попытается обновить токен → множественные вызовы `/auth/refresh`

#### Решение

```typescript
let refreshPromise: Promise<void> | null = null

function makeRefreshToken() {
    // Если refresh уже выполняется - возвращаем существующий Promise
    if (!refreshPromise) {
        refreshPromise = (async () => {
            // ... логика refresh
        })()
        
        // Очищаем после завершения (успеха или ошибки)
        refreshPromise.finally(() => {
            refreshPromise = null
        })
    }
    
    return refreshPromise  // Все запросы ждут один Promise
}
```

#### Как работает

1. Первый 401 → создает `refreshPromise` → вызывает `/auth/refresh`
2. Второй 401 (параллельный) → видит существующий `refreshPromise` → ждет его
3. Refresh завершается → все ждущие запросы получают новый токен
4. `finally` очищает `refreshPromise` для следующего раза

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

### 3. Создание фичи с данными (чтение)

- [ ] Создать компонент в `src/features/[feature-name]/`
- [ ] Создать query хук в `api/use-[entity]-query.ts`
- [ ] Использовать `useQuery` для загрузки данных
- [ ] Обработать состояния: pending, error, success
- [ ] Интегрировать в страницу через композицию

### 4. Создание фичи с мутациями (изменение данных)

- [ ] Создать mutation хук в `api/use-[action]-mutation.tsx`
- [ ] Использовать `useMutation` для POST/PUT/DELETE
- [ ] Добавить `onSuccess` для инвалидации связанных query
- [ ] Обработать состояния: isPending, isError, isSuccess
- [ ] Создать UI компонент в `ui/` для триггера мутации

### 5. Добавление UI компонента

- [ ] Создать в `src/shared/ui/` (переиспользуемый) или `src/features/[name]/ui/` (специфичный)
- [ ] Создать `.module.css` файл для стилей
- [ ] Типизировать props
- [ ] Shared компоненты должны быть без бизнес-логики

### 6. Работа с защищенными роутами (если требуется авторизация)

- [ ] Использовать `useMeQuery()` для проверки авторизации
- [ ] Добавить условный рендеринг или редирект
- [ ] Токены автоматически добавляются через middleware

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
- Использовать `queryClient.invalidateQueries(['queryKey'])` - помечает данные устаревшими и перезагружает
- Использовать `useMutation` с `onSuccess` для автоматической инвалидации

---

### Проблема: 401 ошибки при запросах после некоторого времени

**Причина:** Access token истек

**Решение:** Уже реализовано через middleware! 
- Middleware автоматически перехватывает 401
- Обновляет токен через `/auth/refresh`
- Повторяет оригинальный запрос
- Все происходит прозрачно для компонентов

---

### Разница: invalidateQueries vs resetQueries

```typescript
// invalidateQueries - помечает данные устаревшими и перезагружает
queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
// Используется после login - данные будут перезагружены

// resetQueries - полностью очищает кеш (возвращает в начальное состояние)
queryClient.resetQueries({ queryKey: ['auth', 'me'] })
// Используется после logout - данные будут удалены, query вернется в pending
```

---

### Проблема: Popup блокируется браузером

**Причина:** Браузеры блокируют popup, открытые не в прямом ответ на действие пользователя

**Решение:** 
- Вызывать `window.open()` синхронно внутри обработчика клика
- Не делать асинхронные операции до `window.open()`

```typescript
// ❌ Неправильно - async операция до popup
const handleLogin = async () => {
    await someAsyncOperation()  // Popup будет заблокирован!
    window.open(oauthUrl)
}

// ✅ Правильно - открываем сразу
const handleLogin = () => {
    window.open(oauthUrl)  // Сразу после клика
}
```

---

## 📚 Полезные ссылки

### Официальная документация

- [TanStack Router](https://tanstack.com/router/latest) - файловый роутинг
- [TanStack Query](https://tanstack.com/query/latest) - серверное состояние
  - [Mutations Guide](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) - работа с мутациями
  - [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) - инвалидация кеша
- [OpenAPI TypeScript](https://openapi-ts.dev/) - генерация типов
  - [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) - типизированный клиент
  - [Middleware](https://openapi-ts.dev/openapi-fetch/middleware/) - создание middleware
- [Feature-Sliced Design](https://feature-sliced.design/ru/) - архитектура
  - [Auth feature example](https://feature-sliced.design/ru/examples) - примеры фич

### Дополнительные материалы

- [React 19 Docs](https://react.dev/) - официальная документация React
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - справочник TS
- [Vite Guide](https://vite.dev/guide/) - документация Vite
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749) - спецификация OAuth

### Безопасность

> ⚠️ **Примечание о безопасности**: В продакшен приложениях рекомендуется использовать httpOnly cookies вместо localStorage для хранения токенов, так как это защищает от XSS атак. В данном учебном проекте используется localStorage для простоты.

---

## 🎯 Следующие шаги для изучения

1. ✅ ~~**Мутации данных**~~ - `useMutation` для POST/PUT/DELETE (реализовано)
2. ✅ ~~**Аутентификация**~~ - OAuth 2.0 с refresh tokens (реализовано)
3. ✅ ~~**Middleware**~~ - автоматическое обновление токенов (реализовано)
4. **Оптимистичные обновления** - обновление UI до получения ответа сервера
5. **Suspense** - React Suspense для загрузки данных
6. **Prefetching** - предзагрузка данных для улучшения UX
7. **Error Boundaries** - обработка ошибок на уровне компонентов
8. **Loader данных в роутах** - загрузка данных до рендера страницы

---

*Документация обновлена: 20.01.2026*

