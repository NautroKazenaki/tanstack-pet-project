# 🚀 Шпаргалка по проекту

> Быстрый справочник по частым операциям и паттернам

## 📍 Создание новой страницы

### 1. Создать компонент страницы
```typescript
// src/pages/my-page.tsx
export default function MyPage() {
  return <div>My Page Content</div>
}
```

### 2. Создать роут
```typescript
// src/app/routes/my-route.tsx
import { createFileRoute } from "@tanstack/react-router"
import MyPage from "../../pages/my-page"

export const Route = createFileRoute('/my-route')({
    component: MyPage
})
```

### 3. Добавить навигацию
```typescript
// src/shared/ui/header.tsx
<Link to="/my-route">My Route</Link>
```

---

## 🔍 Загрузка данных (useQuery)

### Базовый пример
```typescript
import { useQuery } from "@tanstack/react-query"
import { client } from "../shared/api/client"

const query = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
        const response = await client.GET('/users')
        if (response.error) throw response.error
        return response.data
    }
})

if (query.isPending) return <div>Loading...</div>
if (query.isError) return <div>Error: {query.error.message}</div>

return <div>{JSON.stringify(query.data)}</div>
```

### С параметрами
```typescript
const userId = '123'

const query = useQuery({
    queryKey: ['user', userId],  // ключ с параметром
    queryFn: async () => {
        const response = await client.GET('/users/{id}', {
            params: { path: { id: userId } }
        })
        if (response.error) throw response.error
        return response.data
    }
})
```

---

## ✏️ Изменение данных (useMutation)

### POST запрос
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query"

const queryClient = useQueryClient()

const mutation = useMutation({
    mutationFn: async (data: { title: string }) => {
        const response = await client.POST('/playlists', { body: data })
        if (response.error) throw response.error
        return response.data
    },
    onSuccess: () => {
        // Обновить кеш после успешного создания
        queryClient.invalidateQueries({ queryKey: ['playlists'] })
    }
})

// Использование
<button onClick={() => mutation.mutate({ title: 'New Playlist' })}>
    Создать
</button>
```

---

## 🎨 CSS Modules

### Создать стили
```css
/* component.module.css */
.container {
    padding: 20px;
}

.title {
    font-size: 24px;
    color: #333;
}
```

### Использовать
```typescript
import styles from './component.module.css'

export const Component = () => (
    <div className={styles.container}>
        <h1 className={styles.title}>Title</h1>
    </div>
)
```

### Несколько классов
```typescript
<div className={`${styles.container} ${styles.active}`}>
```

---

## 🔗 Навигация (TanStack Router)

### Link компонент
```typescript
import { Link } from '@tanstack/react-router'

<Link to="/">Home</Link>
<Link to="/about">About</Link>
```

### Программная навигация
```typescript
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()

const handleClick = () => {
    navigate({ to: '/success' })
}
```

### С параметрами
```typescript
<Link 
    to="/user/$userId" 
    params={{ userId: '123' }}
>
    User Profile
</Link>
```

---

## 🌐 API запросы (openapi-fetch)

### GET запрос
```typescript
const response = await client.GET('/playlists')

if (response.error) {
    console.error(response.error)
} else {
    console.log(response.data)
}
```

### POST с телом
```typescript
const response = await client.POST('/playlists', {
    body: {
        title: 'My Playlist',
        description: 'Cool music'
    }
})
```

### С параметрами пути и query
```typescript
const response = await client.GET('/users/{id}', {
    params: {
        path: { id: '123' },
        query: { include: 'posts' }
    }
})
```

### DELETE
```typescript
const response = await client.DELETE('/playlists/{id}', {
    params: { path: { id: playlistId } }
})
```

---

## 🎯 Типизация компонентов

### Базовые props
```typescript
type Props = {
    title: string
    count: number
    isActive?: boolean  // optional
}

export const Component = ({ title, count, isActive = false }: Props) => (
    <div>{title}: {count}</div>
)
```

### С children
```typescript
import type { ReactNode } from 'react'

type Props = {
    children: ReactNode
    className?: string
}

export const Container = ({ children, className }: Props) => (
    <div className={className}>
        {children}
    </div>
)
```

### Render props
```typescript
type Props = {
    renderHeader: () => ReactNode
    renderFooter: () => ReactNode
}

export const Layout = ({ renderHeader, renderFooter }: Props) => (
    <div>
        {renderHeader()}
        <main>Content</main>
        {renderFooter()}
    </div>
)
```

---

## 📦 Структура файлов по FSD

### Feature (фича)
```
features/
└── playlist-card/
    ├── ui/
    │   ├── playlist-card.tsx
    │   └── playlist-card.module.css
    ├── api/
    │   └── use-playlists.ts
    └── index.ts  # public API
```

### Page (страница)
```typescript
// pages/playlists-page.tsx
import { PlaylistCard } from '../features/playlist-card'
import { Header } from '../shared/ui/header'

export default function PlaylistsPage() {
    return (
        <div>
            <Header />
            <PlaylistCard />
        </div>
    )
}
```

### Shared UI
```
shared/
└── ui/
    ├── button/
    │   ├── button.tsx
    │   ├── button.module.css
    │   └── index.ts
    └── card/
        ├── card.tsx
        └── card.module.css
```

---

## 🔧 Полезные команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Проверка типов
npx tsc --noEmit

# Линтинг
npm run lint

# Обновить API типы
npm run api:gen

# Установить новый пакет
npm install package-name

# Установить dev-зависимость
npm install -D package-name
```

---

## 🐛 Быстрые решения

### Query не обновляется
```typescript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Инвалидировать конкретный query
queryClient.invalidateQueries({ queryKey: ['playlists'] })

// Инвалидировать все queries
queryClient.invalidateQueries()
```

### Ошибка TypeScript в роуте
```bash
# Перезапустить dev-сервер для регенерации routeTree.gen.ts
npm run dev
```

### Обновить API схему
```bash
# 1. Скачать новую схему
node -e "const fs = require('fs'); fetch('https://api.example.com/openapi.json').then(r => r.text()).then(t => fs.writeFileSync('src/shared/api/openapi.json', t))"

# 2. Регенерировать типы
npm run api:gen
```

---

## 💡 Быстрые паттерны

### Loading + Error + Data
```typescript
if (query.isPending) return <Spinner />
if (query.isError) return <ErrorMessage error={query.error} />
return <DataView data={query.data} />
```

### Условный рендеринг
```typescript
{isLoggedIn && <UserMenu />}
{count > 0 ? <ItemList /> : <EmptyState />}
```

### Маппинг массива
```typescript
{items.map(item => (
    <Card key={item.id} data={item} />
))}
```

### Обработка формы
```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    mutation.mutate({ title })
}

<form onSubmit={handleSubmit}>
    <input name="title" />
    <button type="submit">Submit</button>
</form>
```

---

*Шпаргалка обновлена: 13.01.2026*

