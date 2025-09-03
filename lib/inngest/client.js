import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "careerhelpai", 
  name: "careerhelpai",
  credentials:{
    gemini: { apiKey: process.env.GEMINI_API_KEY,
  },
},

});