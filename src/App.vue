<template>
  <div class="mx-auto max-w-2xl">
    <div class="p-2 text-sm bg-gray-100">
      Notice: Please use Google Chrome on Desktop or Android only. Other
      browsers are not supported.
    </div>
    <div class="p-4 bg-white">
      <template v-if="!name">
        <h2 class="text-3xl mb-6">Log in</h2>
        <button
          class="
            bg-blue-500
            hover:bg-blue-700
            text-white
            font-bold
            py-2
            px-4
            rounded
          "
          @click="login()"
        >
          Click to log in
        </button>
      </template>
      <template v-else>
        <h2 class="text-3xl mb-6">Hello {{ name }}</h2>
        <ul>
          <li v-for="(message, i) of messages" :key="i">
            <strong>[{{ message.name }}]</strong>
            {{ message.text }}
          </li>
          <li v-if="draft" class="text-gray-500">
            <strong>[{{ name }}]</strong>
            {{ draft }}
          </li>
        </ul>
        <div v-if="!listening">
          <button
            class="
              bg-blue-500
              hover:bg-blue-700
              text-white
              font-bold
              py-2
              px-4
              rounded
            "
            @click="send()"
          >
            Send message
          </button>
          <button
            class="
              ml-2
              border border-red-500
              hover:bg-red-700
              py-2
              px-4
              rounded
            "
            @click="changeName()"
          >
            Change name
          </button>
        </div>
        <div v-else>
          Speak your message...
          <button
            class="
              bg-blue-500
              hover:bg-blue-700
              text-white
              font-bold
              py-2
              px-4
              rounded
            "
            @click="stop()"
          >
            Stop listening
          </button>
        </div>
      </template>
      <div
        v-if="currentPrompt"
        class="
          bg-yellow-400
          text-black
          p-8
          inset-x-0
          bottom-0
          fixed
          text-center
          font-bold
        "
      >
        {{ currentPrompt }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUpdated, reactive, ref } from "vue";
import { sharedMessages } from "./doc";
import { lang } from "./params";

declare var webkitSpeechRecognition: typeof SpeechRecognition;

export default defineComponent({
  name: "App",
  setup() {
    const name = ref(localStorage.MISHEARD_NAME ?? "");
    const currentPrompt = ref("");
    const messages = ref(sharedMessages.toJSON());
    const listening = ref(false);
    const draft = ref("");
    const sr = new webkitSpeechRecognition();
    sr.lang = lang;
    const sr2 = new webkitSpeechRecognition();
    sr2.lang = lang;
    sr2.continuous = true;
    sr2.interimResults = true;
    sharedMessages.observe(() => {
      messages.value = sharedMessages.toJSON();
    });
    const ask = async (prompt: string): Promise<string> => {
      try {
        currentPrompt.value = prompt;
        return await new Promise((resolve, reject) => {
          sr.onresult = (event) => {
            const text = Array.from(event.results)
              .map((alts) => alts[0].transcript)
              .join("");
            resolve(text);
          };
          sr.onerror = (e) => {
            reject(new Error("Unable to recognize text: " + e.error));
          };
          sr.start();
        });
      } finally {
        currentPrompt.value = "";
      }
    };
    const login = async () => {
      localStorage.MISHEARD_NAME = name.value = await ask(
        "Say your name out loud"
      );
    };
    const changeName = async () => {
      localStorage.MISHEARD_NAME = name.value = "";
    };
    const send = async () => {
      listening.value = true;
      sr2.onresult = function (event) {
        var finalTranscript = "";
        var interimTranscript = "";
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        draft.value = interimTranscript;
        if (finalTranscript) {
          sharedMessages.push([
            {
              text: finalTranscript,
              name: name.value,
              createdAt: new Date().toJSON(),
            },
          ]);
        }
      };
      sr2.onerror = () => {
        listening.value = false;
      };
      sr2.onend = () => {
        listening.value = false;
      };
      sr2.start();
    };
    const stop = () => {
      sr2.stop();
      listening.value = false;
    };
    let scrollIsAtBottom = true;
    window.onscroll = () => {
      scrollIsAtBottom =
        window.scrollY >
        document.documentElement.scrollHeight - window.innerHeight - 16;
    };
    onUpdated(() => {
      if (scrollIsAtBottom) {
        window.scrollBy(0, 1000);
      }
    });
    return {
      name,
      login,
      draft,
      listening,
      currentPrompt,
      send,
      stop,
      messages,
      changeName,
    };
  },
});
</script>

<style>
#app {
}
</style>
