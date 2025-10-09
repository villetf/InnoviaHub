# Testning och kvalitet

## Tester

I projektet finns enhetstester för backend. De delar som testas är följande:

- Skapa en bokning (BookingRepositoryTests/AddBookingTest). Här skapas en testbokning och läggs till i den tillfälliga databasen. Därefter kontrolleras att bokningen finns i databasen. Detta är särskilt viktigt att testa eftersom det kan vara svårt att upptäcka och leda till stor förvirring ifall bokningen ser ut att gå igenom för användaren, men egentligen inte kan läggas till.
- Radera en bokning (BookingRepositoryTests/DeleteBookingTest). Här skapas en bokning och läggs till (manuellt, ej via tilläggningsmetoden), för att sedan tas bort med raderingsmetoden. Därefter kontrolleras att databasen inte innehåller bokningar. Detta är viktigt av samma anledning som ovanstående, att det inte är uppenbart för användaren om en radering misslyckas, och därför kan vara svårt att upptäcka.
- Hämta alla resurser (ResourceRepositoryTests/GetAllResourcesTest). I detta test hämtas alla resurser, vilket ska vara exakt 6 stycken eftersom 6 standardresurser skapas vid initieringen av den tillfälliga inmemory-databasen. Efter detta kontrolleras att det finns exakt 6 resurser, varken fler eller färre. Detta är viktigt eftersom ifall inga eller felaktiga resurser hämtas så kan användaren inte göra något alls, vilket gör systemet värdelöst.
- Hämta en specifik bokning utifrån ID (ResourceRepositoryTests/GetResourceByIdTest). Detta sker genom att en resurs skapas manuellt och därefter hämtas baserat på ID. Testet kontrollerar att det hämtade objektet är samma som det nyligen skapade. Detta är viktigt av samma anledning som ovanstående, felaktig hämtning av resurser gör att bokningssystemet inte går att använda alls.

Eftersom det inte finns jättemånga repository-metoder hade det varit möjligt att skriva tester för alla, vilka på så sätt kan användas i vidareutvecklingen eftersom det är lätt att se att allt funkar efter ändringar.

## Vidareutveckling

Projektet har en bra grund för vidareutveckling. Detta är tack vare att arbetet skett enligt de best practices som används för att separera ansvar och skapa modulära och återanvändbara delar av av applikationen. Exempel på detta är att olika delar av frontend är uppdelade i separata komponenter, och det finns flera återanvändbara komponenter, exempelvis komponenten button som är en knapp som går att anpassa på många olika sätt. API-anrop är utbrutna till injicerbara servicar för att enkelt kunna återanvändas och utökas med fler anrop. Även backend har bra ansvarsseparation genom att den använder sig av en MVC-liknande struktur, vilket gör att det exempelvis går att återanvända repositorymetoder på olika ställen.

## Säkerhet

Nycklar och lösenord hanteras i env-filer eller genom environmentvariabler. OpenAI-nyckeln förvaras i en .env-fil (ej versionshanterad) som importeras automatiskt i projektet. För databasuppgifter används environment-variabler. Environment-variabeln som behöver sättas heter CONNECTIONSTRINGS__DEFAULTCONNECTION, och hämtas in automatiskt av ASP.NET då den letar efter en connectionstring som heter DefaultConnection. I variabeln finns databasadress, databasnamn, användare och lösenord. Denna kan antingen sättas manuellt i den terminal där appen körs, eller läggas till i appsettings.json (som dock då inte får pushas till Github). När appen körs i produktionsmiljö i Azure sätts environmentvariabeln i systemd-tjänsten som kör koden.
