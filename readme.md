# Financieri
**Open-source educational web game about Finances**

### TO DO:
Add English translation, now only slovak language is supported.
Split HTML into templates, because now the code is super long.

---

## Description:
Created for competetion Finančný Štvorboj by Národná banka Slovenska.
Uses node.js for back-end, html5, tailwindCSS and javascript for front-end.
Game is unfinnished, some features missing, expect bugs and glitches.
Inspired by games 'Build your Stax' by NGPF, 'Finančná sloboda' by OVB Allfinanz Slovensko a.s..

### Kinds of savings, investments and insurances?
* II. Pillar and III. Pillar, data from [Sociálna poisťovňa](https://www.socpoist.sk/socialne-poistenie/platenie-poistneho/sporenie-v-ii-pilieri/zakladne-informacie-ii-pilier), [II. Pillar - NN Slovensko](https://www.nn.sk/druhy-pilier/) and [III. Pillar - NN Slovesnko](https://www.nn.sk/treti-pilier/)
* Saving account, data from multiple slovak banks.
* Fixed deposit and inflation rates, data from [Národná banka Slovenska ](https://nbs.sk/)
* Goverment bonds (Slovak), data from [Dlhopisy pre ľudí](https://dlhopisypreludi.ardal.sk/)
* Stocks, index funds, commodities, data from [Macrotrends](www.macrotrends.net)
* Life insurance from Generali.sk
* House insurance from [Najpoistenie.sk](https://www.najpoistenie.sk/poistenie-domu-bytu-domacnosti/)
  
---

## How to play?
(Tested only on Debian 13, so you might need to find your way)

1. Instal mySQL and Node.js
2. Create user with password on mySQL. Replace {username}, {password}, {database} and {path/to/database} with your strings.
   ```
   mysql -u root -p
   CREATE DATABASE {database};
   CREATE USER '{username}'@'localhost' IDENTIFIED BY '{password}';
   GRANT ALL PRIVILEGES ON {database}.* TO '{username}'@'localhost';
   exit
   mysql -u root -p {database} { {path/to/database}.sql
   ```
3. Create `.env` file from template.env, change address to your private address. Now you can play on LAN or via hamachi. USERNAME and PASSWORD are creditials to mySQL and DATABASE is name of database, which has database data.
4. Create self-signed certificate for HTTPS connection. (Can be skipped, altough, you will need to change REDIRECTUNSECURE variable in .env to "false").
   ```
   sudo apt install openssl
   openssl genrsa -out private.key 2048
   openssl req -new -key private.key -out example.csr
   openssl x509 -req -days 365 -in example.csr -signkey private.key -out certificate.crt
   ```
5. Move private.key and certificate.crt into /internal_modules/webserver_modules/
6. Open terminal in folder (Financieri-main, or whatever you called it)
   ```
   npm init
   npm install
   node server.js
   ```
7. You can load the website by clicking on the address provided to you in the terminal.
8. Enjoy!

--- 

## Interested in contributing?
* Any contributions are welcomed!
* Check contributing file thingy (when I create it :p)
* If you want to report issues, please share screenshots from browser console and server!








