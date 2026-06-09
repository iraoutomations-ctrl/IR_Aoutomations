/* ==========================================================================
   autoRI-studio - js/config.js
   ========================================================================== */
export const INTEGRATION_SETTINGS = {
    // 1. n8n Integration Webhook URLs:
    n8nContactWebhook: "", // e.g. "https://n8n.yourdomain.com/webhook/contact"
    n8nSurveyWebhook: "",  // e.g. "https://n8n.yourdomain.com/webhook/survey"
    n8nChatbotWebhook: "https://n8n.autori-studio.com/webhook/chatbot", // e.g. "https://n8n.yourdomain.com/webhook/chatbot"

    // 2. Free Email Fallback (Web3Forms):
    web3FormsAccessKey: "70df35d4-7450-40db-a1f2-240b7d0da6eb", // e.g. "12345678-abcd-1234-abcd-1234567890ab"

    // 3. Supabase Integration (Optional):
    supabaseUrl: "", // e.g. "https://yourproject.supabase.co"
    supabaseAnonKey: "" // e.g. "eyJhbGciOi..."
};
