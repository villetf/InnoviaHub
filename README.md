# InnoviaHub

Ett enkelt bokningssystem för resurser och faciliteter avsett för coworkingcentret Innovia Hub.

## Vad är InnoviaHub?

InnoviaHub är en webbapplikation där användare kan:

- Logga in säkert med Microsoft-konto
- Boka rum och resurser
- Se tillgängliga tider
- Hantera sina bokningar
- Få hjälp av en AI-bot med att göra sina bokningar

## Teknik

**Frontend (Webbsida):**

- Angular 19
- TypeScript
- Azure Entra ID för inloggning

**Backend (Server):**

- .NET 9.0
- ASP.NET Core API
- Entity Framework
- OpenAI GPT-4.1 för AI-chatt

## Kom igång

### Snabbstart

Om du inte vill installera applikationen själv finns produktionsmiljön tillgänglig på https://innoviahub-app-6hrgl.ondigitalocean.app/. Notera att denna miljö innehåller den senaste stabila versionen, alltså inte funktioner som är under utveckling.

### Entra ID

För att logga in, oavsett om det är lokalt eller i produktionsmiljön, behöver du bli tillagd i Innovia Hubs Entra ID-katalog. Kontakta någon i teamet för att bli tillagd.

### .env

För att kunna använda AI-chatbotten behöver du en API-nyckel till OpenAI. Denna läggs till i en .env-fil i backend-mappen med följande innehåll:

`OPENAI_KEY = "din-nyckel"`

### Vad du behöver installerat

- Node.js (version 18 eller senare)
- .NET 9.0 SDK
- Git

### Starta projektet

1. **Klona projektet:**

   ```bash
   git clone https://github.com/villetf/InnoviaHub.git
   cd InnoviaHub
   ```

2. **Starta backend (API):**

   Vill du slippa att behöva ha en lokal databas? Du kan enkelt byta till inMemory-databas genom att ändra variabeln useInMemory på rad 36 i Program.cs till true. Därefter, kör:

   ```bash
   cd backend
   dotnet run
   ```

   Servern startar på: <http://localhost:5184>

3. **Starta frontend (webbsida):**

   ```bash
   cd frontend
   npm install
   ng serve
   ```

   Webbsidan öppnas på: <http://localhost:4200>

## Hur man använder systemet

1. **Öppna webbläsaren** och gå till <http://localhost:4200>
2. **Klicka "Login with Microsoft"** för att logga in
3. **Välj datum** med datumväljaren
4. **Boka resurser** som är lediga
5. **Alternativt, använd AI-chatten** för att få hjälp med att hitta en ledig tid
6. Använd sensorsidan för att se data för sensorer på centret
7. **Logga ut** när du är klar

## Utveckling

### Mappar

- `backend/` - Server-kod (.NET)
- `frontend/` - Webbsida-kod (Angular)
- `README.md` - Den här filen

### Brancher

- `main` - Huvudbranch (stabil kod)
- `dev` - Utvecklingsbranch

### Testning

Det finns en debug-sida på <http://localhost:4200/azure-debug> för att testa Azure-inloggning.

## Problem?

Om något inte fungerar:

1. Kontrollera att Node.js och .NET är installerat
2. Kör `npm install` i frontend-mappen
3. Kör `dotnet restore` i backend-mappen
4. Starta om både frontend och backend

## Nyligen tillagda funktioner

Under oktober har följande funktioner lagts till:

- AI-chattbot som hjälper dig att hitta ledig tider att boka
- Översikt över sensorer samt integration mot IoT-system

---

**Skapad av InnoviaHub-teamet** 🚀
