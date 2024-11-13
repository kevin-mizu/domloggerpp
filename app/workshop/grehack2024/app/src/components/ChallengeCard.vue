<template>
  <div
    @click="showDetails"
    :class="['bg-gray-800 shadow rounded-lg p-6 cursor-pointer transition-transform transform hover:scale-105', neonClass]"
  >
    <h2 class="text-xl font-semibold mb-2 text-white">{{ challenge.title }}</h2>
    <p class="text-gray-400">{{ truncatedDescription }}</p>
    <p class="text-sm mt-2" :class="challenge.solved ? 'text-green-400' : 'text-red-400'">
      {{ challenge.solved ? 'Solved' : 'Not Solved' }}
    </p>
  </div>
</template>

<script setup>
import { defineEmits, computed } from 'vue';

const props = defineProps({
  challenge: Object,
});

const emit = defineEmits();

const truncatedDescription = computed(() => {
  const cleanDescription = props.challenge.description.replace(/<[^>]*>/g, '');
  
  return cleanDescription.length > 70
    ? cleanDescription.substring(0, 70) + '...'
    : cleanDescription;
});


const showDetails = () => {
  emit('show-details', props.challenge);
};

const neonClass = computed(() => {
  return props.challenge.solved ? 'neon-border-green' : 'neon-border-red';
});
</script>

<style>
.neon-border-green {
  border: 2px solid rgb(34 197 94);
  box-shadow: 0 0 3px rgb(34 197 94), 0 0 6px rgb(34 197 94), 0 0 9px rgb(34 197 94), 0 0 12px rgb(34 197 94);
}

.neon-border-red {
  border: 2px solid rgb(248 113 113);
  box-shadow: 0 0 3px rgb(248 113 113), 0 0 6px rgb(248 113 113), 0 0 9px rgb(248 113 113), 0 0 12px rgb(248 113 113);
}
</style>
