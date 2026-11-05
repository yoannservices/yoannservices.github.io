/* Connexion Google : créez un « ID client OAuth 2.0 » de type Application Web sur
   https://console.cloud.google.com/apis/credentials puis ajoutez dans
   « Origines JavaScript autorisées » :
     http://localhost:8765
     https://yoannservices.github.io
   et collez l'ID ci-dessous (il est public, ce n'est pas un secret). */
(() => {
'use strict';
const GOOGLE_CLIENT_ID = '';

Object.assign(SL, { GOOGLE_CLIENT_ID });
})();
