(() => {
  'use strict';

  const english = document.documentElement.lang.toLowerCase().startsWith('en') ||
    /index-en\.html$/i.test(location.pathname);
  const tr = (ru, en) => english ? en : ru;
  const badgeCore = tr('ОСНОВА 2026', '2026 CORE');

  function esc(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function lesson(spec) {
    const block = document.createElement('div');
    block.className = 'block wdg-2026-block';
    block.id = spec.id;
    block.innerHTML =
      '<div class="block-title" onclick="scrollToBlock(\'' + spec.id + '\')">' +
        spec.title + ' <span class="badge must">' + (spec.badge || badgeCore) + '</span>' +
        '<span class="anchor-icon">#</span></div>' +
      '<div class="tip">' + spec.intro + '</div>' +
      '<div class="code">' + esc(spec.code) + '</div>' +
      '<div class="explain">' + spec.explain + '</div>' +
      '<div class="items">' +
        spec.checks.map((item, index) =>
          '<label class="item"><input type="checkbox" class="prog-cb" ' +
          'data-pid="wdg-2026-' + spec.id + '-' + (index + 1) + '" onchange="updateProgress(this)">' +
          '<span>' + item + '</span></label>'
        ).join('') +
      '</div>';
    return block;
  }

  function code(lines) {
    return lines.join('\n');
  }

  function existing(id) {
    return document.getElementById(id);
  }

  function placeAfterHero(sectionId, blocks) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    let anchor = section.querySelector('.lang-section-hero');
    const available = blocks.filter(Boolean);

    if (!anchor) {
      const reference = section.firstElementChild;
      available.forEach(block => section.insertBefore(block, reference));
      return;
    }

    available.forEach(block => {
      anchor.after(block);
      anchor = block;
    });
  }

  [
    'block-page-bg',
    'block-center-lists',
    'block-card',
    'block-animations',
    'block-car-scroll',
    'block-gradient-text',
    'block-carousel',
    'block-ts-config',
    'block-react-state-management',
    'block-node-server',
    'block-node-middleware',
    'block-pg-setup'
  ].forEach(id => existing(id)?.remove());

  document.querySelectorAll('.code').forEach(element => {
    if (element.textContent.includes('obj: any')) {
      element.textContent = element.textContent.replaceAll('obj: any', 'obj: unknown');
    }
  });

  const cssResponsive = lesson({
    id: 'block-css-responsive-2026',
    title: tr('Адаптивная раскладка: Flexbox + Grid', 'Responsive layout: Flexbox + Grid'),
    intro: tr(
      'Flexbox выравнивает элементы по одной оси, Grid строит полноценную сетку. Современный CSS часто адаптируется без отдельного медиазапроса.',
      'Flexbox aligns content on one axis; Grid builds a full layout. Modern CSS can often adapt without an extra breakpoint.'
    ),
    code: code([
      '.page {',
      '  display: grid;',
      '  grid-template-columns: 16rem minmax(0, 1fr);',
      '  gap: 24px;',
      '}',
      '',
      '.cards {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));',
      '  gap: 16px;',
      '}',
      '',
      '.toolbar {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '  flex-wrap: wrap;',
      '}',
      '',
      '@media (max-width: 48rem) {',
      '  .page { grid-template-columns: 1fr; }',
      '}'
    ]),
    explain: tr(
      '<strong>Flexbox</strong> подходит для меню, строки кнопок и выравнивания. <strong>Grid</strong> одновременно управляет строками и колонками. <code>minmax(0, 1fr)</code> не даёт длинному контенту растянуть страницу, а <code>auto-fit</code> сам переносит карточки.',
      '<strong>Flexbox</strong> fits menus, button rows, and alignment. <strong>Grid</strong> controls rows and columns together. <code>minmax(0, 1fr)</code> prevents overflow, while <code>auto-fit</code> wraps cards automatically.'
    ),
    checks: tr(
      ['Выбираю Flexbox для ряда, а Grid для сетки', 'Использую repeat(), minmax() и auto-fit', 'Проверяю 360 px, 768 px и широкий экран'],
      ['I choose Flexbox for a row and Grid for a grid', 'I use repeat(), minmax(), and auto-fit', 'I test 360 px, 768 px, and a wide screen']
    )
  });

  const cssTailwind = lesson({
    id: 'block-css-tailwind-mobile-2026',
    title: tr('Tailwind CSS и Mobile First', 'Tailwind CSS with Mobile First'),
    intro: tr(
      'Сначала напиши удобный вариант для телефона. Префиксы md: и lg: добавляют изменения для более широких экранов.',
      'Write the phone layout first. The md: and lg: prefixes add changes for wider screens.'
    ),
    code: code([
      '<section class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-3">',
      '  <article class="rounded-lg border border-slate-700 bg-slate-900 p-4">',
      '    <h2 class="text-lg font-semibold text-white">Project</h2>',
      '    <p class="mt-2 text-sm text-slate-300">Responsive by default.</p>',
      '    <button class="mt-4 w-full bg-violet-600 px-4 py-2 text-white md:w-auto">',
      '      Open',
      '    </button>',
      '  </article>',
      '</section>'
    ]),
    explain: tr(
      'Классы без префикса создают мобильную основу. <code>md:grid-cols-2</code> включается с md. Tailwind не отменяет CSS: он даёт короткие имена правилам. Повторяющийся интерфейс выноси в компонент, а не копируй длинную строку классов.',
      'Unprefixed utilities form the mobile base. <code>md:grid-cols-2</code> starts at md. Tailwind does not replace CSS knowledge; it names CSS rules. Extract repeated UI into a component instead of copying a long class list.'
    ),
    checks: tr(
      ['Начинаю с мобильной версии', 'Понимаю CSS за utility-классами', 'Выношу повторяющийся UI в компоненты'],
      ['I start with the mobile version', 'I understand the CSS behind utilities', 'I extract repeated UI into components']
    )
  });

  const jsModern = lesson({
    id: 'block-js-modern-2026',
    title: tr('Современный JavaScript: работа с данными', 'Modern JavaScript data transformations'),
    intro: tr(
      'Стрелочные функции, деструктуризация, Rest/Spread и методы массивов - ежедневные инструменты, а не трюки.',
      'Arrow functions, destructuring, Rest/Spread, and array methods are everyday tools, not syntax tricks.'
    ),
    code: code([
      'const users = [',
      '  { id: 1, name: "Mira", active: true, score: 12 },',
      '  { id: 2, name: "Leo", active: false, score: 7 },',
      '  { id: 3, name: "Nika", active: true, score: 18 }',
      '];',
      '',
      'const activeNames = users',
      '  .filter(({ active }) => active)',
      '  .map(({ name }) => name);',
      '',
      'const total = users.reduce((sum, { score }) => sum + score, 0);',
      'const updateUser = (user, changes) => ({ ...user, ...changes });',
      'const [first, ...rest] = users;'
    ]),
    explain: tr(
      '<code>filter</code> отбирает, <code>map</code> преобразует, <code>reduce</code> собирает массив в один результат. Деструктуризация достаёт поля по имени. Spread создаёт новый объект без мутации, Rest собирает оставшиеся значения. <code>var</code> здесь не нужен.',
      '<code>filter</code> selects, <code>map</code> transforms, and <code>reduce</code> combines an array. Destructuring reads named fields. Spread creates a new object without mutation; Rest collects remaining values. There is no reason to use <code>var</code> here.'
    ),
    checks: tr(
      ['Применяю arrow, destructuring и Rest/Spread', 'Отличаю map, filter и reduce', 'Не использую var и лишние мутации'],
      ['I use arrow functions, destructuring, and Rest/Spread', 'I know map, filter, and reduce', 'I avoid var and unnecessary mutation']
    )
  });

  const jsNetwork = lesson({
    id: 'block-js-network-2026',
    title: tr('Реальный запрос: fetch + async/await', 'Real request: fetch + async/await'),
    intro: tr(
      'У запроса есть загрузка, успех, пустой ответ и ошибка. Обработай все состояния, а не только удачный console.log.',
      'A request has loading, success, empty, and error states. Handle all of them, not only the happy-path console.log.'
    ),
    code: code([
      'async function loadProjects() {',
      '  renderStatus("loading");',
      '',
      '  try {',
      '    const response = await fetch("/api/projects");',
      '    if (!response.ok) throw new Error("HTTP " + response.status);',
      '',
      '    const projects = await response.json();',
      '    renderProjects(projects);',
      '    renderStatus(projects.length ? "success" : "empty");',
      '  } catch (error) {',
      '    console.error(error);',
      '    renderStatus("error");',
      '  }',
      '}'
    ]),
    explain: tr(
      '<code>await</code> ждёт Promise внутри async-функции и не замораживает страницу. HTTP 404/500 не всегда бросает исключение, поэтому проверяй <code>response.ok</code>. <code>try/catch</code> обрабатывает сбой, а отдельные render-функции не смешивают сеть и DOM.',
      '<code>await</code> waits for a Promise inside the async function without freezing the page. HTTP 404/500 does not automatically throw, so check <code>response.ok</code>. <code>try/catch</code> handles failure, while render functions keep network and DOM logic separate.'
    ),
    checks: tr(
      ['Проверяю response.ok', 'Обрабатываю ошибку через try/catch', 'Разделяю загрузку данных и DOM'],
      ['I check response.ok', 'I handle errors with try/catch', 'I separate data loading from DOM rendering']
    )
  });

  const tsStrict = lesson({
    id: 'block-ts-strict-2026',
    title: tr('Строгая типизация реальных данных', 'Strict typing for real data'),
    intro: tr(
      'Типизируй аргументы, ответы API, props и состояние. Непроверенные внешние данные начинаются с unknown, а не any.',
      'Type arguments, API results, props, and state. Unverified external data starts as unknown, never any.'
    ),
    code: code([
      'type Role = "student" | "mentor";',
      '',
      'interface User {',
      '  id: number;',
      '  name: string;',
      '  role: Role;',
      '  skills: string[];',
      '}',
      '',
      'function getLabel(user: User): string {',
      '  return user.name + " - " + user.role;',
      '}',
      '',
      'function isUser(value: unknown): value is User {',
      '  if (typeof value !== "object" || value === null) return false;',
      '  return "id" in value && "name" in value && "role" in value;',
      '}'
    ]),
    explain: tr(
      '<code>interface</code> удобен для контракта объекта, <code>type</code> - для объединений и составных типов. <code>unknown</code> требует проверку перед доступом. <code>any</code> отключает TypeScript именно там, где данные ненадёжны.',
      '<code>interface</code> fits object contracts; <code>type</code> fits unions and composed types. <code>unknown</code> requires a check before access. <code>any</code> disables TypeScript exactly where data is untrusted.'
    ),
    checks: tr(
      ['Типизирую аргументы и return', 'Использую unknown вместо any', 'Описываю массивы объектов'],
      ['I type parameters and return values', 'I use unknown instead of any', 'I describe object arrays']
    )
  });

  const tsGenerics = lesson({
    id: 'block-ts-generics-react-2026',
    title: tr('Generics и типы React', 'Generics and React types'),
    intro: tr(
      'Generic сохраняет связь между входным и выходным типом. Он нужен, когда операция общая, а результат должен остаться точным.',
      'A generic preserves the relationship between input and output types. Use it when an operation is reusable but its result must stay precise.'
    ),
    code: code([
      'type ApiResult<T> = { data: T; error: string | null };',
      '',
      'function firstItem<T>(items: T[]): T | undefined {',
      '  return items[0];',
      '}',
      '',
      'type ProjectCardProps = {',
      '  title: string;',
      '  completed: boolean;',
      '  onToggle: (completed: boolean) => void;',
      '};',
      '',
      'function ProjectCard({ title, completed, onToggle }: ProjectCardProps) {',
      '  return <button onClick={() => onToggle(!completed)}>{title}</button>;',
      '}'
    ]),
    explain: tr(
      '<code>T</code> заполняется вызывающим кодом, поэтому <code>ApiResult&lt;User[]&gt;</code> сохраняет data как User[]. Props точно описывают компонент. Для tsconfig бери готовый preset Vite/Next.js с <code>strict: true</code>; не учи десятки флагов без задачи.',
      '<code>T</code> is filled by the caller, so <code>ApiResult&lt;User[]&gt;</code> keeps data as User[]. Props precisely describe the component. Start with the Vite/Next.js preset and <code>strict: true</code>; do not memorize dozens of flags without a need.'
    ),
    checks: tr(
      ['Понимаю связь входа и выхода generic', 'Типизирую React props без any', 'Использую strict preset'],
      ['I understand generic input/output relationships', 'I type React props without any', 'I use a strict preset']
    )
  });

  const reactForms = lesson({
    id: 'block-react-rhf-zod-2026',
    title: 'React Hook Form + Zod',
    intro: tr(
      'React Hook Form управляет формой без лишних ререндеров, а Zod проверяет данные и создаёт TypeScript-тип.',
      'React Hook Form manages form state with minimal rerenders; Zod validates data and becomes the TypeScript type source.'
    ),
    code: code([
      'const schema = z.object({',
      '  email: z.string().email("Invalid email"),',
      '  age: z.coerce.number().int().min(14)',
      '});',
      '',
      'type FormData = z.infer<typeof schema>;',
      '',
      'function ProfileForm() {',
      '  const { register, handleSubmit, formState: { errors } } =',
      '    useForm<FormData>({ resolver: zodResolver(schema) });',
      '',
      '  return <form onSubmit={handleSubmit(console.log)}>',
      '    <input {...register("email")} />',
      '    <span>{errors.email?.message}</span>',
      '    <button>Save</button>',
      '  </form>;',
      '}'
    ]),
    explain: tr(
      '<code>register</code> подключает input, <code>handleSubmit</code> проверяет форму до твоей функции, <code>errors</code> хранит ошибки. <code>z.infer</code> не даёт схеме и типу разойтись. На сервере проверку повторяют.',
      '<code>register</code> connects an input, <code>handleSubmit</code> validates before your callback, and <code>errors</code> contains messages. <code>z.infer</code> keeps schema and type synchronized. Validate again on the server.'
    ),
    checks: tr(
      ['Регистрирую поля через RHF', 'Получаю тип через z.infer', 'Показываю ошибку у поля'],
      ['I register fields with RHF', 'I infer the type with z.infer', 'I show errors next to fields']
    )
  });

  const reactZustand = lesson({
    id: 'block-react-zustand-2026',
    title: tr('Общее состояние с Zustand', 'Shared state with Zustand'),
    intro: tr(
      'Локальное состояние оставляй в useState. Zustand нужен, когда несколько далёких компонентов делят состояние интерфейса.',
      'Keep local state in useState. Zustand is useful when distant components share client UI state.'
    ),
    code: code([
      'type ThemeStore = {',
      '  theme: "light" | "dark";',
      '  toggleTheme: () => void;',
      '};',
      '',
      'const useThemeStore = create<ThemeStore>((set) => ({',
      '  theme: "dark",',
      '  toggleTheme: () => set((state) => ({',
      '    theme: state.theme === "dark" ? "light" : "dark"',
      '  }))',
      '}));',
      '',
      'const theme = useThemeStore((state) => state.theme);'
    ]),
    explain: tr(
      'Store содержит данные и actions. Селектор подписывает компонент только на нужное поле и уменьшает ререндеры. Серверные данные лучше хранить на сервере или в кэше запросов, а не копировать в глобальный store.',
      'The store contains data and actions. A selector subscribes to the required slice and reduces rerenders. Keep server data on the server or in a request cache instead of copying it into global state.'
    ),
    checks: tr(
      ['Отличаю локальное и общее состояние', 'Использую селектор Zustand', 'Не копирую серверные данные в store'],
      ['I distinguish local and shared state', 'I use a Zustand selector', 'I do not copy server data into the store']
    )
  });

  const reactUi = lesson({
    id: 'block-react-ui-2026',
    title: 'shadcn/ui + Radix UI',
    intro: tr(
      'Radix даёт доступное поведение, shadcn/ui - готовый редактируемый код компонентов на Radix и Tailwind.',
      'Radix provides accessible behavior; shadcn/ui provides editable component code built with Radix and Tailwind.'
    ),
    code: code([
      'import { Button } from "@/components/ui/button";',
      'import { Dialog, DialogContent, DialogTitle, DialogTrigger }',
      '  from "@/components/ui/dialog";',
      '',
      'export function DeleteDialog() {',
      '  return <Dialog>',
      '    <DialogTrigger asChild>',
      '      <Button variant="destructive">Delete</Button>',
      '    </DialogTrigger>',
      '    <DialogContent>',
      '      <DialogTitle>Delete project?</DialogTitle>',
      '      <Button variant="destructive">Confirm</Button>',
      '    </DialogContent>',
      '  </Dialog>;',
      '}'
    ]),
    explain: tr(
      'Диалог уже управляет фокусом, Escape, ролями и клавиатурой. Код находится в твоём проекте, его можно стилизовать. Не удаляй подписи, aria-атрибуты и focus-стили ради картинки.',
      'The dialog handles focus, Escape, roles, and keyboard input. Its code lives in your project and can be styled. Do not remove labels, aria attributes, or focus styles to match a picture.'
    ),
    checks: tr(
      ['Отличаю Radix от shadcn/ui', 'Сохраняю keyboard и focus', 'Редактирую компоненты в своём проекте'],
      ['I distinguish Radix from shadcn/ui', 'I preserve keyboard and focus behavior', 'I edit components in my project']
    )
  });

  const nextArchitecture = lesson({
    id: 'block-next-app-router-2026',
    title: tr('Next.js App Router: современная архитектура', 'Next.js App Router architecture'),
    intro: tr(
      'Страницы - Server Components по умолчанию. Добавляй use client только для state, effects и браузерных событий.',
      'Pages are Server Components by default. Add use client only for state, effects, and browser events.'
    ),
    code: code([
      '// app/projects/page.tsx - Server Component',
      'export default async function ProjectsPage() {',
      '  const projects = await db.project.findMany();',
      '  return <ProjectList projects={projects} />;',
      '}',
      '',
      '// app/projects/actions.ts',
      '"use server";',
      'export async function createProject(formData: FormData) {',
      '  const data = schema.parse({ title: formData.get("title") });',
      '  await db.project.create({ data });',
      '  revalidatePath("/projects");',
      '}'
    ]),
    explain: tr(
      'Server Component читает базу без передачи секретов в браузер. Server Action изменяет данные на сервере, валидирует вход и обновляет страницу. Route Handler оставь для webhook или публичного API. Отдельный Express-бэкенд обычно не нужен.',
      'A Server Component reads the database without exposing secrets. A Server Action validates and mutates on the server, then refreshes data. Keep Route Handlers for webhooks or a public API. A separate Express backend is usually unnecessary.'
    ),
    checks: tr(
      ['Отличаю Server и Client Components', 'Проверяю данные в Server Action', 'Не создаю Express без причины'],
      ['I distinguish Server and Client Components', 'I validate inside Server Actions', 'I do not add Express without a reason']
    )
  });

  const nextAuth = lesson({
    id: 'block-next-auth-2026',
    title: tr('Auth.js / Clerk и защита маршрутов', 'Auth.js / Clerk and route protection'),
    intro: tr(
      'Auth.js даёт больше контроля, Clerk - готовую облачную систему аккаунтов. Проверка доступа в любом случае выполняется на сервере.',
      'Auth.js gives more control; Clerk provides a hosted account platform. Access must still be checked on the server.'
    ),
    code: code([
      'import { auth } from "@/auth";',
      'import { redirect } from "next/navigation";',
      '',
      'export default async function DashboardPage() {',
      '  const session = await auth();',
      '  if (!session?.user) redirect("/sign-in");',
      '  return <Dashboard user={session.user} />;',
      '}',
      '',
      '// middleware.ts',
      'export { auth as middleware } from "@/auth";',
      'export const config = { matcher: ["/dashboard/:path*"] };'
    ]),
    explain: tr(
      'Скрытая кнопка - не безопасность. Проверяй сессию внутри приватной серверной страницы и action. Clerk удобен для быстрого готового профиля, Auth.js - для гибкости. Секреты провайдеров хранятся в env.',
      'Hiding a button is not security. Check the session inside the protected server page and action. Clerk is faster for hosted account UI; Auth.js is more flexible. Provider secrets belong in environment variables.'
    ),
    checks: tr(
      ['Проверяю сессию на сервере', 'Защищаю группу маршрутов', 'Не коммичу секреты'],
      ['I verify sessions on the server', 'I protect route groups', 'I never commit secrets']
    )
  });

  const pgOrm = lesson({
    id: 'block-pg-orm-2026',
    title: tr('Связи через Prisma или Drizzle', 'Relations with Prisma or Drizzle'),
    intro: tr(
      'ORM описывает схему, миграции и типизированные запросы. SQL остаётся нужен для понимания и отладки.',
      'An ORM covers schema, migrations, and typed queries. SQL remains essential for understanding and debugging.'
    ),
    code: code([
      'model User {',
      '  id       Int       @id @default(autoincrement())',
      '  email    String    @unique',
      '  projects Project[]',
      '}',
      '',
      'model Project {',
      '  id       Int    @id @default(autoincrement())',
      '  title    String',
      '  author   User   @relation(fields: [authorId], references: [id])',
      '  authorId Int',
      '}',
      '',
      'const projects = await prisma.project.findMany({',
      '  where: { authorId: userId },',
      '  include: { author: true }',
      '});'
    ]),
    explain: tr(
      '<strong>Prisma</strong> использует собственную схему и генерирует клиент. <strong>Drizzle</strong> ближе к SQL и описывает схему на TypeScript. Выбери один ORM. Внешний ключ создаёт one-to-many, промежуточная таблица - many-to-many.',
      '<strong>Prisma</strong> uses its own schema and generated client. <strong>Drizzle</strong> stays closer to SQL with TypeScript schemas. Pick one ORM. A foreign key creates one-to-many; a junction table creates many-to-many.'
    ),
    checks: tr(
      ['Моделирую one-to-many и many-to-many', 'Отличаю Prisma от Drizzle', 'Запускаю миграции'],
      ['I model one-to-many and many-to-many', 'I distinguish Prisma from Drizzle', 'I run migrations']
    )
  });

  const pgCloud = lesson({
    id: 'block-pg-cloud-2026',
    title: tr('Облачный PostgreSQL: Neon или Supabase', 'Cloud PostgreSQL: Neon or Supabase'),
    intro: tr(
      'Облачная база убирает долгую локальную настройку. Для старта достаточно DATABASE_URL и базового CRUD.',
      'A managed cloud database removes lengthy local administration. Start with DATABASE_URL and basic CRUD.'
    ),
    code: code([
      '# .env.local - never commit this file',
      'DATABASE_URL="postgresql://user:password@host/database?sslmode=require"',
      '',
      'SELECT id, title FROM projects ORDER BY id DESC;',
      'INSERT INTO projects (title, author_id) VALUES (\'Roadmap\', 1);',
      'UPDATE projects SET title = \'WebDevGym\' WHERE id = 1;',
      'DELETE FROM projects WHERE id = 1;'
    ]),
    explain: tr(
      '<strong>Neon</strong> специализируется на serverless PostgreSQL и ветках базы. <strong>Supabase</strong> добавляет авторизацию, storage, realtime и панель. <code>DATABASE_URL</code> хранится в env, миграции запускаются через ORM.',
      '<strong>Neon</strong> focuses on serverless PostgreSQL and database branches. <strong>Supabase</strong> adds auth, storage, realtime, and a dashboard. Keep <code>DATABASE_URL</code> in env and run migrations through the ORM.'
    ),
    checks: tr(
      ['Подключаюсь через DATABASE_URL', 'Не отправляю URL базы в GitHub', 'Выполняю SELECT/INSERT/UPDATE/DELETE'],
      ['I connect through DATABASE_URL', 'I never commit the database URL', 'I perform SELECT/INSERT/UPDATE/DELETE']
    )
  });

  placeAfterHero('sec-html', [
    existing('block-semantic'),
    existing('block-page-structure')
  ]);

  placeAfterHero('sec-css', [
    existing('block-css-connect'),
    existing('block-selectors'),
    cssResponsive,
    existing('block-flexbox'),
    existing('block-grid'),
    cssTailwind,
    existing('block-tailwind-basics'),
    existing('block-media')
  ]);

  placeAfterHero('sec-js', [
    existing('block-vars-js'),
    existing('block-functions'),
    existing('block-arrays'),
    existing('block-destructuring'),
    jsModern,
    existing('block-async'),
    existing('block-fetch'),
    existing('block-trycatch'),
    jsNetwork
  ]);

  placeAfterHero('sec-ts', [
    tsStrict,
    existing('block-ts-basics'),
    existing('block-ts-interfaces'),
    existing('block-ts-generics'),
    tsGenerics,
    existing('block-ts-react')
  ]);

  placeAfterHero('sec-react', [
    existing('block-react-components'),
    existing('block-react-hooks'),
    existing('block-react-useref'),
    reactForms,
    reactZustand,
    reactUi
  ]);

  placeAfterHero('sec-node', [
    nextArchitecture,
    existing('block-node-nextjs-intro'),
    existing('block-nextjs-routing'),
    existing('block-nextjs-data'),
    existing('block-nextjs-api'),
    nextAuth,
    existing('block-node-zod-validation')
  ]);

  placeAfterHero('sec-sql', [
    existing('block-sql-what'),
    existing('block-sql-select'),
    existing('block-sql-crud'),
    existing('block-sql-keys'),
    existing('block-sql-joins')
  ]);

  placeAfterHero('sec-pg', [
    pgCloud,
    pgOrm,
    existing('block-pg-prisma'),
    existing('block-pg-schema'),
    existing('block-pg-crud')
  ]);
})();
