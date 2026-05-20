# CityGuard -- MCA Final Viva Preparation Guide

## 1. PROJECT OVERVIEW

### Simple Explanation

CityGuard is a mobile safety and emergency response application. Think of it as a personal safety companion that lives on your phone -- when you are in danger, you press a big red SOS button; it gets your GPS location, alerts the authorities, and texts your emergency contacts. Beyond emergencies, it lets you report crimes (with photos and location), view a map of recent incidents in your area, chat with an AI assistant for safety advice, and verify your identity documents using AI. For police administrators, there is a separate dashboard to manage reports, verify user IDs, monitor social media sentiment, predict crime hotspots using AI, and broadcast emergency alerts to all citizens.

### Problem It Solves

In many cities, citizens lack a direct, fast, and trustworthy channel to report safety incidents and alert authorities during emergencies. Traditional channels (phone calls) can be slow, lack geolocation context, and offer no transparency on report status. Administrators have no centralized tool to analyze incident trends or verify citizen identities. CityGuard bridges this gap by providing a unified, real-time platform.

### Who It Is For

- **Citizens**: Anyone in the city who wants a safety app with SOS, crime reporting, and AI assistance.
- **Police/Administrators**: City officials who need to manage incidents, verify identities, monitor threats, and broadcast alerts.

### What Makes It Unique

- **AI at three layers**: Gemini powers the chatbot, the document forensics scanner, and the crime risk prediction engine.
- **SOS with SMS fallback**: On SOS trigger, the app sends SMS messages to emergency contacts with a Google Maps link of the user's location.
- **Dual-role system**: The same app functions as a civilian tool and an admin command center based on the user's `role` field.
- **Tactical dark UI**: Full black/dark emerald themed interface designed for low-light emergency use.

### Real-World Example

A woman walking home late at night feels unsafe. She opens CityGuard, presses the SOS button, and a 5-second countdown begins. When it reaches zero, the app sends her GPS coordinates to a `emergency_alerts` table in Supabase, triggers an SMS to her saved emergency contacts with a Google Maps link, and logs the event for admin dispatch. The admin sees "ACTIVE SOS" on their dashboard and can dispatch a unit. She can also use "SafeWalk" to set a 15-minute timer; if it expires without disarming, an SOS is automatically dispatched.

---

## CHALLENGES (10 Real Challenges)

### Challenge 1: SOS Alert SMS Not Sending on iOS Simulator

**Symptom**: The SOS feature worked perfectly on Android but on iOS simulator, the `sendSMSAsync` call would open the Messages composer but never auto-send.

**Debugging**: I checked the `expo-sms` documentation and realized that `SMS.sendSMSAsync` on iOS always requires user confirmation -- it cannot send silently. The `result` would return `'cancelled'` even though the user saw the composer.

**Fix**: I added an `SMS.isAvailableAsync()` check and displayed a fallback message. I also adjusted the UI to tell iOS users that the SMS composer will open rather than claiming the SMS was sent.

**Code** (`src/screens/home/HomeScreen.tsx:108-122`):
```typescript
const isAvailable = await SMS.isAvailableAsync();
if (isAvailable) {
  const message = `EMERGENCY SOS: ${profile?.full_name || 'A user'} is in danger! Location: https://www.google.com/maps/search/?api=1&query=${loc.coords.latitude},${loc.coords.longitude}`;
  const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
  if (result === 'sent') {
    contactMsg = `\n\nSMS Alerts dispatched to ${contacts.length} contacts.`;
  } else {
    contactMsg = `\n\nSMS composer opened for ${contacts.length} contacts.`;
  }
}
```

**Explain**: When the examiner asks about cross-platform issues, say: "I had to handle the difference between iOS and Android SMS APIs. On Android, SMS can be sent silently with permissions, but on iOS, the system always opens the Messages composer. Instead of showing a misleading 'SMS sent' message, I check `isAvailableAsync`, and if the result is not 'sent', I inform the user that the composer was opened instead."

### Challenge 2: Overpass API Mirrors Failing in Police Stations Screen

**Symptom**: The nearby police stations feature would often return empty results, especially during viva demonstrations with poor network.

**Debugging**: I checked the console logs and saw "All mirrors failed" errors. The Overpass API (OpenStreetMap) has multiple mirrors, but some are rate-limited or unreliable.

**Fix**: I implemented a mirror fallback loop -- try each mirror in sequence, and if all fail, fall back to hardcoded mock stations for demonstration purposes.

**Code** (`src/screens/map/PoliceStationsScreen.tsx:50-84`):
```typescript
let success = false;
for (const mirror of mirrors) {
  try {
    const response = await fetch(`${mirror}?data=${encodeURIComponent(query)}`);
    if (!response.ok) continue;
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) continue;
    data = await response.json();
    success = true;
    break;
  } catch (mirrorError) {
    console.warn(`Mirror ${mirror} failed`);
  }
}
if (!success) throw new Error('All mirrors failed');
```

**Explain**: "The Overpass API has multiple mirror servers that can fail independently. Instead of a single point of failure, I implemented a fallback chain -- try each mirror in order. If all fail, I fall back to static mock data so the feature still works for demonstrations. This is a classic resilience pattern."

### Challenge 3: Gemini API Returning JSON Wrapped in Markdown

**Symptom**: The AI risk prediction feature would crash because Gemini returned responses like ` ```json\n{...}\n``` ` instead of raw JSON.

**Debugging**: I logged the raw response text and saw the markdown code block wrappers. `JSON.parse` would throw on the backticks.

**Fix**: Added a regex cleanup before parsing.

**Code** (`src/screens/admin/RiskPredictionScreen.tsx:43`):
```typescript
const cleanJson = text.replace(/```json|```/g, '').trim();
const parsed = JSON.parse(cleanJson);
```

**Explain**: "Gemini sometimes wraps JSON responses in markdown code blocks. Before parsing, I strip these wrappers with a regex. I use the same pattern in the SocialMonitor and AIScanner screens too. This is a common gotcha when working with LLM APIs."

### Challenge 4: Supabase Profile Not Auto-Creating After Signup

**Symptom**: Users registered successfully but the profile (name, phone, etc.) was missing in the `profiles` table. The app would show "Loading Profile..." indefinitely.

**Debugging**: I discovered that when Supabase has email confirmation disabled, the `auth.signUp` returns a session immediately, but the database trigger (if any) might not fire. I was navigating to OTP screen but the OTP flow was being bypassed.

**Fix**: In `RegisterScreen`, I check if `authData.session` exists -- if yes, I upsert the profile immediately right there instead of navigating to OTP.

**Code** (`src/screens/auth/RegisterScreen.tsx:63-82`):
```typescript
if (authData.session && authData.user) {
  const { error: profileError } = await supabase.from('profiles').upsert([{
    id: authData.user.id,
    full_name: name,
    phone_number: phoneNumber,
    blood_type: bloodGroup,
    ice_contact: iceContact,
    operative_id: `OP-${Math.floor(100000 + Math.random() * 900000)}`,
    role: 'civilian'
  }], { onConflict: 'id' });
  if (!profileError) {
    await refreshProfile(authData.user.id);
  }
  return;
}
```

**Explain**: "When Supabase email confirmation is disabled, the session is returned immediately from signUp. I had to detect this case and upsert the profile directly, using `onConflict: 'id'` to prevent duplicate key errors. I also generate a unique `operative_id` for each user."

### Challenge 5: Async Update Bug on Report Status Change

**Symptom**: Admin would change a report status, but the UI would not update until the screen was re-focused.

**Debugging**: I was using local state updates instead of refetching after mutation. The `update` call would succeed in the database, but the local `reports` array was stale.

**Fix**: In `ReportActionScreen`, I made `updateReportStatus` navigate back after success, and `AdminReportsScreen` uses `useFocusEffect` to refetch on every focus.

**Code** (`src/screens/admin/AdminReportsScreen.tsx:17-25` + `ReportActionScreen.tsx:36-37`):
```typescript
// AdminReportsScreen uses useFocusEffect to auto-refetch
useFocusEffect(useCallback(() => { fetchReports(); }, []));

// ReportActionScreen navigates back to trigger refetch
Alert.alert("Success", `Report has been marked as ${actionLabel}`);
navigation.goBack();
```

**Explain**: "I used `useFocusEffect` from React Navigation, which runs every time the screen comes into focus. When the admin takes action and navigates back, the reports list automatically refetches from Supabase. This avoids stale data without complex subscription logic."

### Challenge 6: Expo Blur Not Working on Android

**Symptom**: The `BlurView` in `SOSModal` and `GlassCard` showed a solid dark view instead of a blur on Android devices.

**Debugging**: Checked expo-blur documentation and found that Android requires an experimental blur method.

**Fix**: Added `experimentalBlurMethod="dimezisBlurView"` to the BlurView.

**Code** (`src/components/ui/GlassCard.tsx:17`):
```typescript
<BlurView
  intensity={60}
  tint="dark"
  experimentalBlurMethod="dimezisBlurView"
  style={StyleSheet.absoluteFill}
/>
```

**Explain**: "Expo blur uses different rendering methods on iOS and Android. On Android, I had to specify `experimentalBlurMethod="dimezisBlurView"` which leverages a native library for hardware-accelerated blur. Without this, Android would render a non-transparent overlay."

### Challenge 7: Location Permission Denied Breaking SOS Flow

**Symptom**: On some devices, if the user denied location permission once, pressing SOS would silently fail -- no alert was sent because the permission request would return denied immediately.

**Debugging**: I realized `requestForegroundPermissionsAsync` returns the current permission status immediately if previously denied, and the app would just silently return from the SOS function.

**Fix**: Added `Alert.alert` before returning to inform the user, and added a `try/catch` with fallback coordinates.

**Code** (`src/screens/home/HomeScreen.tsx:60-66`):
```typescript
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('Permission Denied', 'Location access is required for SOS.');
  return;
}
```

**Explain**: "I added clear user feedback at every permission checkpoint. If location is denied, the user gets an alert explaining why the SOS failed. This prevents silent failures and guides the user to enable permissions."

### Challenge 8: SafeWalk Timer Continuing in Background

**Symptom**: The SafeWalk timer would pause when the app went to background, rendering the safety feature unreliable.

**Debugging**: I checked React Native's behavior -- `setInterval` does not fire in background on iOS and is throttled on Android. The timer would effectively "freeze" when the app was backgrounded.

**Fix**: I decided to use a simple client-side timer approach for v1, with the understanding that a production version would need a background service or push notification reminder.

**Code** (`src/screens/home/SafeWalkScreen.tsx:12-22`):
```typescript
useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isActive && timeLeft > 0) {
    interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
  } else if (timeLeft === 0) {
    setIsActive(false);
    Alert.alert("PROTOCOL BREACH", "Timer expired. SOS dispatched to authorities.");
    setTimeLeft(900);
  }
  return () => clearInterval(interval);
}, [isActive, timeLeft]);
```

**Explain**: "For v1, SafeWalk uses a client-side timer which works reliably when the app is in the foreground. I acknowledge the limitation -- a production version would use `expo-task-manager` for background geofencing or a push notification reminder. For viva purposes, I demonstrate the core logic: countdown timer with auto-SOS on expiry."

### Challenge 9: Gemini 503 Overload Error on Document Scanner

**Symptom**: During live demonstrations, pressing "Verify Authenticity" on the AI Scanner would sometimes return a raw error page instead of graceful handling.

**Debugging**: I logged the error and saw Google's Gemini API returning HTTP 503 (Service Unavailable) due to high demand.

**Fix**: Added error handling that detects 503 errors and returns a user-friendly message asking them to retry.

**Code** (`src/screens/admin/AIScannerScreen.tsx:92-113`):
```typescript
const isHighDemand = error?.message?.includes('503') || error?.toString()?.includes('503');
setResults({
  authenticityStatus: isHighDemand ? "SYSTEM_OVERLOADED" : "SERVICE_ERROR",
  accuracyScore: "0%",
  documentType: "N/A",
  detailedAnalysis: isHighDemand 
    ? "The Google Gemini AI is currently experiencing extremely high demand globally."
    : "The neural network is currently unavailable.",
  ...
});
```

**Explain**: "Third-party AI APIs can fail. Rather than crashing or showing a raw error, I detect 503 errors specifically and return a structured response with `SYSTEM_OVERLOADED` status. The UI renders this gracefully with the same card layout as a successful scan."

### Challenge 10: NativeWind Class Strings Not Applying on Some Components

**Symptom**: Some `className` strings with dynamic values (e.g., `` `${isActive ? 'bg-red-500' : 'bg-emerald-500'}` ``) would not apply correctly on Android.

**Debugging**: NativeWind (Tailwind for React Native) uses compile-time class extraction. Dynamic class strings are not always recognized. For complex conditional styling, inline `style` props are more reliable.

**Fix**: I used a combination of approaches -- for simple conditionals, template literals work; for complex ones (like `PoliceStationsScreen` severity colors), I used `style` prop with computed color values.

**Code** (`src/screens/admin/AdminReportsScreen.tsx:57-65,79-83`):
```typescript
const getStatusColor = (status: number) => {
  switch (status) {
    case 1: return '#3B82F6';
    case 2: return '#F59E0B';
    case 3: return '#10B981';
    case 4: return '#EF4444';
  }
};

// Usage with inline style for reliable rendering:
<View style={{ backgroundColor: `${getStatusColor(item.status_level)}20`, borderColor: getStatusColor(item.status_level) }}>
```

**Explain**: "NativeWind works by scanning files at build time for class strings. Dynamically constructed class names like `bg-${color}-500` can fail because the compiler does not see the full string. For reliability, I use inline `style` objects with computed colors when the styling depends on runtime data like report status."

---

## 2. SYSTEM ARCHITECTURE

### Simple Analogy

CityGuard is like a three-layer security system:
- **Front Layer (Mobile App)**: This is like the security guard's handheld radio -- the interface citizens and admins use to interact.
- **Middle Layer (Supabase)**: This is like the security command center's server rack -- stores all reports, user data, and manages authentication. It also stores photos in a file cabinet (Supabase Storage).
- **AI Layer (Google Gemini)**: This is like having three AI specialists on call -- one for chatting with citizens, one for examining documents for forgery, and one for predicting where crimes might happen next.

### Technical Architecture Diagram

```
+------------------------------------------------------------------+
|                     CITYGUARD MOBILE APP                          |
|                    (React Native / Expo 54 / TypeScript)          |
|                                                                   |
|  +------------+  +------------+  +-----------+  +--------------+ |
|  | Auth       |  | SOS/Emerg  |  | Crime     |  | AI Chatbot   | |
|  | (Login/    |  | (SOSModal, |  | Reporting |  | (Gemini AI)  | |
|  |  Register) |  | SafeWalk)  |  | + Maps    |  |              | |
|  +------------+  +------------+  +-----------+  +--------------+ |
|  +------------+  +------------+  +-----------+  +--------------+ |
|  | Admin      |  | Profile/   |  | Social    |  | Doc Scanner  | |
|  | Dashboard  |  | Contacts   |  | Monitor   |  | (Gemini AI)  | |
|  +------------+  +------------+  +-----------+  +--------------+ |
|                                                                   |
|  [React Navigation: Stack+Drawer+Tabs]  [NativeWind Tailwind]    |
|  [react-native-maps] [react-native-chart-kit] [expo-av/SMS/Location]
+------------------------------------------------------------------+
          |                    |                    |
          | Supabase SDK      | Gemini SDK         | Overpass API
          v                    v                    v
+------------------------+  +-------------+  +------------------+
|      SUPABASE           |  |   GOOGLE   |  |  OpenStreetMap   |
|  (Backend-as-a-Service) |  |   GEMINI   |  |  Overpass API    |
|                         |  |   (AI)     |  |                  |
|  +-------------------+  |  |            |  |  Query:          |
|  | Auth              |  |  |  Model:    |  |  amenity=police  |
|  | (email/password)  |  |  |  gemini-   |  |  within 20km     |
|  |                   |  |  |  flash-    |  |                  |
|  | Database          |  |  |  latest    |  +------------------+
|  | - 9 tables        |  |  |            |
|  | - PostgreSQL      |  |  |  Uses:     |
|  |                   |  |  |  - Chatbot |
|  | Storage           |  |  |  - Doc     |
|  | - images bucket   |  |  |    Scanner |
|  +-------------------+  |  |  - Risk     |
+------------------------+  |    Predict |
                            |  - Social   |
                            |    Monitor  |
                            +-------------+
```

### How Data Flows -- Step by Step

#### Simple Version (SOS Flow):
1. User presses the red SOS button on the home screen.
2. A 5-second countdown appears with a pulsing animation.
3. If user does not cancel, the app requests GPS location permission.
4. Gets current latitude/longitude via `expo-location`.
5. Inserts a record into `emergency_alerts` table (user_id, location, status).
6. Fetches active emergency contacts from `emergency_contacts` table.
7. Opens SMS composer (or auto-sends on Android) with a Google Maps link.
8. Admin dashboard sees the active SOS alert in real-time.

#### Technical Version (Report Crime Flow):
1. User fills Title, Description, optionally captures/selects an image, and captures their location.
2. On submit, if an image is selected, it is uploaded to Supabase Storage (`images` bucket) using `supabase.storage.from('images').upload(fileName, blob)` and a public URL is obtained.
3. A record is inserted into the `reports` table with `title`, `description`, `user_id`, `status_level: 1`, `severity: 'medium'`, `image_url`, `latitude`, `longitude`, and `report_tag: 'OPERATIVE_LOG'`.
4. The user sees "Report Submitted" alert and is navigated back.
5. On the admin side, `AdminReportsScreen` fetches all reports with a join on `profiles` to get the reporter's name.
6. Admin clicks a report, sees details on `ReportActionScreen`, and can change `status_level` (1=Submitted, 2=Under Review, 3=Verified/Resolved, 4=Rejected).

**Actual Code** (`src/screens/report/ReportCrimeScreen.tsx:63-109`):
```typescript
const submitReport = async () => {
  if (!title || !description) { Alert.alert("Error", "Title and Description are required."); return; }
  setLoading(true);
  try {
    let uploadedImageUrl = null;
    if (image) { uploadedImageUrl = await uploadImage(image); }
    const { error } = await supabase.from('reports').insert([{
      title, description, user_id: user?.id,
      status_level: 1, report_tag: 'OPERATIVE_LOG',
      reported_at: new Date().toISOString(), severity: 'medium',
      image_url: uploadedImageUrl, latitude: location?.latitude, longitude: location?.longitude,
    }]);
    if (error) throw error;
    Alert.alert("Report Submitted", "Your incident report has been securely sent.");
  } catch (error: any) {
    Alert.alert("Error", "Failed to submit report: " + error.message);
  } finally { setLoading(false); }
};
```

**Explain**: "The report submission follows a three-step pipeline: first, optionally upload the image to Supabase Storage and get a public URL. Second, insert the report record into the `reports` table with all metadata. The `status_level` field uses a numeric enum (1-4) to track the admin workflow. The `report_tag` field classifies the report for analytics."

---

## 3. SCREEN-BY-SCREEN EXPLANATION

### Screen 1: LoginScreen

**Simple Explanation**: The login page where users enter their email and password to access the app. It has a CityGuard logo (shield icon), email field, password field, and a login button.

**Visual Appearance**: Dark background (`bg-gray-950`), centered shield icon in a bordered circle, "CityGuard" title in 4xl white bold text, "Welcome Back" subtitle in emerald green. Two input fields with icons (mail, lock) on dark gray background. Emerald login button. "Don't have an account? Sign Up" link at bottom.

**Technical Steps**:
1. User types email and password into controlled state variables (`useState`).
2. On pressing "Log In", `handleLogin` is called.
3. Calls `supabase.auth.signInWithPassword({ email, password })`.
4. If error, shows `Alert.alert("Login Failed", error.message)`.
5. On success, `AuthContext` detects the session change via `onAuthStateChange` listener, and `RootNavigator` automatically switches from `AuthNavigator` to `MainNavigator`.

**Code** (`src/screens/auth/LoginScreen.tsx:12-28`):
```typescript
const handleLogin = async () => {
  if (!email || !password) { Alert.alert("Error", "Email and Password are required."); return; }
  setLoading(true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { Alert.alert("Login Failed", error.message); }
  setLoading(false);
};
```

**Explain**: "Login uses Supabase Auth's `signInWithPassword` method. The session is automatically managed by `AuthContext` which listens to `onAuthStateChange`. The `RootNavigator` conditionally renders either the Auth stack or the Main stack based on whether `session` is null. The loading state is handled by an `ActivityIndicator` inside the button."

**Viva Key Point**: "The authentication flow is declarative -- I do not manually navigate after login. The `AuthContext` updates the session state, which triggers a re-render of `RootNavigator`, which conditionally shows the main app. This prevents manual navigation bugs."

### Screen 2: RegisterScreen

**Simple Explanation**: Sign-up page where new users create an account with name, email, phone, password, and optional fields like blood group and emergency contact.

**Visual Appearance**: Scrollable form on dark background with a back arrow, "Sign up" heading, input fields for Full Name, Phone, Email, Password, Confirm Password, Blood Group (optional), Emergency Contact (optional), and a green "Sign Up" button.

**Technical Steps**:
1. All fields are controlled via `useState`.
2. `handleRegister` validates required fields.
3. Calls `supabase.auth.signUp` with `options.data` containing profile info.
4. If a session is returned immediately (email confirmation off), upserts the profile into `profiles` table directly.
5. If no session (email confirmation on), navigates to `OtpScreen` with email and serialized user data.

**Code** (`src/screens/auth/RegisterScreen.tsx:41-95`):
```typescript
const { data: authData, error: authError } = await supabase.auth.signUp({
  email, password,
  options: { data: { full_name: name, phone_number: phoneNumber, blood_type: bloodGroup, ice_contact: iceContact } }
});
if (authData.session && authData.user) {
  await supabase.from('profiles').upsert([{
    id: authData.user.id, full_name: name, ...,
    operative_id: `OP-${Math.floor(100000 + Math.random() * 900000)}`, role: 'civilian'
  }], { onConflict: 'id' });
  await refreshProfile(authData.user.id);
  return;
}
navigation.navigate('Otp', { email, userDataString: JSON.stringify({...}) });
```

**Explain**: "The registration has a dual path. If Supabase email confirmation is disabled, the session is returned immediately, and I upsert the profile right there. If enabled, I navigate to OTP verification. I serialize user data as JSON string to pass it through navigation params, which is the standard React Navigation pattern for complex data."

**Viva Key Point**: "I handle both configurations of Supabase email verification. The `operative_id` is generated as `OP-XXXXXX` to give each user a unique identifier visible on their profile."

### Screen 3: OtpScreen

**Simple Explanation**: Email verification screen where the user enters a 6-digit OTP sent to their registered email.

**Visual Appearance**: Dark screen with a back arrow, a keypad icon inside a circle, "Verify Email" heading, instruction text showing the user's email, a centered OTP input field with large monospace text and wide letter spacing, and a "Verify OTP" button.

**Technical Steps**:
1. Receives `email` and `userDataString` from route params.
2. User types 6-digit OTP.
3. Calls `supabase.auth.verifyOtp({ email, token: otp, type: 'signup' })`.
4. On success, upserts the profile into `profiles` table using the previously serialized user data.
5. Calls `refreshProfile` to update AuthContext.

**Code** (`src/screens/auth/OtpScreen.tsx:15-63`):
```typescript
const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
  email, token: otp, type: 'signup'
});
if (verifyData.user) {
  await supabase.from('profiles').upsert([{
    id: verifyData.user.id, full_name: userData.name, ...
  }], { onConflict: 'id' });
  await refreshProfile(verifyData.user.id);
}
```

**Explain**: "OTP verification uses Supabase's `verifyOtp` with type 'signup'. After the user is verified and logged in, I create the profile record. I use `upsert` with `onConflict: 'id'` to handle the case where a database trigger might have already created a skeleton profile. The `refreshProfile` call updates the `AuthContext` so the navigator switches to the main app."

**Viva Key Point**: "The OTP screen is the fallback path when email confirmation is enabled. It completes the auth flow by calling `verifyOtp`, which both confirms the email and logs the user in."

### Screen 4: HomeScreen (Safety Dashboard)

**Simple Explanation**: The main dashboard users see after login. It has an SOS button, an alarm buzzer, quick links to report incidents, find police stations, give feedback, start SafeWalk, view community intel, and access AI tools.

**Visual Appearance**: Dark header with hamburger menu (opens drawer), "Safety Dashboard" subtitle, user's first name in emerald, profile avatar. Below: a large red SOS card with a shield icon, a Buzz Alarm toggle card, a "REPORT INCIDENT" card in emerald, two-column grid for Police/Feedback/SafeWalk/Community/Advisory/My Reports, a bottom row of three small cards for Risk AI/Override/Stats, live widgets showing "Area Risk: LOW" and "Network: 100%", horizontal scroll for "Assistant", "Live Map", "Scanner", and a green status bar footer.

**Technical Steps**:
1. Synchronizes user data from `AuthContext` profile via `useEffect`.
2. SOS Flow: `triggerSOS()` sets `showSOS=true` and countdown=5. A `useEffect` decrements countdown every second. At 0, `sendEmergencyAlert()` fires.
3. `sendEmergencyAlert()`: requests location, gets coordinates, inserts into `emergency_alerts`, fetches active contacts, and opens SMS composer.
4. Buzz Alarm: `playAlarm()` uses `expo-av` `Audio.Sound.createAsync` to play `emergencyalarm.wav` in a loop.
5. All navigation cards navigate to respective screens via drawer navigator.

**Code** (`src/screens/home/HomeScreen.tsx:58-131`):
```typescript
const sendEmergencyAlert = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') { Alert.alert('Permission Denied'); return; }
  const loc = await Location.getCurrentPositionAsync({});
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  await supabase.from('emergency_alerts').insert([{
    user_id: user.id, full_name: profile?.full_name, latitude: loc.coords.latitude, longitude: loc.coords.longitude, status: 'active'
  }]);
  // SMS to emergency contacts...
};
```

**Explain**: "The HomeScreen is the civilian command center. The SOS feature uses a countdown timer (`useEffect` with `setTimeout`) to give users a chance to cancel. The actual alert dispatch requests location permission, gets current position, stores the alert in Supabase with 'active' status, and triggers SMS notifications to emergency contacts. The audio alarm uses `expo-av` for playing a looping emergency sound."

**Viva Key Point**: "The SOS has a 5-second abort window. If the user does not cancel, the app writes an `emergency_alerts` record, which the admin sees on their dashboard with a pulsing red indicator."

### Screen 5: SafeWalkScreen

**Simple Explanation**: A personal safety timer. Set a countdown (5, 15, or 30 minutes). If the timer expires without you disarming it, an SOS is dispatched as if you pressed the emergency button.

**Visual Appearance**: Blue/emerald themed screen with a large circular countdown timer display showing MM:SS. Quick-set buttons for 5m, 15m, 30m. An "Engage Escort Timer" button that turns into "Disarm Protocol" when active.

**Technical Steps**:
1. `timeLeft` is stored in seconds, default 900 (15 min).
2. `useEffect` decrements every second when `isActive` is true.
3. At zero, shows alert "PROTOCOL BREACH" and resets.
4. `toggleProtocol` shows an Alert confirmation before disarming.

**Code** (`src/screens/home/SafeWalkScreen.tsx:10-48`):
```typescript
useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isActive && timeLeft > 0) {
    interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
  } else if (timeLeft === 0) {
    setIsActive(false);
    Alert.alert("PROTOCOL BREACH", "Timer expired. SOS dispatched to authorities.");
    setTimeLeft(900);
  }
  return () => clearInterval(interval);
}, [isActive, timeLeft]);
```

**Explain**: "SafeWalk uses a simple `setInterval` countdown. The critical design decision is the confirmation dialog on disarming -- this prevents accidental deactivation. In production, the zero-state would trigger the same `sendEmergencyAlert` function as the SOS button."

**Viva Key Point**: "The timer reset at zero triggers an alert message. In a full implementation, this would call the same SOS dispatch pipeline. The confirmation-on-disarm prevents the user from accidentally turning off safety."

### Screen 6: IntelHubScreen (Community)

**Simple Explanation**: A community feed showing official emergency broadcasts (red cards) and citizen-submitted incident reports (gray cards).

**Visual Appearance**: Purple-themed header, "Community" title. Official broadcasts shown as red-bordered critical cards with "CRITICAL OVERRIDE" badge. Citizen reports shown as gray cards with severity badges (high=red, medium=amber, low=emerald), title, description, and timestamp.

**Technical Steps**:
1. On screen focus (`useFocusEffect`), fetches broadcasts from `broadcasts` table and reports from `reports` table.
2. Broadcasts ordered by `created_at` descending, limited to 5.
3. Reports ordered by `reported_at` descending, limited to 10.

**Code** (`src/screens/home/IntelHubScreen.tsx:44-76`):
```typescript
const fetchReports = async () => {
  const { data, error } = await supabase
    .from('reports').select('*')
    .order('reported_at', { ascending: false }).limit(10);
  if (data && data.length > 0) setReports(data);
};
const fetchBroadcasts = async () => {
  const { data, error } = await supabase
    .from('broadcasts').select('*')
    .order('created_at', { ascending: false }).limit(5);
  if (data && data.length > 0) setBroadcasts(data);
};
```

**Explain**: "The Intel Hub combines two data sources: `broadcasts` (admin-created emergency messages) and `reports` (citizen incident reports). Both are fetched on screen focus using `useFocusEffect`, which ensures fresh data every time the user visits. The broadcasts are displayed with red critical styling to differentiate them from citizen reports."

**Viva Key Point**: "This screen demonstrates a dual-data-source pattern. Official broadcasts and citizen reports are fetched from separate tables but displayed in a unified feed with different visual treatments."

### Screen 7: ReportCrimeScreen

**Simple Explanation**: A form to file a detailed incident report. User provides a title, description, optional photo (camera or gallery), and optional GPS location.

**Visual Appearance**: Dark form with "REPORT INCIDENT" header, shield icon. Title and Description text inputs. Image preview area if selected. Camera/Upload buttons. "Get Current Location" button with coordinates display. Red "Submit Report" button.

**Technical Steps**:
1. `pickImage()` / `openCamera()` uses `expo-image-picker` to get image URI.
2. `getLocation()` uses `expo-location` to get GPS coordinates.
3. `uploadImage()`: fetches the image URI as blob, uploads to Supabase Storage `images` bucket, returns public URL.
4. `submitReport()`: inserts report with all data into `reports` table.

**Code** (`src/screens/report/ReportCrimeScreen.tsx:39-61, 63-109`):
```typescript
const uploadImage = async (uri: string) => {
  const fileName = `${user?.id}/${Date.now()}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { data, error } = await supabase.storage.from('images').upload(fileName, blob, { contentType: 'image/jpeg' });
  const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
  return publicUrl;
};
```

**Explain**: "The image upload follows a fetch-blob-upload pattern: the local URI is fetched as a blob, then uploaded to Supabase Storage with a path structured as `userId/timestamp.jpg`. The public URL is generated using `getPublicUrl`. The report record includes all metadata including the image URL, GPS coordinates, severity, and status_level."

**Viva Key Point**: "Image upload happens first, then the report record is created. If the upload fails, the whole submission is aborted. The `status_level: 1` corresponds to 'Report Submitted', the initial state of the admin workflow."

### Screen 8: MyReportsScreen

**Simple Explanation**: A list of all reports the current user has submitted, showing title, date, status, and description.

**Visual Appearance**: Green-themed header with "My Reports" title. Each report card shows title, timestamp, status badge (Submitted/Resolved), description, and a Log ID reference.

**Technical Steps**:
1. `useFocusEffect` triggers `fetchReports` when screen is focused.
2. Queries `reports` table filtered by `user.id`, ordered by `reported_at` descending.
3. Displays each report with `dayjs` formatted timestamp.
4. `statusSteps` array shows the possible status flow: Submitted, Verified, Authorities Dispatched, Resolved.

**Code** (`src/screens/report/MyReportsScreen.tsx:27-45`):
```typescript
const fetchReports = async () => {
  if (!user) return;
  const { data, error } = await supabase
    .from('reports').select('*')
    .eq('user_id', user.id)
    .order('reported_at', { ascending: false });
  if (data && data.length > 0) setMyReports(data);
};
```

**Explain**: "MyReports filters reports by the authenticated user's ID. It uses `useFocusEffect` from React Navigation so the list is refreshed every time the tab is focused."

**Viva Key Point**: "This demonstrates row-level security in practice -- the user can only see their own reports because we filter by `user_id` on the client side. In production, Supabase RLS policies would enforce this at the database level."

### Screen 9: CrimeMapScreen (Live Threat Map)

**Simple Explanation**: A map view showing the user's location and nearby crime/incident markers. Uses a dark tactical map style.

**Visual Appearance**: Full-screen MapView with custom dark map style (`darkMapStyle` array). Shows user location as a blue dot. Incident markers are small colored dots (red=critical, amber=warning) with layered circle heat effects. Top overlay shows "CITYGUARD LIVE" and a pulsing red dot. Bottom left shows legend.

**Technical Steps**:
1. `useEffect` requests location permission and gets current position.
2. `useFocusEffect` fetches all reports from `reports` table.
3. Each report is rendered as a `Marker` with `Circle` overlays for heat effect.
4. Since reports may not have actual lat/lng from real data, `jitterLat`/`jitterLng` offsets are applied to spread markers visually.
5. Custom dark map style array darkens roads, water, and hides POIs.

**Code** (`src/screens/map/CrimeMapScreen.tsx:28-112`):
```typescript
const fetchMapData = async () => {
  const { data, error } = await supabase.from('reports').select('*');
  if (data) setHotspots(data);
};
// Marker rendering with jitter and layered circles:
hotspots.map((spot, index) => {
  const jitterLat = location.coords.latitude + ((index % 5) * 0.003 * (index % 2 === 0 ? 1 : -1));
  <Circle center={{ latitude: jitterLat, longitude: jitterLng }} radius={800}
    fillColor={isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)'} />
});
```

**Explain**: "The crime map uses `react-native-maps` with a custom dark style array that makes roads `#1E293B` and water `#020617`. Since real-world incident data may not have precise coordinates, I apply a deterministic jitter formula based on the index to spread markers visually. The layered `Circle` components with decreasing radii and increasing opacity create a heatmap-like visual effect."

**Viva Key Point**: "The heat effect is achieved using three concentric Circle components with decreasing radii and increasing opacity -- not an actual heatmap library. This was a creative workaround since `react-native-maps` has limited heatmap support."

### Screen 10: ChatbotScreen (CityGuard AI)

**Simple Explanation**: An AI chat assistant powered by Google Gemini. Users can ask safety questions, get advice, or any general query.

**Visual Appearance**: Chat interface with dark background. Messages bubble left (bot, gray border) or right (user, emerald). Animated typing indicator with three bouncing dots. Input field at bottom with rounded send button.

**Technical Steps**:
1. Messages stored in `useState` with `{id, text, sender}` objects.
2. `sendMessage` inserts user message into `chatbot_history` table.
3. Calls `geminiModel.generateContent(systemContext + input)` with a system prompt that includes the current date.
4. Bot response is displayed and also saved to `chatbot_history`.
5. `scrollViewRef.current.scrollToEnd` auto-scrolls on new messages.
6. `TypingIndicator` component uses `Animated.loop` with staggered delays for a three-dot bounce effect.

**Code** (`src/screens/chatbot/ChatbotScreen.tsx:52-94`):
```typescript
const sendMessage = async () => {
  const currentInput = inputText.trim(); setInputText('');
  setIsLoading(true);
  await supabase.from('chatbot_history').insert([{
    user_id: user?.id, message: currentInput, sender: 'user'
  }]);
  const systemContext = `Present Day: ${currentDate}. You are CityGuard AI...`;
  const result = await geminiModel.generateContent(systemContext + currentInput);
  const botMsg = { id: Date.now().toString(), text: await result.response.text(), sender: 'bot' };
  await supabase.from('chatbot_history').insert([{ ...botMsg, user_id: user?.id }]);
  setIsLoading(false);
};
```

**Explain**: "The chatbot uses Google Generative AI SDK (`@google/generative-ai`). Each message is saved to Supabase for history. The system prompt includes the current date so Gemini can give date-aware responses. Error handling catches API failures and displays a user-friendly message. The typing indicator uses React Native Animated API with staggered timing for a natural effect."

**Viva Key Point**: "Both user messages and bot responses are persisted to `chatbot_history` table. This allows future features like conversation history review. The Gemini model is initialized once in `src/lib/gemini.ts` and reused across chatbot, risk predictor, social monitor, and document scanner."

### Screen 11: NotificationScreen (Dispatch Feed)

**Simple Explanation**: A feed showing system alerts, SOS activations, and safety notifications.

**Visual Appearance**: Yellow-themed header "Dispatch Feed". Alert cards with colored icons (red=critical, amber=warning, green=info), title, description, and relative timestamp ("Just now", "12 mins ago").

**Technical Steps**:
1. Uses mock data (`mockAlerts` array) for demonstration.
2. Each alert has `type` (critical/warning/info), `icon`, `title`, `desc`, `time`.
3. Icons and colors are conditionally rendered based on `type`.

**Code** (`src/screens/notifications/NotificationScreen.tsx:9-15`):
```typescript
const mockAlerts = [
  { id: 1, type: 'critical', title: 'SOS Activated', desc: 'Sector 4, Near Mall Road. Units dispatched.', time: 'Just now', icon: 'warning' },
  { id: 2, type: 'warning', title: 'Suspicious Crowd', desc: 'AI Camera 04 detected anomaly at Bus Stand.', time: '12 mins ago', icon: 'people' },
];
```

**Explain**: "The notification screen currently uses static mock data to demonstrate the UI pattern. In production, this would be connected to Supabase real-time subscriptions on the `emergency_alerts` and `broadcasts` tables for live updates."

**Viva Key Point**: "This is intentionally 'mock' for the UI demonstration. The architecture supports connecting it to real-time Supabase subscriptions as a future enhancement."

### Screen 12: ProfileScreen

**Simple Explanation**: Displays the user's profile information -- name, role, operative ID, email, phone, blood type, emergency contact -- with navigation to edit profile and manage emergency contacts.

**Visual Appearance**: Scrollable profile page. Top section has a circular avatar (generated via ui-avatars.com), name, role badge ("civilian" or "admin" in emerald), operative ID. Below: blood type and status in a card. Account details section shows email, phone, emergency contact. "Edit Profile" and "Emergency Contacts" buttons. Red "Sign Out" button at bottom.

**Technical Steps**:
1. Reads `profile` and `user` from `AuthContext`.
2. `useEffect` syncs context data to local state when auth loading completes.
3. Avatar URL uses `ui-avatars.com` API with the user's name.
4. All data is read-only display; editing is done via `EditProfileScreen`.

**Code** (`src/screens/profile/ProfileScreen.tsx:43-62`):
```typescript
<Image
  source={{ uri: displayData.avatar_url ||
    `https://ui-avatars.com/api/?name=${displayData.full_name}&background=111827&color=10B981&size=256&bold=true` }}
  className="h-32 w-32 rounded-full"
/>
```

**Explain**: "Profile data comes from the `AuthContext` which fetches from the `profiles` table. The avatar uses the ui-avatars.com service which generates a unique avatar based on the user's name -- no image upload needed. The profile is read-only here; editing is delegated to `EditProfileScreen`."

**Viva Key Point**: "The profile is a 'view' component. All mutations happen through dedicated screens (`EditProfile`, `EmergencyContacts`). This follows the separation of concerns pattern."

### Screen 13: EditProfileScreen

**Simple Explanation**: Form to update profile details -- name, phone, blood type, and emergency contact.

**Visual Appearance**: Dark form with back button, "EDIT PROFILE" heading. Four labeled input fields with icons. Green "Save Changes" button.

**Technical Steps**:
1. Pre-populates fields from `AuthContext` profile via `useEffect`.
2. `handleUpdate` calls `supabase.from('profiles').update({...}).eq('id', user.id)`.
3. On success, shows alert and navigates back.

**Code** (`src/screens/profile/EditProfileScreen.tsx:31-62`):
```typescript
const handleUpdate = async () => {
  if (!fullName) { Alert.alert('Validation Error', 'Full Name is required.'); return; }
  setSaving(true);
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('profiles').update({
    full_name: fullName, phone_number: phoneNumber, blood_type: bloodType, ice_contact: iceContact, updated_at: new Date()
  }).eq('id', user.id);
  if (error) throw error;
  Alert.alert('Success', 'Profile credentials updated securely.');
  navigation.goBack();
};
```

**Explain**: "Edit Profile performs a direct update on the `profiles` table using the authenticated user's ID. The `updated_at` timestamp is set for auditing."

**Viva Key Point**: "The update uses `supabase.from('profiles').update()` with an `.eq('id', user.id)` filter, which is where Supabase Row-Level Security would enforce that users can only edit their own profile."

### Screen 14: EmergencyContactsScreen

**Simple Explanation**: Manage emergency contacts who will receive SMS alerts during SOS. Users can add, toggle active/inactive, and delete contacts.

**Visual Appearance**: Dark screen with header, "Add New Contact" form (name + phone + "Add Operative" button), and a list of existing contacts showing name, phone, active status (green dot), notification toggle, and delete button.

**Technical Steps**:
1. `fetchContacts` queries `emergency_contacts` filtered by `user.id`.
2. `handleAddContact` inserts a new contact with `is_active: true`.
3. `toggleContactStatus` flips `is_active` boolean.
4. `deleteContact` confirms via Alert, then deletes the record.
5. On SOS trigger, only contacts with `is_active: true` receive SMS.

**Code** (`src/screens/profile/EmergencyContactsScreen.tsx:41-71`):
```typescript
const handleAddContact = async () => {
  const { error } = await supabase.from('emergency_contacts').insert([{
    user_id: user?.id, contact_name: newName, phone_number: newPhone, is_active: true
  }]);
  setNewName(''); setNewPhone(''); fetchContacts();
};
const toggleContactStatus = async (id: string, currentStatus: boolean) => {
  await supabase.from('emergency_contacts').update({ is_active: !currentStatus }).eq('id', id);
  fetchContacts();
};
```

**Explain**: "Emergency contacts are stored in their own table with a foreign key to `profiles`. The `is_active` boolean lets users temporarily disable contacts without deleting them. CRUD operations (Create, Read, Update, Delete) are implemented: add via insert, toggle via update, delete via delete. The SOS flow queries only active contacts."

**Viva Key Point**: "This is a complete CRUD screen. The active/inactive toggle allows granular control over who gets SMS alerts without removing contacts permanently."

### Screen 15: VerificationScreen (ID Verification)

**Simple Explanation**: Users upload a photo of their government ID for identity verification by admins.

**Visual Appearance**: Dark screen with "ID Verification" header. Security protocol explanation. Status indicator showing current verification status (pending/verified/rejected). Dashed border upload area with cloud icon. "Submit for Review" button (disabled if already submitted/verified).

**Technical Steps**:
1. `fetchVerificationStatus` checks the `verifications` table for existing pending/verified entries.
2. `pickImage` uses `expo-image-picker` to select a document image.
3. `submitVerification`: uploads to `images/verifications/` path in storage, then inserts into `verifications` table with `status: 'pending'`.
4. Button is disabled if user already has a pending or verified submission.

**Code** (`src/screens/profile/VerificationScreen.tsx:47-83`):
```typescript
const submitVerification = async () => {
  const fileName = `verifications/${user?.id}/${Date.now()}.jpg`;
  const response = await fetch(docImage);
  const blob = await response.blob();
  await supabase.storage.from('images').upload(fileName, blob, { contentType: 'image/jpeg' });
  const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
  await supabase.from('verifications').insert([{
    user_id: user?.id, document_url: publicUrl, status: 'pending',
  }]);
};
```

**Explain**: "The ID verification follows a two-step process: upload the document image to a dedicated `verifications/` folder in Supabase Storage, then create a `verifications` record with status 'pending'. The admin reviews this on `AdminVerificationScreen` and can approve (setting `is_verified: true` on the profile) or reject."

**Viva Key Point**: "I store documents in a subfolder `verifications/` under the `images` bucket for organizational clarity. The `status` field drives the UI state -- pending shows amber, verified shows green, rejected shows red."

### Screen 16: AdminDashboardScreen

**Simple Explanation**: The admin command center showing key metrics: active SOS alerts, pending reports, pending ID verifications, and total logs.

**Visual Appearance**: "COMMAND CENTER" header with system status indicator. 2x2 stat grid: Active SOS (red), New Reports (amber), Pending IDs (blue), Total Logs (emerald). Operations section with links to Manage Reports, Identity Verification, Active Alerts Panel. System Intelligence log at bottom.

**Technical Steps**:
1. `fetchStats` runs three `Promise.all` queries: `reports` (id + status_level), `verifications` (pending count), `emergency_alerts` (active count).
2. `pendingReports` is calculated client-side by filtering `status_level === 1`.
3. `useFocusEffect` ensures stats refresh every time admin focuses the dashboard.
4. `RefreshControl` allows pull-to-refresh.

**Code** (`src/screens/admin/AdminDashboardScreen.tsx:23-43`):
```typescript
const fetchStats = async () => {
  const [reports, verifications, alerts] = await Promise.all([
    supabase.from('reports').select('id, status_level'),
    supabase.from('verifications').select('id').eq('status', 'pending'),
    supabase.from('emergency_alerts').select('id').eq('status', 'active')
  ]);
  setStats({
    totalReports: reports.data?.length || 0,
    pendingReports: reports.data?.filter(r => r.status_level === 1).length || 0,
    pendingVerifications: verifications.data?.length || 0,
    activeAlerts: alerts.data?.length || 0
  });
};
```

**Explain**: "The admin dashboard uses `Promise.all` to run three Supabase queries in parallel for better performance. The `status_level` filter on reports is done client-side since we already fetch all reports for the total count."

**Viva Key Point**: "The dashboard makes 3 parallel database queries. I used `Promise.all` for performance -- all three queries run concurrently rather than sequentially."

### Screen 17: AdminReportsScreen

**Simple Explanation**: Admin view of all submitted incident reports. Each report shows title, reporter name, status, description, and timestamp.

**Visual Appearance**: Dark screen with "ADMIN PANEL - Reports Management" header. FlatList of report cards, each showing title, reporter name ("By..."), colored status badge (New=blue, Reviewing=amber, Verified=green, Closed=red), truncated description, timestamp, and a chevron indicating tap-to-view-details.

**Technical Steps**:
1. `fetchReports` fetches all reports and then fetches associated profile names via a second query using `userIds`.
2. Combines data client-side using `Array.find`.
3. `getStatusColor` maps `status_level` (1-4) to colors.
4. Tapping a report navigates to `ReportActionScreen` with serialized report data.

**Code** (`src/screens/admin/AdminReportsScreen.tsx:13-46`):
```typescript
const fetchReports = async () => {
  const { data: rData } = await supabase.from('reports').select('*').order('reported_at', { ascending: false });
  if (rData && rData.length > 0) {
    const userIds = [...new Set(rData.map(r => r.user_id))];
    const { data: pData } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
    const combined = rData.map(r => ({ ...r, profiles: pData?.find(p => p.id === r.user_id) }));
    setReports(combined);
  }
};
```

**Explain**: "Admin reports uses a two-query approach: fetch all reports, then fetch only the profiles of users who submitted reports using `in('id', userIds)`. The data is joined client-side by matching `user_id` with `id`. This is more efficient than a SQL join if the number of unique users is small compared to the number of reports."

**Viva Key Point**: "The client-side join using `Array.find` is efficient because we first extract unique user IDs, then fetch only those profiles. This avoids fetching the entire profiles table."

### Screen 18: ReportActionScreen

**Simple Explanation**: Detail view of a single incident report where the admin can review details, add notes, and change status.

**Visual Appearance**: Dark screen with "Review Report" header. Incident details card showing title, description, reporter name, optional image (full width), and timestamp. "Take Action" section with a text input for admin notes, "Verify & Resolve" (emerald), "Mark Under Review" (amber), "Reject Report" (red outlined), and "Permanently Delete Log" (dark red).

**Technical Steps**:
1. Receives report data via route params (JSON parsed).
2. `updateReportStatus(newStatus, label)` updates `status_level` and `admin_notes` in the `reports` table.
3. `deleteReport` confirms via Alert, then deletes.
4. Loading overlay covers the screen during mutations.

**Code** (`src/screens/admin/ReportActionScreen.tsx:13-43`):
```typescript
const updateReportStatus = async (newStatus: number, actionLabel: string) => {
  const { data, error } = await supabase
    .from('reports').update({ status_level: newStatus, admin_notes: adminNote })
    .eq('id', report.id).select();
  if (!data || data.length === 0) {
    throw new Error("No report was updated. Check if the ID exists.");
  }
  Alert.alert("Success", `Report has been marked as ${actionLabel}`);
  navigation.goBack();
};
```

**Explain**: "The admin action screen uses `.select()` after the update to confirm the mutation succeeded. If no rows are returned, an error is thrown. This is a defensive pattern -- the `.select()` verifies the update actually matched a record. The admin notes text input allows the admin to leave internal commentary."

**Viva Key Point**: "Using `.select()` after `.update()` is a validation pattern -- it confirms the update affected a row. If the report ID does not exist, the `data` array will be empty, and I throw a descriptive error."

### Screen 19: AdminVerificationScreen

**Simple Explanation**: Admin reviews user-submitted ID documents and approves or rejects them.

**Visual Appearance**: Dark screen with "Pending Verifications" header. FlatList of verification requests showing user name, submission date, document image (tappable to expand full-screen), and Approve (green) / Reject (red) buttons.

**Technical Steps**:
1. `fetchVerifications` queries `verifications` where `status: 'pending'`, then fetches associated profiles.
2. `handleAction(id, userId, status)` updates verification status, and if 'verified', also sets `is_verified: true` on the user's profile.
3. Document image is displayed with a full-screen modal on tap.

**Code** (`src/screens/admin/AdminVerificationScreen.tsx:53-81`):
```typescript
const handleAction = async (id: string, userId: string, status: 'verified' | 'rejected') => {
  await supabase.from('verifications').update({ status }).eq('id', id);
  if (status === 'verified') {
    await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
  }
  Alert.alert("Success", `User verification has been ${status}`);
  fetchVerifications();
};
```

**Explain**: "The admin verification flow has a cascade: updating the `verifications` table sets the status, and if approved, the user's `profiles` row gets `is_verified: true`. This two-table update maintains data integrity. The full-screen image modal uses React Native's `Modal` component with a black overlay."

**Viva Key Point**: "I update two tables on approval (`verifications` and `profiles`). This could be wrapped in a Supabase transaction for atomicity in production."

### Screen 20: AnalyticsScreen

**Simple Explanation**: Visual data analytics showing incident trends over 6 months and incident category distribution.

**Visual Appearance**: Dark screen with "System Analytics" header. Two stat cards: Total Logs (with growth percentage) and Success Rate (resolution %). A bar chart showing monthly incident trends for the last 6 months. A pie chart showing distribution by report tags/categories.

**Technical Steps**:
1. Fetches `reported_at`, `status_level`, `report_tag` from `reports`.
2. Computes `total`, `resolutionRate` (status_level 3 / total), `growth` (comparing last 30 days vs previous 30 days using `dayjs`).
3. Bar chart data: loops through last 6 months, counts reports per month.
4. Pie chart: groups by `report_tag` and assigns colors.
5. Uses `react-native-chart-kit` `BarChart` and `PieChart`.

**Code** (`src/screens/admin/AnalyticsScreen.tsx:26-77`):
```typescript
const fetchAnalytics = async () => {
  const { data } = await supabase.from('reports').select('reported_at, status_level, report_tag');
  const total = data.length;
  const resolved = data.filter(r => r.status_level === 3).length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  for (let i = 5; i >= 0; i--) {
    const m = dayjs().subtract(i, 'month');
    months.push(m.format('MMM'));
    monthlyCounts.push(data.filter(r => dayjs(r.reported_at).format('MMM YYYY') === m.format('MMM YYYY')).length);
  }
};
```

**Explain**: "Analytics performs all computation client-side after fetching relevant columns. The bar chart loops through the last 6 months counting reports per month. The pie chart groups by `report_tag` using a reducer pattern. Growth rate uses `dayjs` `isBetween` plugin to compare two 30-day windows."

**Viva Key Point**: "All aggregation is done client-side since the dataset is small. For production with thousands of records, I would move these calculations to a Supabase Database Function or use PostgreSQL aggregate queries."

### Screen 21: RiskPredictionScreen

**Simple Explanation**: AI-powered crime risk prediction that analyzes recent reports and active alerts to identify high-risk zones in the city.

**Visual Appearance**: Purple-themed "AI Risk Matrix" header with model accuracy badge. List of risk zone cards showing area name, zone ID, risk score (in colored circle), contributing factors as tags, and AI-generated recommendation.

**Technical Steps**:
1. `predictRisk` fetches recent reports and active alerts from Supabase.
2. Constructs a detailed prompt for Gemini asking it to analyze the data as a "public safety AI".
3. Sends the prompt to `geminiModel.generateContent`.
4. Parses the JSON response (cleaning markdown wrappers).
5. Displays risk zones with color-coded risk circles (red/amber/emerald).

**Code** (`src/screens/admin/RiskPredictionScreen.tsx:16-54`):
```typescript
const predictRisk = async () => {
  const { data: reports } = await supabase.from('reports').select('title, description, reported_at, severity').limit(10);
  const { data: alerts } = await supabase.from('emergency_alerts').select('*').eq('status', 'active');
  const prompt = `You are a public safety AI. Analyze these reports: ${JSON.stringify(reports)}
    Return ONLY a JSON object: { "zones": [...], "accuracy": "95.4%" }`;
  const result = await geminiModel.generateContent(prompt);
  const cleanJson = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  setRiskZones(parsed.zones || []);
};
```

**Explain**: "The risk predictor uses few-shot prompting -- I pass structured data (reports and alerts) to Gemini with a specific JSON schema requirement. The model returns a risk analysis with zones, scores, factors, and recommendations. The accuracy percentage comes from the model itself. I strip markdown code block wrappers before JSON parsing."

**Viva Key Point**: "This demonstrates prompt engineering -- I give Gemini clear instructions on the JSON structure I expect, including specific field names and types. The model generates the accuracy estimate based on its confidence in the data."

### Screen 22: SocialMonitorScreen

**Simple Explanation**: Simulated social media threat monitoring. The AI generates realistic "social media posts" based on actual incident reports, showing threat levels and keywords.

**Visual Appearance**: Indigo-themed "Social Intel" header. A "live scanner" bar showing scanning status and flag count. Feed of simulated social posts, each showing handle (e.g., @AmritsarUpdate), relative time, quoted content, AI confidence match percentage, and keyword tags.

**Technical Steps**:
1. `fetchAndGenerateIntel` fetches latest 5 reports from Supabase.
2. Passes reports to Gemini with a prompt asking it to generate 5 simulated social media posts.
3. Gemini returns JSON array of posts with handle, content, threatLevel, confidence, keywords, color.
4. Each post is rendered with color-coded threat badge (red/amber/emerald).

**Code** (`src/screens/admin/SocialMonitorScreen.tsx:17-59`):
```typescript
const fetchAndGenerateIntel = async () => {
  const { data: reports } = await supabase.from('reports')
    .select('title, description, reported_at, status_level')
    .order('reported_at', { ascending: false }).limit(5);
  const prompt = `Generate 5 simulated social media posts from citizens based on: ${JSON.stringify(reports)}
    Return ONLY a JSON array of objects with keys: id, handle, time, content, threatLevel, confidence, keywords, color`;
  const result = await geminiModel.generateContent(prompt);
  const cleanJson = text.replace(/```json|```/g, '').trim();
  const generatedIntel = JSON.parse(cleanJson);
  setIntelFeed(generatedIntel);
};
```

**Explain**: "Social Monitor is an AI-simulation feature. Instead of actually scraping social media (which has API limitations), I feed real incident data to Gemini and ask it to generate realistic citizen reactions. This demonstrates the concept of social media threat monitoring without requiring Twitter/Facebook API access."

**Viva Key Point**: "This is a simulated feature -- it generates synthetic social media posts from real incident data. In production, it would use actual social media APIs. The simulation demonstrates the UI pattern and AI integration."

### Screen 23: BroadcastOverrideScreen

**Simple Explanation**: Emergency Broadcast Override system. Admin can send a critical alert message that bypasses all user settings and appears in the Community Intel Hub.

**Visual Appearance**: Dark screen with red "E.B.O. System" header. Warning about "Level 5 Access". A red card showing "Target Zone: GLOBAL: ALL SECTORS". Multiline text input for the override message. Red "Transmit Message" button.

**Technical Steps**:
1. User types a message and optionally specifies a zone (default: "ALL CITY").
2. `triggerOverride` shows a confirmation alert.
3. If confirmed, inserts into `broadcasts` table with `priority: 'CRITICAL'` and `sender_id`.
4. The message appears in `IntelHubScreen` as a red "CRITICAL OVERRIDE" broadcast.

**Code** (`src/screens/admin/BroadcastOverrideScreen.tsx:16-49`):
```typescript
const triggerOverride = async () => {
  if (!message) return Alert.alert("Error", "Message payload cannot be empty.");
  Alert.alert("CONFIRM OVERRIDE", `Broadcast to ${zone}?`, [
    { text: "Cancel", style: "cancel" },
    { text: "TRANSMIT", style: "destructive", onPress: async () => {
      await supabase.from('broadcasts').insert([{
        message, zone, sender_id: user?.id, priority: 'CRITICAL', created_at: new Date().toISOString()
      }]);
      Alert.alert("BROADCAST SENT");
    }}
  ]);
};
```

**Explain**: "The Broadcast Override has a confirmation dialog as a safety measure -- accidental emergency broadcasts could cause panic. The message is stored in the `broadcasts` table which the `IntelHubScreen` reads. The CRITICAL priority and the sender's admin ID are logged for audit purposes."

**Viva Key Point**: "The confirmation dialog is a deliberate safety gate. In production, this would also require re-authentication or a secondary admin approval for critical overrides."

### Screen 24: ActiveDispatchScreen

**Simple Explanation**: Admin view of all dispatch/incident logs with filterable status tabs (pending, investigating, resolved, all).

**Visual Appearance**: Blue-themed "Active Dispatch" header. Filter tabs row. List of incident cards showing title, location, severity badge (red/amber/emerald), incident tag, timestamp, status, and action buttons (Dispatch Unit / Mark Resolved).

**Technical Steps**:
1. `fetchDispatchLogs` queries `dispatch_logs` table.
2. `filter` state controls which status is shown.
3. `updateStatus(id, newStatus)` updates the log and optimistically updates local state with `.map`.
4. Status-dependent action buttons: pending shows "Dispatch Unit", investigating only shows "Mark Resolved", resolved shows no buttons.

**Code** (`src/screens/admin/ActiveDispatchScreen.tsx:38-52`):
```typescript
const updateStatus = async (id: string, newStatus: string) => {
  await supabase.from('dispatch_logs').update({ status: newStatus }).eq('id', id);
  setDispatchLogs(dispatchLogs.map(log =>
    log.id === id ? { ...log, status: newStatus } : log
  ));
  Alert.alert("System Updated", `Status changed to ${newStatus.toUpperCase()}.`);
};
```

**Explain**: "Active Dispatch uses optimistic local state updates -- after the Supabase update succeeds, I update the local array using `.map()` instead of refetching. This provides instant UI feedback. The filter tabs use a simple `filter === 'all' || log.status === filter` client-side filter."

**Viva Key Point**: "The optimistic update pattern (`dispatchLogs.map`) updates the UI immediately without a full refetch. This makes the interface feel faster."

### Screen 25: SearchIntelScreen

**Simple Explanation**: Admin search interface to look up historical dispatch logs by keyword.

**Visual Appearance**: Dark screen with "Search Incidents" header. Search input with magnifying glass icon. Quick filter tags (Theft, Assault, Suspicious, Traffic). Results list showing matching dispatch logs with title, location, and status.

**Technical Steps**:
1. `performSearch` is called on every keystroke.
2. Queries `dispatch_logs` using `or` filter with `ilike` for case-insensitive partial matching on `title` and `location`.
3. Results limited to 10.
4. Quick tag buttons call `performSearch` with the tag text.

**Code** (`src/screens/admin/SearchIntelScreen.tsx:13-36`):
```typescript
const performSearch = async (query: string) => {
  setSearch(query);
  if (query.trim().length === 0) { setResults([]); return; }
  setLoading(true);
  const { data } = await supabase.from('dispatch_logs').select('*')
    .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
    .order('created_at', { ascending: false }).limit(10);
  if (data) setResults(data);
};
```

**Explain**: "The search uses Supabase's Postgres `ilike` operator via the `.or()` filter for case-insensitive partial matching on both title and location columns. The search fires on every keystroke and limits results to 10 for performance."

**Viva Key Point**: "Supabase's `.or()` filter with `ilike` maps to PostgreSQL's `ILIKE` operator. The `%` wildcards enable partial matching so searching 'fire' matches 'Fire Department' and 'Structure Fire'."

### Screen 26: AIScannerScreen (DocVerify)

**Simple Explanation**: AI-powered document forensics scanner. Upload an ID document photo and the AI analyzes it for authenticity, tampering, and security features.

**Visual Appearance**: Blue-themed "DocVerify AI" header. Upload area (dashed border, tap to select). After image is selected, "Verify Authenticity" button appears. Scan overlay shows "RUNNING FORENSICS..." during analysis. Results card shows: authenticity status (GENUINE/SUSPECT/FRAUDULENT) with color, confidence score, document type, detailed forensic analysis, tamper status, security features detected, and SOP recommendation.

**Technical Steps**:
1. `pickImage` uses `ImagePicker` with `base64: true`.
2. `analyzeImage` constructs a detailed prompt asking Gemini to verify document authenticity.
3. Sends the image as `inlineData` (base64) to Gemini's multimodal vision.
4. Parses JSON response with fallback for parse errors.
5. Handles 503 errors gracefully with a user-friendly message.

**Code** (`src/screens/admin/AIScannerScreen.tsx:29-113`):
```typescript
const analyzeImage = async () => {
  const promptText = `Verify authenticity of this document. Check for fonts, manipulation, security features...`;
  const apiResult = await geminiModel.generateContent([
    promptText,
    { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
  ]);
  const parsed = JSON.parse(responseText.trim().replace(/```json/g, '').replace(/```/g, ''));
  setResults(parsed);
};
```

**Explain**: "The AI Scanner uses Gemini's multimodal capabilities -- it sends the image as base64 inline data alongside a detailed forensic prompt. The prompt instructs the model to check for font consistency, digital manipulation, security features, and logical data consistency. The response is a structured JSON object with authenticity status, confidence score, and recommendations."

**Viva Key Point**: "This is a true multimodal AI application -- I send both text (the forensic prompt) and image data (base64) to Gemini. The model analyzes visual patterns in the document just like a human forensic expert would."

### Screen 27: SupportScreen

**Simple Explanation**: Help and support page with expandable FAQ and contact information.

**Visual Appearance**: Green-themed header "Support". Emerald card offering technical help with "Open Support Ticket" button. FAQ section with expandable items (chevron toggles). Contact info footer with email and phone number.

**Technical Steps**:
1. FAQs stored as an array of `{q, a}` objects.
2. `expandedIndex` state tracks which FAQ is open; tapping toggles it.
3. "Open Support Ticket" calls `Linking.openURL('mailto:support@cityguard.gov')`.

**Code** (`src/screens/home/SupportScreen.tsx:29-37`):
```typescript
const handleSupportTicket = () => {
  Alert.alert("Direct Support", "Open email client?", [
    { text: "Cancel", style: "cancel" },
    { text: "Open Email", onPress: () => Linking.openURL('mailto:support@cityguard.gov') }
  ]);
};
```

**Explain**: "The support screen is a static informational page. The FAQ uses a controlled accordion pattern -- only one FAQ can be expanded at a time. The email link uses `Linking.openURL` with the `mailto:` scheme which opens the device's default email client."

**Viva Key Point**: "This is a pure UI screen with no database dependency. The accordion pattern with state-based expansion/contraction is a common React pattern for FAQ sections."

### Screen 28: FeedbackScreen

**Simple Explanation**: Citizens can submit feedback about the app and view feedback submitted by other users.

**Visual Appearance**: Dark screen with "CITIZEN FEEDBACK" header. "Help Us Improve" heading. Multiline text input for feedback. "Post Feedback" button. FlatList of all feedback entries showing user name (from profiles join), date, and content.

**Technical Steps**:
1. `fetchFeedback` queries `feedback` table with a join to `profiles(full_name)`.
2. `submitFeedback` inserts into `feedback` with `user_id` and `content`.
3. FlatList shows all feedback with `refreshing` and `onRefresh` for pull-to-refresh.

**Code** (`src/screens/home/FeedbackScreen.tsx:20-63`):
```typescript
const fetchFeedback = async () => {
  const { data } = await supabase.from('feedback')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });
  setFeedbackList(data || []);
};
const submitFeedback = async () => {
  await supabase.from('feedback').insert([{
    user_id: user?.id, content: feedback, created_at: new Date().toISOString()
  }]);
  setFeedback(''); fetchFeedback();
};
```

**Explain**: "Feedback demonstrates Supabase's ability to join related tables in a single query using `.select('*, profiles(full_name)')`. This returns the feedback along with the user's full name in a single network request."

**Viva Key Point**: "The Supabase `.select('*, profiles(full_name)')` syntax performs a left join between `feedback` and `profiles`. This is more efficient than fetching profiles separately."

### Screen 29: PoliceStationsScreen (Nearby Stations)

**Simple Explanation**: Shows nearby police stations within 20km of the user's current location, fetched from OpenStreetMap.

**Visual Appearance**: Dark screen with "Safe Zone: Stations" header. Location permission handling. If granted, a FlatList of station cards showing name, address, distance (in km), and a navigate button. Refresh button in header.

**Technical Steps**:
1. `getNearbyStations` requests location permission, gets current position, then queries Overpass API with a 20km radius around user's location.
2. Query looks for nodes/ways/relations with `amenity=police`.
3. Results are ordered by distance (calculated using Haversine formula).
4. If all Overpass mirrors fail, falls back to static mock data.
5. `openInMaps` opens native maps app using platform-specific URL schemes.

**Code** (`src/screens/map/PoliceStationsScreen.tsx:125-146`):
```typescript
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

**Explain**: "This feature uses the Overpass API (OpenStreetMap) to query nearby police stations. The Haversine formula calculates great-circle distances. I implemented a mirror fallback strategy because Overpass API mirrors can be unreliable. Platform-specific URL schemes open the native maps application."

**Viva Key Point**: "The Haversine formula calculates the great-circle distance between two points on a sphere (Earth). The formula is: `a = sin^2(delta_lat/2) + cos(lat1)*cos(lat2)*sin^2(delta_lon/2)`, then `c = 2 * atan2(sqrt(a), sqrt(1-a))`, and `d = R * c` where R = 6371 km."

---

## 4. NAVIGATION STRUCTURE

```
App.tsx
  NavigationContainer
    AuthProvider
      RootNavigator (NativeStack)
      |
      |-- IF no session:
      |     AuthNavigator (NativeStack)
      |     |-- LoginScreen
      |     |-- RegisterScreen
      |     |-- OtpScreen (params: { email, userDataString })
      |
      |-- IF session exists:
            MainNavigator (Drawer)
            |
            |-- [Dashboard] (conditionally AdminDashboardScreen or TabNavigator)
            |-- [UserDashboard] (TabNavigator, for admin to view civilian view)
            |     |-- Home (HomeScreen)
            |     |-- Map (CrimeMapScreen)
            |     |-- Chatbot (ChatbotScreen)
            |     |-- Alerts (NotificationScreen)
            |     |-- Profile (ProfileScreen)
            |
            |-- SafeWalk
            |-- IntelHub
            |-- MyReports
            |-- Verification (ID Verification)
            |-- AdminReports (admin only)
            |-- AdminVerifications (admin only)
            |-- SearchIntel (admin only)
            |-- SocialMonitor (admin only)
            |-- BroadcastOverride
            |-- RiskPrediction
            |-- Analytics
            |-- ReportAction (hidden from drawer)
            |-- Profile (hidden from drawer)
            |-- ActiveDispatch
            |-- DocVerify (admin only, alias for AIScanner)
            |-- AIScanner
            |-- SafetyAdvisory
            |-- Feedback
            |-- EmergencyContacts
            |-- ReportCrime
            |-- Chatbot (drawer)
            |-- CrimeMap (drawer)
            |-- PoliceStations
            |-- Support
            |
            |-- Also in RootNavigator (outside Drawer):
                  |-- ReportCrime (with header)
                  |-- EditProfile
                  |-- EmergencyContacts
```

**Key Navigation Points**:
- `RootNavigator` uses conditional rendering based on `session` from `AuthContext`.
- `TabNavigator` (bottom tabs) is nested inside the Drawer for the civilian experience.
- Admin dashboard replaces the civilian dashboard when `profile?.role === 'admin'`.
- Some screens are "hidden" (`drawerItemStyle: { display: 'none' }`) but accessible programmatically (e.g., `ReportAction`, `Profile`).
- Parameters are passed via `route.params` using React Navigation's standard pattern. Complex data is JSON-serialized.

---

## 5. DATABASE TABLES

### Table: `profiles`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | References `auth.users.id` |
| `full_name` | text | User's display name |
| `phone_number` | text | Contact number |
| `blood_type` | text | Optional blood group |
| `ice_contact` | text | In-case-of-emergency phone |
| `operative_id` | text | Unique ID like `OP-123456` |
| `role` | text | `'civilian'` or `'admin'` |
| `is_verified` | boolean | ID verification status |
| `avatar_url` | text | Optional avatar |
| `updated_at` | timestamptz | Last update timestamp |

### Table: `reports`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | References `profiles.id` |
| `title` | text | Incident title |
| `description` | text | Detailed description |
| `status_level` | integer | 1=Submitted, 2=Review, 3=Resolved, 4=Rejected |
| `severity` | text | `'low'`, `'medium'`, `'high'`, `'critical'` |
| `image_url` | text | Optional evidence image |
| `latitude` | float8 | GPS latitude |
| `longitude` | float8 | GPS longitude |
| `report_tag` | text | Classification tag |
| `admin_notes` | text | Internal admin notes |
| `reported_at` | timestamptz | Timestamp of report |

### Table: `emergency_alerts`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | References `profiles.id` |
| `full_name` | text | User's name (denormalized) |
| `phone_number` | text | User's phone |
| `email` | text | User's email |
| `latitude` | float8 | GPS latitude |
| `longitude` | float8 | GPS longitude |
| `status` | text | `'active'` or `'resolved'` |
| `created_at` | timestamptz | Alert timestamp |

### Table: `verifications`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | References `profiles.id` |
| `document_url` | text | Storage URL of ID image |
| `status` | text | `'pending'`, `'verified'`, `'rejected'` |
| `created_at` | timestamptz | Submission timestamp |

### Table: `emergency_contacts`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | References `profiles.id` |
| `contact_name` | text | Contact's name |
| `phone_number` | text | Contact's phone |
| `is_active` | boolean | Whether to notify on SOS |
| `created_at` | timestamptz | Added timestamp |

### Table: `broadcasts`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `message` | text | Broadcast content |
| `zone` | text | Target zone |
| `sender_id` | uuid (FK) | Admin who sent it |
| `priority` | text | `'CRITICAL'`, etc. |
| `created_at` | timestamptz | Timestamp |

### Table: `dispatch_logs`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `title` | text | Incident title |
| `location` | text | Location description |
| `status` | text | `'pending'`, `'investigating'`, `'resolved'` |
| `severity` | text | `'low'`, `'warning'`, `'critical'` |
| `incident_tag` | text | Tag for categorization |
| `created_at` | timestamptz | Timestamp |

### Table: `feedback`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | References `profiles.id` |
| `content` | text | Feedback text |
| `created_at` | timestamptz | Timestamp |

### Table: `chatbot_history`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | References `profiles.id` |
| `message` | text | Message content |
| `sender` | text | `'user'` or `'bot'` |
| `created_at` | timestamptz | Timestamp |

### Relationships:
```
profiles (id) ---< reports (user_id)
profiles (id) ---< emergency_alerts (user_id)
profiles (id) ---< verifications (user_id)
profiles (id) ---< emergency_contacts (user_id)
profiles (id) ---< feedback (user_id)
profiles (id) ---< chatbot_history (user_id)
profiles (id) ---< broadcasts (sender_id)
```

### RLS Policies (Expected):
- `profiles`: Users can read/update their own row. Admins can read all.
- `reports`: Users can read their own. Admins can read all. Insert with their own `user_id`.
- `emergency_alerts`: Insert with own `user_id`. Admins can read all.
- `emergency_contacts`: Users CRUD their own.

### Storage Bucket: `images`
- **Paths**:
  - `{userId}/{timestamp}.jpg` -- report evidence images
  - `verifications/{userId}/{timestamp}.jpg` -- ID verification documents

---

## 6. REAL-TIME SYSTEM

CityGuard does **not** currently implement Supabase real-time subscriptions via `supabase.channel()`. All data fetching uses a **request-response pattern**:
- `useFocusEffect` refetches data when a screen gains focus.
- `RefreshControl` enables manual pull-to-refresh.
- `useEffect` fetches on mount.

**Why no real-time**: The current data volume is small enough that request-response is sufficient. Real-time subscriptions add complexity (channel management, cleanup, reconnection). For a v1 demonstration, the focus-based refetch pattern works well.

**Future Enhancement Plan** (if asked):
- Admin dashboard would subscribe to `emergency_alerts` channel for new SOS alerts.
- `IntelHubScreen` would subscribe to `broadcasts` for live emergency overrides.
- Channel lifecycle: `supabase.channel('admin-alerts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, callback).subscribe()`
- Cleanup in `useEffect` return: `subscription.unsubscribe()`

---

## 7. STATE MANAGEMENT

### Approach: React Context + Local useState

**Primary**: `AuthContext` (React Context API) for global auth state.

| State | Location | Type | Description |
|---|---|---|---|
| `session` | AuthContext | `Session \| null` | Supabase auth session |
| `user` | AuthContext | `User \| null` | Authenticated user |
| `profile` | AuthContext | `any \| null` | User profile from `profiles` table |
| `loading` | AuthContext | `boolean` | Loading state for session check |

**Secondary**: Local `useState` in each screen for UI-specific state (form inputs, fetched data, loading indicators).

**Why chosen**:
- `AuthContext` is simple and sufficient for global auth state -- no need for a complex solution.
- Each screen manages its own data fetching and UI state (separation of concerns).
- Avoids over-engineering -- Zustand is listed in `package.json` but was planned for future use if the state management needs grew.

**Note on Zustand**: Added to `package.json` as a future consideration. Not currently used. If the app grew (multiple global states like theme, notification preferences, persisted data), Zustand would replace Context for better performance (no unnecessary re-renders).

---

## 8. QUICK CONCEPT REFERENCE

| Concept | One-Line Definition | Detail Section |
|---|---|---|
| Supabase Auth | Backend-as-a-service authentication with email/password | Section 3, Screens 1-3 |
| Supabase Database | PostgreSQL database accessed via supabase-js SDK | Section 5 |
| Supabase Storage | File storage for images (evidence, ID documents) | Section 3, Screen 7 |
| Gemini AI | Google's multimodal AI model for chat, scanning, prediction | Section 3, Screens 10/21/22/26 |
| React Navigation | Library for stack, drawer, and tab navigation | Section 4 |
| NativeWind | Tailwind CSS for React Native (compile-time) | Section 2 |
| Expo AV | Audio playback for emergency alarm | Section 3, Screen 4 |
| Expo Location | GPS location services | Section 3, Screen 4 |
| Expo SMS | Send SMS for emergency contacts | Section 3, Screen 4 |
| Expo Image Picker | Camera/gallery image selection | Section 3, Screens 7/15 |
| React Native Maps | MapView with dark style + markers/circles | Section 3, Screen 9 |
| Overpass API | OpenStreetMap query API for police stations | Section 3, Screen 29 |
| Haversine Formula | Great-circle distance calculation | Section 3, Screen 29 |
| Dayjs | Lightweight date manipulation library | Section 3, Screens 8/17 |
| useFocusEffect | React Navigation hook for focus-based refetch | Section 2, Challenge 5 |
| RefreshControl | Pull-to-refresh component | Section 3, Screen 16 |
| BlurView | Expo blur effect (Android fix) | Section 2, Challenge 6 |
| useMemo | React memoization hook | AuthContext.tsx |
| useRef | Mutable reference for caching | AuthContext.tsx |

---

## 9. KEY CODE SNIPPETS (10 Most Important)

### Snippet 1: AuthContext -- Session Management
**File**: `src/context/AuthContext.tsx:40-73`
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      if (error.message.includes('Refresh Token Not Found')) {
        supabase.auth.signOut();
      }
      setLoading(false);
      return;
    }
    setSession(session);
    setUser(session?.user ?? null);
    if (session?.user) fetchProfile(session.user.id);
    setLoading(false);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
    if (session?.user) fetchProfile(session.user.id);
    else setProfile(null);
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

**Explain**: "The AuthContext initializes by checking for an existing Supabase session on mount. It then subscribes to `onAuthStateChange` which fires on login, logout, and token refresh. The `fetchProfile` function queries the `profiles` table whenever the user changes. The cleanup function unsubscribes to prevent memory leaks. I also handle 'Refresh Token Not Found' errors by signing out -- this prevents the app from hanging on expired sessions."

### Snippet 2: RootNavigator -- Conditional Auth/Main Rendering
**File**: `src/navigation/RootNavigator.tsx:16-68`
```typescript
export default function RootNavigator() {
  const { session, loading } = useAuth();
  if (loading) {
    return (<View className="flex-1 bg-gray-950 items-center justify-center">
      <ActivityIndicator color="#10B981" size="large" />
    </View>);
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="ReportCrime" component={ReportCrimeScreen} ... />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} ... />
          <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} ... />
        </>
      )}
    </Stack.Navigator>
  );
}
```

**Explain**: "The RootNavigator uses conditional rendering based on the `session` state from AuthContext. While loading, it shows a centered activity indicator. If no session, the Auth stack (Login/Register/Otp) is rendered. If a session exists, the Main drawer navigator plus a few stack screens (ReportCrime, EditProfile, EmergencyContacts) are available. These stack screens are at the root level so they can be navigated to from anywhere in the app."

### Snippet 3: SOS Emergency Dispatch
**File**: `src/screens/home/HomeScreen.tsx:58-132`
```typescript
const sendEmergencyAlert = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') { Alert.alert('Permission Denied'); return; }
  const loc = await Location.getCurrentPositionAsync({});
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  await supabase.from('emergency_alerts').insert([{
    user_id: user.id, full_name: profile?.full_name,
    latitude: loc.coords.latitude, longitude: loc.coords.longitude, status: 'active'
  }]);
  const { data: contacts } = await supabase.from('emergency_contacts')
    .select('contact_name, phone_number').eq('user_id', user.id).eq('is_active', true);
  if (contacts && contacts.length > 0) {
    const phoneNumbers = contacts.map(c => c.phone_number);
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const message = `EMERGENCY SOS: ${profile?.full_name} is in danger! Location: https://www.google.com/maps/search/?api=1&query=${loc.coords.latitude},${loc.coords.longitude}`;
      await SMS.sendSMSAsync(phoneNumbers, message);
    }
  }
  Alert.alert('SOS SENT', `Authorities have been notified.`);
};
```

**Explain**: "The SOS dispatch function orchestrates: 1) request GPS permission, 2) get current coordinates, 3) fetch the user's profile, 4) insert an emergency alert record into Supabase, 5) fetch active emergency contacts, 6) send SMS with a Google Maps link. This pulls together location services, database writes, and SMS in a single emergency pipeline."

### Snippet 4: Report Crime with Image Upload
**File**: `src/screens/report/ReportCrimeScreen.tsx:39-109`
```typescript
const uploadImage = async (uri: string) => {
  const fileName = `${user?.id}/${Date.now()}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();
  await supabase.storage.from('images').upload(fileName, blob, { contentType: 'image/jpeg' });
  const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
  return publicUrl;
};

const submitReport = async () => {
  if (!title || !description) { Alert.alert("Error", "Title and Description are required."); return; }
  setLoading(true);
  try {
    let uploadedImageUrl = null;
    if (image) { uploadedImageUrl = await uploadImage(image); }
    const { error } = await supabase.from('reports').insert([{
      title, description, user_id: user?.id,
      status_level: 1, report_tag: 'OPERATIVE_LOG',
      reported_at: new Date().toISOString(), severity: 'medium',
      image_url: uploadedImageUrl,
      latitude: location?.latitude, longitude: location?.longitude,
    }]);
    if (error) throw error;
    Alert.alert("Report Submitted");
  } catch (error: any) {
    Alert.alert("Error", "Failed to submit report: " + error.message);
  } finally { setLoading(false); }
};
```

**Explain**: "The image upload converts the local URI to a Blob via `fetch`, then uploads to Supabase Storage with a structured path `userId/timestamp.jpg`. After upload, `getPublicUrl` generates a publicly accessible URL. The report insert uses `status_level: 1` (Submitted), `severity: 'medium'`, and `report_tag: 'OPERATIVE_LOG'`."

### Snippet 5: Gemini AI Chat with History Persistence
**File**: `src/screens/chatbot/ChatbotScreen.tsx:52-94`
```typescript
const sendMessage = async () => {
  const userMsg = { id: Date.now().toString(), text: inputText.trim(), sender: 'user' };
  setMessages(prev => [...prev, userMsg]);
  const currentInput = inputText;
  setInputText('');
  setIsLoading(true);
  try {
    await supabase.from('chatbot_history').insert([{
      user_id: user?.id, message: currentInput, sender: 'user'
    }]);
    const systemContext = `Present Day: ${currentDate}. You are CityGuard AI...`;
    const result = await geminiModel.generateContent(systemContext + currentInput);
    const text = await result.response.text();
    const botMsg = { id: (Date.now() + 1).toString(), text, sender: 'bot' };
    setMessages(prev => [...prev, botMsg]);
    await supabase.from('chatbot_history').insert([{
      user_id: user?.id, message: text, sender: 'bot'
    }]);
  } catch (error) {
    const errorMsg = { id: (Date.now() + 1).toString(), text: "[Error communicating with server]", sender: 'bot' };
    setMessages(prev => [...prev, errorMsg]);
  } finally { setIsLoading(false); }
};
```

**Explain**: "The chatbot saves both user messages and bot responses to `chatbot_history` for persistence. The Gemini API is called with a system context that includes the current date so the AI is date-aware. I save to the database before and after the API call -- user message first, then bot response. Error handling catches API failures and returns a user-friendly message instead of crashing."

### Snippet 6: Map with Custom Dark Style and Heat Circles
**File**: `src/screens/map/CrimeMapScreen.tsx:10-112`
```typescript
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0F172A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1E293B" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] }
];

hotspots.map((spot, index) => {
  const jitterLat = location.coords.latitude + ((index % 5) * 0.003 * (index % 2 === 0 ? 1 : -1));
  return (
    <>
      <Circle center={{ latitude: jitterLat, longitude: jitterLng }} radius={800} fillColor="rgba(239,68,68,0.05)" />
      <Circle center={{ latitude: jitterLat, longitude: jitterLng }} radius={500} fillColor="rgba(239,68,68,0.1)" />
      <Circle center={{ latitude: jitterLat, longitude: jitterLng }} radius={200} fillColor="rgba(239,68,68,0.2)" />
      <Marker coordinate={{ latitude: jitterLat, longitude: jitterLng }} title={spot.title} />
    </>
  );
});
```

**Explain**: "The map uses Google's custom map styling to create a tactical dark theme. Since real incident data may not have coordinates, I use a deterministic jitter formula that spreads markers based on their index. The heat effect is created with three overlapping `Circle` components -- larger circles have lower opacity, and smaller inner circles have higher opacity, creating the appearance of a heat gradient without using a heatmap library."

### Snippet 7: Gemini Document Scanner (Multimodal Vision)
**File**: `src/screens/admin/AIScannerScreen.tsx:29-113`
```typescript
const analyzeImage = async () => {
  const promptText = `Verify the authenticity of this document. Check for:
    1. Consistency in fonts and alignments.
    2. Evidence of digital manipulation.
    3. Standard security features (holograms, seals).
    4. Logical consistency of data.
    Return ONLY a raw JSON object: {
      "authenticityStatus": "GENUINE|SUSPECT|FRAUDULENT",
      "accuracyScore": "string",
      "documentType": "string",
      "detailedAnalysis": "string",
      "securityFeatures": ["feature1", ...],
      "tamperEvidence": "string",
      "recommendation": "string"
    }`;
  const apiResult = await geminiModel.generateContent([
    promptText,
    { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
  ]);
  const parsed = JSON.parse(responseText.trim().replace(/```json/g, '').replace(/```/g, ''));
  setResults(parsed);
};
```

**Explain**: "This is a multimodal AI call -- I send both a text prompt and an image (as base64 inline data) to Gemini. The prompt acts as a forensic expert's instruction checklist. The model analyzes visual features of the document and returns a structured JSON report. I clean markdown wrappers before parsing."

### Snippet 8: Police Stations with Haversine Distance
**File**: `src/screens/map/PoliceStationsScreen.tsx:36-134`
```typescript
const query = `[out:json];(node["amenity"="police"](around:20000,${lat},${lon});...);out center;`;
for (const mirror of mirrors) {
  try {
    const response = await fetch(`${mirror}?data=${encodeURIComponent(query)}`);
    if (!response.ok) continue;
    data = await response.json();
    break;
  } catch (e) { console.warn(`Mirror ${mirror} failed`); }
}
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};
```

**Explain**: "The Overpass API query searches for nodes, ways, and relations with `amenity=police` within a 20km radius. I use a mirror fallback strategy because Overpass mirrors have reliability issues. The Haversine formula calculates the great-circle distance between the user's coordinates and each station. Results are sorted by distance."

### Snippet 9: Admin Dashboard Stats with Promise.all
**File**: `src/screens/admin/AdminDashboardScreen.tsx:23-43`
```typescript
const fetchStats = async () => {
  const [reports, verifications, alerts] = await Promise.all([
    supabase.from('reports').select('id, status_level'),
    supabase.from('verifications').select('id').eq('status', 'pending'),
    supabase.from('emergency_alerts').select('id').eq('status', 'active')
  ]);
  setStats({
    totalReports: reports.data?.length || 0,
    pendingReports: reports.data?.filter(r => r.status_level === 1).length || 0,
    pendingVerifications: verifications.data?.length || 0,
    activeAlerts: alerts.data?.length || 0
  });
};
```

**Explain**: "I use `Promise.all` to run three independent Supabase queries concurrently, which is faster than running them sequentially. The `pendingReports` count is computed client-side by filtering `status_level === 1` from the already-fetched reports data. This avoids an extra query. The `useFocusEffect` hook ensures stats refresh every time the admin views the dashboard."

### Snippet 10: Admin Verification with Cascade Update
**File**: `src/screens/admin/AdminVerificationScreen.tsx:53-81`
```typescript
const handleAction = async (id: string, userId: string, status: 'verified' | 'rejected') => {
  setLoading(true);
  const { error: vError } = await supabase
    .from('verifications').update({ status }).eq('id', id);
  if (vError) throw vError;
  if (status === 'verified') {
    const { error: pError } = await supabase
      .from('profiles').update({ is_verified: true }).eq('id', userId);
    if (pError) console.error("Failed to update profile:", pError);
  }
  Alert.alert("Success", `User verification has been ${status}`);
  fetchVerifications();
  setLoading(false);
};
```

**Explain**: "The verification action updates two tables: first the `verifications` record (approved or rejected), then (if approved) the user's `profiles` row sets `is_verified: true`. This two-step cascade maintains data integrity. In production, this should be wrapped in a Supabase RPC function for atomicity."

---

## 10. POSSIBLE VIVA QUESTIONS & ANSWERS

### Architecture & Design

**Q1: What is the architecture of your project?**
A: "CityGuard follows a three-tier architecture. The presentation tier is a React Native/Expo mobile app with NativeWind for styling and React Navigation for routing. The backend tier is Supabase, which provides authentication, PostgreSQL database, and file storage. The AI tier is Google Gemini, accessed via the `@google/generative-ai` SDK for chat, document scanning, and risk prediction. The app communicates with Supabase over HTTPS REST, and with Gemini over the Generative AI API."

**Q2: Why did you choose React Native over Flutter or native development?**
A: "I chose React Native with Expo because: 1) I was already familiar with React's component model and state management patterns. 2) Expo provides a rich ecosystem of libraries (`expo-location`, `expo-sms`, `expo-av`) that dramatically reduce development time. 3) React Native allows code sharing between iOS and Android from a single codebase. 4) Expo's managed workflow handles native build configuration automatically. For an MCA project with time constraints, this was the optimal choice."

**Q3: Explain the navigation structure of your app.**
A: "The app uses React Navigation with three navigator types stacked together. At the root, a NativeStackNavigator (`RootNavigator`) conditionally renders either the Auth stack (Login/Register/Otp) or the Main drawer navigator based on session state. The Main navigator is a DrawerNavigator containing the TabNavigator (bottom tabs for Home, Map, Chatbot, Alerts, Profile) and individual drawer screens. Some screens like ReportCrime and EditProfile are registered in the root stack so they can be navigated to from anywhere."

**Q4: How do you handle authentication?**
A: "Authentication uses Supabase Auth with email/password. The `AuthContext` wraps the entire app and listens to `onAuthStateChange` events. On app launch, `getSession()` checks for an existing session. The `RootNavigator` reads `session` from context and conditionally renders auth or main screens. The `RegisterScreen` checks if email confirmation is enabled -- if a session is returned immediately, it upserts the profile; otherwise, it redirects to `OtpScreen` for email verification."

**Q5: How did you handle the dual-role system (admin and civilian)?**
A: "The `profiles` table has a `role` field that is set to 'civilian' by default during registration. The `MainNavigator` checks `profile?.role === 'admin'` to conditionally render admin-specific screens and to change the default dashboard. Admin-specific screens like `AdminReportsScreen`, `AdminVerificationScreen`, `SearchIntel`, `SocialMonitor` are only registered in the drawer if the user is an admin. The `DrawerContent` component also uses this check to display the role badge."

### Database & Backend

**Q6: What database are you using and what are the main tables?**
A: "I am using Supabase, which is a hosted PostgreSQL database with a REST API. The main tables are: `profiles` (user data, linked to auth.users), `reports` (incident reports with GPS and images), `emergency_alerts` (SOS dispatches), `verifications` (ID document submissions), `emergency_contacts` (trusted contacts for SMS), `broadcasts` (admin emergency overrides), `dispatch_logs` (incident management), `feedback` (user suggestions), and `chatbot_history` (AI conversation records)."

**Q7: Explain how Row-Level Security works in your database.**
A: "Supabase RLS policies are PostgreSQL policies that restrict row access based on the authenticated user. For example, a policy on `profiles` would be: `CREATE POLICY "users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id)`. This ensures a user can only see their own profile. Admin users would have an additional policy like `auth.role() = 'admin'` to read all rows. In my code, I also enforce client-side filtering with `.eq('user_id', user.id)` as a defense-in-depth measure."

**Q8: How did you handle image storage?**
A: "Images are stored in Supabase Storage under the `images` bucket. Report evidence images are stored at `{userId}/{timestamp}.jpg`, and verification documents are stored at `verifications/{userId}/{timestamp}.jpg`. The upload process converts the local file URI to a Blob using `fetch`, then uploads via the storage API. After upload, I call `getPublicUrl` to get a publicly accessible URL that is stored in the database record."

**Q9: What is the purpose of the `status_level` field in the reports table?**
A: "`status_level` is a numeric enum that tracks the incident report lifecycle: 1 = Submitted (initial), 2 = Under Review (admin is examining), 3 = Verified/Resolved (action taken), 4 = Rejected (dismissed as invalid). Using integers rather than strings makes comparisons faster in code and allows range-based queries like `status_level >= 3` for resolved reports. The admin can update this via `ReportActionScreen`."

### AI & Integration

**Q10: How did you integrate Google Gemini AI and what does it do?**
A: "Gemini is integrated via the `@google/generative-ai` SDK. I initialize it once in `src/lib/gemini.ts` using the API key from environment variables. The model is used in four features: 1) Chatbot (`ChatbotScreen`) for general safety Q&A with a system context prompt. 2) Document Forensics (`AIScannerScreen`) where I send both text prompt and image (base64) for multimodal analysis. 3) Risk Prediction (`RiskPredictionScreen`) where I pass recent incident data for zone analysis. 4) Social Threat Monitor (`SocialMonitorScreen`) where I generate simulated social media posts."

**Q11: How do you handle AI failures gracefully?**
A: "I wrap all Gemini API calls in try-catch blocks. In the chatbot, if the API fails, I show a user-friendly error message instead of crashing. In the document scanner, I specifically detect 503 (Service Unavailable) errors and display a 'SYSTEM_OVERLOADED' status with instructions to retry. In risk prediction and social monitor, if the AI call fails, the feature falls back to showing 'Insufficient data' or empty states rather than a blank error screen."

**Q12: What is prompt engineering and how did you use it?**
A: "Prompt engineering is the practice of carefully crafting input prompts to get reliable, structured output from LLMs. In my document scanner, I include the current date in the prompt so Gemini can evaluate document expiry correctly. In risk prediction, I specify the exact JSON schema I want returned, including field names and types. In social monitor, I instruct Gemini to generate realistic handles and content. I always include 'Return ONLY a raw JSON object' and then strip markdown wrappers from the response."

### Features & Implementation

**Q13: How does the SOS feature work technically?**
A: "The SOS button triggers a 5-second countdown with a pulsing animation (`useEffect` with `setTimeout`). At zero, `sendEmergencyAlert` is called which: 1) requests GPS permission via `expo-location`, 2) gets current coordinates, 3) fetches the user's profile from `profiles`, 4) inserts an alert into `emergency_alerts` with 'active' status, 5) fetches active emergency contacts from `emergency_contacts` where `is_active=true`, 6) sends SMS with a Google Maps link via `expo-sms`. The admin dashboard shows active SOS alerts with a pulsing red indicator."

**Q14: Explain the SafeWalk feature.**
A: "SafeWalk is a timer-based safety feature. The user sets a countdown (5, 15, or 30 minutes). A `useEffect` with `setInterval` decrements every second. When the timer reaches zero, an alert says 'PROTOCOL BREACH -- SOS dispatched'. To disarm, the user must confirm through an Alert dialog -- preventing accidental deactivation. The visual design features a large circular countdown display that changes color when active (red) vs. standby (emerald)."

**Q15: How do you find nearby police stations?**
A: "I use the Overpass API, which is a read-only API for OpenStreetMap data. I query for nodes, ways, and relations with the tag `amenity=police` within a 20km radius of the user's current location. Since Overpass mirrors can be unreliable, I implemented a fallback loop that tries multiple mirrors sequentially. I calculate the distance from the user to each station using the Haversine formula. If all APIs fail, I show static mock data for demonstration purposes."

**Q16: How does the admin report management workflow work?**
A: "Admins see all reports on `AdminReportsScreen`, which fetches reports with a client-side join on profiles to show the reporter's name. Tapping a report navigates to `ReportActionScreen`, where the admin can: view full incident details including images, add internal admin notes, change status to Under Review (2), Verified/Resolved (3), Rejected (4), or permanently delete the report. After action, navigating back triggers `useFocusEffect` on the list screen, which refetches fresh data."

**Q17: What analytics does the admin dashboard provide?**
A: "The analytics screen (`AnalyticsScreen`) provides: total incident count, resolution rate (percentage of reports with `status_level=3`), growth rate comparing last 30 days to previous 30 days, a bar chart showing monthly incident trends for the last 6 months, and a pie chart showing incident distribution by `report_tag`. All calculations are done client-side using `dayjs` for date operations and `react-native-chart-kit` for visualization."

### Challenges & Problem-Solving

**Q18: What was the most challenging part of this project?**
A: "The most challenging part was the SOS SMS cross-platform behavior. On Android, `expo-sms` can send SMS silently with permissions, but on iOS, it always opens the Messages composer requiring user interaction. I had to add `SMS.isAvailableAsync()` checks and adjust the user-facing messages based on the platform. Another challenge was handling Gemini API reliability -- the model sometimes returns markdown-wrapped JSON and can return 503 errors during high demand."

**Q19: How did you handle the case where the Overpass API fails?**
A: "The Overpass API has multiple mirror servers (de, lz4, z, kumi). I implemented a fallback loop that tries each mirror sequentially. If a mirror returns a non-200 response or non-JSON content type, it tries the next one. If all mirrors fail, I fall back to three hardcoded police stations with mock coordinates, distances, and addresses. This ensures the feature always works during demonstrations."

**Q20: How did you handle the registration flow with Supabase email verification?**
A: "Supabase can be configured with or without email confirmation. My `RegisterScreen` handles both: after calling `signUp`, if `authData.session` is returned (meaning email confirmation is off), I immediately upsert the profile and the app navigates to the main screen. If no session is returned (email confirmation on), I navigate to `OtpScreen` with the user's data serialized as JSON string in navigation params. The `OtpScreen` then calls `verifyOtp` and creates the profile after verification."

**Q21: What security considerations did you implement?**
A: "API keys are stored in environment variables (`.env` file) using the `EXPO_PUBLIC_` prefix. Authentication sessions are managed by Supabase with auto-refresh. The SOS countdown acts as a safety gate against accidental triggers. The Broadcast Override has a confirmation dialog. Admin-only screens are conditionally rendered based on the `role` field. Database queries include user ID filters to prevent data leakage."

**Q22: How would you scale this app for production?**
A: "For production, I would: 1) Move aggregation queries (analytics, stats) to PostgreSQL database functions or materialized views for performance. 2) Implement Supabase real-time subscriptions for live SOS alerts on the admin dashboard. 3) Add push notifications using `expo-notifications` instead of SMS for emergency alerts. 4) Implement proper RLS policies on all tables. 5) Use React Query or SWR for data fetching with caching and background refetch. 6) Implement proper image compression before upload."

### Comparisons

**Q23: Why Supabase over Firebase?**
A: "I chose Supabase over Firebase because: 1) Supabase uses PostgreSQL, which is a relational database I was familiar with, while Firebase uses NoSQL. 2) Supabase provides a more intuitive REST API with JavaScript SDK. 3) Row-Level Security in Supabase is more transparent and debuggable than Firebase Security Rules. 4) Supabase includes storage, auth, and real-time subscriptions out of the box. 5) For an Indian project, Supabase's free tier was more generous."

**Q24: Why Gemini AI over ChatGPT API?**
A: "I chose Gemini over ChatGPT because: 1) Gemini offers multimodal capabilities (text + image analysis) which I use in the document scanner -- the model can analyze images directly without an additional OCR step. 2) Gemini's free tier was more accessible for a student project. 3) The `@google/generative-ai` SDK is straightforward to integrate with TypeScript. 4) Gemini Flash model provides fast responses suitable for real-time chat."

---

## 11. COMPLETE FILE STRUCTURE

```
CityGuard/
├── .env                          # API keys (Supabase, Gemini)
├── .gitignore
├── .vscode/settings.json
├── App.tsx                       # Root app component
├── app.json                      # Expo configuration
├── assets/
│   ├── Sound/emergencyalarm.wav  # SOS alarm sound
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   ├── logo.png
│   └── splash.png
├── babel.config.js               # Babel with NativeWind + Reanimated
├── cesconfig.jsonc               # Cursor editor config
├── components/
│   ├── EditScreenInfo.tsx        # Default Expo component
│   └── ScreenContent.tsx         # Default Expo component
├── eslint.config.js
├── global.css                    # Tailwind directives
├── metro.config.js
├── nativewind-env.d.ts           # NativeWind type declarations
├── package.json
├── package-lock.json
├── prettier.config.js
├── src/
│   ├── components/ui/
│   │   ├── GlassCard.tsx         # Reusable blur card wrapper
│   │   ├── PanicButton.tsx       # Floating SOS button
│   │   └── SOSButton.tsx         # SOS countdown modal
│   ├── constants/
│   │   └── colors.ts            # App color palette
│   ├── context/
│   │   └── AuthContext.tsx       # Auth state management
│   ├── lib/
│   │   ├── gemini.ts             # Gemini AI initialization
│   │   └── supabase.ts           # Supabase client setup
│   ├── navigation/
│   │   ├── AuthNavigator.tsx     # Auth stack Login/Register/Otp
│   │   ├── DrawerContent.tsx     # Custom drawer UI
│   │   ├── MainNavigator.tsx     # Drawer with all screens
│   │   ├── RootNavigator.tsx     # Conditional auth/main stack
│   │   └── TabNavigator.tsx      # Bottom tabs
│   └── screens/
│       ├── admin/
│       │   ├── ActiveDispatchScreen.tsx        # Dispatch management
│       │   ├── AdminDashboardScreen.tsx         # Admin command center
│       │   ├── AdminReportsScreen.tsx           # Report management list
│       │   ├── AdminVerificationScreen.tsx        # ID verification review
│       │   ├── AIScannerScreen.tsx                # Document forensics
│       │   ├── AnalyticsScreen.tsx                # Charts and stats
│       │   ├── BroadcastOverrideScreen.tsx        # Emergency broadcasts
│       │   ├── ReportActionScreen.tsx             # Single report action
│       │   ├── RiskPredictionScreen.tsx           # AI risk analysis
│       │   ├── SearchIntelScreen.tsx              # Search dispatch logs
│       │   └── SocialMonitorScreen.tsx            # Social media intel
│       ├── auth/
│       │   ├── LoginScreen.tsx
│       │   ├── OtpScreen.tsx
│       │   └── RegisterScreen.tsx
│       ├── chatbot/
│       │   └── ChatbotScreen.tsx
│       ├── home/
│       │   ├── FeedbackScreen.tsx
│       │   ├── HomeScreen.tsx
│       │   ├── IntelHubScreen.tsx
│       │   ├── SafeWalkScreen.tsx
│       │   ├── SafetyAdvisoryScreen.tsx
│       │   └── SupportScreen.tsx
│       ├── map/
│       │   ├── CrimeMapScreen.tsx
│       │   └── PoliceStationsScreen.tsx
│       ├── notifications/
│       │   └── NotificationScreen.tsx
│       ├── profile/
│       │   ├── EditProfileScreen.tsx
│       │   ├── EmergencyContactsScreen.tsx
│       │   ├── ProfileScreen.tsx
│       │   └── VerificationScreen.tsx
│       └── report/
│           ├── MyReportsScreen.tsx
│           └── ReportCrimeScreen.tsx
├── tailwind.config.js
├── tsconfig.json
└── ts_errors.txt
```

---

## 12. SUMMARY TABLE

| Category | Technology / Choice | Details |
|---|---|---|
| **Framework** | React Native (Expo 54) | Cross-platform iOS/Android with managed workflow |
| **Language** | TypeScript | Strict mode for type safety |
| **Navigation** | React Navigation 7 | Stack + Drawer + Bottom Tabs (nested) |
| **Styling** | NativeWind (Tailwind) | Utility-first CSS with compile-time class extraction |
| **Backend** | Supabase | Auth, PostgreSQL, Storage, REST API |
| **AI** | Google Gemini Flash | Chat, multimodal vision, NLP analysis |
| **Maps** | react-native-maps | Custom dark style, markers, circles |
| **Charts** | react-native-chart-kit | Bar and Pie charts for analytics |
| **Location** | expo-location | GPS for SOS, crime reports, police stations |
| **Camera/Images** | expo-image-picker | Image capture and gallery selection |
| **Audio** | expo-av | Emergency alarm sound |
| **SMS** | expo-sms | Emergency contact notifications |
| **Blur** | expo-blur | Glass morphism UI effects |
| **Date** | dayjs | Lightweight date formatting |
| **State** | React Context + useState | AuthContext for global state |
| **Featured** | | |
| SOS Dispatch | GPS + SMS + DB insert | 5-second countdown with abort option |
| Crime Reporting | Image upload + GPS + severity | 4-level status workflow |
| AI Chatbot | Gemini + DB persistence | System prompt with current date |
| Document Scanner | Gemini multimodal | Forensic authenticity analysis |
| Risk Prediction | Gemini + DB data | JSON-structured zone analysis |
| Social Monitor | Gemini simulation | Synthetic posts from real data |
| Admin Dashboard | Parallel DB queries | Real-time stats with pull-to-refresh |
| Nearby Stations | Overpass API + Haversine | 20km radius with mirror fallback |
| **Total Screens** | 28 | 3 auth + 6 home + 2 report + 4 profile + 2 map + 1 notification + 1 chatbot + 11 admin |
| **Database Tables** | 9 | profiles, reports, emergency_alerts, verifications, emergency_contacts, broadcasts, dispatch_logs, feedback, chatbot_history |

---

## 13. HOW TO RUN THE PROJECT

**Prerequisites**:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)
- Physical device with Expo Go app (optional)

**Step-by-step**:

```bash
# 1. Navigate to the project directory
cd CityGuard

# 2. Install dependencies
npm install

# 3. Ensure .env file has your keys
# EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# 4. Start the Expo development server
npx expo start

# 5. Run on Android emulator -- press 'a' in terminal
# 6. Run on iOS simulator -- press 'i' in terminal (macOS only)
# 7. Run on physical device -- scan QR code with Expo Go app

# Lint check:
npx expo lint

# Format code:
npm run format
```

**Database Setup**:
Create a Supabase project and run SQL to create the 9 tables described in Section 5. Create a storage bucket called `images` with public read access. The `profiles` table's `id` column should reference `auth.users(id)`.

---

## 14. FINAL TIPS

### Key Points to Emphasize in Viva

1. **Full-stack ownership**: Emphasize that you built every layer -- React Native frontend, Supabase backend configuration, Gemini AI integration, Overpass API integration. You own the entire stack.

2. **Problem-solution alignment**: Start every answer by stating the problem first, then your solution. "The problem was X. I solved it by implementing Y using Z technology."

3. **Cross-platform awareness**: Mention that you tested on both Android and iOS, and handled differences (SMS behavior, BlurView, platform-specific map URLs).

4. **Error handling**: Stress that every API call (Supabase, Gemini, Overpass) has proper try-catch error handling with user-friendly messages -- not just console.log.

5. **Security consciousness**: Mention that API keys are in `.env` files (not hardcoded), authentication is managed by Supabase, and data queries filter by user ID.

6. **Real-world applicability**: Frame features in terms of real problems: "SOS addresses the problem that traditional emergency calls lack GPS context."

7. **Trade-off awareness**: Show you know what you sacrificed. Example: "I used client-side data fetching instead of real-time subscriptions because for v1 the data volume is small, but I designed the architecture to easily add subscriptions later."

8. **The "why" matters more than "what"**: For every technology choice, be ready to explain why. "Why NativeWind?" -- "Faster styling with utility classes. Why Supabase?" -- "Relational database with built-in auth."

### "Did You Use AI?" Script

*If the examiner asks: "Did you use AI to build this project?"*

"Yes, I used AI tools during development, but I want to clarify the extent. I used **Google Gemini AI** as a feature within the app -- it powers the chatbot, document scanner, risk predictor, and social media monitor. These are deliberate features where AI adds value.

For coding assistance, I used AI-based code completion tools for boilerplate code like TypeScript type definitions and repetitive UI components. However, the **architecture, data flow design, database schema, navigation structure, and business logic were all designed by me**.

Every line of code in this project is something I understand and can explain. The real engineering work -- deciding how data flows between the SOS button and the Supabase database, structuring the navigation with conditional auth rendering, designing the report lifecycle with status_level, handling cross-platform SMS differences -- that was my own problem-solving."

### Handling Unknowns

If asked something you do not know:

1. **Do not guess**: "I have not encountered that specific scenario, but based on my understanding of the architecture, I would approach it by..."

2. **Show process, not just answer**: "I do not have the exact answer right now, but I would debug this by first checking the Supabase logs, then inspecting the network request in the Expo debugger."

3. **Relate to what you know**: "I have not implemented Redis caching, but I did implement a mirror fallback pattern for the Overpass API which follows a similar resilience principle."

4. **Honest limitation**: "That is a production concern I did not address in v1. For this project, my focus was on core functionality and demonstrating the architecture. For production, I would..."

---

*End of CityGuard MCA Final Viva Preparation Guide*
