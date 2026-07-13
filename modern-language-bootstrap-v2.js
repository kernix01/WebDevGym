(function () {
  const isEnglishPage = /index-en\.html$/i.test(location.pathname);
  const pageLanguage = isEnglishPage ? 'en' : 'ru';
  document.documentElement.lang = pageLanguage;
  localStorage.setItem('webdevgym_main_lang', pageLanguage);
})();

