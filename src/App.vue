<script setup lang="ts">
import VObCar from "@/components/VObCar.vue"

interface DemoSlide {
  id: string
  cover: string
  title: string
  text: string
  shortLabel?: string
  [key: string]: unknown
}

const natureSlides: DemoSlide[] = [
  {
    id: "nature-1",
    cover: "/demo-images/nature-1.jpg",
    title: "Горное озеро на рассвете",
    text: "На снимке спокойная вода, альпийские вершины и мягкий утренний свет, который хорошо показывает крупную фотографию в первом экране."
  },
  {
    id: "nature-2",
    cover: "/demo-images/nature-2.jpg",
    title: "Лесная река после дождя",
    text: "Здесь изображены хвойный лес, извилистая река и холодная зелёная палитра. Пример показывает стандартный сценарий с направленной анимацией."
  },
  {
    id: "nature-3",
    cover: "/demo-images/nature-3.jpg",
    title: "Море и скалистый берег",
    text: "На фотографии высокий берег над морем и открытый горизонт. Такой кадр помогает проверить, как компонент держит широкие и контрастные изображения."
  }
]

const citySlides: DemoSlide[] = [
  {
    id: "city-1",
    cover: "/demo-images/city-1.jpg",
    title: "Ночной город с огнями",
    text: "В кадре вечерние улицы, витрины и плотный поток света. Этот пример показывает ту же карусель без направленной анимации `oneway`."
  },
  {
    id: "city-2",
    cover: "/demo-images/city-2.jpg",
    title: "Уличное кафе в выходной день",
    text: "На изображении столики у фасада, прохожие и более тёплая городская атмосфера. Хороший сценарий для travel- и lifestyle-контента."
  },
  {
    id: "city-3",
    cover: "/demo-images/city-3.jpg",
    title: "Мост и современная архитектура",
    text: "Здесь показаны линии моста и стеклянные здания на заднем плане. Такой набор помогает оценить, как выглядят более графичные композиции."
  }
]

const workspaceSlides: DemoSlide[] = [
  {
    id: "workspace-1",
    cover: "/demo-images/workspace-1.jpg",
    title: "Рабочий стол с ноутбуком",
    text: "На фото ноутбук, блокнот и дневной свет у окна. В этом примере меняется заголовок и подписи в точках через слоты.",
    shortLabel: "Desk"
  },
  {
    id: "workspace-2",
    cover: "/demo-images/workspace-2.jpg",
    title: "Уголок для чтения",
    text: "Здесь изображены кресло, лампа и спокойный интерьер. Такой сценарий подходит для визуально спокойных презентационных блоков.",
    shortLabel: "Read"
  },
  {
    id: "workspace-3",
    cover: "/demo-images/workspace-3.jpg",
    title: "Утренний кофе и завтрак",
    text: "В кадре кофейная чашка, завтрак и мягкие тёплые цвета. Этот слайд показывает, как компонент работает с бытовыми lifestyle-сюжетами.",
    shortLabel: "Mood"
  }
]

const improvementIdeas = [
  "Управление с клавиатуры и улучшенные ARIA-атрибуты для доступности.",
  "Вертикальный режим и адаптивные пресеты размеров для разных макетов.",
  "Lazy loading изображений и отдельные состояния загрузки для медленных сетей.",
  "Поддержка циклической прокрутки и стрелок навигации как альтернативы точкам."
]
</script>

<template>
  <main class="page">
    <section class="hero">
      <div class="container page-container">
        <p class="hero__eyebrow">
          Vue Oneblock Carousel
        </p>
        <h1 class="hero__title">
          Примеры использования компонента на одной странице
        </h1>
        <p class="hero__lead">
          Ниже собраны несколько сценариев с разными изображениями и подписями,
          чтобы сразу увидеть, как карусель выглядит в типовых интерфейсах.
        </p>
      </div>
    </section>

    <section class="container page-container examples">
      <article class="example-card example-card--slot-demo">
        <div class="example-card__header">
          <p class="example-card__kicker">
            Пример 1
          </p>
          <h2 class="example-card__title">
            Базовая карусель с пейзажами
          </h2>
          <p class="example-card__description">
            На слайдах показаны горное озеро, лесная река и морской берег.
            Подписи объясняют, что именно изображено и зачем такой кадр полезен в демо.
            На мобильных устройствах этот же пример можно листать свайпом.
          </p>
        </div>

        <VObCar
          :slides="natureSlides"
          animation-type="oneway"
        />
      </article>

      <article class="example-card">
        <div class="example-card__header">
          <p class="example-card__kicker">
            Пример 2
          </p>
          <h2 class="example-card__title">
            Автопрокрутка с паузой при наведении
          </h2>
          <p class="example-card__description">
            В этом наборе используются ночной город, уличное кафе и современный мост.
            Карусель сама переключает слайды каждые 2.5 секунды, а при наведении ставит автопрокрутку на паузу.
          </p>
        </div>

        <VObCar
          :slides="citySlides"
          :autoplay="true"
          :autoplay-interval="2500"
        />
      </article>

      <article class="example-card">
        <div class="example-card__header">
          <p class="example-card__kicker">
            Пример 3
          </p>
          <h2 class="example-card__title">
            Кастомизация заголовков и точек через слоты
          </h2>
          <p class="example-card__description">
            Здесь изображены рабочее место, уголок для чтения и завтрак с кофе.
            Этот блок показывает, как можно адаптировать подачу контента без изменения компонента.
          </p>
        </div>

        <VObCar
          :slides="workspaceSlides"
          animation-type="oneway"
        >
          <template #title="{ slide, index }">
            <div class="custom-title">
              <span class="custom-title__counter">Сценарий {{ index + 1 }}</span>
              <h2 class="custom-title__text">
                {{ slide.title }}
              </h2>
            </div>
          </template>

          <template #dot="{ slide, isActive }">
            <span
              class="custom-dot"
              :class="{ 'custom-dot--active': isActive }"
            >
              {{ slide.shortLabel }}
            </span>
          </template>
        </VObCar>
      </article>

      <article class="example-card">
        <div class="example-card__header">
          <p class="example-card__kicker">
            Пример 4
          </p>
          <h2 class="example-card__title">
            Пустое состояние
          </h2>
          <p class="example-card__description">
            Отдельно полезно показать, как блок выглядит без данных, чтобы страница не разваливалась при пустом массиве слайдов.
          </p>
        </div>

        <VObCar :slides="[]">
          <template #not-found>
            <div class="empty-state">
              <h3 class="empty-state__title">
                Пока нет слайдов для показа
              </h3>
              <p class="empty-state__text">
                Сюда можно вывести заглушку, подсказку редактору контента или кнопку для загрузки изображений.
              </p>
            </div>
          </template>
        </VObCar>
      </article>

      <article class="summary-card">
        <p class="summary-card__kicker">
          Итог
        </p>
        <h2 class="summary-card__title">
          Какие нововведения ещё можно добавить в компонент
        </h2>
        <ul class="summary-card__list">
          <li
            v-for="idea in improvementIdeas"
            :key="idea"
            class="summary-card__item"
          >
            {{ idea }}
          </li>
        </ul>
      </article>
    </section>
  </main>
</template>

<style lang="scss">
html {
  font-size: 10px;
}

body {
  margin: 0;
  font-family: "Manrope", "Arial", sans-serif;
  background:
    radial-gradient(circle at top, rgba(254, 233, 204, 0.75), transparent 35%),
    linear-gradient(180deg, #f8f4ee 0%, #ebe6df 100%);
  color: #1f2933;
}

#app {
  min-height: 100vh;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
}

.page {
  padding: 6rem 0 8rem;
}

.page-container {
  padding: 0 2.4rem;
  box-sizing: border-box;
}

.hero {
  margin-bottom: 4rem;
}

.hero__eyebrow,
.example-card__kicker,
.summary-card__kicker {
  margin: 0 0 1.2rem;
  font-size: 1.4rem;
  line-height: 1.4;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  color: #7a5c2e;
}

.hero__title,
.example-card__title,
.summary-card__title {
  margin: 0;
  font-family: "Sora", "Manrope", "Arial", sans-serif;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero__title {
  max-width: 86rem;
  font-size: clamp(3.8rem, 5vw, 6.4rem);
  line-height: 0.98;
}

.hero__lead {
  max-width: 74rem;
  margin: 1.8rem 0 0;
  font-size: 2rem;
  line-height: 1.5;
  color: #52606d;
}

.examples {
  display: grid;
  gap: 2.4rem;
}

.example-card,
.summary-card {
  padding: 3.2rem;
  border: 1px solid rgba(31, 41, 51, 0.08);
  border-radius: 3.2rem;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 2rem 5rem rgba(31, 41, 51, 0.08);
  backdrop-filter: blur(10px);
}

.example-card__header {
  margin-bottom: 2.4rem;
}

.example-card__title,
.summary-card__title {
  font-size: 3rem;
  line-height: 1.1;
}

.example-card__description {
  max-width: 84rem;
  margin: 1.6rem 0 0;
  font-size: 1.8rem;
  line-height: 1.55;
  color: #52606d;
}

.examples .v-ob-car-slide .img {
  aspect-ratio: 12 / 7;
}

.examples .v-ob-car-slide .text {
  box-sizing: border-box;
}

.examples .v-ob-car-slide .ico-tit,
.examples .v-ob-car-slide .custom-title {
  min-height: 9.6rem;
}

.examples .v-ob-car-slide .subtext {
  min-height: 10rem;
}

.custom-title {
  display: grid;
  gap: 0.8rem;
}

.custom-title__counter {
  font-size: 1.4rem;
  line-height: 1.4;
  letter-spacing: 0.16rem;
  text-transform: uppercase;
  color: #7a5c2e;
}

.custom-title__text {
  margin: 0;
  font-size: 4rem;
  line-height: 1;
  font-family: "Sora", "Manrope", "Arial", sans-serif;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.custom-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 0.8rem;
  border-radius: 999px;
  font-size: 1.2rem;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
  box-sizing: border-box;
  white-space: nowrap;
}

.custom-dot--active {
  color: #fff;
}

.example-card--slot-demo .v-ob-car-dots .item {
  width: 7.2rem;
  flex: 0 0 7.2rem;
}

.empty-state {
  min-height: 43.4rem;
  display: grid;
  align-content: center;
  justify-items: start;
  padding: 4rem;
  border-radius: 2.4rem;
  background:
    linear-gradient(135deg, rgba(4, 49, 153, 0.12), rgba(122, 92, 46, 0.12)),
    #f4efe7;
}

.empty-state__title {
  margin: 0 0 1.2rem;
  font-size: 3.2rem;
  line-height: 1.1;
  font-family: "Sora", "Manrope", "Arial", sans-serif;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.empty-state__text {
  max-width: 58rem;
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.55;
  color: #52606d;
}

.summary-card__list {
  margin: 2.4rem 0 0;
  padding-left: 2.4rem;
  font-size: 1.8rem;
  line-height: 1.6;
  color: #1f2933;
}

.summary-card__item + .summary-card__item {
  margin-top: 1.2rem;
}

@media (max-width: 1024px) {
  .page {
    padding-top: 4rem;
  }

  .example-card,
  .summary-card {
    padding: 2.4rem;
  }

  .custom-title__text {
    font-size: 3.2rem;
  }

  .examples .v-ob-car-slide .ico-tit,
  .examples .v-ob-car-slide .custom-title {
    min-height: 8.4rem;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 1.6rem;
  }

  .hero__lead,
  .example-card__description,
  .empty-state__text,
  .summary-card__list {
    font-size: 1.6rem;
  }

  .example-card__title,
  .summary-card__title {
    font-size: 2.4rem;
  }

  .custom-title__text {
    font-size: 2.8rem;
  }

  .empty-state {
    min-height: 28rem;
    padding: 2.4rem;
  }

  .examples .v-ob-car-slide .ico-tit,
  .examples .v-ob-car-slide .custom-title,
  .examples .v-ob-car-slide .subtext {
    min-height: auto;
  }
}
</style>
