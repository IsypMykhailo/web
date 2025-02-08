<script>
import ThemeSwitcher from "../../components/controls/ThemeSwitcher.vue";
import Translation from "../../i18n/translation"
import LanguageSwitcher from "../../components/controls/LanguageSwitcher.vue";
import Logo from "../../components/Logo.vue";
export default {
  setup() {
    return { Translation }
  },
  components: { ThemeSwitcher, Logo, LanguageSwitcher },
  mounted() {
    const doc = document.documentElement;
    const w = window;

    let prevScroll = w.scrollY || doc.scrollTop;
    let curScroll;
    let direction = 0;
    let prevDirection = 0;

    const header = document.querySelector('header');

    const checkScroll = function() {
      /*
      ** Find the direction of scroll
      ** 0 - initial, 1 - up, 2 - down
      */

      curScroll = w.scrollY || doc.scrollTop;
      if (curScroll > prevScroll) {
        //scrolled up
        direction = 2;
      }
      else if (curScroll < prevScroll) {
        //scrolled down
        direction = 1;
      }

      if (direction !== prevDirection) {
        toggleHeader(direction, curScroll);
      }

      prevScroll = curScroll;
    };

    const toggleHeader = function(direction, curScroll) {
      if (direction === 2 && curScroll > 32) {
        header.classList.add('nav-up');
        prevDirection = direction;
      }
      else if (direction === 1) {
        header.classList.remove('nav-up');
        prevDirection = direction;
      }
    };

    window.addEventListener('scroll', checkScroll);
  },
  methods: {
    toggleMobileNav() {
      const mobileNav = document.querySelector('.mobile-header-links-container')

      if (mobileNav.classList.contains('hidden')){
        document.body.style.overflow = 'hidden'
        mobileNav.classList.remove('hidden')
      }
      else {
        document.body.style.overflow = 'auto'
        mobileNav.classList.add('hidden')
      }
    }
  }
}
</script>

<template>
  <div class="wrapper">
    <header class="home-header-wrapper">
      <div class="home-header-container">
        <div class="home-header container">
          <div class="header-link mobile-only mobile-offset">
            <div class="simplified-button" @click="toggleMobileNav" style="display: inline-flex">
              <svg id="button-open-menu" class="ico nav-icon nav-ico" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17H20M4 12H20M4 7H20" stroke="var(--text-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <RouterLink :to="Translation.i18nRoute({ name: 'home' })" class="logo-container">
            <Logo class="logo" />
          </RouterLink>

          <ul class="header-links mobile-offset">
            <li><ThemeSwitcher class="header-link pc-only"/></li>
            <li><a class="header-link link pc-only" href="#home">{{ $t("nav.home") }}</a></li>
            <li><a class="header-link link pc-only" href="#about-us">{{ $t("nav.about") }}</a></li>
            <li><RouterLink class="header-link link link-active link-try" :to="Translation.i18nRoute({ name: 'sign in'})">{{ $t("home.button-try") }}</RouterLink></li>
            <li><LanguageSwitcher class="header-link pc-only"/></li>
          </ul>
        </div>
      </div>
    </header>

    <div class="mobile-header-links-container hidden mobile-only">
      <div class="container">
        <ul class="mobile-header-links">
          <li @click="toggleMobileNav"><a class="link" href="#home">{{ $t("nav.home") }}</a></li>
          <li @click="toggleMobileNav"><a class="link" href="#about-us">{{ $t("nav.about") }}</a></li>
        </ul>

        <div class="mobile-header-section">
          <span class="title">Language</span>
          <LanguageSwitcher />
        </div>

        <div class="mobile-header-section">
          <span class="title">Appearance</span>
          <ThemeSwitcher />
        </div>
      </div>
    </div>

    <div id="home">
      <div class="hero-container">
        <div class="hero container">
          <h1 class="hero-title">{{ $t('home.title') }}</h1>
          <a href="#about-us" class="button button-large">{{ $t('home.more-details') }}</a>
        </div>
      </div>
    </div>

    <div id="about-us" class="about-us-wrapper">
      <div class="about-us-container container">
        <div class="about-us-cards">
          <div class="about-us-card">
            <h4>{{ $t('home.modernity.title') }}</h4>
            <span class="muted-text">{{ $t('home.modernity.text') }}</span>
          </div>

          <div class="about-us-card">
            <h4>{{ $t('home.opportunities.title') }}</h4>
            <span class="muted-text">{{ $t('home.opportunities.text') }}</span>
          </div>

          <div class="about-us-card">
            <h4>{{ $t('home.convenience.title') }}</h4>
            <span class="muted-text">{{ $t('home.convenience.text') }}</span>
          </div>
        </div>
      </div>
    </div>

<!--    <div id="tutorial">
      <div class="container">Інструкція</div>
    </div>-->
  </div>
</template>

<style scoped>
/*noinspection ALL*/
.wrapper {
  background-color: var(--background-color)!important;
  padding-bottom: 1.5rem;
}

.logo-container {
  display: flex;
}

.home-header-wrapper {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: var(--background-color);
  width: 100%;
  height: 4rem;
  transition: top 0.2s ease-in-out;
  box-shadow: 0 1px 25px rgba(0,0,0, .1);
}

.home-header-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.mobile-header-links-container {
  position: fixed;
  top: 4rem;
  z-index: 99;
  padding: 1.5rem;
  width: 100%;
  height: 100vh;
  background-color: var(--background-color);
  transform: none;
  transition: transform .15s;
}

.mobile-header-links-container.hidden {
  top: -4rem;
  transform: translateY(-100vh);
}

.mobile-header-links {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-header-links li {
  border-bottom: 1px solid var(--border-color);
  padding: 12px 0 11px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
}

.mobile-header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(0,0,0, .1);
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
}

.mobile-header-section {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
}

.nav-up {
  top: -5rem;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-links {
  height: 100%;
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.header-links .header-link {
  padding-left: 0.95rem;
  padding-right: 0.95rem;
}

.link-try, .link-try:hover {
  font-weight: 600;
  color: var(--button-background-color)!important;
}

@media (max-width:641px) {
  .mobile-offset {
    width: 33%;
    justify-content: flex-end;
  }
}

.hero-container {
  display: flex;
  align-items: center;
  height: calc(100vh - 4rem);
  padding: 1rem;
  position: relative;
  z-index: 1;
}

/*noinspection CssUnknownTarget*/
.hero-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: url("/banner bg.png") no-repeat center;
  background-size: cover;
}

/*noinspection CssUnknownTarget*/
:root.dark-theme .hero-container::before {
  background: url("/bg_dark.png") no-repeat center;
  background-size: cover;
}

.hero-title {
  color: #FFFFFF;
  width: 75%;
  font-family: 'Raleway', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 60px;
  line-height: 70px;
  margin-bottom: 1.8rem;
}

@media (max-width:641px) {
  .hero-title {
    width: 100%;
    font-size: 40px;
    line-height: 50px;
  }
}

.about-us-wrapper {
  padding-top: 2rem;
}

/*.about-us-container .title {
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
}*/

.about-us-cards {
  display: flex;
  justify-content: space-around;
}

.about-us-cards .about-us-card {
  padding-right: 2.5rem;
  font-family: 'Raleway',sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
}

.about-us-cards .about-us-card:last-child {
  padding-right: 0;
}

@media (max-width:641px) {
  .about-us-cards {
    flex-direction: column;
  }

  .about-us-cards .about-us-card {
    padding: 0 0 1.5rem;
  }

  .about-us-cards .about-us-card:last-child {
    padding: 0;
  }
}

#tutorial {
  padding-top: 1.5rem;
}
</style>
