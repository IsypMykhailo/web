<script>
import DefaultLayout from "@/layouts/DefaultLayout.vue";

export default {
    name: "MyProfileView",
    components: {DefaultLayout}
}
</script>

<template>
    <DefaultLayout :show-links="true">
        <div class="container">
            <div class="columns">
                <div class="column settings-list">
                    <ul class="nav nav-pills flex-column pe-3 mb-auto">
                        <li class="nav-item">
                            <a href="#" class="nav-link active">
                                {{ $t('profile.title') }}
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="column">
                    <form class="default-form">
                        <h2 class="form-title">{{ $t('profile.title') }}</h2>

                        <div class="form-section">
                            <strong class="form-input-title">{{ $t('form-fields.pfp') }}</strong>
                            <div style="display: flex">
                                <div style="border: 1px solid var(--border-color); width: 3rem; height: 3rem; min-width: 3rem; min-height: 3rem; max-width: 3rem; max-height: 3rem; margin-right: 1rem; border-radius: 50%"></div>
                                <input class="form-input" type="file"/>
                            </div>
                        </div>

                        <div class="form-section">
                            <strong class="form-input-title">{{ $t('form-fields.name') }}</strong>
                            <input class="form-input" type="text"/>
                            <!--        <span class="muted-text"></span>-->
                        </div>
                        <button type="button" class="button">{{ $t('buttons.save') }}</button>
                    </form>
                </div>
            </div>
        </div>
        <div class="container">

        </div>
    </DefaultLayout>
</template>

<style scoped>
.nav-link {
    font-size: 15px;
    font-weight: 600;
}

.nav-item a.active {
    background-color: var(--button-background-color);
}

.nav-item a:not(.active) {
    color: var(--button-background-color);
}

.nav-item a:not(.active):hover {
    color: var(--button-active-background-color);
}

.columns {
    display: flex;
    flex-direction: row;
}

.columns .column {
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.settings-list {
    list-style: none;
    min-width: 20rem;
}
</style>