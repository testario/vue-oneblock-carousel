<template>
  <div class="v-ob-car">
    <div class="container">
      <div class="v-ob-car-slide" :class="animClass">
        <div class="img" :style="`background-image: url(${carState.cover})`"></div>
        <div class="text">
          <h1 class="ico-tit">
            {{ carState.title }}
          </h1>
          <div class="subtext">
            <div class="subtext-item">
              {{ carState.text }}
            </div>
          </div>
          <div class="v-ob-car-dots">
            <div class="v-ob-car-highlighter" :style="highlighter"></div>
            <div class="item" :class="item.id === carState.id ? 'active' : ''" v-for="item in carSlides" :key="item.id" @click="item.id !== carState.id ? carDots(item.id) : ''">
              {{ item.id + 1 }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "v-ob-car",
  props: ["animationType"],
  data() {
    return {
      animClass: "",
      highlighter: {
        top: "",
        left: "",
        width: ""
      },
      carSlides: [
        {
          id: 0,
          cover: "https://sebweo.com/wp-content/uploads/2019/06/landshaft-bernskikh-alp-v-yasniy-den_thumb.jpg",
          title: "First simple title for example",
          text: "First simple text for example too",
        },
        {
          id: 1,
          cover: "https://cdn.pixabay.com/photo/2020/04/10/21/28/bernese-oberland-5027861_1280.jpg",
          title: "Second simple title for example",
          text: "Second simple text for example too"
        }
      ],
      carState: {}
    }
  },
  methods: {
    async carDots(index) {
      let animDir = ""
      if (this.animationType === "oneway") {
        animDir = this.carState.id < index ? "animated-right" : "animated-left"
      }
      const activeDot = document.querySelectorAll(".v-ob-car-dots .item")[index]
      this.animClass = animDir
      activeDot.classList.add("active")
      if (this.carState.id > index) {
        this.highlighter.left = `${activeDot.offsetLeft}px`
      }
      this.highlighter.width = `${39 * (Math.abs(index - this.carState.id) + 1)}px`
      setTimeout(() => {
        this.animClass = `${animDir} stop`
      }, 150)
      setTimeout(() => {
        this.highlighter.left = `${activeDot.offsetLeft}px`
        this.highlighter.width = "32px"
        this.carState = this.carSlides[index]
        this.animClass = ""
      }, 300)
    }
  },
  created() {
    return (this.carState = this.carSlides[0])
  },
  mounted() {
    const activeDot = document.querySelector(".v-ob-car-dots .item.active")
    return this.highlighter = {
      top: `${activeDot.offsetTop}px`,
      left: `${activeDot.offsetLeft}px`,
      width: `32px`
    }
  }
}
</script>

<style lang="scss" scoped>
.v-ob-car {
  width: 100%;
  display: block;
  background: #EEEEEE;
  position: relative;
  .container {
    padding: 0;
  }
}
.v-ob-car-slide {
  display: flex;
  min-height: 43.4rem;
  overflow: hidden;
  .img {
    width: 70.4rem;
    margin-right: 7.8rem;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    transition: all 0.3s ease;
    opacity: 1;
  }
  .text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 5.8rem 0 7.1rem;
    h1, .subtext {
      transition: all 0.3s ease;
      opacity: 1;
    }
    .subtext {
      font-size: 2rem;
      .subtext-item {
        margin-bottom: 2.8rem;
      }
    }
    .v-ob-car-dots {
      display: flex;
      align-items: center;
      margin: auto -0.5rem 0;
      font-size: 1.6rem;
      line-height: 1.25;
      position: relative;
      .item {
        width: 3.2rem;
        height: 3.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 0.5rem;
        border-radius: 50%;
        cursor: pointer;
        z-index: 1;
        &.active {
          color: #fff;
        }
      }
      .v-ob-car-highlighter {
        position: absolute;
        min-width: 3.2rem;
        height: 3.2rem;
        background-color: #043199;
        transition: all 0.15s ease;
        z-index: 0;
        border-radius: 1.8rem;
      }
    }
  }
  &.animated-right {
    .img {
      transform: translateX(-100px);
      opacity: 0;
    }
    .text {
      h1, .subtext {
        transform: translateX(-100px);
        opacity: 0;
      }
    }
    &.stop {
      .img {
        transform: translateX(100px);
        transition: none;
      }
      .text {
        h1, .subtext {
          transform: translateX(100px);
          transition: none;
        }
      }
    }
  }
  &.animated-left {
    .img {
      transform: translateX(100px);
      opacity: 0;
    }
    .text {
      h1, .subtext {
        transform: translateX(100px);
        opacity: 0;
      }
    }
    &.stop {
      .img {
        transform: translateX(-100px);
        transition: none;
      }
      .text {
        h1, .subtext {
          transform: translateX(-100px);
          transition: none;
        }
      }
    }
  }

}
@media (max-width: 991px) {
  .v-ob-car-slide {
    flex-direction: column;
    .img {
      margin-right: 0;
      width: 100%;
      height: calc(100vw - 1.8rem);
    }
    .text {
      padding-left: 2rem;
      padding-right: 2rem;
      .subtext {
        margin-bottom: 4rem;
      }
    }
  }
}
</style>