<template>
<div>
 <v-ob-car animation-type="oneway"></v-ob-car>
</div>
</template>

<script>

import VObCar from "@/components/VObCar";
export default {
  components: {
    VObCar
  }
}
</script>

<style lang="scss">
@import "~normalize-css";
html {
  font-size: 10px;
}
.container {
  max-width: 1440px;
  margin: 0 auto;
}
h1 {
  font-size: 4rem;
}
</style>
