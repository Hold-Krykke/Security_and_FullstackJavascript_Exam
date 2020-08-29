# 4. Semester Security Eksamens Rapport

### Dette projekt er programmeret og skrevet af:
* **Cph-mh748 - [Malte Hviid-Magnussen](https://github.com/MalteMagnussen)**
* **Cph-rn118 - [Rúni Vedel Niclasen](https://github.com/Runi-VN)**
* **Cph-ab363 - [Asger Bjarup](https://github.com/HrBjarup)**
* **Cph-cs340 - [Camilla Staunstrup](https://github.com/Castau)**

--- 
* [Backend kode](https://github.com/Hold-Krykke/Security_and_FullstackJavascript_Exam/tree/master/Backend)
* [Frontend App kode](https://github.com/Hold-Krykke/Security_and_FullstackJavascript_Exam/tree/master/FindYourFriends)
---

### Indholdsfortegnelse
* [Introduktion](#introduktion)
* [OWASP](#owasp)
  * [Broken Authentication](#broken-authentication)
  * [Kryptering af data](#kryptering-af-data)
  * [Broken Access Control](#broken-access-control)
  * [Injection](#injection)
  * [Security Misconfiguration](#security-misconfiguration)
  * [Insufficient Logging & Monitoring](#insufficient-logging--monitoring)
* [Servere og Databaser](#servere-og-databaser)
  * [Struktur og Sikkerhed](#struktur-og-sikkerhed)
  * [Sikkerhed ift. Injection](#sikkerhed-ift-injection)
  * [Logging](#logging)
* [Login](#login)
  * [Bcrypt](#bcrypt)
  * [JWT](#jwt)
  * [Anti Brute Force](#anti-brute-force)
  * [Kontrol af passwords](#kontrol-af-passwords)
  * [Endpoints](#endpoints)
  * [Passport](#passport)
  * [OAuth 2.0/OpenID 2.0](#oauth-20openid-20)
    * [Kort beskrivelse af OAuth 2.0 flows](#kort-beskrivelse-af--oauth-20-flows)
    * [Authorizationcode flow vs. Implicit flow](#authorizationcode-flow-vs-implicit-flow)
  * [Brugen af Expo, deep linking og URL schemes](#brugen-af-expo-deep-linking-og-url-schemes)
* [Authentication & Authorization med Apollo](#authentication--authorization-med-apollo)
  * [Apollo Links](#apollo-links)
  * [Apollo Error Handling](#apollo-error-handling)
  * [JWT sikkerhed i App](#jwt-sikkerhed-i-app)
  * [Incremental Authorization](#incremental-authorization)
* [Refleksion & Konklusion](#refleksion--konklusion)
  * [Security relevante funktionaliteter der ikke er implementeret endnu](#security-relevante-funktionaliteter-der-ikke-er-implementeret-endnu)

---
###### 48.458 tegn, svarende til 20,2 normalsider af 2400 tegn per side
---

### Introduktion
Vi ønsker at udvikle en mobil app med konceptet “Find your Friends” hvor brugerens lokation deles med andre. Efter lokationen er delt kan man finde venner i nærheden af sig. Udover det vil vi gerne give brugerne mulighed for at chatte - her kunne det enten være i plenum eller privat mellem hver bruger. 

Vi har valgt at kombinere fagene Security og Fullstack JS, fordi vi godt kunne tænke os at anvende vores security læring i et større projekt, og få alle brikkerne til at spille sammen. En udfordring med læringsmaterialet, er at disse to fag ikke nødvendigvis har været kombineret, så derfor ønsker vi at lave best practice implementationer, der dækker begge fag. 

**Oversigt over konceptet**
* Mobil-app udviklet i React Native 
* Konstant opdatering af egen position, også i baggrunden 
* Forhindre dvale af appen 
* Kryptering af chatbeskeder 
* **Sikkerhed i fokus**
  * OAuth 2.0 login (Google Sign In)
  * “Traditionelt” login uden om OAuth 2.0 med sikker transport, hashing.
  * Sikker brug af både MongoDB og MySQL. Her vil vi bl.a. gå i dybden med brugen af NoSQL databaser og undersøge emner såsom injections.

Vi har valgt dette projekt for at få dækket nogle af de OWASP-praksisser vi har hørt om, men ikke implementeret, eller ikke har implementeret i en JavaScript-sammenhæng før. Udover det, vil vi også gerne lære mere om Oauth 2.0/OpenID 2.0 og sikkerheds overvejelserne dertil, da det er noget der bliver brugt ofte ude i den virkelige verden. 

---

### OWASP
Når sværhedsgraden af potentielle sikkerhedsfejl vurderes, er der altid flere aspekter, man tager i betragtning. OWASP vurderer i denne sammenhæng 4 forskellige faktorer:
* **Exploitability**: Hvor nemt er det for threat agents at udnyttet et sikkerhedshul
* **Prevalence**: Hvor velkendt er sikkerhedshullet
* **Detectability**: Hvor nemt er det at opdage sikkerhedshullet
* **Technical**: Hvor alvorlig er den tekniske indvirkning hvis sikkerhedshullet bliver udnyttet
De fire vurderinger får en score mellem 1 og 3 og en samlet score bliver derefter udregnet som vist på figuren:  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83125263-97001800-a0d7-11ea-8c78-f3336d566bc5.png"/>
</p>  

Den indvirkning lækkede/mistede data har på os og vores brugere, samt den tekniske destruktion en tredjepart ville kunne lave i vores backend, bliver vurderet som den faktor der vejer tungest. Nummer 2 på OWASPs liste er Broken Authentication og den ligger netop så højt, fordi den scorer højest i “Technical”.

#### Broken Authentication
Hvis authentication management ikke håndteres korrekt, f.eks. når en session ikke bliver invalideret ved logout, fører det til broken authentication. 
Broken authentication er relativt nemt for angribere at udnytte og kan have store konsekvenser for både brugere og virksomheder, såsom hvidvaskning, bedrageri og identitetstyveri.  
  
Følgende problemer i en applikation kan føre til Broken Authentication:
* Ingen forhindring af automatiserede login/angreb 
  * credential shuffling og brute force
* Tillader default, svage og velkendte passwords
* Bruger svage og ineffektive måder for brugeren at generhverve et glemt password
* Gemmer passwords i plain text, krypterede eller med en svag hash funktion
* Gør ikke brug af multi factor authentication 
* Ukorrekt brug af session (viser session ID i URL, roterer ikke session ID efter login, ugyldiggør ikke session ID efter logout)

Vi ønskede i vores applikation at minimere Broken Authentication ved udelukkende at bruge OAuth 2.0/OpenID 2.0 til login. Herved skal en bruger aldrig indtaste et password direkte i vores applikation, men kun gennem vores identity provider, og vi ville ikke skulle gemme brugerpasswords eller kunne genskabe dem. 
Vi valgte også at implementere et traditionelt login sideløbende med, for at skabe et mere realistisk billede af virkeligheden, hvor ikke alle brugere nødvendigvis har en konto hos f.eks. Google. I dette login har vi ønsket at komme så mange af de punkter der nævnes i OWASP som usikre til livs. 
* Vi bruger ikke session, men JWTs. Vores applikation er stateless.
* Vi krypterer passwords med Bcrypt
* Begrænsning af loginforsøg
* Kontrol af valgt password

#### Kryptering af data
Som tidligere nævnt har “Technical” den største vægt i OWASPs vurdering. For at få så lille en indvirkning som muligt i OWASPs udregning og for at skabe en sikring af brugerdata i vores service, har vi snakket om at kryptere brugernes data på samme måde som ens forbindelse over internettet krypteres med SSL, eller i hvert fald tilbyde det som en service.
Hos hver enkelt bruger ville vi generere et asymmetrisk nøglepar, ligesom vi selv har og bruger, når vi skal tilgå vores droplets. Med denne strategi ville brugerne naturligvis være begrænsede af, at kun de har deres private key, og at deres data derfor i princippet ville gå tabt, hvis de skiftede telefon eller de mistede deres private key.   
For at løse dette problem kunne vi involvere iCloud og Google, og diktere at brugere skulle gemme deres private keys i den cloud service, deres telefon er bundet op på. Med denne opsætning ville en tredjepart både skulle kende brugerens password til vores service og passwordet til brugerens cloud service eller mobil for at skaffe deres private key, for så at kunne stjæle deres data i vores system. 
Hvis vores backenden blev overtaget af en tredjepart, ville vedkommende kunne ødelægge eller slette den data, der ligger i de to databaser, men ville ikke kunne lække noget data da alting er krypteret. Dette kunne løses ved at gemme periodiske back-ups på en anden server. Ingen andre end brugerne selv, ikke engang os som udviklere ville kunne læse brugernes data - det ville medvirke til en lavere score for “Technical” i OWASPs vurdering og ville sikre brugerens privatliv.

#### Broken Access Control
Access control sørger for at brugere ikke kan agere udover hvad det er meningen de skal kunne i en applikation. OWASP beskriver følgende typiske Access control sikkerhedshuller.
* Forbigåelse af checks ved at modificere URL, state, HTML eller ved at bruge et API angrebs redskab
* Tillade at et id kan ændres til en anden brugers, så det er muligt at se eller redigere en andens konto/information. 
* At kunne tilgå indhold man ikke bør have adgang til (adminrettigheder som almindelig bruger osv)
* Manipulation af metadata. Eksempelvis, redigering af JWT, access control token eller cookies for at ændre i rettigheder eller lignende. 
* Forkert CORS konfiguration der gør det muligt at få unauthorized API adgang. 
* Kunne tilgå sider der kræver authentication som unauthenticated bruger eller adminsider som almindelig bruger. Tilgå API endpoints med manglende access control. 

I vores applikation er de ting vi har skulle være opmærksomme på i forhold til Broken Access Control primært været vores JWT, samt vores GraphQL. Vi løser problemet med at en bruger eller tredjepart kan ændre i JWT ved at sørge for at det underskrives, både med hashet af payload og header, samt vores secret. Se mere om dette i [JWT](#jwt) afsnittet. Vores GraphQL er beskyttet ved at bruge [Apollo Links](#apollo-links). 
I backenden laver Apollo Server en såkaldt `context`, hvor den tjekker validiteten på den JWT der bliver sendt i requesten. Hvis JWT ikke er valid, bliver `context` sendt videre til vores GraphQL Resolvers med variablen `valid: false`. Hvis JWT er valid, bliver `valid: true` sat på `context` samt det valide `token`. Man kan derefter benytte det `token` til at trække information om brugeren ud, så man sørger for, at brugeren kun kan foretage ændringer i databaserne på sig selv og ikke andre brugere.

#### Injection
OWASP vurderer stadig injection som problem nummer 1 i sikkerhedsverden. På trods af hvor velkendt denne slags sikkerhedsrisiko er, er der stadig utroligt mange, der ikke tager højde for det og hvis et system er åbent for injections, kan en tredjepart få adgang til stort set al data.  
Svagheden er nem at udnytte, nem at opdage og konsekvenserne er som regel ekstremt store. Vi har gjort vores bedste for at eliminere denne potentielle svaghed ved brug af typekontrol og prepared statements (se afsnit om [Sikkerhed ift. Injection](#sikkerhed-ift-injection)).

#### Security Misconfiguration
OWASP beskriver Security Misconfiguration som f.eks default accounts, offentlig visning af stacktrace, unødvendige features/frameworks/libraries og deslige. Vi har i vores projekt sørget for at eliminere Security Misconfiguration ved:
* ikke at have default users
* vi har slået StackTrace fra når vores server er i produktion, så det ikke kommer med ud til brugerne af vores API

Når der opstår en fejl i vores backend, sender vi en error message til Frontend. Den bliver vist i en Alert (se mere under [Apollo Error Handling](#apollo-error-handling)), så brugeren ikke kan undgå at se den, og den fortæller bare brugeren hvad de har gjort forkert, i stedet for at fortælle i detaljer om hvad der er gået galt internt i programmet. 
Herudover har vi været kritiske når vi har skulle bruge f.eks. tredjepart frameworks, hvor vi grundig har undersøgt om det er noget der er meget brugt og om det er noget vi har behov for at bruge.

#### Insufficient Logging & Monitoring
OWASP beskriver dette punkt som et af de sikkerhedshuller der meget ofte bliver udnyttet.  
Nogle af de ting der er med til at gøre en applikation usikker i forhold til Insufficient Logging & Monitoring er blandt andet:
* Login, samt forsøg herpå ikke bliver logget.
* Warnings og errors genererer ikke beskrivende log-beskeder.
* Logs bliver ikke monitoreret
* Logs gemmes kun lokalt
* Der er ikke sat alameringsfunktionalitet op
* Applikationen kan ikke give besked om angreb i realtid eller nær-realtid. 

I vores applikation har vores fokuspunkt vedrørende security ligget mest omkring Login og beskyttelse af vores droplets, men vi mente stadig at det var vigtigt at have logging med.  
Derfor har vi gjort følgende:

* Vi logger alle requests og errors (*lokalt*) i hver sin fil, men:
  * Logs bliver ikke monitoreret (udover manuelt)
  * Applikationen reagerer ikke i forbindelse med logging.
* Vi logger ikke bestemte exceptions, noget vi kunne have gjort i forbindelse med brugen af Apollo Links.
* Vi logger ikke ekstraordinært i forbindelse med brute-force detection

---

### Servere og Databaser
Vi har valgt at have 2 databaser i dette projekt. En MySQL database til opbevaring af vores brugeres login informationer (de brugere, der ikke logger ind med OAuth 2.0) og bl.a. refresh tokens for OAuth 2.0 brugere. Den anden database er en NoSQL MongoDB der er hosted online hos Atlas. I denne database ligger geo lokationer og chatbeskeder (hvis denne funktion når at blive implementeret). Den data er forbundet med et brugernavn, som brugere selv vælger (OAuth brugere kan undlade at vælge et brugernavn, men så vil deres mail blive vist som brugernavn i applikationen i stedet for, efter de er blevet informeret om dette). Lokationsdata er naturligvis personlig, men denne data ligger uden referencer til brugerens mail (hvis brugeren har angivet et brugernavn) eller anden personlig information, der er er gemt om brugeren. 
Atlas krypterer som standard forbindelser til databaser med TLS/SSL, så vores data kan ikke ses over netværket, når vi opdaterer brugeres lokationer osv.

Vores MySQL database ligger på en anden server end vores backend. Vi har valgt denne opdeling for bedre at kunne sikre vores data, både i forhold til hvis vores backend server skulle gå ned og i forhold til sikkerhed omkring dataen i det hele taget.
MySQL databasen kan kun tilgås af vores backend server. Databasen kan altså ikke tilgås direkte af brugere og database-serverens IP er ikke offentligt kendt. Forsøger man at tilgå den, vil man som sagt blive afvist af dens firewall.


For at tilgå databasen bruger backenden en MySQL non-root bruger. Denne bruger har tilladelse til at gøre alt på de tables, der har med applikationens brugere at gøre. Dvs. at hvis backenden skulle blive kompromitteret, ville tredjeparten trods alt kun få adgang til de tables der har med brugere for denne applikation at gøre, og ikke andre tables og anden data, der kunne ligge i databasen. Dette kan selvfølgelig i sig selv været slemt nok - det optimale er derfor at give MySQL brugeren så få rettigheder som overhovedet muligt. For at have en fungerende applikation er man dog nødt til at have en vis mængde rettigheder på MySQL brugeren. I og med MySQL brugeren kan læse al dataen i tabellen, så ville en tredjepart kunne lække al denne information.
På samme måde ville det være muligt at læse al informationen omkring brugernes lokation og deres chatbeskeder, der ligger i MongoDB, hvilket naturligvis ville være et kæmpe brud på brugernes privatliv. 
I den forbindelse har vi gjort os nogle overvejelser (nærmere beskrevet i afsnittet [kryptering af data](#kryptering-af-data))

#### Struktur og Sikkerhed
Vores initielle ide af systemets design kan ses på nedenstående figur.  

<p align="center">
<img src="https://user-images.githubusercontent.com/44898491/83128064-2fe46280-a0db-11ea-8feb-dae77c422c5e.png"/>
</p>  


Det endelige design endte med at følge skitsen nogenlunde. Vi har to servere og vi kommunikerer med to cloud services; Google og Atlas.

Den midterste droplet på figuren er vores backend server. På denne server har vi installeret en reverse proxy nginx, der sikrer at al kommunikation foregår via https - alle requests til port 80 bliver omdirigeret til port 443 og hvis ikke klienten har en passende cipher suite, bliver de nødt til at droppe kommunikationen med vores server. Derudover afviser serverens firewall al anden netværkskommunikation (bortset fra SSH selvfølgelig).
For at tilgå de forskellige data, skal man være logget ind (se [Authentication & Authorization afsnit](#authentication--authorization-med-apollo)). Vi sikrer altså at alle forbindelser er sikre og at intet data er tilgængeligt uden at brugeren har en valid JWT.
Når vi selv skal håndtere vores servere benytter vi SSH, der sikrer en stærkt krypteret forbindelse. Vores servere har ikke nogen unødvendige porte åbne og som tidligere nævnt er det kun vores backend server, der kan oprette forbindelse til vores database server (ud over at port 22 selvfølgelig er åben). Database serverens firewall tillader kun forbindelser på port 22 og port 3306 fra backend serverens IP. 


#### Sikkerhed ift. Injection
Vi har som sagt valgt at bruge både en SQL database og en NoSQL database (MongoDB). Når man snakker om databaser støder man naturligvis på problemstillingen med injection. Vi har gjort flere ting for at beskytte os selv mod injection og har undersøgt eventuelle svagheder i MongoDBs API. Da MongoDB er nyt for os ville vi være sikre på, at det var sikkert at bruge, så vi har undersøgt og testet injection i forhold til MongoDB. 

Der findes forskellige query- og projection “operators” i MongoDBs API som kan bruges til at optimere og forme ens API kald. Blandt andet findes `$not` operatoren, der returnerer alle dokumenter, der ikke passer på den query, der eksekveres på ens collection. En anden operator er `$ne` der match’er alle værdier, der ikke er lig med det, man specificerer efter operatoren.
Eksempelvis ville man kunne benytte `$ne` til at undgå at skulle skrive en given brugers password: 

`.find({"user": "patrick", "password": {"&ne": ""}});`

I dette tilfælde injecter vi operatoren ind hvor passwordet skulle have stået. Operatoren lader os finde al data om brugeren “patrick”. I eksemplet siger man: Find brugeren, hvis navn er “patrick” og hvis password ikke er lig med en tom streng. Naturligvis går denne query igennem, fordi patrick har et password - og vi har nu fået adgang til patricks data uden at kende til hans password. 
Hvis der var tale om SQL, havde tredjeparten selvfølgelig skullet strukturere sin injection anderledes. En SQL query svarende til det ovenstående API kald ville se ud som følgende:

```SELECT * FROM users WHERE `user` = “patrick”;-- AND `password` = "";```

I dette tilfælde sørger tredjeparten for at udkommentere den del af query’en, der ellers havde tjekket, om man havde angivet det rigtige password.

I SQL løser man langt hen ad vejen problemet med injection ved at bruge prepared statements, der sørger for, man ikke kan escape strengen, når query’en bliver opbygget i backenden. Det er også det vi bruger i vores backend. Vi tvinger brugerens input til at være en streng, så det ovenstående SQL eksempel ville ende med at se ud som følgende:

```SELECT * FROM users WHERE `user` = “patrick;--” AND `password` = "";```

Der er ikke nogen bruger, der hedder “patrick;--” og hvis der var, ville tredjeparten stadig ikke kunne få adgang til hans data, da der ikke er angivet et password. 
De ovenstående eksempler er forsimplede for at gøre det nemmere at forklare konceptet. 

For at løse problemet i NoSQL APIet skal vi sørge for at opnå samme effekt som vores prepared statements for SQL giver. Der findes ikke prepared statements i APIet så for at lave det, der så vidt muligt svarer til et prepared statement, skal vi sikre at alt input bliver “type casted” til strenge eller tal.
Vi har valgt at bygge vores backend med TypeScript og vores API med GraphQL - GraphQL som framework og TypeScript som programmeringssprog sikrer begge stærke typer og løser derfor problemet for os. Det er ikke muligt at give objektet `{"&ne": ""}` videre som parameter til en query i MongoDB APIet, og hvis man prøver at gøre det ved f.eks. at sende det i en streng “{"&ne": ""}”, så beholder det netop sin tilstand som streng og manipulerer dermed ikke den underliggende query-struktur i backenden. 

I større applikationer med mere varierende data end det, vi har, ville systemet med stærke typer begrænse den fleksibilitet man ellers nyder godt af med delvist ustruktureret data i NoSQL databaser, men til vores behov passer brugen af TypeScript og GraphQL perfekt. 

#### Logging
Som standard bliver logfiler gemt til mappen logs, og hvis programmet kører i udviklings-tilstand vil der også blive logget i konsollen. Til dette brugte vi [express-winston](https://www.npmjs.com/package/express-winston) med en opsætning skræddersyet til vores behov. Vi har fokus på maskinlæsbart output som samtidig kan granskes af mennesker, derfor har vi valgt et output i JSON-format. 
Vi logger alle indgående requests til applikation, bortset fra `/graphql` som ville overfylde logs med overvejende triviel data.  
Vi logger alle fejl som opstår i applikationen.

---

### Login
I dette afsnit beskriver vi hvordan vi har valgt at håndtere hele vores login strategi. Vores mål med denne applikation har hele tiden været at udvikle den, som var det en applikation der skulle bruges i den virkelige verden og derfor forholder vi os til de sikkerhedsrisici der eksisterer og følger de "best practices" der er inden for de forskellige områder vi berører. Angående login er "best pratice" at bruge OAuth 2.0/OpenID 2.0. I en virkelig applikation forestiller vi os, at en virsomhed ikke ønsker at afskære brugere, der ikke ønsker at bruge deres konti hos diverse openID providers. Derfor implementerer vi også et traditionelt login. Her sørger vi igen for at følge de standarder der eksisterer vedrørende opbevaring af passwords. 

#### Bcrypt
Vi bruger Bcrypt til at hashe passwords hos de brugere af vores applikation der ikke ønsker at logge ind med deres Google-konto. Vi har valgt Bcrypt da det virker som det bedste valg i forhold til fremtidssikring, samt det er den hashing algoritme der bliver anbefalet mest til hashing af passwords.   
Bcrypt er som nævnt en hashing algoritme der er udviklet specifikt til hashing af passwords. Den er derfor designet til at være langsom. Grunden til at en hashing algoritme bør være langsom er, at det vil tage lige så lang tid at brute force hvert password-gæt, som når det hashes. Ved også at inkorporere et salt, er der beskyttelse mod rainbow-table angreb, da to ens passwords vil resultere i 2 forskellige hash. Herudover kan antallet af rounds justeres, hvilket gør processen mere langsommelig. 

Forsimplet diagram over hvordan bcrypt virker:  
<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83121674-ed1e8c80-a0d2-11ea-9b62-89a5b169bd48.png"/>
</p>  

Rounds er antallet af gange hashingalgoritmen bliver udført. Første gang med password som key. I efterfølgende rounds er det skiftevis salt’et eller password’et der sættes som key, mens der bliver hash’et med den foregående value. 
Jo flere rounds, jo længere tid tager hele operationen, hvilket betyder at når computer hardware i fremtiden bliver bedre vil denne algoritme stadig kunne benyttes, ved at sætte antallet af rounds op. Dette medfører også at hvis ens applikation indeholder meget sensitiv data, så er det muligt at sætte et højt antal af rounds for at optimere sikkerheden - det betyder selvfølgelig også at brugeren vil opleve en betydelig længere “ventetid” når de logger ind. 

#### JWT
Når en bruger er logget ind i vores applikation skal vi bruge en måde at kommunikere dette til vores mobile app. Vi ønsker ikke at sende nogle af de tokens vi får af Google ud til den mobile app, da de giver adgang til den sensitive data Google har om den givne bruger. Samtidig ønsker vi at kunne behandle brugere ens, efter login, uanset hvilken måde de er logget ind på. For at løse dette, bruger vi JSON Web Tokens.   

JSON Web Token indeholder JSON-formater der bruges som bevis for authentication. JWT har følgende struktur:  
**Header** - indeholder information om hvilken algoritme der er brugt til kryptering, i vores tilfælde er det default algoritmen HS256 (HMAC med SHA256).  
**Payload** - indeholder den information der er relevant for ens applikation. Vores payload består af et expiresIn objekt og et user e-mail objekt.  
**Signatur** - JWT validering. Formålet med signaturen er at kunne validere afsenderen. Signaturen er beregnet ved at encode header og payload med base64url encoding og herefter sammenkæde dem med et punktum imellem. Denne string krypteres herefter med den algoritme der er specificeret i headeren og vores secret.  
* HMAC (HMAC med SHA256) er en Message Authentication Code (MAC) baseret på en hash funktion, der basalt set går ud på at sammenkæde en secret og en message og hash’e dem sammen. Valideringen består i at modtageren kender både message og secret og ved at foretage samme beregning, vil der nås frem til den samme MAC.  
	
At JWT header og payload er encoded, mens selve signaturen er krypteret giver mulighed for at læse header og payload ud af JWT i client applikationen og bruge de værdier der er sat, mens signaturen kun kan læses af dem der har adgang til den secret der bliver brugt til signering.  
I praksis betyder det at for at ændre i et JWT (angive sig selv som admin eller en anden bruger), eller lave et falsk JWT, er det nødvendigt at kende den secret der er brugt af krypteringsalgoritmen. I vores program er det kun vores server der kender vores secret, så der skal skaffes adgang til den før tredjepart får fat i den. I vores JWT er expiresIn sat til 60 minutter for at mindske sandsynligheden for at det kan misbruges i tilfælde af at tredjepart får fat i det pågældende token.    

De fleste JWT biblioteker har følgende tre funktioner, som er nødvendige for at kunne bruge JWT.
* Encode et token. Payload og header encodes med base64url encoding.
* Decode et token. Payload og header decodes fra base64url encoding.
* Verify et token. Valideringen består i at foretage samme beregning som ved signeringen, hvilket vil sige at secret skal bruges til at verify. 
	
I backenden håndteres produktion af JWT ens uanset hvilken login metode der er brugt. Yderligere ville vi gerne have at authentication via OAuth 2.0/OpenID 2.0 provider skete i backenden. OAuth 2.0/OpenID 2.0 login er mere komplekst end vores eget login og vores valg om at det er backenden der skal stå for dette har medført at det er nødvendigt at foretage et redirect tilbage til frontenden (react native app) umiddelbart efter login. 

Da authorization headers bliver fjernet under et redirect, for at beskytte clienten fra at blive redirected med deres credentials til en untrusted tredjepart, var det ikke en mulighed at sende JWT på denne måde. 

I stedet sættes JWT som en query parameter og sendes med til frontenden. Det blev vurderet som værende sikkert, da responset sendes over TLS/SSL hvori selve query string’en også er krypteret, samt at vores JWT er short-lived. 

#### Anti Brute Force
Vi begrænser mængden af login forsøg en bruger kan lave. Hvis man forsøger at logge ind mere end en gang i sekundet vil det blive opfattet som et brute force angreb og den IP forsøget kom fra vil blive afvist de næste fem sekunder. Hvor længe en IP er bannet og hvor lang tid der kan gå mellem normale forsøg kan selvfølgelig justeres - vi valgte relativt lave værdier mens systemet stadig er under udvikling.

#### Kontrol af passwords
Når man laver en ny bruger, (hvor man altså ikke logger ind med OAuth 2.0/OpenID 2.0) bliver man bedt om at taste et password ind 2 gange. Det password man angiver bliver tjekket på en række forskellige punkter:
* Minimum længde af 10
* Skal indeholde både et bogstav, et tal og et tegn
* Må ikke indeholde kendte svage passwords

De fleste kendte svage passwords er kortere end 10 tegn. Vi kræver et password, der indeholder mindst 10 karakterer, men hvis brugeren nu ville have brugt `qwer1!` som password, men får at vide, det er for kort, så kunne brugeren bare tilføje flere tal: `qwer123456!` og så ville passwordet være langt nok, men stadig usikkert. Derfor siger vi at ens password slet ikke må indeholde sekvenser, der passer på et allerede kendt svagt password. Passwordet `qwer123456!` ville altså blive afvist, da det indeholder `qwer1234`, som er et kendt svagt password.

#### Endpoints
`/auth/jwt`
Dette er vores eget login der eksekverer passport strategien `local` (se næste afsnit om [Passport](#passport)). Endpointet kaldes fra react native app’en med brugerens username og password.
Password tjekkes med Bcrypt (se afsnit om [Bcrypt](#bcrypt)). Til sidst genererer dette endpoint et JWT som så sendes tilbage til react native app’en. 

`/auth/google`
Dette er vores OAuth 2.0/OpenID 2.0. endpoint der eksekverer passport strategien `google`. Brugere logger ind med deres Google konto. Dette endpoint kaldes fra react native app’en. Herfra redirectes der via passport videre til Googles servere som står for at authenticate den givne bruger. Når dette er gjort laver Google en request til vores `/auth/google/callback`. 

`/auth/google/callback`
Dette endpoint eksekverer også passport strategien `google`. Ved succesfuldt login modtager dette endpoint en authorizationcode fra Google. Denne authorizationcode bliver via passport herefter sendt tilbage til Google som sender accesstoken, refreshtoken og profildata tilbage til os. Til sidst genererer dette endpoint et JWT som så sendes tilbage til react native app’en. 

#### Passport
Passport er en authentication middleware hvis formål er at authenticate requests. Frameworket indeholder en masse predefinerede strategier for login med diverse OAuth 2.0/OpenID 2.0 providers, samt andre såsom BasicAuth, JWT og deslige. På definerede endpoints kaldes `passport.authenticate()`, der tager navnet på den ønskede strategi ind som herefter eksekveres.  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83126575-4be70480-a0d9-11ea-9c41-1641bf900705.png"/>
</p>  

Passport sikrer den korrekte struktur på URL'en til OAuth 2.0/OpenID 2.0 provider, og sørger for at client id og client secret bliver checket. Desuden håndterer passport svar fra provideren og behandler det for os. Ved brug af passport sikrer vi stabilitet og pålidelighed, da det er et gennemtestet og udbredt framework  
* **Google Strategi**  
Denne strategi authenticater brugere via deres Google account som også er en OpenID 2.0 identifier.  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83126652-6d47f080-a0d9-11ea-96a4-461d79ca5dbf.png"/>
</p>   

* **Local Strategi**  
Denne strategi gør det muligt at authenticate brugere med username og password.   

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83126729-8a7cbf00-a0d9-11ea-9940-91f56138f0d7.png"/>
</p>  

#### Oauth 2.0/OpenID 2.0
Vi valgte at vores primære login strategi skulle være gennem OAuth 2.0/OpenID 2.0. da vi var interesserede i at prøve at implementere et så tæt på real-world scenarie som muligt i forhold til vores valgfag Security. 

Det er en meget udbredt måde at håndtere login på og det abstraherer hele håndteringen af kryptering og opbevaring af passwords hen på den OAuth 2.0/OpenID 2.0. provider man vælger at benytte. Dermed ikke sagt at det ikke stadig er nødvendigt at sikre sine data - vi håndterer bare ikke længere passwords. 
Det der skal beskyttes ved denne strategi, udover sensitiv brugerinformation som f.eks. e-mails, er den client secret vi får udleveret af vores provider, som i vores tilfælde er Google. 
Denne client secret gemmes hos os i en .env fil, som aldrig kommer med i versionsstyringen. Når projektet bliver endeligt deployet på vores server, kort før Fullstack Javascript eksamen, bliver filen manuelt lagt over på serveren. Hvis en tredjepart får fat i disse oplysninger (ved at skaffe sig adgang til vores server - håndtering af dette er beskrevet under afsnittet [Servere og Databaser](#servere-og-databaser)) vil de kunne udgive sig for at være os over for Google og eventuelt få fat i brugerinformation, requeste adgang til bruger e-mails med mere. Dog vil en tredjepart også skulle kunne komme ind på vores konto på [Google Cloud Platform](https://console.developers.google.com/) for at kunne sende data’en et andet sted hen end det endpoint vi der har specificeret - `serverIPaddress/auth/google/callback`.

Vores OAuth 2.0/OpenID 2.0. flow er et authorizationcode flow og virker på følgende måde.  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83127121-1393f600-a0da-11ea-969c-2eb67357fe69.png"/>
</p>  

Brugeren trykker på Google-knappen for at logge ind, hvorefter der bliver åbnet en webbrowser hvorfra endpointet `/auth/google` kaldes og eksekverer passports `google` strategi. Denne strategi redirecter til Googles authentication servere, som resulterer i at Google beder brugeren om at logge ind.  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83127234-32928800-a0da-11ea-8195-3b62006fe523.png"/>
</p>  

Den request backenden sender til Google indeholder de Oauth 2.0 parametre vi er interesserede i, `scope`, `accessType`, `prompt` og `state`.   

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83127277-41793a80-a0da-11ea-9317-1810fe9e413f.png"/>
</p>  

* `scope` er det brugerdata vi er interesserede i og her specificerer vi at det er brugerens OpenID 2.0 data samt deres e-mail vi gerne vil have adgang til (også kaldet profile data).   
* `accessType` er den parameter der fortæller brugeren at vi gerne vil have offline access til deres data, hvilket vil sige at Google giver os et refresh token med tilbage, sammen med access token og profile data.   
* `promt` med value `“consent”` er påkrævet af Google for at vi kan få lov til at sende `accessType: "offline"` med.   
* `state` er data som Google sender uændret tilbage til os igen. Vi skal bruge indholdet af vores state for at kunne lave et redirect tilbage til vores react native app.  

Det passport sender afsted til Google med ovenstående parametre ser nogenlunde ud på følgende måde   

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83127911-0297b480-a0db-11ea-92d2-8c08a6e2bdc1.png"/>
</p>  

Når brugeren er logget ind sender Google et svar tilbage til endpointet `/auth/google/callback` med en authorizationcode.  
Den vil se ud som her:  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83127974-16431b00-a0db-11ea-9598-fabc6800d507.png"/>
</p>  

Denne authorizationcode bruger backenden til at spørge Google om access token, refresh token og brugerens profile data (som blandt andet indeholder deres e-mail)   

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83128031-265afa80-a0db-11ea-9b4a-a8ff5248e48c.png"/>
</p>  

Som så kommer tilbage nogenlunde sådan her  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83128071-3377e980-a0db-11ea-9ffe-5faba7262a6c.png"/>
</p>  

Backenden genererer et Json Web Token (se mere i afsnittet [JWT](#jwt)) og redirecter til react native app’ens custom scheme (se [Brugen af Expo, deep linking og URL schemes](#brugen-af-expo-deep-linking-og-url-schemes)). Dette lukker den browser der var åbnet op og herefter tager App’en over og sørger videre for håndteringen af JWT. 

#### Kort beskrivelse af  OAuth 2.0 flows
Der findes fire typer af flows, eller grant types som det også kaldes, for en client at få et access token fra en authorizationserver på. 
* **Authorizationcode flow** - det vi bruger og som er vist billedligt længere oppe. Bruges i serverside applikationer hvor source koden ikke er offentlig eksponeret. I dette flow foregår der på backenden en udveksling mellem applikationen og 2.0/OpenID 2.0 provideren hvor authorizationcode udveksles for tokens. 
* **Implicit flow** - clienten henter selv direkte et access token hos provideren. User credentials skal, hvis dette flow bruges, ikke gemmes i client koden. Er oftest brugt i web-, desktop- og mobilapplikationer der ikke har en backend applikation. 
* **Ressource owner password credentials** - dette flow kræver at der logges ind med username og password og eftersom disse vil være en del af requesten er dette flow kun anbefalet til trusted clients.
* **Client credentials** - dette flow er ment til server-til-server authentication hvor applikationen agerer på vegne af sig selv, fremfor på vegne af en individuel bruger. 

#### Authorizationcode flow vs. Implicit flow
Det der adskiller authorizationcode flow fra implicit flow er det trin hvor Google afleverer en authorizationcode til backenden og backenden udveksler denne til access token, refresh token og profile data. 
Det vil sige at implicit flow går direkte fra bruger-login til at få udleveret accesstoken fra Google. Vi startede med at lave et implicit flow direkte i app’en, men dette vurderes som relativt usikkert i forhold til authorizationcode flow af flere grunde. Client secret skal for det første gemmes et sted i app’en, for at blive sendt med til Google. Herudover sendes access token direkte tilbage til app’en gennem browseren og app’en vil selv skulle holde styr på det. Dette vurderes generelt som værende usikkert, både fordi al clientkode ligger frit tilgængeligt, trods eventuel obfuscation, samt at det generelt er nemmere for en tredjepart at få stjålet et accesstoken fra en app eller en SPA, end fra en backend. Dette kan f.eks. ske gennem Cross Site Scripting hvor der injectes client-side scripts. 
 
Authorizationcode flow’et hvor det er backenden der står for kommunikationen med Google, udveksling af tokens og opbevaring af tokens er den anbefalede måde at håndtere OAuth 2.0/OpenID 2.0 på. [OAuth 2.0 Flow](https://auth0.com/docs/api-auth/which-oauth-flow-to-use)

#### Brugen af Expo, deep linking og URL schemes
Brugen af custom URL schemes, såsom `appname://` til at linke internt i app’en er ikke altid lige sikkert. Hvis to applikationer bruger samme skema, er det for iOS ikke garanteret hvilken app skemaet henvender sig til.  
For Android har man mulighed for at benytte sig af [Intents](https://developer.android.com/guide/components/intents-filters) og samtidig giver styresystemet per standard en valgmulighed mellem de apps der har registreret brug af skemaet.  
[Denne artikel fra Nowsecure.com](https://www.nowsecure.com/blog/2019/04/05/how-to-guard-against-mobile-app-deep-link-abuse/) beskriver hvordan at at såkaldt *deep link abuse* virker i praksis, og hvordan man også kan beskytte sig ved brug af en [ekstern link-liste](https://developer.android.com/training/app-links/verify-site-associations) som indeholder en checksum. Sådan et angreb afhænger dog af mange faktorer. Typisk skal appen reverse engineeres og en lignende eller tilhørende (understøttende) app skal udvikles, fungerende som en trojansk hest. Dette er givetvis nemmere på Android, hvor man frit kan installere .apk-filer udenom App Store.  

For at kunne sende besked tilbage til vores react native app, som beskrevet i OAuth 2.0/OpenID 2.0, er vi nødt til at redirecte tilbage app’en når Google kalder vores `/auth/google/callback` endpoint. Da vores app er en Expo app og vi ikke ender med at ejecte Expo, er vi begrænsede i de muligheder vi har.  
Vi har valgt at bruge [Expo’s egen anbefalede løsning](https://docs.expo.io/workflow/linking/#example-linking-back-to-your-app-from). Det vil sige vi bruger Expos scheme `exp://exp.host/@yourname/yourAppName`, da det er den eneste måde vi kan linke tilbage til vores app på.  
Vi undersøgte muligheden for at lave en embedded browser i app’en så vi i stedet for et custom scheme, ville kunne lytte på et specifikt endpoint i backenden og trække JWT ud fra den request. Vi fik dette til at virke, men fandt derefter ud af at Google har lukket ned for muligheden for at bruge OAuth 2.0/OpenID 2.0 gennem embedded browsers i 2017, da det er for usikkert.  

---

### Authentication & Authorization med Apollo
Når man bygger et API, vil man formentlig på et tidspunkt i processen, gerne kunne styre hvem der kan se og ændre i ens data. Der er to vigtige principper i dette, som man skal kunne holde styr på; authentication og authorization. Authentication er at vide om en bruger er logget ind i systemet, og at vide hvem de er. Authorization er så at beslutte hvad den bruger har adgang til at se og ændre i ens system. 
Til dette har vi brugt Apollo Link, som er en form for middleware. 

#### Apollo Links
Et link beskriver, hvordan man vil modtage resultatet af et GraphQL kald, og hvad man vil gøre med resultaterne. Det er et abstraktionslag der bl.a. kan løse detaljerne omkring fejlhåndtering, authentication og authorization. Med denne løsning skal man ikke lave ændringer i hver resolver, men det er samlet i et lag højere oppe. Resolveres opgaver holdes derfor adskilt, hvilket samtidigt giver et bedre overblik. Man kan kæde mange links sammen, så når der affyres et GraphQL request, bliver hvert links funktionalitet anvendt i rækkefølge.   

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83138869-c3259400-a0eb-11ea-8d07-ebec22628df4.png"/>
</p>  

Når en bruger logger ind på vores app via telefonen, så kan de enten logge ind via Google eller via vores eget login-system. I begge tilfælde opretter backenden et JWT der er signed med en secret, og sender med til frontenden ved et login. 

I vores tilfælde bruger vi Apollo Link Context, hvor der på hvert request fra frontenden til backend serveren bliver sat et JWT på headers i form af `Authorization: <token string>`  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83138945-dd5f7200-a0eb-11ea-87c2-c0670eeef006.png"/>
</p>  

Derved kan backend serveren, for hvert indgående request, tjekke om denne header findes. 
Hvis denne header er sat, så kan vi med et JWT bibliotek verificere dette token. 
For at verificere et token, så skal det være signet med den secret vi bruger, og tokens udløbsdato skal ikke være overskredet. 
Her placeres token på authorization header, hvilket anses som best practice.
Hvis token er verificeret, så kan vi give brugeren adgang til beskyttet data. Hvis ikke, smider vi en AuthenticationError fra serveren. Man kan også returnere null, eller f.eks. et tomt array, men vi vil gerne tydeligt kunne fortælle brugeren, at man skal være logget ind for at se denne data, så der ikke er tvivl fra brugerens side om hvorvidt der er sket en fejl. 

#### Apollo Error Handling
**Backend**  
I vores backend smider vi kun Apollos egne errors udadtil. Det gør det nemmere at håndtere dem i frontend, fordi vi ved at fejlens struktur vil være ens, uanset hvilken type fejl der opstår. Samtidig sørger vi for at der ikke bliver delt mere data om fejlen end vi ønsker.

I vores backend har vi brugt Apollos middleware, der omformer alle errors smidt i koden, til en af Apollos egne. I vores kode smider vi enten en af Apollos egne errors, eller en ApiError. Hvis der kommer en ApiError så omformer vi den til en ApolloError, som så nemt kan læses i frontenden.  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83139227-4d6df800-a0ec-11ea-9fef-ac6ad0b1d135.png"/>
</p>  

Hvis vi er i et udviklermiljø, så sendes hele stacktracen med ved hver fejl, så det gøres nemmere at debugge de fejl der opstår undervejs. Men hvis vi er i et produktionsmiljø, så sender vi ikke stacktracen med, da vi ikke vil afsløre for meget information om vores interne struktur. 

Der findes 4 kategorier af fejl i Apollos struktur. 
* **AuthenticationError** - sender koden `UNAUTHENTICATED`
* **UserInputError** - sender koden `BAD_USER_INPUT`
* **ForbiddenError** - sender koden `FORBIDDEN`
* **ApolloError** - kan customizes, default er koden `INTERNAL_SERVER_ERROR`  
  
  
**AuthenticationError** kan bruges hvis en user ikke er logget ind, men prøver at tilgå ressourcer.   

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83139548-da18b600-a0ec-11ea-8351-13a9de7f656a.png"/>
</p>  

**ForbiddenError** kan bruges i forbindelse med authorization. Hvis en user er authenticated, men ikke har tilladelse til at tilgå en bestemt ressource, så kan man smide en ForbiddenError. 

**UserInputError** er til at verificere input som GraphQLs typer ikke selv kan klare. For eksempel, hvis bruger bedes skrive deres e-mail når de skal oprette en bruger, og der ikke er noget `@` i deres input, så kan vi smide en UserInputError med `“e-mail”` som `invalidArg`, og en custom besked. Denne error gør det muligt at specificere hvilken inputdata der ikke levede op til vores krav. Det gør vi ved hjælp af et custom `invalidArgs` felt. Her vist med en invalid e-mail:  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83139697-0fbd9f00-a0ed-11ea-8da1-196066715e27.png"/>
</p>  

Eller f.eks. et koordinatsæt bestående af latitude og longitude, som i GraphQL bare er integers.  

<p align="center">
<img src="https://user-images.githubusercontent.com/35559774/83139747-24019c00-a0ed-11ea-9245-8e992855fffc.png"/>
</p>  

Man kan også tjekke i frontend for den slags, men det ville ikke være sikkert kun at validere der, da brugeren ville kunne sende en request til vores backend uden om frontend mobilappen. Derfor skal den slags også tjekkes i backenden. Vi tjekker for fejl så “højt” oppe som muligt i koden, så serveren ikke skal lave for meget arbejde, før den afviser requesten. Desto før man kan validere input'et, desto bedre.

**Frontend**  
Til Errorhandling i frontenden har vi brugt et Apollo-link der hedder Apollo-Link-Error.
Det link fanger alle networkerrors og GraphQL errors, og så kan man ét sted i koden bestemme hvad der skal ske derfra. Det gør det nemt at håndtere, og refaktorere senere. Desuden har vi lavet en custom “ErrorHandler” der kan tage imod en ApolloError. Vi bruger en Alert, som er en slags popup, til at sætte en besked til brugeren, som de ikke kan undgå at se, hvis noget går galt. 
F.eks. hvis errorcode her er `FORBIDDEN`, ved vi at den stammer fra en ForbiddenError i backenden, og det betyder dermed at brugerens adgangsniveau til API'en ikke er højt nok til det de prøver at tilgå. 
Eller hvis koden f.eks. er `UNAUTHENTICATED`, kan man slette det lokale token i SecureStore, fordi man nu ved at det er ugyldigt, og sende brugeren til login-siden. 
Og til sidst, hvis koden er `BAD_USER_INPUT` skal brugeren have at vide præcis hvilket felt de har tastet forkert i, og hvorfor. Derfor er `invalidArgs` feltet smart på den error, fordi det kan nu benyttes til en præcis fejlbesked og bedre brugervenlighed. 

#### JWT sikkerhed i App
Vi gemmer [JWT](#jwt) i [SecureStore](https://docs.expo.io/versions/latest/sdk/securestore/) hos brugere. Securestore krypterer og gemmer key-value par 	lokalt på brugerens mobil. Info der er gemt i et Expo-projekt kan ikke tilgås fra andre Expo-projekter. Desuden gør SecureStore det nemt for os at tilgå JWT uanset hvor vi er i vores application. Og hvis brugeren lukker for vores app, logges de ikke af, da vi kan hente JWT op igen fra SecureStore. Alt efter om brugeren er på Android eller IOS har den forskellige implementationer. 
* På IOS bruger de [Keychain Services](https://developer.apple.com/documentation/security/keychain_services)
* På Android bruger de [Android Keystore System](https://developer.android.com/training/articles/keystore.html)

#### Incremental Authorization
Der findes Authorization i den forstand, at vi skal give en bruger adgang til vores data og ressourcer via deres login. Men brugeren skal også give samtykke til at vores app må tilgå f.eks deres Google account og deres lokation.

Når en bruger logger ind med Google, føres de til Googles loginside, og bliver så spurgt om app'en skal have lov til at se deres e-mail, profilbillede osv. Når en bruger så gerne vil bruge vores map-feature, så bliver de spurgt om lov til at bruge deres lokation. 
Dette er Incremental Authorization. At man ikke spørger brugeren om tilladelse til at bruge f.eks kameraet, lokationen, osv., før man rent faktisk har brug for det. Man kan risikere at overvælde brugeren med en samtykke screen, hvis alt der skal gives samtykke til præsenteres på en gang når de logger ind. Derfor kan man risikere at miste brugere, fordi de så trykker nej. Desuden kan de anvende alle de features af app'en der ikke kræver samtykke, selv hvis de trykker nej til f.eks lokation. De har stadig sagt ja til e-mail osv. da de loggede ind. Derfor kan man få flere permissions fra brugerne igennem, uden at skræmme dem væk.

---

### Refleksion & Konklusion
Der er utroligt mange ting, man skal tage højde for, når man laver en applikation, hvor man fokuserer på at gøre systemet så sikkert som muligt. OWASPs top 10 liste fra 2017 er et godt sted at begynde, men listen af ting, man skal overveje er naturligvis meget længere. For os har det været en god øvelse at prøve at kode et samlet projekt, hvor vi kombinerer mange af de ting, vi har lært i løbet af semesteret. 
Da app’en først bliver deployet kort før Fullstack Javascript eksamen (vi mangler nogle funktionaliteter der ikke er relevante for Security valgfaget), har vi ikke mulighed for at vise det helt færdige produkt før eksaminerne, men vi er selv på nuværende stadie er vi meget tilfredse med den udvikling vi har været igennem, specielt i forhold til Oauth 2.0/OpenID 2.0, der for os virkede meget kompleks inden vi gik i gang med projektet. Det har ligeledes været en øjenåbner at finde ud af hvor mange forskellige frameworks og libraries der er udviklet til at håndtere de mange forskellige aspekter af Security-risici, når man udvikler et projekt efter real world standarder. Passport er en af de frameworks vi valgte at bruge, men som på trods af den simple opgave det løser, har været mere end svær at forstå præcis hvad gør. Vi har haft mange debatter om hvorvidt det ville være bedre at prøve at løse en given opgave selv, fremfor at bruge et tredjeparts framework, men er oftest kommet frem til den konklusion, at sålænge det er et velbrugt framework som er anbefalet af mange andre og løser et givent problem, så er det nok bedre at vi bruger det, fremfor at prøve at løse det selv. 

#### Security relevante funktionaliteter der ikke er implementeret endnu  
* **Brute Force admin alerts** - Vi holder styr på, hvilke IP adresser der forsøger at lave brute force angreb, men vi gør ikke andet ved det, end at afvise de IP adresser hvor angrebene kommer fra. Hvis vi havde tid og vores applikation skulle blive til et større, mere virkeligt eksempel, ville vi have implementeret et system, der kunne advare en admin, hvis vores applikation blev angrebet. I denne sammenhæng ville vi have udvidet vores event emitter-system, så der var kontrol af requests til alle vores ressourcer, så vi ikke kun ville kunne stoppe brute force angreb ifm login, men også DoS angreb i det hele taget.

* **Refresh token skal gemmes** i databasen - Sammen med brugeres info vil vi gerne gemme refresh token for herefter at kunne bruge det til at re-authenticate brugeren uden at brugeren behøver at logge ind igen. Planen er at når JWT expires (efter 60 minutter) at gøre ovenstående. Refresh token bør fjernes helt fra databasen hvis brugerne manuelt logger ud. Hvis brugeren går ind og revoker deres samtykke til offline access (som vi har bedt dem om) så vil deres refresh token blive invalidatet af Google og vi skal bede om et nyt næste gang de bruger app’en. Vi håber på at nå at implementere denne funktionalitet inden Fullstack Javascript eksamen. 

* **Logging** - Som en ekstra funktionalitet, kunne vi have implementeret at logfilerne blev gemt væk fra applikationen, eksempelvis på en an anden server. Dette ville sikre diverse data fra at blive delt eller slettet i tilfælde af et brud på sikkerheden. På nuværende tidspunkt logger vi ikke noget privat data, så der er ikke et problem i den sammenhæng, men i tilfælde af at backenden blev overtaget af en tredjepart, ville det være optimalt at have alle logs liggende på en anden server, så tredjeparten ikke bare ville kunne fjerne sporene efter sit angreb. Havde vi haft mere tid, ville vi have sat en logging server op til dette formål, på samme måde som vi har en separat server til vores database.

* **OWASP** 
    * **A2** - Reset password (dvs. ikke nogen generhvervelse af glemt password). Vores applikation har ingen funktionalitet til at generhverve eller lave et reset af passwords lige pt. Det betyder at en bruger der glemmer sit password ingen mulighed har for at få det igen eller lavet et nyt. Hvis tiden tillod det, ville dette være en funktionalitet vi meget gerne ville have haft med. 
    * **A1** - Automatiske unit tests for alle funktioner, der tager brugerinput og dermed kunne være sårbare over for injection.
    * **A7** - Eftersom vores applikation er skrevet i React Native, kører der på brugernes mobiler en JavaScript engine. Med en applikation, hvor brugere selv taster oplysninger ind, især i chat-delen af vores program, ville brugeren kunne give mere data med end bare en neutral besked eller et navn - de ville kunne give JavaScript kode med. Umiddelbart er der ikke noget sted i vores kode, hvor eventuelt injected JavaScript kode ville kunne blive eksekveret; al brugerens input bliver desuden tvunget til at være af typen string eller float. Dog er vi ikke eksperter på dette område, så hvis vi havde mere tid, ville vi undersøge om det er muligt at udføre XSS i en React Native applikation, og hvis det er muligt, om vi så skulle gøre noget for at forhindre det (f.eks med en sanitiser) eller om vi allerede løser problemet med vores typestærke system. 

* **PKCE (Proof Key for Code Exchange)** - Som beskrevet i [Brugen af Expo, deep linking og URL schemes](#brugen-af-expo-deep-linking-og-url-schemes) kan der med brugen af app-links opstå sikkerhedsangreb. I forbindelse med OAauth 2.0 Authorization Code-flowet kan der opstå et *Authorization Code Interception Attack*.  
PKCE (udtales Pixie) [blev inkluderet i OAauth 2.0 standarden](https://tools.ietf.org/html/rfc7636) efter sådanne angreb, hvor man ved hjælp af en *verifyer* kan verificere hvilken app der har ret til den pågældende authorization code.  
  <p align="center">
  <img src="https://user-images.githubusercontent.com/35559774/83181265-ed477800-a124-11ea-9636-f8a67592ac15.png"/>
  </p>  
  
  To apps bruger samme URL-skema. Styresystemet tillader uden forbehold begge apps at modtage authorization code gennem URL-skemaet og derved kan man risikere at access token bliver udleveret til tredjepart.  
  PKCE løser dette problem ved at tilsætte følgende til flowet ([kilde](https://www.oauth.com/oauth2-servers/pkce/)):
  * Applikationen genererer en String: code_verifier
  * Applikationen bruger code_verifier til at generere en SHA256-hash code_challenge og sender denne med i authorization-requesten
  * Auth-serveren gemmer code_challenge
  * Applikationen får svar på authorization-requesten, og inkluderer code_verifier i token-exchange-requesten.
  * Auth-serveren kan nu selv generere sin egen code_challenge. 
  * Hvis den matcher den udleverede, er applikationen hvem den udgiver sig for.

  Vi har ikke [implementeret](https://medium.com/passportjs/pkce-support-for-oauth-2-0-e3a77013b278) PKCE, men vores backend udleverer kun et JWT til app’en med en expiryTime på 60 minutter, hvilket gør vores løsning væsentlig bedre end traditionelle apps hvor access token kan opfanges. Samtidig sørger expo for et ekstra lag sikkerhed ved at linke direkte ind i app’en ved at formatere links sådan her: `exp://exp.host/@yourname/yourAppName`

  ---
