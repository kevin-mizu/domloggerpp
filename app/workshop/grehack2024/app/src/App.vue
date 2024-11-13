<template>
  <div class="min-h-screen flex flex-col items-center py-10" :style="{ backgroundColor: '#0D1117' }">
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold mb-4 text-white">DOMLogger++ | GreHack 2024 Workshop</h1>
      <div class="w-full max-w-4xl bg-gray-600 h-2 rounded-full mb-6">
        <div class="bg-green-500 h-2 rounded-full" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <div v-if="!selectedChallenge" class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-3/5">
      <ChallengeCard
        v-for="challenge in challenges"
        :key="challenge.id"
        :challenge="challenge"
        @show-details="showDetails(challenge)"
      />
    </div>

    <div v-else class="bg-gray-800 shadow rounded-lg p-6 w-3/5 max-w-5xl relative">
      <button
        :class="selectedChallenge.solved ? 'text-green-500' : 'text-red-500'"
        class="mb-4 back-button"
        @click="goBackToList"
      ><b>← Back to List</b></button>
      <h2 class="text-2xl font-bold mb-2 text-white">{{ selectedChallenge.title }}</h2>
      <p class="text-gray-300 mb-4" v-html="selectedChallenge.description"></p>

      <h3 v-if="selectedChallenge.conditions.length" class="text-lg font-semibold mb-4 text-white">
        Challenge Conditions:
      </h3>
      <ul>
        <li
          v-for="(condition, index) in selectedChallenge.conditions"
          :key="index"
          class="p-2 rounded-md flex items-center space-x-2 text-gray-300"
        >
          <input
            type="checkbox"
            :checked="selectedChallenge.solved || condition.solved"
            class="form-checkbox h-5 w-5 text-green-500"
            disabled
          />
          <span v-html="condition.description"></span>
        </li>
      </ul>

      <h3 v-if="selectedChallenge.showScript" class="text-lg font-semibold mb-2 text-white mt-4">
        Challenge Code:
      </h3>
      <pre v-if="selectedChallenge.showScript" class="code-background"><code :class="'language-' + (selectedChallenge.language || 'javascript')" ref="codeBlock">{{ challengeScript }}</code></pre>

      <div id="challenge-html" hidden></div>

      <div class="mt-4 flex justify-center">
        <button class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mx-2" @click="clearCurrentChallenge">
          Clear
        </button>
        <a
          v-if="selectedChallenge.solution"
          :href="selectedChallenge.sameOrigin ? `${this.$el.ownerDocument.location.origin}${selectedChallenge.solution}` : selectedChallenge.solution"
          :target="selectedChallenge.solutionTarget || '_blank'"
        >
          <button class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mx-2">Solution</button>
        </a>
      </div>
    </div>

    <div class="mt-10 flex space-x-4">
      <a href="https://x.com/kevin_mizu" target="_blank" class="text-gray-400 hover:text-blue-500">
        <i class="fab fa-twitter fa-2x"></i>
      </a>
      <a href="https://github.com/kevin-mizu/domloggerpp" target="_blank" class="text-gray-400 hover:text-white">
        <i class="fab fa-github fa-2x"></i>
      </a>
      <a href="https://mizu.re" target="_blank" class="text-gray-400 hover:text-green-500">
        <i class="fas fa-globe fa-2x"></i>
      </a>
    </div>

    <footer class="mt-6 text-gray-400 text-sm">
      © 2024 <a href="https://x.com/kevin_mizu" target="_blank" class="text-gray-400 hover:text-blue-500">@kevin_mizu</a>. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import ChallengeCard from './components/ChallengeCard.vue';
import confetti from 'canvas-confetti';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const challenges = ref([]);
const selectedChallenge = ref(null);
const challengeScript = ref('');

const loadChallengeState = () => {
  try {
    const savedChallenges = localStorage.getItem('challenges');
    return savedChallenges ? JSON.parse(savedChallenges) : null;
  } catch {
    console.error('Error loading challenge state from localStorage');
    return null;
  }
};

const saveChallengeState = () => {
  try {
    localStorage.setItem('challenges', JSON.stringify(challenges.value));
  } catch {
    console.error('Error saving challenge state to localStorage');
  }
};

const saveSelectedChallenge = () => {
  if (selectedChallenge.value) {
    localStorage.setItem('selectedChallengeId', selectedChallenge.value.id);
  } else {
    localStorage.removeItem('selectedChallengeId');
  }
};

watch(selectedChallenge, saveSelectedChallenge);

const loadChallengeScript = async (scriptPath) => {
  try {
    const response = await fetch(scriptPath);
    challengeScript.value = (await response.text()).replace('await import("/challenges/checkSolve.js");\n\n', '');
    await nextTick();
    highlightCode();

    if (!selectedChallenge.value.language || selectedChallenge.value.language === 'javascript') {
      const scriptElement = document.createElement('script');
      scriptElement.src = scriptPath;
      scriptElement.id = 'challenge-script';
      scriptElement.type = 'module';
      scriptElement.async = true;
      document.body.appendChild(scriptElement);
    }
  } catch {
    console.error('Error loading challenge script');
  }
};

const highlightCode = () => {
  const codeBlocks = document.querySelectorAll("code");
  for (const codeBlock of codeBlocks) {
    hljs.highlightElement(codeBlock);
  }
};

const showDetails = (challenge) => {
  selectedChallenge.value = challenge;
  setupChallengeListeners();
  if (challenge.script) loadChallengeScript(`/challenges/${challenge.script}`);
};

const goBackToList = () => {
  removeChallengeListeners();
  selectedChallenge.value = null;
  localStorage.removeItem('selectedChallengeId');
  document.getElementById('challenge-html').innerHTML = '';
  const scriptElement = document.getElementById('challenge-script');
  if (scriptElement) scriptElement.remove();
  challengeScript.value = '';
};

const clearCurrentChallenge = () => {
  if (selectedChallenge.value) {
    selectedChallenge.value.solved = false;
    selectedChallenge.value.conditions.forEach((condition) => (condition.solved = condition.defaultValue));
    saveChallengeState();
    removeChallengeListeners();
    setupChallengeListeners();
  }
};

const progress = computed(() => {
  const total = challenges.value.length;
  const solved = challenges.value.filter((ch) => ch.solved).length;
  return total > 0 ? (solved / total) * 100 : 0;
});

const challengeSolved = () => {
  selectedChallenge.value.solved = true;
  saveChallengeState();
  triggerConfetti();
  removeChallengeListeners();
}

const checkConditions = (data) => {
  if (selectedChallenge.value.solved || !(data.ext === 'domlogger++')) return;

  selectedChallenge.value.conditions.forEach((condition) => {
    try {
      if (condition.type === 1 && !condition.solved) {
        condition.solved = eval(condition.expression);
      } else if (condition.type === 2 && condition.solved) {
        condition.solved = eval(condition.expression);
      }
    } catch(e) {
      console.error(`Error evaluating condition: ${e}`);
    }
  });

  if (selectedChallenge.value.conditions.every(item => item.solved)) {
    challengeSolved();
  } else {
    selectedChallenge.value.solved = false;
  }
};

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 60,
    origin: { x: 0.5, y: 0.5 },
  });
};

const setupChallengeListeners = () => {
  if (!selectedChallenge.value.solved) {
    window.onmessage = (event) => {
      const data = event.data;
      if (selectedChallenge.value.conditions.length) {
        checkConditions(data);
      } else if (data.solved === true) {
        challengeSolved();
      }
    };
  }
  console.log("ready!")
};

const removeChallengeListeners = () => {
  window.onmessage = null;
};

const handleEscPress = (event) => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    if (selectedChallenge.value) goBackToList()
  }
};

onMounted(async () => {
  try {
    const response = await fetch('/challenges.json');
    const fetchedChallenges = await response.json();
    const savedChallenges = loadChallengeState();

    if (savedChallenges) {
      fetchedChallenges.forEach((fetchedChallenge) => {
        const existingChallenge = savedChallenges.find((ch) => ch.id === fetchedChallenge.id);
        if (existingChallenge) {
          fetchedChallenge.solved = existingChallenge.solved;
          fetchedChallenge.conditions = fetchedChallenge.conditions.map((condition, index) => ({
            ...condition,
            solved: existingChallenge.conditions[index]?.defaultValue || false,
          }));
        }
      });
    }

    challenges.value = fetchedChallenges;
    saveChallengeState();

    const savedSelectedChallengeId = localStorage.getItem('selectedChallengeId');
    if (savedSelectedChallengeId) {
      const challenge = challenges.value.find(
        (ch) => ch.id === parseInt(savedSelectedChallengeId, 10)
      );
      if (challenge) {
        selectedChallenge.value = challenge;
        setupChallengeListeners();
        if (challenge.script) loadChallengeScript(`/challenges/${challenge.script}`);
      }
    }
  } catch {
    console.error('Error fetching challenge data');
  }

  document.addEventListener('keydown', handleEscPress);
});
</script>

<style>
.code-background {
  border: none;
  padding: 0;
  padding-top: 20px;
  margin: 0;
}

.hljs {
  background: #0D1117;
}

.back-button {
  margin-top: 10px !important;
}

button {
  margin-top: 30px !important;
  text-align: center;
}
</style>

