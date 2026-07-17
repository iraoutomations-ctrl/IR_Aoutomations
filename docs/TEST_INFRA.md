# Test Infrastructure & Design Document

## Test Philosophy
Our E2E test suite adopts an **opaque-box testing philosophy**, treating the entire landing page application as a single integrated black-box system. All interactions are performed via user-simulated inputs, gestures, and selectors, and verification is done by checking the DOM output, properties, and CSS states.

To guarantee reliability, performance, and deterministic results, the test environment operates under an **offline-first policy**:
- External CDN requests (fonts, scripts, icons) are blocked to ensure tests can run in a sandboxed, network-restricted CI/CD environment.
- Any outgoing API calls (e.g., Web3Forms form submit, Discord/WhatsApp webhook integrations) are intercepted and mocked using Puppeteer request interception.
- Dialog alerts are automatically accepted via browser handlers.
- Access-Control-Allow-Origin headers are injected into mocked responses to avoid local CORS blocks on `file://` pages.

## Feature Inventory
The E2E suite covers the following features:
1. **ROI Calculator**: Real-time savings projection based on inputs for employee count, manual hours spent, and hourly rate.
2. **Interactive Industry Survey**: 3-step digital automation assessment questionnaire tailored for different niches (Clinics, Lawyers, Realtors, General Business) with validation, backward navigation, summary cards, and WhatsApp output.
3. **AI Chatbot (Widget)**: Interactive lead generation chatbot supporting path-based button clicks, free-text inputs, custom logic validation (phone, email), error handling, context/history preservation on toggle, and full state reset.
4. **General Contact Form**: Access-key-driven contact submissions.
5. **Cross-Feature Integrations**: Inter-feature links (e.g., footer navigation triggering survey initiation) and concurrent state isolation.

## Test Architecture
- **Runner**: Node.js native `node:test` runner.
- **Automation Engine**: `puppeteer` (headless Chromium).
- **Execution Script**: `tests/test-e2e.js`.
- **Command**: `node --test tests/test-e2e.js`.
- **Offline Configuration**: Request interception maps `https://api.web3forms.com/` and webhook routes to mock CORS-compliant HTTP 200 JSON responses.

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: >=5 test cases per feature (ROI, Survey, Chatbot).
- **Tier 2 (Boundary & Corner Cases)**: >=5 test cases covering boundary limits (slider min/max limits, invalid inputs, CSS status changes).
- **Tier 3 (Cross-Feature Combinations)**: Interactions spanning multiple features (e.g., footer-to-survey flow).
- **Tier 4 (Real-World Application Scenarios)**: E2E user flows simulating complete workloads for specific business niches.
- **Total Tests**: 39 test cases implemented (all nested under node:test).

## Test Case List

### Tier 1: Feature Coverage (15 cases)
- **TC_ROI_01**: Verify default values are loaded correctly for inputs and text displays.
- **TC_ROI_02**: Verify default monthly/yearly savings results are calculated accurately.
- **TC_ROI_03**: Verify employee slider updates calculations correctly.
- **TC_ROI_04**: Verify manual hours slider updates calculations correctly.
- **TC_ROI_05**: Verify cost-per-hour slider updates calculations correctly.
- **TC_SRV_01**: Verify selecting an industry card hides the landing list and displays the survey form.
- **TC_SRV_02**: Verify the first step inputs for the chosen industry are dynamically rendered.
- **TC_SRV_03**: Verify that clicking "Next" with empty required fields triggers validation and alerts.
- **TC_SRV_04**: Verify transitioning to step 2 shows the appropriate text/textarea questions.
- **TC_SRV_05**: Verify completing the survey shows the thank-you screen and correct answers summary.
- **TC_CHT_01**: Verify toggle button opens/closes the chatbot window.
- **TC_CHT_02**: Verify welcome message and initial option chips are displayed.
- **TC_CHT_03**: Verify selecting a niche option adds a user message and transitions to the next bot question.
- **TC_CHT_04**: Verify selecting a challenge chip presents the call-scheduling prompt chips.
- **TC_CHT_05**: Verify the text input field and send button add messages to the chat history.

### Tier 2: Boundary & Corner Cases (15 cases)
- **TC_ROI_06**: Verify calculations with employee slider at its minimum boundary (1).
- **TC_ROI_07**: Verify calculations with employee slider at its maximum boundary (50).
- **TC_ROI_08**: Verify calculations with hours slider at its minimum boundary (1).
- **TC_ROI_09**: Verify calculations with hours slider at its maximum boundary (25).
- **TC_ROI_10**: Verify cost slider snaps to defined step increments (5).
- **TC_SRV_06**: Verify survey handles special characters and potential script injection strings safely.
- **TC_SRV_07**: Verify previously entered survey values are preserved when navigating back.
- **TC_SRV_08**: Verify rating options display selection styling and compile correctly.
- **TC_SRV_09**: Verify that clicking "Reset Survey" returns the user to the industry selection screen with clean fields.
- **TC_SRV_10**: Verify that focused invalid inputs clear their error styles.
- **TC_CHT_06**: Verify chatbot handles very long text inputs gracefully without breaking layout or history.
- **TC_CHT_07**: Verify chatbot phone validation rules reject non-digit or too short values and accept valid formats.
- **TC_CHT_08**: Verify chatbot email validation rules validate format and allow skipping.
- **TC_CHT_09**: Verify that clicking the "Reset Chat" option chip clears conversation history.
- **TC_CHT_10**: Verify that closing the chatbot window preserves history when reopened.

### Tier 3: Cross-Feature Combinations (4 cases)
- **TC_COM_01**: Verify that footer industry links scroll to the survey section and launch the correct survey.
- **TC_COM_02**: Verify that modifying the ROI calculator while a survey is open does not disrupt survey state.
- **TC_COM_03**: Verify that submitting the contact form works independently and does not affect the chatbot's state.
- **TC_COM_04**: Verify that completing a survey, exporting to WhatsApp, and interacting with the chatbot work concurrently.

### Tier 4: Real-World Application Scenarios (5 cases)
- **TC_APP_01**: Clinics Full Lead Workload (Calculations, dynamic inputs, textareas, final submit).
- **TC_APP_02**: Lawyers Custom Survey & Rating Workload (Skipping optional fields, multiple ratings, final summary validation).
- **TC_APP_03**: Realtor Foot-to-Survey and Reset Workload (Access via footer, partial fill, reset, switching to General business).
- **TC_APP_04**: Chatbot DIY Path Workload (General business pathway, choosing not to call, verifying DIY Make/n8n plan generation).
- **TC_APP_05**: Chatbot Full Lead Gen Workload (Niche selection, validation loops on phone, valid email skip, and success summary verification).
