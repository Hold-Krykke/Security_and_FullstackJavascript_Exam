# 4. Semester Security og Fullstack Javascript Eksamens Projekt
#### Lavet af:
* Cph-mh748 - Malte Hviid-Magnussen 
* Cph-rn118 - Rúni Vedel Niclasen 
* Cph-ab363 - Asger Bjarup 
* Cph-cs340 - Camilla Staunstrup 

## Security Rapport
* [Security Eksamens Rapport](https://github.com/Hold-Krykke/Security_and_FullstackJavascript_Exam/blob/master/RAPPORT.md)

## JavaScript Produkt
* [React Native App]()
* [Backend]()


### Overordnet projekt ide:
Vores grundlag for projektet er at vi gerne vil lave en *__sikker__* React native mobil application. 

* __Find your Friends__
  * Lokation spores ved tilgang af forside - vises på kort (uden login)
    * Login for at chatte/poste beskeder
    * Konstant opdatering af egen position
    * “Forhindre” dvale af app’en
* __Oauth login (med google, facebook, microsoft eller github)__
  * Med mulighed for login uden oauth. Her bruges i stedet eget login lavet ved hjælp af bcrypt
* __1. database mulighed:__ 
  * 2 droplets, en til databasen og en til webApp’en, med ssh-tunnel imellem
    * Databasen indeholder 
      * Posts og evt. info knyttet til posts (original poster, evt. comments)
      * Passwords til brugere uden oauth login
    * WebApp droplet er lukket med firewall. App kører kun på https
    * Droplets kan kun ssh’es ind på, ingen password
* __2. database mulighed__
  * Vi bruger mongoDB i stedet for ovenstående i mulighed 1. 
* __3. database mulighed__
  * MongoDB til storage af alt vedrørende selve applicationen
  * mySQL database på en droplet til storage af ikke-oauth passwords og refreshtokens 
* __Yderligere problemstillinger/muligheder/udvidelser__
  * Problemer ved mongoDB ift injections?
  * Beskriv/argumenter for fordele/ulemper ved mongoDB iforhold til mySQL database
  * Evt. brug af graphql til endpoints


### Links til tutorials, libraries og lignende:
* [graphql](https://graphql.org/)

